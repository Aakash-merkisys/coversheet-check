// Backend Server for Coversheet Automation System
const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const JSZip = require('jszip');
const { buildCoversheetDocx } = require('./docx-generator');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve static files from current directory

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, 'uploads');
        // Create uploads directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'excel-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter to accept only Excel files
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel' // .xls
    ];

    const allowedExtensions = ['.xlsx', '.xls'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only Excel files (.xlsx, .xls) are allowed.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// API Routes

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Coversheet Automation Backend is running',
        timestamp: new Date().toISOString()
    });
});

// Upload and process Excel file
app.post('/api/upload-excel', upload.single('excelFile'), (req, res) => {
    console.log('📤 Received Excel upload request');

    try {
        // Check if file was uploaded
        if (!req.file) {
            console.error('❌ No file uploaded');
            return res.status(400).json({
                success: false,
                message: 'No file uploaded. Please select an Excel file.'
            });
        }

        console.log('📁 File received:', req.file.originalname);
        console.log('📊 File size:', (req.file.size / 1024).toFixed(2), 'KB');

        const filePath = req.file.path;

        // Read the Excel file
        console.log('📖 Reading Excel file...');
        const workbook = XLSX.readFile(filePath);

        // Get the first sheet name
        const firstSheetName = workbook.SheetNames[0];
        console.log('📄 Processing sheet:', firstSheetName);

        // Get the worksheet
        const worksheet = workbook.Sheets[firstSheetName];

        // Convert to JSON (with headers)
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length < 2) {
            console.error('❌ Excel file is empty or has no data rows');
            // Clean up uploaded file
            fs.unlinkSync(filePath);
            return res.status(400).json({
                success: false,
                message: 'Excel file must contain at least a header row and one data row.'
            });
        }

        // Extract headers and data
        const headers = jsonData[0];
        const dataRows = jsonData.slice(1).filter(row => row.some(cell => cell !== undefined && cell !== ''));

        console.log('✅ Headers found:', headers);
        console.log('✅ Data rows:', dataRows.length);

        // Convert to array of objects
        const records = dataRows.map((row, index) => {
            const record = {};
            headers.forEach((header, headerIndex) => {
                record[header] = row[headerIndex] || '';
            });
            // Add default fields for automation
            record.selectedRevisions = [];
            record.revision = 'Not Set';
            record.status = 'Pending';
            return record;
        });

        console.log('✅ Processed', records.length, 'customer records');
        console.log('Sample record:', records[0]);

        // Clean up uploaded file after processing
        fs.unlinkSync(filePath);
        console.log('🗑️ Cleaned up temporary file');

        // Return success response
        res.json({
            success: true,
            message: 'Excel file processed successfully',
            data: {
                fileName: req.file.originalname,
                recordCount: records.length,
                headers: headers,
                records: records
            }
        });

    } catch (error) {
        console.error('❌ Error processing Excel file:', error);

        // Clean up file if it exists
        if (req.file && req.file.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({
            success: false,
            message: 'Error processing Excel file: ' + error.message
        });
    }
});

// Generate DOCX coversheet(s) from JSON records
// POST /api/generate-docx
// Body: { records: [{...}, ...], revision: "A" }
// Returns: single .docx (1 record) or .zip (multiple records)
app.post('/api/generate-docx', express.json({ limit: '10mb' }), async (req, res) => {
    console.log('📝 Received DOCX generation request');

    try {
        const { records, revision } = req.body;

        if (!records || !Array.isArray(records) || records.length === 0) {
            return res.status(400).json({ success: false, message: 'No records provided.' });
        }

        const rev = revision || 'A';

        if (records.length === 1) {
            // Single record → return one .docx
            const buf = await buildCoversheetDocx(records[0], rev);
            const record = records[0];
            const id = record['ID'] || record['id'] || record['Customer ID'] || '';
            const name = record['Name'] || record['Customer Name'] || record['name'] || '';
            const safeName = (id || name || 'coversheet')
                .toString().toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 40);
            const filename = `coversheet_${safeName}_REV_${rev}.docx`;

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            return res.send(buf);
        }

        // Multiple records → build ZIP
        const zip = new JSZip();

        for (let i = 0; i < records.length; i++) {
            const record = records[i];
            const revisions = Array.isArray(record.selectedRevisions) && record.selectedRevisions.length > 0
                ? record.selectedRevisions
                : [rev];

            const id = record['ID'] || record['id'] || record['Customer ID'] || '';
            const name = record['Name'] || record['Customer Name'] || record['name'] || '';
            const safeName = (id || name || `record_${i + 1}`)
                .toString().toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 40);

            for (const r of revisions) {
                const buf = await buildCoversheetDocx(record, r);
                zip.file(`coversheet_${safeName}_REV_${r}.docx`, buf);
            }
        }

        const zipBuf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
        const zipName = `coversheets_${Date.now()}.zip`;

        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${zipName}"`);
        return res.send(zipBuf);

    } catch (err) {
        console.error('❌ DOCX generation error:', err);
        res.status(500).json({ success: false, message: 'Failed to generate DOCX: ' + err.message });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('❌ Server error:', error);

    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File size exceeds 10MB limit.'
            });
        }
        return res.status(400).json({
            success: false,
            message: 'File upload error: ' + error.message
        });
    }

    res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
    });
});

// Start server
app.listen(PORT, () => {
    console.log('🚀 Coversheet Automation Backend Server');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`✅ API endpoint: http://localhost:${PORT}/api/upload-excel`);
    console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📁 Static files served from:', __dirname);
    console.log('📤 Ready to accept Excel file uploads');
});
