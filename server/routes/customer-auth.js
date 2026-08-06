const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const customerAuth = require('../middleware/customerAuth');

const router = express.Router();

const sign = (u) =>
  jwt.sign(
    { userId: u.id, email: u.email, name: u.name, role: 'customer' },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

/** POST /api/auth/register — create a customer account */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required.' });
    }
    if (await prisma.user.findUnique({ where: { email } })) {
      return res.status(409).json({ error: 'Email already registered.' });
    }
    const user = await prisma.user.create({
      data: { name, email, password: await bcrypt.hash(password, 10), role: 'customer' },
    });
    res.status(201).json({
      token: sign(user),
      user: { id: user.id, name: user.name, email: user.email, role: 'customer' },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** POST /api/auth/login — authenticate a customer */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }
    res.json({
      token: sign(user),
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** GET /api/auth/me — current logged-in customer */
router.get('/me', customerAuth, (req, res) => {
  res.json({ id: req.user.userId, name: req.user.name, email: req.user.email, role: 'customer' });
});

module.exports = router;
