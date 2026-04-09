USE finance_tracker;

-- Seed categories
INSERT IGNORE INTO categories (id, name, icon, color) VALUES
  (1,  'Food',          '🍔', '#ff6584'),
  (2,  'Transport',     '🚌', '#43e0a4'),
  (3,  'Utilities',     '⚡', '#6c63ff'),
  (4,  'Shopping',      '🛍️', '#ffa94d'),
  (5,  'Health',        '🏥', '#a78bfa'),
  (6,  'Entertainment', '🎮', '#38bdf8'),
  (7,  'Education',     '📚', '#fb923c'),
  (8,  'Salary',        '💰', '#4ade80'),
  (9,  'Freelance',     '💼', '#34d399'),
  (10, 'Other',         '📦', '#94a3b8');

-- Demo user (password: demo1234, bcrypt hashed)
INSERT IGNORE INTO users (id, name, email, password) VALUES
  (1, 'Arjun Sharma', 'demo@finance.com', '$2b$10$YQvjjGcUPAEzx5JFKfXtIuZ5VwBkL3mN8qRpT2dH6.XeKvs1yMCi2');

-- Sample transactions
INSERT IGNORE INTO transactions (user_id, category_id, type, amount, description, tx_date, payment_mode) VALUES
  (1, 8, 'income',  70000, 'Monthly Salary',    '2026-04-05', 'netbanking'),
  (1, 9, 'income',  15000, 'Freelance Project',  '2026-04-02', 'upi'),
  (1, 1, 'expense',   680, 'Zomato Order',       '2026-04-07', 'upi'),
  (1, 1, 'expense',  1200, 'Grocery - DMart',    '2026-04-06', 'upi'),
  (1, 2, 'expense',   500, 'Metro Recharge',     '2026-04-03', 'upi'),
  (1, 3, 'expense',  2140, 'Electricity Bill',   '2026-04-04', 'netbanking'),
  (1, 4, 'expense',  3500, 'Amazon Shopping',    '2026-04-01', 'card'),
  (1, 5, 'expense',   800, 'Pharmacy',           '2026-04-03', 'cash'),
  (1, 8, 'income',  70000, 'March Salary',       '2026-03-05', 'netbanking'),
  (1, 1, 'expense',  9800, 'Food - March',       '2026-03-20', 'upi'),
  (1, 2, 'expense',  8000, 'Transport - March',  '2026-03-15', 'upi'),
  (1, 8, 'income',  70000, 'February Salary',    '2026-02-05', 'netbanking'),
  (1, 1, 'expense',  7200, 'Food - Feb',         '2026-02-18', 'upi'),
  (1, 2, 'expense',  5500, 'Transport - Feb',    '2026-02-12', 'upi');

-- Sample budgets for April 2026
INSERT IGNORE INTO budgets (user_id, category_id, amount, month, year, alert_pct) VALUES
  (1, 1, 15000, 4, 2026, 80),
  (1, 2, 10000, 4, 2026, 80),
  (1, 3,  5000, 4, 2026, 80),
  (1, 4,  8000, 4, 2026, 80),
  (1, 5,  3000, 4, 2026, 80);
