const express = require('express');
const router = express.Router();
const prisma = require('../../../lib/prisma');
const { requireAuth, requireRole } = require('../../../middleware/auth');

router.use(requireAuth);
router.use(requireRole(['super_admin']));

// Get templates
router.get('/templates', async (req, res) => {
  try {
    const templates = await prisma.notificationTemplate.findMany();
    res.json({ templates });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// Update/Create template
router.put('/templates', async (req, res) => {
  try {
    const { event, smsBody, emailSubject, emailBody, isActive } = req.body;
    
    const template = await prisma.notificationTemplate.upsert({
      where: { event },
      update: { smsBody, emailSubject, emailBody, isActive },
      create: { event, smsBody, emailSubject, emailBody, isActive }
    });

    res.json({ template, message: 'Template saved' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save template' });
  }
});

// Get recent logs
router.get('/logs', async (req, res) => {
  try {
    const logs = await prisma.notificationLog.findMany({
      orderBy: { sentAt: 'desc' },
      take: 200
    });
    res.json({ logs });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

module.exports = router;
