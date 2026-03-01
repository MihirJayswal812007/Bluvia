const express = require('express');
const db = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const router = express.Router();

// POST /api/orders  — place a new order (auth required)
router.post('/', requireAuth, async (req, res) => {
    const { items, shipping_address } = req.body;
    if (!items?.length) return res.status(400).json({ error: 'No items provided' });

    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        // Calculate total
        let total = 0;
        for (const item of items) {
            const [[prod]] = await conn.query('SELECT price_paise FROM products WHERE id=? AND active=1', [item.product_id]);
            if (!prod) throw new Error(`Product ${item.product_id} not found`);
            total += prod.price_paise * item.quantity;
        }
        // Add delivery fee + GST
        const delivery_fee = 500;
        const gst = Math.round(total * 0.18);
        total = total + delivery_fee + gst;

        // Insert order
        const [orderRes] = await conn.query(
            'INSERT INTO orders (user_id, total_paise, shipping_address, status) VALUES (?, ?, ?, ?)',
            [req.user.id, total, shipping_address, 'confirmed']
        );
        const orderId = orderRes.insertId;

        // Insert order items + reduce inventory
        for (const item of items) {
            const [[prod]] = await conn.query('SELECT price_paise FROM products WHERE id=?', [item.product_id]);
            await conn.query(
                'INSERT INTO order_items (order_id, product_id, quantity, unit_price_paise) VALUES (?, ?, ?, ?)',
                [orderId, item.product_id, item.quantity, prod.price_paise]
            );
            await conn.query(
                'UPDATE inventory SET stock_quantity = GREATEST(0, stock_quantity - ?) WHERE product_id=?',
                [item.quantity, item.product_id]
            );
        }

        await conn.commit();
        res.status(201).json({ order_id: orderId, total_paise: total, status: 'confirmed' });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        conn.release();
    }
});

// GET /api/orders  — current user's orders
router.get('/', requireAuth, async (req, res) => {
    try {
        const [orders] = await db.query(
            `SELECT o.*,
                    JSON_ARRAYAGG(JSON_OBJECT(
                        'product_id', oi.product_id,
                        'quantity', oi.quantity,
                        'unit_price_paise', oi.unit_price_paise,
                        'product_name', p.name
                    )) AS items
             FROM orders o
             LEFT JOIN order_items oi ON oi.order_id = o.id
             LEFT JOIN products p ON p.id = oi.product_id
             WHERE o.user_id = ?
             GROUP BY o.id
             ORDER BY o.created_at DESC`,
            [req.user.id]
        );
        res.json({ orders });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/orders/all  — all orders (admin)
router.get('/all', requireAdmin, async (req, res) => {
    try {
        const [orders] = await db.query(
            `SELECT o.*, u.email, u.full_name
             FROM orders o
             LEFT JOIN users u ON u.id = o.user_id
             ORDER BY o.created_at DESC
             LIMIT 200`
        );
        res.json({ orders });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH /api/orders/:id/status  (admin only)
router.patch('/:id/status', requireAdmin, async (req, res) => {
    const { status } = req.body;
    const valid = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!valid.includes(status)) return res.status(400).json({ error: 'Invalid status' });
    try {
        await db.query('UPDATE orders SET status=?, updated_at=NOW() WHERE id=?', [status, req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
