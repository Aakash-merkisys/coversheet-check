#zq Customer Management Dashboard (Frontend Demo)



---

## Project Overview
This project is a modern SaaS-style Customer Management Dashboard built as a frontend demonstration of an admin interface used to manage customers, documents, and analytics.

The application provides an intuitive UI for administrators to:

- View customer data  
- Analyze metrics  
- Manage documents  
- Interact with customer records  

All within a clean and professional dashboard experience.

The project is deployed using **Vercel**, which enables fast deployment and global delivery of frontend applications.

---

## Key Features

### Coversheet Generator with Revision Automation
Automatically generate individual customer coversheets from Excel data with automated revision management.

Features:

- Upload Excel files with customer records (.xlsx, .xls)
- Automatic field mapping for customer data (ID, Name, Phone Number)
- Individual coversheet generation (one per customer)
- Batch processing of multiple customer records
- Real-time data preview with revision column
- Progress tracking during generation
- Download all coversheets as a single ZIP file
- Professional customer-focused coversheet templates
- Automated revision tracking and display
- Revision badge in coversheet header
- Highlighted revision section in each coversheet
- Customer ID-based file naming (e.g., `coversheet_101.html`)

Required Excel Columns:
- ID (Customer ID, Client ID, Record ID)
- Name (Customer Name, Full Name)
- Phone Number (Phone, Contact, Mobile)

Optional Excel Columns:
- Email (Email Address)
- Address (Location, Street)

Workflow:
1. Set revision number in Automation page (stored in LocalStorage)
2. Upload Excel file with customer records
3. Preview customer data with revision column
4. Generate individual coversheets (one per customer)
5. Each coversheet automatically includes customer info and current revision
6. Download ZIP file with all customer coversheets

File Naming:
- Format: `coversheet_{customerID}.html`
- Example: `coversheet_101.html`, `coversheet_102.html`
- ZIP file: `customer_coversheets_{timestamp}.zip`

Revision Management:
- Set revision from Automation page
- Revision persists across page refreshes (LocalStorage)
- All generated coversheets display the current revision
- Revision badge appears in coversheet header
- Highlighted revision section at top of coversheet content
- Timestamp tracking for revision updates

---

### Customer Directory
- View customer list with key information
- Customer status indicators
- Document count tracking
- Action menu for each customer

---

### Quick View Modal
Clicking a customer row opens a detailed modal view.

The modal displays:

- Customer Name  
- Email  
- Phone Number  
- Status  
- Document overview  

---

### Modern SaaS UI
- Clean dashboard layout
- Responsive design
- Professional analytics section
- Status badges with visual indicators

---

### Export Functionality
Administrators can export customer data.

Features include:

- Export customer table data
- Download CSV reports

---

### Analytics Dashboard
Provides visual insights into customer metrics.

Features:

- Customer growth visualization
- Doughnut chart showing customer distribution
- Modern chart styling with gradients

---

## Smart UI States

The dashboard includes multiple user experience improvements.

### Skeleton Loading
Displays animated placeholders while data loads.

```
████████████
████████████
████████████
```

---

### Empty State UI
Displays a helpful message when no data exists.

Example:

```
No customers found
Add your first customer to get started
```

---

### Data Fallback Handling
Missing values are handled gracefully using placeholders such as:

```
-
N/A
```

---

## UI Enhancements

### Action Menu
Each customer row includes a contextual action menu with options such as:

- Quick View
- Edit Customer
- View Documents
- Delete Customer

---

### Micro-interactions
Improves the user experience through:

- Hover animations
- Modal transitions
- Button feedback effects

---

### Status System
Customer records support multiple statuses:

- Active  
- Pending  
- Suspended  

Each status includes dedicated styling and visual indicators.

---

## Tech Stack

### Frontend Technologies
- HTML5
- CSS3
- JavaScript
- Chart.js for analytics visualization
- SheetJS (xlsx) for Excel file processing
- JSZip for ZIP file generation

### Deployment
- Vercel hosting

---

## Project Structure

```
project
│
├── index.html
├── customers.html
├── clients.html
├── automations.html
├── coversheet-generator.html (NEW)
├── coversheet-generator.js (NEW)
├── create-sample-excel.html (NEW)
├── script.js
├── premium-styles.css
├── styles.css
└── assets
```

---

## Dashboard Pages

### Coversheet Generator with Revision Automation
Automated coversheet generation from Excel data with revision management.

Features:

- Excel file upload and validation
- Data preview with column mapping
- Batch coversheet generation
- ZIP file download with all coversheets
- Progress tracking and status updates
- Automated revision tracking
- Revision display in all generated coversheets
- LocalStorage-based revision persistence

---

### Main Dashboard
Displays analytics cards and charts.

Features:

- Customer metrics
- Activity overview
- Analytics graphs

---

### Customer Directory
Allows administrators to:

- View customer records
- Search customers
- Export customer data
- Access quick actions

---

## UX Design Goals

The dashboard was designed with the following goals:

- Clean SaaS user interface  
- Fast interaction workflows  
- Professional admin experience  
- Production-ready frontend showcase  

---

## Use Cases

This dashboard UI can be used for:

- CRM platforms  
- Customer document management systems  
- Admin dashboards  
- Internal business tools  

---

## Future Improvements

Planned improvements include:

- Backend integration
- Authentication system
- Role-based admin access
- Advanced customer filtering
- Document preview system



---

## Backend Setup & Deployment

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Start the backend server:
```bash
npm start
```

The server will run on `http://localhost:3000`

3. Open the application:
- Navigate to `http://localhost:3000/coversheet-generator.html`
- Upload an Excel file to test the upload feature

### Dependencies

The backend uses the following packages:
- `express` - Web server framework
- `multer` - File upload middleware
- `xlsx` - Excel file parsing
- `cors` - Cross-origin resource sharing

All dependencies are listed in `package.json` and will be installed automatically.

### Deployment to Render

#### Option 1: Using render.yaml (Recommended)

1. Push your code to GitHub
2. Connect your GitHub repository to Render
3. Render will automatically detect `render.yaml` and configure the service
4. Click "Create Web Service"
5. Your app will be deployed automatically

#### Option 2: Manual Configuration

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure the service:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
4. Click "Create Web Service"

### Environment Variables

The application uses `process.env.PORT` which is automatically set by Render. No additional environment variables are required.

### API Endpoints

- `GET /api/health` - Health check endpoint
- `POST /api/upload-excel` - Upload and process Excel files
  - Accepts: `multipart/form-data` with field name `excelFile`
  - File types: `.xlsx`, `.xls`
  - Max size: 10MB
  - Returns: JSON with parsed customer records

### File Upload Configuration

- Uploaded files are temporarily stored in the `uploads/` directory
- Files are automatically deleted after processing
- Maximum file size: 10MB
- Supported formats: Excel (.xlsx, .xls)

### Troubleshooting

**Issue**: Excel upload fails with "No file uploaded"
- **Solution**: Ensure the form field name is `excelFile`

**Issue**: Server not starting on Render
- **Solution**: Check that `package.json` has the correct start script: `"start": "node server.js"`

**Issue**: CORS errors
- **Solution**: The server already includes CORS middleware. Ensure you're using relative URLs (`/api/upload-excel`) instead of absolute URLs

**Issue**: File size limit exceeded
- **Solution**: Reduce Excel file size or increase the limit in `server.js` (multer configuration)

### Testing the Backend

Run the test script to verify backend functionality:
```bash
npm test
```

This will test the Excel upload endpoint and verify data parsing.
