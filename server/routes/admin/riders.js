const express = require('express');
const router = express.Router();
const prisma = require('../../../lib/prisma');
const { requireAuth, requireRole, requirePermission } = require('../../../middleware/auth');

router.use(requireAuth);
router.use(requireRole(['super_admin', 'branch_manager']));
router.use(requirePermission(['view_users', 'manage_users']));

// Get all riders with profiles
router.get('/', async (req, res) => {
  try {
    const riders = await prisma.user.findMany({
      where: { role: 'rider' },
      include: {
        riderProfile: {
          include: { deliveries: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ riders });
  } catch (error) {
    console.error('Error fetching riders:', error);
    res.status(500).json({ error: 'Failed to fetch riders' });
  }
});

// Update rider profile status / payouts
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, isActive, payoutAmount } = req.body;

    // Update user status
    if (status) {
      await prisma.user.update({
        where: { id },
        data: { status }
      });
    }

    // Update rider profile
    let updatedProfile = null;
    if (isActive !== undefined || payoutAmount !== undefined) {
      const data = {};
      if (isActive !== undefined) data.isActive = isActive;
      if (payoutAmount !== undefined) {
        data.walletBalance = { decrement: payoutAmount };
      }
      
      updatedProfile = await prisma.riderProfile.update({
        where: { userId: id },
        data
      });
    }

    res.json({ message: 'Rider updated successfully' });
  } catch (error) {
    console.error('Error updating rider:', error);
    res.status(500).json({ error: 'Failed to update rider' });
  }
});

module.exports = router;
