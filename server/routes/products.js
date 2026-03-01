const express = require('express');
const db = require('../db');
const { requireAdmin } = require('../middleware/auth');
const router = express.Router();

// GET /api/products  (public)
router.get('/', async (req, res) => {
    try {
        const [products] = await db.query(`
            SELECT p.*, i.stock_quantity
            FROM products p
            LEFT JOIN inventory i ON i.product_id = p.id
            WHERE p.active = 1
            ORDER BY p.price_paise ASC
        `);
        res.json({ products });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/products/:id  (public)
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT p.*, i.stock_quantity
            FROM products p
            LEFT JOIN inventory i ON i.product_id = p.id
            WHERE p.id = ?
        `, [req.params.id]);
        if (!rows.length) return res.status(404).json({ error: 'Product not found' });
        res.json({ product: rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/products  (admin only)
router.post('/', requireAdmin, async (req, res) => {
    const { name, description, price_paise, volume_ml, specs } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO products (name, description, price_paise, volume_ml, specs) VALUES (?, ?, ?, ?, ?)',
            [name, description, price_paise, volume_ml, JSON.stringify(specs || [])]
        );
        // create inventory row
        await db.query('INSERT INTO inventory (product_id, stock_quantity) VALUES (?, ?)', [result.insertId, 0]);
        res.status(201).json({ id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH /api/products/:id  (admin only)
router.patch('/:id', requireAdmin, async (req, res) => {
    const { name, description, price_paise, active } = req.body;
    try {
        await db.query(
            'UPDATE products SET name=COALESCE(?,name), description=COALESCE(?,description), price_paise=COALESCE(?,price_paise), active=COALESCE(?,active) WHERE id=?',
            [name, description, price_paise, active, req.params.id]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH /api/products/:id/stock  (admin only)
router.patch('/:id/stock', requireAdmin, async (req, res) => {
    const { stock_quantity } = req.body;
    try {
        await db.query('UPDATE inventory SET stock_quantity=? WHERE product_id=?', [stock_quantity, req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
