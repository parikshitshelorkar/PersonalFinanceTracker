const db = require('../config/db');

const getAll = async (req, res) => {
  const userId = req.userId;
  const month = req.query.month || new Date().getMonth() + 1;
  const year = req.query.year || new Date().getFullYear();

  const [rows] = await db.query(`
    SELECT b.*, c.name AS category_name, c.icon AS category_icon, c.color AS category_color,
      COALESCE(SUM(t.amount), 0) AS spent
    FROM budgets b
    JOIN categories c ON c.id = b.category_id
    LEFT JOIN transactions t ON t.category_id = b.category_id
      AND t.user_id = b.user_id
      AND t.type = 'expense'
      AND MONTH(t.tx_date) = b.month
      AND YEAR(t.tx_date) = b.year
    WHERE b.user_id = ? AND b.month = ? AND b.year = ?
    GROUP BY b.id
    ORDER BY c.name
  `, [userId, month, year]);

  res.json({ success: true, data: rows });
};

const create = async (req, res) => {
  const userId = req.userId;
  const { category_id, amount, month, year, alert_pct } = req.body;
  if (!category_id || !amount || !month || !year)
    return res.status(400).json({ success: false, message: 'Required fields missing' });

  await db.query(`
    INSERT INTO budgets (user_id, category_id, amount, month, year, alert_pct)
    VALUES (?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE amount = VALUES(amount), alert_pct = VALUES(alert_pct)
  `, [userId, category_id, amount, month, year, alert_pct || 80]);

  res.status(201).json({ success: true, message: 'Budget saved' });
};

const remove = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;
  await db.query('DELETE FROM budgets WHERE id = ? AND user_id = ?', [id, userId]);
  res.json({ success: true, message: 'Budget deleted' });
};

const getAlerts = async (req, res) => {
  const userId = req.userId;
  const month = new Date().getMonth() + 1;
  const year = new Date().getFullYear();

  const [rows] = await db.query(`
    SELECT b.*, c.name AS category_name, c.icon AS category_icon,
      COALESCE(SUM(t.amount), 0) AS spent,
      ROUND(COALESCE(SUM(t.amount), 0) / b.amount * 100, 1) AS pct_used
    FROM budgets b
    JOIN categories c ON c.id = b.category_id
    LEFT JOIN transactions t ON t.category_id = b.category_id
      AND t.user_id = b.user_id AND t.type='expense'
      AND MONTH(t.tx_date) = b.month AND YEAR(t.tx_date) = b.year
    WHERE b.user_id = ? AND b.month = ? AND b.year = ?
    GROUP BY b.id
    HAVING pct_used >= b.alert_pct
    ORDER BY pct_used DESC
  `, [userId, month, year]);

  res.json({ success: true, data: rows });
};

module.exports = { getAll, create, remove, getAlerts };
