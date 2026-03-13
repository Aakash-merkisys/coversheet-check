// Template Engine for Coversheet Automation System

/**
 * Fill template with data from Excel record
 * @param {string} template - HTML template with {{placeholders}}
 * @param {object} record - Excel record data
 * @param {string} revision - Current revision
 * @returns {string} Filled HTML template
 */
function fillTemplate(template, record, revision) {
    let html = template;

    // Replace all record fields
    Object.keys(record).forEach(key => {
        const placeholder = `{{${key}}}`;
        const value = record[key] || '';
        html = html.replaceAll(placeholder, value);
    });

    // Replace revision placeholder
    html = html.replaceAll('{{revision}}', revision);
    html = html.replaceAll('{{currentRevision}}', revision);

    // Replace date placeholders
    const now = new Date();
    html = html.replaceAll('{{currentDate}}', now.toLocaleDateString());
    html = html.replaceAll('{{currentTime}}', now.toLocaleTimeString());
    html = html.replaceAll('{{currentDateTime}}', now.toLocaleString());

    // Replace index placeholder if exists
    html = html.replaceAll('{{index}}', record.index || '');

    return html;
}

/**
 * Generate dynamic table rows from record data
 * @param {object} record - Excel record data
 * @param {array} excludeFields - Fields to exclude from table
 * @returns {string} HTML table rows
 */
function generateDynamicTableRows(record, excludeFields = []) {
    const systemFields = ['currentRevision', 'automatedAt', 'selectedRevisions', 'revision', 'status', 'index'];
    const allExcluded = [...systemFields, ...excludeFields];

    let rows = '';

    Object.keys(record).forEach(fieldName => {
        if (allExcluded.includes(fieldName)) return;

        const fieldValue = record[fieldName] || 'Not specified';
        const isEmpty = !record[fieldName] || record[fieldName] === '';

        rows += `
                        <tr>
                            <td class="info-label">
                                <span class="info-icon">📋</span>
                                ${fieldName}
                            </td>
                            <td class="info-value ${isEmpty ? 'empty' : ''}">${fieldValue}</td>
                        </tr>`;
    });

    return rows;
}

/**
 * Get coversheet template
 * @returns {string} HTML template with placeholders
 */
function getCoversheetTemplate() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Coversheet - {{Document Title}} - Rev {{revision}}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .coversheet {
            background: white;
            max-width: 800px;
            width: 100%;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            color: white;
            padding: 50px 40px;
            text-align: center;
            position: relative;
        }
        .revision-badge {
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(255, 255, 255, 0.25);
            backdrop-filter: blur(10px);
            padding: 10px 20px;
            border-radius: 25px;
            font-size: 13px;
            font-weight: 700;
            letter-spacing: 1.5px;
            border: 2px solid rgba(255, 255, 255, 0.4);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }
        .header-icon {
            font-size: 64px;
            margin-bottom: 16px;
            display: block;
        }
        .header h1 {
            font-size: 36px;
            font-weight: 700;
            margin-bottom: 10px;
            letter-spacing: -0.5px;
        }
        .header p {
            font-size: 17px;
            opacity: 0.95;
            font-weight: 500;
        }
        .content {
            padding: 50px 40px;
        }
        .revision-highlight {
            background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
            border: 3px solid #6ee7b7;
            border-radius: 16px;
            padding: 24px;
            margin-bottom: 40px;
            text-align: center;
            box-shadow: 0 4px 15px rgba(16, 185, 129, 0.15);
        }
        .revision-highlight .label {
            font-size: 13px;
            font-weight: 700;
            color: #065f46;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            margin-bottom: 10px;
        }
        .revision-highlight .value {
            font-size: 32px;
            font-weight: 700;
            color: #047857;
            letter-spacing: -0.5px;
        }
        .document-info {
            background: #f8fafc;
            border: 2px solid #e2e8f0;
            border-radius: 16px;
            padding: 32px;
            margin-bottom: 32px;
        }
        .info-table {
            width: 100%;
            border-collapse: collapse;
        }
        .info-table tr {
            border-bottom: 1px solid #e2e8f0;
        }
        .info-table tr:last-child {
            border-bottom: none;
        }
        .info-table td {
            padding: 16px 0;
        }
        .info-label {
            font-size: 13px;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 1px;
            width: 250px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .info-icon {
            font-size: 20px;
            color: #2563eb;
        }
        .info-value {
            font-size: 18px;
            color: #1e293b;
            font-weight: 600;
        }
        .info-value.empty {
            color: #94a3b8;
            font-style: italic;
            font-weight: 500;
        }
        .footer {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            padding: 28px 40px;
            border-top: 2px solid #e2e8f0;
            text-align: center;
        }
        .footer p {
            font-size: 14px;
            color: #64748b;
            font-weight: 500;
            margin-bottom: 8px;
        }
        .footer .timestamp {
            font-size: 12px;
            color: #94a3b8;
            margin-top: 6px;
        }
        @media print {
            body {
                background: white;
                padding: 0;
            }
            .coversheet {
                box-shadow: none;
                max-width: 100%;
            }
        }
    </style>
</head>
<body>
    <div class="coversheet">
        <div class="header">
            <span class="revision-badge">REV: {{revision}}</span>
            <span class="header-icon">📄</span>
            <h1>DOCUMENT COVERSHEET</h1>
            <p>Automated Document Management System</p>
        </div>
        
        <div class="content">
            <!-- Revision Highlight Section -->
            <div class="revision-highlight">
                <div class="label">Current Revision</div>
                <div class="value">{{revision}}</div>
            </div>

            <!-- Document Information Table - DYNAMIC CONTENT -->
            <div class="document-info">
                <table class="info-table">
                    <tbody>
                        {{dynamicRows}}
                        <tr>
                            <td class="info-label">
                                <span class="info-icon">🔄</span>
                                Revision
                            </td>
                            <td class="info-value" style="color: #047857; font-weight: 700; font-size: 20px;">{{revision}}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="footer">
            <p><strong>Generated by Coversheet Automation System</strong></p>
            <p class="timestamp">Generated on {{currentDate}} at {{currentTime}}</p>
            <p class="timestamp">Document ID: {{Document ID}} • Revision: {{revision}}</p>
        </div>
    </div>
</body>
</html>`;
}

/**
 * Validate template placeholders against record data
 * @param {string} template - HTML template
 * @param {object} record - Excel record
 * @returns {object} Validation result
 */
function validateTemplate(template, record) {
    const placeholderRegex = /\{\{([^}]+)\}\}/g;
    const placeholders = [];
    let match;

    while ((match = placeholderRegex.exec(template)) !== null) {
        placeholders.push(match[1]);
    }

    const missingFields = placeholders.filter(p =>
        !record.hasOwnProperty(p) &&
        !['revision', 'currentRevision', 'currentDate', 'currentTime', 'currentDateTime', 'index', 'dynamicRows'].includes(p)
    );

    return {
        valid: missingFields.length === 0,
        placeholders,
        missingFields
    };
}

// Export functions for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        fillTemplate,
        generateDynamicTableRows,
        getCoversheetTemplate,
        validateTemplate
    };
}
