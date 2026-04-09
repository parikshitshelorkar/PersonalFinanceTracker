const db = require('../config/db');

const getAll = async (req, res) => {
  const userId = req.userId;
  const { type, category_id, start_date, end_date, search, limit = 50, offset = 0 } = req.query;

  let query = `
    SELECT t.*, c.name AS category_name, c.icon AS category_icon, c.color AS category_color
    FROM transactions t
    JOIN categories c ON c.id = t.category_id
    WHERE t.user_id = ?
  `;
  const params = [userId];

  if (type) { query += ' AND t.type = ?'; params.push(type); }
  if (category_id) { query += ' AND t.category_id = ?'; params.push(category_id); }
  if (start_date) { query += ' AND t.tx_date >= ?'; params.push(start_date); }
  if (end_date) { query += ' AND t.tx_date <= ?'; params.push(end_date); }
  if (search) { query += ' AND (t.description LIKE ? OR t.notes LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }

  query += ' ORDER BY t.tx_date DESC, t.created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  const [rows] = await db.query(query, params);
  res.json({ success: true, data: rows });
};

const getSummary = async (req, res) => {
  const userId = req.userId;
  const { month, year } = req.query;
  const m = month || new Date().getMonth() + 1;
  const y = year || new Date().getFullYear();

  const [rows] = await db.query(`
    SELECT
      SUM(CASE WHEN type='income' THEN amount ELSE 0 END) AS total_income,
      SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) AS total_expense,
      SUM(CASE WHEN type='income' THEN amount ELSE -amount END) AS balance
    FROM transactions
    WHERE user_id = ? AND MONTH(tx_date) = ? AND YEAR(tx_date) = ?
  `, [userId, m, y]);

  res.json({ success: true, data: rows[0] });
};

const create = async (req, res) => {
  const userId = req.userId;
  const { category_id, type, amount, description, notes, tx_date, payment_mode, upi_ref_id } = req.body;

  if (!category_id || !type || !amount || !tx_date)
    return res.status(400).json({ success: false, message: 'Required fields missing' });

  const [result] = await db.query(
    `INSERT INTO transactions (user_id, category_id, type, amount, description, notes, tx_date, payment_mode, upi_ref_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [userId, category_id, type, amount, description || '', notes || '', tx_date, payment_mode || 'cash', upi_ref_id || null]
  );

  const [rows] = await db.query(`
    SELECT t.*, c.name AS category_name, c.icon AS category_icon, c.color AS category_color
    FROM transactions t JOIN categories c ON c.id = t.category_id
    WHERE t.id = ?`, [result.insertId]);

  res.status(201).json({ success: true, data: rows[0] });
};

const update = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;
  const { category_id, type, amount, description, notes, tx_date, payment_mode } = req.body;

  const [check] = await db.query('SELECT id FROM transactions WHERE id = ? AND user_id = ?', [id, userId]);
  if (!check.length) return res.status(404).json({ success: false, message: 'Transaction not found' });

  await db.query(
    `UPDATE transactions SET category_id=?, type=?, amount=?, description=?, notes=?, tx_date=?, payment_mode=?
     WHERE id = ? AND user_id = ?`,
    [category_id, type, amount, description, notes, tx_date, payment_mode, id, userId]
  );

  const [rows] = await db.query(`
    SELECT t.*, c.name AS category_name, c.icon AS category_icon, c.color AS category_color
    FROM transactions t JOIN categories c ON c.id = t.category_id
    WHERE t.id = ?`, [id]);

  res.json({ success: true, data: rows[0] });
};

const remove = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  const [check] = await db.query('SELECT id FROM transactions WHERE id = ? AND user_id = ?', [id, userId]);
  if (!check.length) return res.status(404).json({ success: false, message: 'Transaction not found' });

  await db.query('DELETE FROM transactions WHERE id = ? AND user_id = ?', [id, userId]);
  res.json({ success: true, message: 'Transaction deleted' });
};

const getCategories = async (req, res) => {
  const [rows] = await db.query('SELECT * FROM categories ORDER BY id');
  res.json({ success: true, data: rows });
};

module.exports = { getAll, getSummary, create, update, remove, getCategories };
