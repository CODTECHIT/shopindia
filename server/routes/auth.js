const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'shopindia_dev_secret';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '24h';

/** POST /api/auth/login */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) return res.status(401).json({ error: 'Invalid credentials.' });
    if (user.status !== 'active') {
      return res.status(403).json({ error: `Account is ${user.status}.` });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials.' });

    // Build token payload — include vendorId if vendor role
    const payload = {
      userId:      user.id,
      role:        user.role,
      permissions: user.permissions || [],
      name:        user.name,
      email:       user.email,
    };
    if (user.vendorId) payload.vendorId = user.vendorId;

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    res.json({
      token,
      user: {
        id:          user.id,
        name:        user.name,
        email:       user.email,
        role:        user.role,
        permissions: user.permissions || [],
        vendorId:    user.vendorId,
        avatar:      user.avatar,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** POST /api/auth/logout — client-side: just discard token. */
router.post('/logout', (_req, res) => res.json({ message: 'Logged out.' }));

module.exports = router;
