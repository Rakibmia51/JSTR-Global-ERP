# JSTR Global Limited – Web Development Project

Welcome to the official repository of the **JSTR Global Limited** Web Application. This is a robust, enterprise-grade full-stack web application built using the **MERN Stack** (MongoDB, Express.js, React.js, Node.js). The platform is designed to streamline internal business operations, manage financial records, track marketing performance, and calculate sales commissions.

---

## 🚀 Key Modules & Feature List

### 1. 🔐 User Login & Registration System
*   **Role-Based Access Control (RBAC):** Distinct permissions for Admin, Managers, Sales Representatives, and Clients.
*   **Secure Authentication:** Password hashing using `bcryptjs` and session management via JSON Web Tokens (JWT).
*   **Multi-Factor Authentication (MFA):** Optional OTP verification via email or SMS for enhanced security.
*   **Profile Management:** User-specific dashboards with personal details, activity logs, and password reset options.

### 2. 🧾 Invoice & Accounting Module
*   **Automated Invoice Generation:** Create, update, and send professional PDF invoices dynamically.
*   **Expense Tracking:** Log operational costs, vendor payments, and recurring business expenses.
*   **Financial Reporting:** Real-time generation of Profit & Loss statements, balance sheets, and tax summaries.
*   **Payment Gateway Integration:** Secure online payment collection via Stripe, PayPal, or local gateways (SSLCommerz).

### 3. 📊 Marketing & Sales Tracking System
*   **Lead Management Pipeline:** Track potential customers from initial contact to successful conversion (CRM).
*   **Campaign Analytics:** Monitor performance, ROI, and click-through rates of marketing campaigns.
*   **Visual Dashboards:** Interactive charts and graphs (using Chart.js or Recharts) showing daily, weekly, and monthly sales trends.
*   **Activity Logs:** Audit trails detailing which team member interacted with which client or lead.

### 4. 💰 Commission-Based Sales System
*   **Dynamic Commission Rules:** Tiered structure configuration (e.g., 5% commission for Tier 1, 10% for Tier 2 sales targets).
*   **Automated Calculations:** Instant payout calculations upon successful invoice clearance.
*   **Payout Dashboard:** Dedicated view for sales agents to track earned, pending, and disbursed commissions.
*   **Approval Workflow:** Admin authorization panel to review and release monthly commission payouts.

### 5. 🏢 Business Portfolio Management
*   **Project Showcase:** Dynamic CRUD (Create, Read, Update, Delete) system to manage company case studies and past work.
*   **Service Catalog:** Public or client-facing listings of JSTR Global's business solutions and pricing plans.
*   **Media Gallery:** Optimized image and video hosting for project assets (integrated with Cloudinary or AWS S3).
*   **Client Testimonials:** Section to publish authenticated reviews and feedback from corporate clients.

---

## 🛠️ Tech Stack Used

*   **Frontend:** React.js (with Redux Toolkit for state management & Tailwind CSS for UI)
*   **Backend:** Node.js & Express.js (RESTful API Architecture)
*   **Database:** MongoDB Atlas (NoSQL database with Mongoose ODM)
*   **Hosting/DevOps:** AWS / Vercel (Frontend) / Heroku or Render (Backend)

---

## 💻 Getting Started & Installation

Follow these steps to set up the project locally on your machine.

### Prerequisites
*   Node.js (v18.x or higher installed)
*   MongoDB Atlas Account or local MongoDB Community Server

### 1. Clone the Repository
```bash
git clone https://github.com
cd jstr-global-web-app
```

### 2. Backend Setup
```bash
cd backend
npm install
```
*Create a `.env` file in the `backend` folder and add:*
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
STRIPE_SECRET_KEY=your_stripe_key
```
*Run the backend server:*
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```
*Create a `.env` file in the `frontend` folder and add:*
```env
REACT_APP_API_URL=http://localhost:5000/api
```
*Run the frontend server:*
```bash
npm start
```

---

## 🔒 Security Best Practices Implemented
*   Data validation using `Joi` or `Zod`.
*   HTTP header security using `Helmet`.
*   API rate-limiting to prevent Brute-Force and DDoS attacks.
*   CORS configuration to restrict unauthorized domain requests.

---

## 👥 Contributors & Support
Developed for internal and client management operations of **JSTR Global Limited**. For technical assistance, bug reports, or feature requests, please contact the development team at `tech@jstrglobal.com`.
