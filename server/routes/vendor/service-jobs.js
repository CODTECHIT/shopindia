const express = require('express');
const router = express.Router();
const prisma = require('../../lib/prisma');
const { verifyToken } = require('../../middleware/auth');
const { requireRole } = require('../../middleware/rbac');

router.use(verifyToken);
router.use(requireRole('vendor'));

// Get all service jobs for the vendor's orders
router.get('/', async (req, res) => {
  try {
    const vendor = await prisma.vendor.findUnique({ where: { userId: req.user.userId } });
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });

    // Fetch jobs linked to orders belonging to this vendor
    const serviceJobs = await prisma.serviceJob.findMany({
      where: {
        order: { items: { some: { vendorId: vendor.id } } }
      },
      include: {
        order: { select: { orderNumber: true, status: true } },
        technician: { select: { name: true, phone: true } }
      },
      orderBy: { scheduledDate: 'asc' }
    });
    res.json({ serviceJobs });
  } catch (error) {
    console.error('Error fetching service jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// Assign a job
router.post('/', async (req, res) => {
  try {
    const { orderId, technicianId, scheduledDate, notes } = req.body;
    const vendor = await prisma.vendor.findUnique({ where: { userId: req.user.userId } });

    // Verify order belongs to vendor
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { select: { vendorId: true } } },
    });
    if (!order || !order.items.some((it) => it.vendorId === vendor.id)) {
      return res.status(403).json({ error: 'Unauthorized to assign this order' });
    }

    const job = await prisma.serviceJob.create({
      data: {
        orderId,
        technicianId,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        notes,
        status: 'scheduled'
      }
    });

    res.json({ job });
  } catch (error) {
    res.status(500).json({ error: 'Failed to assign job' });
  }
});

// Update a job
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, technicianId } = req.body;
    
    // Verify ownership
    const vendor = await prisma.vendor.findUnique({ where: { userId: req.user.userId } });
    const job = await prisma.serviceJob.findUnique({
      where: { id },
      include: { order: { include: { items: { select: { vendorId: true } } } } },
    });

    if (!job || !job.order.items.some((it) => it.vendorId === vendor.id)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updateData = { status, notes, technicianId };
    if (status === 'completed' && job.status !== 'completed') {
      updateData.completedAt = new Date();
    }

    const updated = await prisma.serviceJob.update({
      where: { id },
      data: updateData
    });

    res.json({ job: updated, message: 'Job updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update job' });
  }
});

module.exports = router;
