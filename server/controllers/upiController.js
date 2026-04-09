const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const initiatePayment = async (req, res) => {
  const userId = req.userId;
  const { amount, payee_upi, payee_name } = req.body;

  if (!amount || !payee_upi)
    return res.status(400).json({ success: false, message: 'Amount and payee UPI required' });

  const sessionToken = uuidv4();

  await db.query(
    `INSERT INTO upi_sessions (session_token, user_id, amount, payee_upi, payee_name)
     VALUES (?, ?, ?, ?, ?)`,
    [sessionToken, userId, amount, payee_upi, payee_name || 'Unknown Payee']
  );

  // Auto-confirm after 6 seconds (simulation)
  setTimeout(() => autoConfirm(sessionToken), 6000);

  res.json({
    success: true,
    session_token: sessionToken,
    upi_link: `upi://pay?pa=${payee_upi}&pn=${encodeURIComponent(payee_name || '')}&am=${amount}&cu=INR`,
    message: 'Payment initiated. Will auto-confirm in 6 seconds.'
  });
};

const autoConfirm = async (token) => {
  try {
    const refId = 'TXN' + Date.now() + Math.floor(Math.random() * 1000);
    await db.query(
      `UPDATE upi_sessions SET status='success', ref_id=?, confirmed_at=NOW()
       WHERE session_token=? AND status='pending'`,
      [refId, token]
    );
  } catch (err) {
    console.error('Auto-confirm error:', err.message);
  }
};

const getStatus = async (req, res) => {
  const { token } = req.params;
  const [rows] = await db.query(
    'SELECT status, ref_id, amount, payee_name, payee_upi, created_at FROM upi_sessions WHERE session_token = ?',
    [token]
  );
  if (!rows.length) return res.status(404).json({ success: false, message: 'Session not found' });
  res.json({ success: true, data: rows[0] });
};

const confirmPayment = async (req, res) => {
  const { token } = req.params;
  const refId = 'TXN' + Date.now() + Math.floor(Math.random() * 1000);

  await db.query(
    `UPDATE upi_sessions SET status='success', ref_id=?, confirmed_at=NOW()
     WHERE session_token=? AND status='pending'`,
    [refId, token]
  );
  res.json({ success: true, ref_id: refId, message: 'Payment confirmed' });
};

const failPayment = async (req, res) => {
  const { token } = req.params;
  await db.query(
    `UPDATE upi_sessions SET status='failed' WHERE session_token=? AND status='pending'`,
    [token]
  );
  res.json({ success: true, message: 'Payment marked as failed' });
};

module.exports = { initiatePayment, getStatus, confirmPayment, failPayment };
