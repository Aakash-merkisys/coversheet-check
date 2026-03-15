// Coversheet Generator JavaScript - Enhanced for Per-Record Revisions
let excelData = [];
let excelHeaders = [];

// Enable drag and drop and auto-load stored data
document.addEventListener('DOMContentLoaded', function () {
    const uploadZone = document.querySelector('.upload-zone');

    if (uploadZone) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadZone.addEventListener(eventName, preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            uploadZone.addEventListener(eventName, () => {
                uploadZone.classList.add('border-blue-500', 'bg-blue-50');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            uploadZone.addEventListener(eventName, () => {
                uploadZone.classList.remove('border-blue-500', 'bg-blue-50');
            });
        });

        uploadZone.addEventListener('drop', handleDrop, false);
    }

    // Auto-load previously uploaded Excel data from LocalStorage
    loadStoredExcelData();
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length > 0) {
        document.getElementById('excelFileInput').files = files;
        handleFileUpload({ target: { files: files } });
    }
}

// Handle file upload with backend API
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/)) {
        showToast('Please upload a valid Excel file (.xlsx or .xls)', 'error');
        return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
        showToast('File size exceeds 10MB limit', 'error');
        return;
    }

    // Update file name display
    document.getElementById('fileNameDisplay').textContent = file.name;

    // Show loading state
    showToast('Uploading and processing Excel file...', 'info');

    // Create FormData and append file
    const formData = new FormData();
    formData.append('excelFile', file);

    // Send file to backend API (works both locally and on Render)
    fetch('/api/upload-excel', {
        method: 'POST',
        body: formData
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.message || 'Server error');
                });
            }
            return response.json();
        })
        .then(result => {
            console.log('✅ Backend response:', result);

            if (!result.success) {
                throw new Error(result.message || 'Failed to process Excel file');
            }

            const { data } = result;
            console.log('📊 Received', data.recordCount, 'records from backend');
            console.log('Sample record:', data.records[0]);

            // Store the parsed data
            excelHeaders = data.headers;
            excelData = data.records.map(record => {
                return data.headers.map(header => record[header] || '');
            });

            // Store customer data in LocalStorage
            localStorage.setItem('excelCustomerData', JSON.stringify(data.records));

            // Verify storage immediately
            const verification = localStorage.getItem('excelCustomerData');
            if (verification) {
                console.log('✅ Stored customer data in LocalStorage:', data.records.length, 'records');
                console.log('✅ Verification: Data successfully retrieved from LocalStorage');
                console.log('Sample record:', data.records[0]);
            } else {
                console.error('❌ ERROR: Data was NOT stored in LocalStorage!');
                showToast('Warning: Data may not persist. Check browser settings.', 'error');
            }

            // Show file info
            document.getElementById('uploadedFileName').textContent = data.fileName;
            document.getElementById('fileDetails').textContent = `${data.recordCount} customer records • ${data.headers.length} columns`;
            document.getElementById('fileInfo').classList.remove('hidden');

            // Display data preview
            displayDataPreview();

            showToast(`Successfully loaded ${data.recordCount} customer records from backend`, 'success');
        })
        .catch(error => {
            console.error('❌ Error uploading Excel file:', error);
            showToast('Error: ' + error.message, 'error');
        });
}

