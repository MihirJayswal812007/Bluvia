const express = require('express');
const db = require('../db');
const { requireAdmin } = require('../middleware/auth');
const router = express.Router();

// GET /api/admin/stats
router.get('/stats', requireAdmin, async (req, res) => {
    try {
        const [[orderStats]] = await db.query(`
            SELECT COUNT(*) as total_orders,
                   COALESCE(SUM(total_paise), 0) as total_revenue,
                   SUM(status IN ('pending','confirmed')) as pending_orders
            FROM orders
        `);
        const [[{ total_users }]] = await db.query('SELECT COUNT(*) as total_users FROM users');
        res.json({ ...orderStats, total_users });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/admin/users
router.get('/users', requireAdmin, async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT id, full_name, email, role, created_at FROM users ORDER BY created_at DESC'
        );
        res.json({ users });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/admin/inventory
router.get('/inventory', requireAdmin, async (req, res) => {
    try {
        const [inventory] = await db.query(`
            SELECT i.*, p.name, p.price_paise
            FROM inventory i
            JOIN products p ON p.id = i.product_id
        `);
        res.json({ inventory });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH /api/admin/users/:id/role
router.patch('/users/:id/role', requireAdmin, async (req, res) => {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
    try {
        await db.query('UPDATE users SET role=? WHERE id=?', [role, req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
