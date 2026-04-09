-- ============================================
-- Personal Finance Tracker - MySQL Schema
-- ============================================

CREATE DATABASE IF NOT EXISTS finance_tracker;
USE finance_tracker;

-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(150) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
  id    INT AUTO_INCREMENT PRIMARY KEY,
  name  VARCHAR(80) NOT NULL,
  icon  VARCHAR(10),
  color VARCHAR(20)
);

-- 3. TRANSACTIONS
CREATE TABLE IF NOT EXISTS transactions (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL,
  category_id   INT NOT NULL,
  type          ENUM('income','expense') NOT NULL,
  amount        DECIMAL(12,2) NOT NULL,
  description   VARCHAR(300),
  notes         TEXT,
  tx_date       DATE NOT NULL,
  payment_mode  ENUM('cash','upi','card','netbanking') DEFAULT 'cash',
  upi_ref_id    VARCHAR(100),
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id),
  INDEX idx_user_date (user_id, tx_date),
  INDEX idx_type (type)
);

-- 4. BUDGETS
CREATE TABLE IF NOT EXISTS budgets (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL,
  category_id   INT NOT NULL,
  amount        DECIMAL(12,2) NOT NULL,
  month         TINYINT NOT NULL,
  year          SMALLINT NOT NULL,
  alert_pct     TINYINT DEFAULT 80,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id),
  UNIQUE KEY unique_budget (user_id, category_id, month, year)
);

-- 5. UPI_SESSIONS
CREATE TABLE IF NOT EXISTS upi_sessions (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  session_token VARCHAR(100) UNIQUE NOT NULL,
  user_id       INT NOT NULL,
  amount        DECIMAL(12,2) NOT NULL,
  payee_upi     VARCHAR(100) NOT NULL,
  payee_name    VARCHAR(100),
  status        ENUM('pending','success','failed') DEFAULT 'pending',
  ref_id        VARCHAR(100),
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  confirmed_at  TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
