const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/budgets', require('./routes/budgets'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/upi', require('./routes/upi'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'Finance Tracker API running' }));

// Error handler
app.use(require('./middleware/errorHandler'));

module.exports = app;
