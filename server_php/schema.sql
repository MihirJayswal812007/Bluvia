CREATE DATABASE IF NOT EXISTS bluvia;
USE bluvia;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    image_url VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    price_paise INT NOT NULL, /* using paise (Rs/100) */
    image_url VARCHAR(255),
    active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS inventory (
    product_id INT PRIMARY KEY,
    stock_quantity INT NOT NULL DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    total_paise INT NOT NULL,
    shipping_address TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', /* pending, confirmed, processing, shipped, delivered, cancelled */
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    product_id INT,
    quantity INT NOT NULL,
    unit_price_paise INT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Insert dummy admin (password is 'admin123')
INSERT IGNORE INTO users (full_name, email, password_hash, role) VALUES 
('Admin User', 'admin@bluvia.com', '$2y$10$tZk5.RMyB5VvN4zIUK/iU.TFYb2m4uL3nQf4W8l6/iV2hRKVqT0nK', 'admin'),
('John Doe', 'john@example.com', '$2y$10$tZk5.RMyB5VvN4zIUK/iU.TFYb2m4uL3nQf4W8l6/iV2hRKVqT0nK', 'user');

INSERT IGNORE INTO categories (id, name, slug) VALUES 
(1, 'Water Bottles', 'water-bottles'),
(2, 'Dispensers', 'dispensers'),
(3, 'Filters', 'filters');

INSERT IGNORE INTO products (id, category_id, name, slug, description, price_paise, image_url) VALUES 
(1, 1, 'Bluvia 1L Mineral Water', 'bluvia-1l-mineral', 'Pure mineral water infused with essential minerals.', 2000, 'https://images.unsplash.com/photo-1548839140-29a749e1a029?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80'),
(2, 1, 'Bluvia 20L Premium Jar', 'bluvia-20l-premium', 'For homes and offices, keeping you hydrated.', 15000, 'https://images.unsplash.com/photo-1628147573678-b118742fcaca?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80'),
(3, 2, 'Smart Water Dispenser', 'smart-water-dispenser', 'Automatic hot/cold water dispenser.', 250000, 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80'),
(4, 3, 'UF Reverse Osmosis Filter', 'uf-ro-filter', 'Ensures 99.9% purity for your home tap water.', 450000, 'https://images.unsplash.com/photo-1594818379496-da1e345b0ebd?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80');

INSERT IGNORE INTO inventory (product_id, stock_quantity) VALUES
(1, 500), (2, 200), (3, 50), (4, 120);

