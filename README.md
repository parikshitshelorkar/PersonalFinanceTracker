# 💰 Personal Finance Tracker

A full-stack Personal Finance Tracker built with React, Node.js/Express, and MySQL.

---

## 🚀 Features

- **Dashboard** — Balance, income, expense summary + recent transactions
- **Add Transactions** — With category, amount, date, notes, payment mode
- **Simulated UPI Payment** — QR code, polling, auto-confirm flow
- **Analytics** — Pie chart, bar chart, line chart (Recharts)
- **Smart Insights** — Auto-generated spending comparisons
- **Budget Tracking** — Set monthly budgets per category, alerts at threshold
- **Transaction History** — Search, filter by type/category/date range
- **Auth** — JWT-based login/register

---

## 🗂️ Project Structure

```
finance-tracker/
├── client/          # React (Vite) frontend
├── server/          # Node.js + Express backend
├── database/        # MySQL schema + seed data
└── README.md
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js v18+
- MySQL 8.0+

---

### 1. Database Setup

```bash
# Login to MySQL
mysql -u root -p

# Run schema
source /path/to/finance-tracker/database/schema.sql

# Run seed data
source /path/to/finance-tracker/database/seed.sql
```

Or combined:
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p finance_tracker < database/seed.sql
```

---

### 2. Backend Setup

```bash
cd server

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your MySQL credentials
nano .env
```

**.env file:**
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=finance_tracker
JWT_SECRET=supersecretkey123
```

```bash
# Start server (development)
npm run dev

# Or production
npm start
```

Server runs on: `http://localhost:5000`

---

### 3. Frontend Setup

```bash
cd client

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs on: `http://localhost:5173`

---

### 4. Demo Login

After running seed.sql, use the demo account:
- **Email:** `demo@finance.com`
- **Password:** `demo1234`

Or click **"Try Demo Account"** on the login page.

---

## 📡 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| GET | /api/transactions | Get all transactions (filterable) |
| POST | /api/transactions | Add transaction |
| PUT | /api/transactions/:id | Update transaction |
| DELETE | /api/transactions/:id | Delete transaction |
| GET | /api/transactions/summary | Monthly summary |
| GET | /api/budgets | Get budgets |
| POST | /api/budgets | Create/update budget |
| GET | /api/budgets/alerts | Budget alerts |
| GET | /api/analytics/category-split | Pie chart data |
| GET | /api/analytics/monthly | Bar chart data |
| GET | /api/analytics/trend | Line chart data |
| GET | /api/analytics/insights | Smart insights |
| POST | /api/upi/initiate | Start UPI session |
| GET | /api/upi/status/:token | Poll status |
| POST | /api/upi/confirm/:token | Confirm payment |

---

## 🧪 UPI Simulation Flow

1. User selects UPI as payment mode
2. Modal opens — user enters UPI ID
3. `POST /api/upi/initiate` creates session, starts 6s auto-timer
4. QR code displayed, frontend polls status every 2s
5. After 6s, backend auto-confirms → status = `success`
6. Transaction saved with UPI reference ID

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router v6 |
| Charts | Recharts |
| HTTP | Axios |
| Backend | Node.js, Express 4 |
| Database | MySQL 8 |
| Auth | JWT + bcryptjs |
| QR Code | qrcode.react |

---

## 📱 Mobile Support

The app is fully responsive. On mobile, the sidebar collapses into a slide-out menu via a ☰ hamburger button.

---

## 🎓 PBL Evaluation Points

- Normalized relational database schema (5 tables with FK constraints)
- RESTful API design with proper HTTP methods and status codes
- JWT authentication with bcrypt password hashing
- Context API for global state management
- Async UPI simulation with polling pattern
- Recharts integration for data visualization
- Debounced search in transaction history
- Budget alerts with configurable threshold percentage
- Mobile-first responsive design