// Display data preview with per-record revisions
function displayDataPreview() {
    const previewSection = document.getElementById('dataPreviewSection');
    const tableHead = document.getElementById('previewTableHead');
    const tableBody = document.getElementById('previewTableBody');

    // Load customer data from LocalStorage to get per-record revisions
    let customerData = [];
    try {
        const storedData = localStorage.getItem('excelCustomerData');
        if (storedData) {
            customerData = JSON.parse(storedData);
        }
    } catch (error) {
        console.error('Error loading customer data:', error);
    }

    // Clear previous content
    tableHead.innerHTML = '';
    tableBody.innerHTML = '';

    // Create header row with Revision column
    const headerRow = document.createElement('tr');
    headerRow.style.backgroundColor = '#f1f5f9';
    headerRow.style.opacity = '1';

    excelHeaders.forEach(header => {
        const th = document.createElement('th');
        th.className = 'px-6 py-4 text-[11px] uppercase tracking-wider font-bold';
        th.style.color = '#475569';
        th.style.opacity = '1';
        th.textContent = header || 'Unnamed';
        headerRow.appendChild(th);
    });

    // Add Revision column header
    const revisionTh = document.createElement('th');
    revisionTh.className = 'px-6 py-4 text-[11px] uppercase tracking-wider font-bold';
    revisionTh.style.backgroundColor = '#d1fae5';
    revisionTh.style.color = '#065f46';
    revisionTh.style.opacity = '1';
    revisionTh.textContent = 'Selected Revisions';
    headerRow.appendChild(revisionTh);

    // Add Coversheets column header
    const coversheetsTh = document.createElement('th');
    coversheetsTh.className = 'px-6 py-4 text-[11px] uppercase tracking-wider font-bold';
    coversheetsTh.style.backgroundColor = '#dbeafe';
    coversheetsTh.style.color = '#1e40af';
    coversheetsTh.style.opacity = '1';
    coversheetsTh.textContent = 'Coversheets';
    headerRow.appendChild(coversheetsTh);

    tableHead.appendChild(headerRow);

    // Calculate total coversheets
    let totalCoversheets = 0;

    // Create data rows (show first 5 rows)
    const previewRows = excelData.slice(0, 5);
    previewRows.forEach((row, rowIndex) => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid #e2e8f0';
        tr.style.opacity = '1';
        tr.className = 'hover:bg-slate-50 transition-colors';

        excelHeaders.forEach((_, index) => {
            const td = document.createElement('td');
            td.className = 'px-6 py-4 text-sm';
            td.style.color = '#1e293b';
            td.style.opacity = '1';
            td.style.fontWeight = '500';
            td.textContent = row[index] || '-';
            tr.appendChild(td);
        });

        // Add Revision column value from stored data
        const revisions = getCustomerRevisions(customerData[rowIndex]);
        const revisionTd = document.createElement('td');
        revisionTd.className = 'px-6 py-4 text-sm font-bold';
        revisionTd.style.opacity = '1';

        if (revisions.length > 0) {
            revisionTd.style.backgroundColor = '#d1fae5';
            revisionTd.style.color = '#065f46';
            revisionTd.innerHTML = revisions.map(rev =>
                `<span style="display: inline-block; background-color: #2563eb; color: white; padding: 4px 10px; border-radius: 6px; margin: 2px; font-size: 12px; font-weight: 600; opacity: 1;">${rev}</span>`
            ).join(' ');
            totalCoversheets += revisions.length;
        } else {
            revisionTd.style.backgroundColor = '#fef3c7';
            revisionTd.style.color = '#92400e';
            revisionTd.textContent = 'None Selected';
        }
        tr.appendChild(revisionTd);

        // Add Coversheets count column
        const coversheetsTd = document.createElement('td');
        coversheetsTd.className = 'px-6 py-4 text-sm font-bold text-center';
        coversheetsTd.style.backgroundColor = '#dbeafe';
        coversheetsTd.style.color = revisions.length > 0 ? '#1e40af' : '#64748b';
        coversheetsTd.style.opacity = '1';
        coversheetsTd.style.fontWeight = '700';
        coversheetsTd.textContent = revisions.length > 0 ? `${revisions.length} file${revisions.length > 1 ? 's' : ''}` : '0 files';
        tr.appendChild(coversheetsTd);

        tableBody.appendChild(tr);
    });

    // Calculate total for all records (not just preview)
    for (let i = 0; i < customerData.length; i++) {
        if (i >= 5) { // Skip already counted preview rows
            const revisions = getCustomerRevisions(customerData[i]);
            totalCoversheets += revisions.length;
        }
    }

    // Update counts
    document.getElementById('rowCount').textContent = excelData.length;
    document.getElementById('coversheetCount').textContent = totalCoversheets;

    // Show preview section
    previewSection.classList.remove('hidden');
}

