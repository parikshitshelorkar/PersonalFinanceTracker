const db = require('../config/db');

const getCategorySplit = async (req, res) => {
  const userId = req.userId;
  const month = req.query.month || new Date().getMonth() + 1;
  const year = req.query.year || new Date().getFullYear();

  const [rows] = await db.query(`
    SELECT c.name, c.icon, c.color, SUM(t.amount) AS total
    FROM transactions t
    JOIN categories c ON c.id = t.category_id
    WHERE t.user_id = ? AND t.type = 'expense'
      AND MONTH(t.tx_date) = ? AND YEAR(t.tx_date) = ?
    GROUP BY c.id
    ORDER BY total DESC
  `, [userId, month, year]);

  res.json({ success: true, data: rows });
};

const getMonthly = async (req, res) => {
  const userId = req.userId;
  const year = req.query.year || new Date().getFullYear();

  const [rows] = await db.query(`
    SELECT
      MONTH(tx_date) AS month,
      SUM(CASE WHEN type='income' THEN amount ELSE 0 END) AS income,
      SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) AS expense
    FROM transactions
    WHERE user_id = ? AND YEAR(tx_date) = ?
    GROUP BY MONTH(tx_date)
    ORDER BY month
  `, [userId, year]);

  // Fill missing months with 0
  const months = Array.from({ length: 12 }, (_, i) => {
    const found = rows.find(r => r.month === i + 1);
    return { month: i + 1, income: found ? parseFloat(found.income) : 0, expense: found ? parseFloat(found.expense) : 0 };
  });

  res.json({ success: true, data: months });
};

const getTrend = async (req, res) => {
  const userId = req.userId;
  const { days = 30 } = req.query;

  const [rows] = await db.query(`
    SELECT DATE(tx_date) AS date,
      SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) AS expense,
      SUM(CASE WHEN type='income' THEN amount ELSE 0 END) AS income
    FROM transactions
    WHERE user_id = ? AND tx_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
    GROUP BY DATE(tx_date)
    ORDER BY date
  `, [userId, parseInt(days)]);

  res.json({ success: true, data: rows });
};

const getInsights = async (req, res) => {
  const userId = req.userId;
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const lastYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  const [catRows] = await db.query(`
    SELECT c.name, c.icon,
      SUM(CASE WHEN MONTH(t.tx_date)=? AND YEAR(t.tx_date)=? THEN t.amount ELSE 0 END) AS this_month,
      SUM(CASE WHEN MONTH(t.tx_date)=? AND YEAR(t.tx_date)=? THEN t.amount ELSE 0 END) AS last_month
    FROM transactions t
    JOIN categories c ON c.id = t.category_id
    WHERE t.user_id = ? AND t.type='expense'
    GROUP BY c.id
  `, [currentMonth, currentYear, lastMonth, lastYear, userId]);

  const [totalRow] = await db.query(`
    SELECT
      SUM(CASE WHEN type='income' THEN amount ELSE 0 END) AS income,
      SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) AS expense
    FROM transactions WHERE user_id=? AND MONTH(tx_date)=? AND YEAR(tx_date)=?
  `, [userId, currentMonth, currentYear]);

  const insights = [];
  const total = totalRow[0];
  if (total.income > 0) {
    const savingsRate = ((total.income - total.expense) / total.income * 100).toFixed(1);
    insights.push({ icon: '💡', text: `Your savings rate this month is ${savingsRate}%` });
  }

  for (const row of catRows) {
    if (row.last_month > 0 && row.this_month > 0) {
      const pct = ((row.this_month - row.last_month) / row.last_month * 100).toFixed(1);
      if (pct > 15) insights.push({ icon: '⚠️', text: `You spent ${pct}% more on ${row.name} than last month` });
      if (pct < -15) insights.push({ icon: '🎉', text: `Great! You reduced ${row.name} spending by ${Math.abs(pct)}%` });
    }
    if (row.this_month > 0 && total.expense > 0) {
      const share = (row.this_month / total.expense * 100).toFixed(1);
      if (share > 40) insights.push({ icon: '📊', text: `${row.name} accounts for ${share}% of your expenses` });
    }
  }

  if (insights.length === 0) insights.push({ icon: '✅', text: 'Your spending looks balanced this month!' });
  res.json({ success: true, data: insights });
};

module.exports = { getCategorySplit, getMonthly, getTrend, getInsights };
