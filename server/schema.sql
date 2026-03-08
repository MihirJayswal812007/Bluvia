-- ============================================================
--  BLUVIA — MySQL Schema
--  Run this in phpMyAdmin (WAMP) or MySQL Workbench
--  Create database first: CREATE DATABASE IF NOT EXISTS bluvia;
-- ============================================================

CREATE DATABASE IF NOT EXISTS bluvia CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bluvia;

-- ── Users ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    full_name     VARCHAR(150) NOT NULL,
    email         VARCHAR(191) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          ENUM('user', 'admin') DEFAULT 'user',
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── Products ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(150) NOT NULL,
    description TEXT,
    price_paise INT NOT NULL,
    volume_ml   INT DEFAULT 0,
    specs       JSON,
    image_url   VARCHAR(500),
    active      TINYINT(1) DEFAULT 1,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── Inventory ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inventory (
    id                INT AUTO_INCREMENT PRIMARY KEY,
    product_id        INT NOT NULL UNIQUE,
    stock_quantity    INT DEFAULT 0,
    reorder_threshold INT DEFAULT 50,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ── Orders ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    user_id          INT NOT NULL,
    status           ENUM('pending','confirmed','processing','shipped','delivered','cancelled') DEFAULT 'confirmed',
    total_paise      INT NOT NULL,
    shipping_address TEXT,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ── Order Items ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    order_id         INT NOT NULL,
    product_id       INT NOT NULL,
    quantity         INT NOT NULL,
    unit_price_paise INT NOT NULL,
    FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- ============================================================
--  Seed Data
-- ============================================================

-- Admin user (password: admin123)
INSERT IGNORE INTO users (full_name, email, password_hash, role) VALUES
('Bluvia Admin', 'admin@bluvia.com',
 '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Products
INSERT IGNORE INTO products (id, name, description, price_paise, volume_ml, specs) VALUES
(1, 'Essential 200ml', 'Pure, refreshing water in a compact 200ml bottle. Perfect for on-the-go hydration.', 500, 200, '["PET", "Screw-on cap", "210g", "6 months shelf life"]'),
(2, 'Classic 500ml',   'Our bestselling 500ml bottle. Balanced minerals for the perfect taste, every time.',  1000, 500, '["PET", "Sports cap", "520g", "12 months shelf life"]'),
(3, 'Premium 1 Litre', 'Premium purified water in a generous 1 litre bottle. Ideal for home and office.',   2000, 1000, '["BPA-free PET", "Wide-mouth cap", "1050g", "12 months shelf life"]');

-- Inventory
INSERT IGNORE INTO inventory (product_id, stock_quantity, reorder_threshold) VALUES
(1, 500, 50),
(2, 300, 30),
(3, 200, 20);
