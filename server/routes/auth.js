const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const router = express.Router();

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
    const { full_name, email, password } = req.body;
    if (!email || !password || !full_name) {
        return res.status(400).json({ error: 'Name, email and password are required' });
    }
    try {
        const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length) return res.status(409).json({ error: 'Email already in use' });

        const hash = await bcrypt.hash(password, 10);
        const [result] = await db.query(
            'INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)',
            [full_name, email, hash, 'user']
        );
        const user = { id: result.insertId, full_name, email, role: 'user' };
        const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
        res.json({ token, user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    try {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (!rows.length) return res.status(401).json({ error: 'Invalid email or password' });

        const user = rows[0];
        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

        const payload = { id: user.id, full_name: user.full_name, email: user.email, role: user.role };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
        res.json({ token, user: payload });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/auth/me  (verify token & return user)
router.get('/me', require('../middleware/auth').requireAuth, (req, res) => {
    res.json({ user: req.user });
});

module.exports = router;
