// DOCX Generator for Coversheet Automation System
const {
    Document, Packer, Paragraph, Table, TableRow, TableCell,
    TextRun, HeadingLevel, AlignmentType, BorderStyle,
    WidthType, ShadingType, Header, Footer, PageNumber,
    VerticalAlign, TableLayoutType
} = require('docx');

const SYSTEM_FIELDS = ['currentRevision', 'automatedAt', 'selectedRevisions', 'revision', 'status', 'index'];

// Colours matching the HTML template
const BLUE_DARK = '1D4ED8';
const BLUE_MID = '2563EB';
const GREEN_BG = 'D1FAE5';
const GREEN_TEXT = '047857';
const SLATE_BG = 'F8FAFC';
const SLATE_BORDER = 'E2E8F0';
const SLATE_LABEL = '64748B';
const SLATE_VALUE = '1E293B';

/**
 * Build a single coversheet Word document for one record + revision.
 * @param {object} record  - flat key/value object from Excel row
 * @param {string} revision - revision string
 * @returns {Promise<Buffer>} - .docx file as a Buffer
 */
async function buildCoversheetDocx(record, revision) {
    const now = new Date();
    const dateStr = now.toLocaleDateString();
    const timeStr = now.toLocaleTimeString();

    // Collect data rows (exclude system fields)
    const dataFields = Object.keys(record).filter(k => !SYSTEM_FIELDS.includes(k));

    // ── Header section rows ──────────────────────────────────────────────────
    const headerRows = [
        new Paragraph({
            children: [new TextRun({ text: 'DOCUMENT COVERSHEET', bold: true, size: 52, color: 'FFFFFF', font: 'Segoe UI' })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 100 },
            shading: { type: ShadingType.SOLID, color: BLUE_MID },
        }),
        new Paragraph({
            children: [new TextRun({ text: 'Automated Document Management System', size: 24, color: 'FFFFFF', font: 'Segoe UI' })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 0 },
            shading: { type: ShadingType.SOLID, color: BLUE_MID },
        }),
        new Paragraph({
            children: [new TextRun({ text: `REV: ${revision}`, bold: true, size: 22, color: 'FFFFFF', font: 'Segoe UI' })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 300 },
            shading: { type: ShadingType.SOLID, color: BLUE_DARK },
        }),
    ];

    // ── Revision highlight box ───────────────────────────────────────────────
    const revisionBox = [
        new Paragraph({
            children: [new TextRun({ text: 'CURRENT REVISION', bold: true, size: 18, color: '065F46', font: 'Segoe UI' })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 60 },
            shading: { type: ShadingType.SOLID, color: GREEN_BG },
            border: { top: { style: BorderStyle.SINGLE, size: 6, color: '6EE7B7' }, bottom: { style: BorderStyle.SINGLE, size: 6, color: '6EE7B7' }, left: { style: BorderStyle.SINGLE, size: 6, color: '6EE7B7' }, right: { style: BorderStyle.SINGLE, size: 6, color: '6EE7B7' } },
        }),
        new Paragraph({
            children: [new TextRun({ text: revision, bold: true, size: 56, color: GREEN_TEXT, font: 'Segoe UI' })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 200 },
            shading: { type: ShadingType.SOLID, color: GREEN_BG },
            border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '6EE7B7' }, left: { style: BorderStyle.SINGLE, size: 6, color: '6EE7B7' }, right: { style: BorderStyle.SINGLE, size: 6, color: '6EE7B7' } },
        }),
    ];

    // ── Data table ───────────────────────────────────────────────────────────
    const tableRows = dataFields.map(fieldName => {
        const val = record[fieldName] ? String(record[fieldName]) : 'Not specified';
        return new TableRow({
            children: [
                new TableCell({
                    children: [new Paragraph({
                        children: [new TextRun({ text: fieldName.toUpperCase(), bold: true, size: 18, color: SLATE_LABEL, font: 'Segoe UI' })],
                        spacing: { before: 80, after: 80 },
                    })],
                    width: { size: 35, type: WidthType.PERCENTAGE },
                    shading: { type: ShadingType.SOLID, color: SLATE_BG },
                    verticalAlign: VerticalAlign.CENTER,
                    margins: { top: 80, bottom: 80, left: 120, right: 120 },
                }),
                new TableCell({
                    children: [new Paragraph({
                        children: [new TextRun({ text: val, size: 20, color: SLATE_VALUE, font: 'Segoe UI', bold: val !== 'Not specified' })],
                        spacing: { before: 80, after: 80 },
                    })],
                    width: { size: 65, type: WidthType.PERCENTAGE },
                    verticalAlign: VerticalAlign.CENTER,
                    margins: { top: 80, bottom: 80, left: 120, right: 120 },
                }),
            ],
        });
    });

    // Add revision row at the bottom of the table
    tableRows.push(new TableRow({
        children: [
            new TableCell({
                children: [new Paragraph({
                    children: [new TextRun({ text: 'REVISION', bold: true, size: 18, color: SLATE_LABEL, font: 'Segoe UI' })],
                    spacing: { before: 80, after: 80 },
                })],
                shading: { type: ShadingType.SOLID, color: SLATE_BG },
                verticalAlign: VerticalAlign.CENTER,
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
            }),
            new TableCell({
                children: [new Paragraph({
                    children: [new TextRun({ text: revision, bold: true, size: 24, color: GREEN_TEXT, font: 'Segoe UI' })],
                    spacing: { before: 80, after: 80 },
                })],
                verticalAlign: VerticalAlign.CENTER,
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
            }),
        ],
    }));

    const dataTable = new Table({
        rows: tableRows,
        width: { size: 100, type: WidthType.PERCENTAGE },
        layout: TableLayoutType.FIXED,
        borders: {
            top: { style: BorderStyle.SINGLE, size: 4, color: SLATE_BORDER },
            bottom: { style: BorderStyle.SINGLE, size: 4, color: SLATE_BORDER },
            left: { style: BorderStyle.SINGLE, size: 4, color: SLATE_BORDER },
            right: { style: BorderStyle.SINGLE, size: 4, color: SLATE_BORDER },
            insideH: { style: BorderStyle.SINGLE, size: 2, color: SLATE_BORDER },
            insideV: { style: BorderStyle.SINGLE, size: 2, color: SLATE_BORDER },
        },
    });

    // ── Footer ───────────────────────────────────────────────────────────────
    const footerParagraphs = [
        new Paragraph({
            children: [new TextRun({ text: 'Generated by Coversheet Automation System', bold: true, size: 18, color: SLATE_LABEL, font: 'Segoe UI' })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 300, after: 60 },
            border: { top: { style: BorderStyle.SINGLE, size: 4, color: SLATE_BORDER } },
        }),
        new Paragraph({
            children: [new TextRun({ text: `Generated on ${dateStr} at ${timeStr}`, size: 16, color: '94A3B8', font: 'Segoe UI' })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 60 },
        }),
        new Paragraph({
            children: [new TextRun({ text: `Revision: ${revision}`, size: 16, color: '94A3B8', font: 'Segoe UI' })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 200 },
        }),
    ];

    const doc = new Document({
        sections: [{
            properties: {
                page: {
                    margin: { top: 720, bottom: 720, left: 1080, right: 1080 },
                },
            },
            children: [
                ...headerRows,
                ...revisionBox,
                dataTable,
                ...footerParagraphs,
            ],
        }],
    });

    return Packer.toBuffer(doc);
}

module.exports = { buildCoversheetDocx };
