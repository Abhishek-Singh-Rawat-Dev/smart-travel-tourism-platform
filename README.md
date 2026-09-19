# 🌍 Smart Travel & Tourism Platform

A modern full-stack web platform built for smart tourism, intelligent AI trip planning, booking management, real-time emergency safety, and group expense tracking.

🚀 **Live Deployment on Vercel:** [https://smart-travel-tourism-platform.vercel.app](https://smart-travel-tourism-platform.vercel.app)  
🐙 **GitHub Repository:** [https://github.com/Abhishek-Singh-Rawat-Dev/smart-travel-tourism-platform](https://github.com/Abhishek-Singh-Rawat-Dev/smart-travel-tourism-platform)

---

## 📁 Systematic Project Structure

The project is structured cleanly into distinct layers:

```text
major project/
├── 🌐 frontend/              # Client-Side Application
│   ├── index.html            # Modern 2026 Home Page (Full-viewport video hero & Bento Grid)
│   ├── pages/                # Subpages (dashboard.html, login.html, register.html)
│   ├── css/                  # Luxury Dark Glassmorphism Styling (style.css)
│   └── js/                   # Frontend controllers (app.js, auth.js, dashboard.js)
│
├── ⚙️ backend/               # Server-Side Application
│   ├── server.js             # Express.js Application Server & Routing
│   ├── routes/               # 15 REST API Routes (auth, tripPlanner, booking, weather, etc.)
│   ├── middleware/           # JWT Auth Verification & Role-Based Access Control
│   └── uploads/              # Local file uploads directory
│
├── 🗄️ database/              # Data Persistence Layer
│   ├── config/               # MongoDB Mongoose connection handler (db.js)
│   ├── models/               # 15 Mongoose Schema Models (User, Trip, Booking, etc.)
│   └── seeds/                # Seed scripts with sample data & admin account (seed.js)
│
├── ☁️ api/                   # Serverless Cloud Handlers (Vercel Edge API index.js)
├── 📦 public/                # Synced Production Static Assets (Served via Vercel CDN)
├── 📑 docs/                  # Project Reports, Presentations & Architecture DFDs
│
├── 🔒 .gitignore             # Strict rules protecting all keys, .env & secrets
├── 📄 .env.example           # Safe placeholder environment template (no real secrets)
├── ⚙️ vercel.json            # Vercel deployment routing & API rewrites
├── 📋 package.json           # Dependencies and build scripts
└── 👥 PROJECT_STRUCTURE_AND_TEAM_ROLES.md # 4-Member Project Work Allocation Report
```

---

## 🔒 Security & Git Protection (`.gitignore`)

All sensitive files, private credentials, and environment configs are strictly protected and prevented from being pushed to Git:

- **`.env` / `*.env`**: Database connection URI, JWT secrets, and external API keys stay **only on your local machine** and are never committed.
- **`*.pem` / `*.key` / `credentials.json`**: Certificates and private SSH/service account keys are blocked.
- **`.vercel/`**: Vercel deployment state, project IDs, and authentication tokens are blocked.
- **`node_modules/`**: Heavy package binaries are ignored.
- **`.env.example`**: Only safe placeholder values (`<username>`, `<password>`, `demo_key`) are committed for reference.

---

## 👥 Team Work Distribution (4 Members)

For a detailed breakdown of individual contributions across all 4 team members, see:  
👉 **[PROJECT_STRUCTURE_AND_TEAM_ROLES.md](./PROJECT_STRUCTURE_AND_TEAM_ROLES.md)**

| Member | Assigned Area | Key Modules |
| :--- | :--- | :--- |
| **Abhishek Singh Rawat** | System Architecture & Core Backend | Project Setup, Auth, DB Config, Trip Planner, Permitting, Vercel & Deployment |
| **Member 2** | Booking & Financial Services | Hotel/Transport Booking, Razorpay Payment, Expense Tracker, Price Drop Alerts |
| **Member 3** | Travel Intelligence & Location Services | Live Weather, Real-time Navigation, Road Conditions, Nearby Services Discovery |
| **Member 4** | Safety, Eco-Tourism & Offline Mobility | SOS Emergency Response, Offline BLE Mesh, Eco-Score, Cultural Heritage Audio |

---

## 🚀 How to Run Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and configure your credentials:
```bash
cp .env.example .env
```

### 3. Seed Database (Optional - Loads sample data & Admin)
```bash
npm run seed
```

### 4. Start Full-Stack Server
```bash
npm run server
```

Open your browser at: **[http://localhost:3000](http://localhost:3000)**

---

## 🔑 Default Credentials (After Seeding)

| Role | Email | Password |
| :--- | :--- | :--- |
| **🛡️ System Admin** | `admin@travelsmart.com` | `password123` |
| **👤 Tourist / Traveller** | `tourist@travelsmart.com` | `password123` |
| **🏢 Service Provider** | `vendor@travelsmart.com` | `password123` |
