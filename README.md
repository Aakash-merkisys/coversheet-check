# Customer Management Dashboard (Frontend Demo)



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

