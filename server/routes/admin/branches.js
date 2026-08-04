const express = require('express');
const prisma = require('../../lib/prisma');
const { verifyToken }      = require('../../middleware/auth');
const { requirePermission } = require('../../middleware/rbac');

const router = express.Router();
router.use(verifyToken, requirePermission('manage_branches'));

/** GET /api/admin/branches */
router.get('/', async (req, res) => {
  try {
    const branches = await prisma.branch.findMany({
      include: {
        manager: { select: { id: true, name: true, email: true } },
        serviceAreas: { include: { pincodes: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(branches);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/** GET /api/admin/branches/:id */
router.get('/:id', async (req, res) => {
  try {
    const branch = await prisma.branch.findUnique({
      where: { id: req.params.id },
      include: {
        manager: { select: { id: true, name: true, email: true, phone: true } },
        staff: { select: { id: true, name: true, email: true, role: true } },
        serviceAreas: { include: { pincodes: true } },
      },
    });
    if (!branch) return res.status(404).json({ error: 'Branch not found.' });
    res.json(branch);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/** POST /api/admin/branches — FR-05.4: Create branch */
router.post('/', async (req, res) => {
  try {
    const { name, code, managerId, phone, email, street, city, state, pincode } = req.body;
    const branch = await prisma.branch.create({
      data: { name, code, managerId, phone, email, street, city, state, pincode },
    });
    if (managerId) {
      await prisma.user.update({ where: { id: managerId }, data: { branchId: branch.id } });
    }
    res.status(201).json(branch);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

/** PUT /api/admin/branches/:id */
router.put('/:id', async (req, res) => {
  try {
    const { name, code, managerId, phone, email, street, city, state, pincode } = req.body;
    const branch = await prisma.branch.update({
      where: { id: req.params.id },
      data: { name, code, managerId, phone, email, street, city, state, pincode },
    });
    if (managerId) {
      await prisma.user.update({ where: { id: managerId }, data: { branchId: branch.id } });
    }
    res.json(branch);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

/** DELETE /api/admin/branches/:id */
router.delete('/:id', async (req, res) => {
  try {
    await prisma.branch.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });
    res.json({ message: 'Branch deactivated.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/** PATCH /api/admin/branches/:id/staff — add/remove staff */
router.patch('/:id/staff', async (req, res) => {
  try {
    const { action, userId } = req.body;
    if (action === 'add') {
      await prisma.user.update({ where: { id: userId }, data: { branchId: req.params.id } });
    } else if (action === 'remove') {
      await prisma.user.update({ where: { id: userId }, data: { branchId: null } });
    }
    const branch = await prisma.branch.findUnique({
      where: { id: req.params.id },
      include: { staff: true },
    });
    res.json(branch);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
