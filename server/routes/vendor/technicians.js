const express = require('express');
const router = express.Router();
const prisma = require('../../../lib/prisma');
const { requireAuth, requireRole } = require('../../../middleware/auth');

router.use(requireAuth);
router.use(requireRole(['vendor']));

// Get all technicians for the logged in vendor
router.get('/', async (req, res) => {
  try {
    const vendor = await prisma.vendor.findUnique({ where: { userId: req.user.id } });
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });

    const technicians = await prisma.technician.findMany({
      where: { vendorId: vendor.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ technicians });
  } catch (error) {
    console.error('Error fetching technicians:', error);
    res.status(500).json({ error: 'Failed to fetch technicians' });
  }
});

// Create new technician
router.post('/', async (req, res) => {
  try {
    const { name, phone, email, skills } = req.body;
    const vendor = await prisma.vendor.findUnique({ where: { userId: req.user.id } });
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });

    const technician = await prisma.technician.create({
      data: {
        vendorId: vendor.id,
        name,
        phone,
        email,
        skills: skills ? skills.split(',').map(s => s.trim()) : []
      }
    });

    res.json({ technician });
  } catch (error) {
    console.error('Error creating technician:', error);
    res.status(500).json({ error: 'Failed to create technician' });
  }
});

// Update technician status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { currentStatus, isActive } = req.body;
    const vendor = await prisma.vendor.findUnique({ where: { userId: req.user.id } });
    
    const technician = await prisma.technician.findUnique({ where: { id } });
    if (!technician || technician.vendorId !== vendor.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updated = await prisma.technician.update({
      where: { id },
      data: {
        ...(currentStatus && { currentStatus }),
        ...(isActive !== undefined && { isActive })
      }
    });

    res.json({ technician: updated, message: 'Status updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update status' });
  }
});

module.exports = router;
