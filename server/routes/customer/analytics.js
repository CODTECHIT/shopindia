const express = require('express');
const prisma = require('../../lib/prisma');
const customerAuth = require('../../middleware/customerAuth');

const router = express.Router();

router.use(customerAuth);

/** POST /api/customer/analytics  { event, entityId?, entityType?, metadata? } */
router.post('/', async (req, res) => {
  try {
    const { event, entityId, entityType, metadata } = req.body || {};
    if (!event) return res.status(400).json({ error: 'event required.' });
    const activity = await prisma.userActivity.create({
      data: {
        userId: req.user.userId,
        event,
        entityId: entityId || null,
        entityType: entityType || null,
        metadata: metadata ? JSON.stringify(metadata) : null,
        sessionId: req.body.sessionId || null,
      },
    });
    res.status(201).json({ activity });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** GET /api/customer/analytics — recent activity + usage chart */
router.get('/', async (req, res) => {
  try {
    const userId = req.user.userId;
    const activities = await prisma.userActivity.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 200 });

    const dayMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      dayMap[d.toISOString().slice(0, 10)] = 0;
    }
    activities.forEach((a) => {
      const k = a.createdAt.toISOString().slice(0, 10);
      if (k in dayMap) dayMap[k] += 1;
    });
    const events = Object.entries(activities.reduce((m, a) => ((m[a.event] = (m[a.event] || 0) + 1), m), {}))
      .sort((a, b) => b[1] - a[1]);

    res.json({ activities: activities.slice(0, 30), events, activityByDay: Object.entries(dayMap).map(([date, count]) => ({ date, count })) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;