// Generate coversheets as Word documents (.docx) via backend API
async function generateCoversheets() {
    if (excelData.length === 0) {
        showToast('No data to generate coversheets', 'error');
        return;
    }

    // Load customer data with revisions from LocalStorage
    let customerData = [];
    try {
        const storedData = localStorage.getItem('excelCustomerData');
        if (storedData) {
            customerData = JSON.parse(storedData);
        }
    } catch (error) {
        console.error('Error loading customer data:', error);
    }

    // Build flat records array with selectedRevisions attached
    const records = [];
    for (let i = 0; i < excelData.length; i++) {
        const row = excelData[i];
        const rowData = {};
        excelHeaders.forEach((header, idx) => { rowData[header] = row[idx] || ''; });

        const revisions = getCustomerRevisions(customerData[i]);
        if (revisions.length === 0) continue; // skip customers with no revisions

        rowData.selectedRevisions = revisions;
        records.push(rowData);
    }

    if (records.length === 0) {
        showToast('No revisions selected. Please assign revisions in the Automation Dashboard first.', 'error');
        return;
    }

    // Show progress
    document.getElementById('progressSection').classList.remove('hidden');
    document.getElementById('dataPreviewSection').classList.add('hidden');
    updateProgress(0, 1, 'Sending data to server...');

    try {
        const response = await fetch('/api/generate-docx', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ records, revision: 'A' }),
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({ message: 'Server error' }));
            throw new Error(err.message || 'Server error');
        }

        updateProgress(1, 1, 'Downloading...');

        // Determine filename from Content-Disposition header
        const disposition = response.headers.get('Content-Disposition') || '';
        const match = disposition.match(/filename="?([^"]+)"?/);
        const filename = match ? match[1] : (records.length === 1 ? 'coversheet.docx' : 'coversheets.zip');

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);

        setTimeout(() => {
            document.getElementById('progressSection').classList.add('hidden');
            document.getElementById('dataPreviewSection').classList.remove('hidden');
            showToast(`Downloaded ${filename} with ${records.length} coversheet(s)`, 'success');
        }, 500);

    } catch (error) {
        console.error('❌ Error generating DOCX:', error);
        document.getElementById('progressSection').classList.add('hidden');
        document.getElementById('dataPreviewSection').classList.remove('hidden');
        showToast('Error generating Word document: ' + error.message, 'error');
    }
}

// Get customer revisions as array
function getCustomerRevisions(customerRecord) {
    if (!customerRecord) {
        return [];
    }

    // First, try to get selectedRevisions array (new format)
    if (customerRecord.selectedRevisions && Array.isArray(customerRecord.selectedRevisions)) {
        return customerRecord.selectedRevisions.filter(r => r !== '' && r !== null && r !== undefined);
    }

    // Fallback to revision field (backward compatibility)
    const revision = customerRecord.revision;

    // Handle "Not Set" or empty
    if (!revision || revision === 'Not Set' || revision === '' || revision === null) {
        return [];
    }

    // If it's a comma-separated string, split it
    if (typeof revision === 'string' && revision.includes(',')) {
        return revision.split(',').map(r => r.trim()).filter(r => r !== '');
    }

    // If it's a single value
    if (typeof revision === 'string') {
        return [revision.trim()];
    }

    // If it's already an array
    if (Array.isArray(revision)) {
        return revision.filter(r => r !== '');
    }

    return [];
}

// Generate customer coversheet HTML with specific revision - DYNAMIC VERSION
// Generate customer coversheet HTML with specific revision - TEMPLATE ENGINE VERSION
function generateCoversheetHTML(data, index) {
    console.log('🎨 Generating coversheet using template engine for index:', index);

    // Use the specific revision passed in data.currentRevision
    const storedRevision = data.currentRevision || '0';

    // Add index to data for template
    data.index = index;

    // Get the coversheet template
    const template = getCoversheetTemplate();

    // Generate dynamic table rows
    const dynamicRows = generateDynamicTableRows(data);

    // Create a modified template with dynamic rows
    let filledTemplate = template.replace('{{dynamicRows}}', dynamicRows);

    // Fill the template with data
    filledTemplate = fillTemplate(filledTemplate, data, storedRevision);

    console.log('✅ Coversheet generated with template engine');

    return filledTemplate;
}


// Update progress bar
function updateProgress(current, total, status = null) {
    const percentage = Math.round((current / total) * 100);
    document.getElementById('progressBar').style.width = percentage + '%';
    document.getElementById('progressText').textContent = percentage + '%';

    if (status) {
        document.getElementById('progressStatus').textContent = status;
    } else {
        document.getElementById('progressStatus').textContent = `Processing ${current} of ${total} customer records...`;
    }
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) {
        // Create toast if it doesn't exist
        const toastEl = document.createElement('div');
        toastEl.id = 'toast';
        toastEl.className = 'fixed bottom-6 right-6 px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 z-50 transition-all';
        toastEl.innerHTML = `
            <span class="material-symbols-outlined" id="toastIcon">check_circle</span>
            <span id="toastMessage"></span>
        `;
        document.body.appendChild(toastEl);
    }

    const toastEl = document.getElementById('toast');
    const toastIcon = document.getElementById('toastIcon');
    const toastMessage = document.getElementById('toastMessage');

    // Set message
    toastMessage.textContent = message;

    // Set style based on type
    if (type === 'success') {
        toastEl.className = 'fixed bottom-6 right-6 bg-emerald-500 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 z-50 transition-all';
        toastIcon.textContent = 'check_circle';
    } else if (type === 'error') {
        toastEl.className = 'fixed bottom-6 right-6 bg-red-500 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 z-50 transition-all';
        toastIcon.textContent = 'error';
    }

    // Show toast
    toastEl.classList.remove('hidden');

    // Hide after 4 seconds
    setTimeout(() => {
        toastEl.classList.add('hidden');
    }, 4000);
}

// Sanitize file name
function sanitizeFileName(name) {
    return name.toString()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_')
        .substring(0, 50);
}


// Override generateCoversheetHTML with template engine version
function generateCoversheetHTML(data, index) {
    console.log('🎨 Generating coversheet using template engine for index:', index);

    // Use the specific revision passed in data.currentRevision
    const storedRevision = data.currentRevision || '0';

    // Add index to data for template
    data.index = index;

    // Get the coversheet template
    const template = getCoversheetTemplate();

    // Generate dynamic table rows
    const dynamicRows = generateDynamicTableRows(data);

    // Create a modified template with dynamic rows
    let filledTemplate = template.replace('{{dynamicRows}}', dynamicRows);

    // Fill the template with data
    filledTemplate = fillTemplate(filledTemplate, data, storedRevision);

    console.log('✅ Coversheet generated with template engine');

    return filledTemplate;
}


// Load stored Excel data from LocalStorage on page load
function loadStoredExcelData() {
    console.log('🔍 Checking for stored Excel data in LocalStorage...');

    try {
        const storedData = localStorage.getItem('excelCustomerData');

        if (!storedData) {
            console.log('ℹ️ No stored Excel data found. Please upload an Excel file.');
            return;
        }

        const customerData = JSON.parse(storedData);

        if (!customerData || customerData.length === 0) {
            console.log('ℹ️ Stored data is empty. Please upload an Excel file.');
            return;
        }

        console.log('✅ Found stored Excel data:', customerData.length, 'records');
        console.log('📋 Sample record:', customerData[0]);

        // Extract headers from first record
        const firstRecord = customerData[0];
        excelHeaders = Object.keys(firstRecord).filter(key =>
            !['selectedRevisions', 'revision', 'status', 'automatedAt', 'currentRevision'].includes(key)
        );

        // Convert records to array format for excelData
        excelData = customerData.map(record => {
            return excelHeaders.map(header => record[header] || '');
        });

        console.log('📊 Loaded headers:', excelHeaders);
        console.log('📊 Loaded data rows:', excelData.length);

        // Update UI to show loaded data
        const fileNameDisplay = document.getElementById('fileNameDisplay');
        if (fileNameDisplay) {
            fileNameDisplay.textContent = 'Previously Uploaded Excel Data';
        }

        // Show file info
        const uploadedFileName = document.getElementById('uploadedFileName');
        const fileDetails = document.getElementById('fileDetails');
        const fileInfo = document.getElementById('fileInfo');

        if (uploadedFileName && fileDetails && fileInfo) {
            uploadedFileName.textContent = 'Stored Excel Data (from previous upload)';
            fileDetails.textContent = `${customerData.length} customer records • ${excelHeaders.length} columns`;
            fileInfo.classList.remove('hidden');
        }

        // Display data preview
        displayDataPreview();

        // Show success message
        showToast(`Loaded ${customerData.length} customer records from previous upload`, 'success');

        console.log('✅ Successfully loaded stored Excel data');

    } catch (error) {
        console.error('❌ Error loading stored Excel data:', error);
        showToast('Error loading stored data. Please upload Excel file again.', 'error');
    }
}

// Function to refresh data from LocalStorage (useful after returning from automation page)
function refreshDataFromStorage() {
    console.log('🔄 Refreshing data from LocalStorage...');
    loadStoredExcelData();
}
