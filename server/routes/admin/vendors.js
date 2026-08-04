const express = require('express');
const prisma = require('../../lib/prisma');
const { verifyToken }      = require('../../middleware/auth');
const { requirePermission } = require('../../middleware/rbac');

const router = express.Router();
router.use(verifyToken, requirePermission('manage_vendors'));

/** GET /api/admin/vendors?status=&page= — FR-05.2 */
router.get('/', async (req, res) => {
  try {
    const { status, page = 1, limit = 20, q } = req.query;
    const where = {};
    if (status) where.approvalStatus = status;
    if (q)      where.businessName   = { contains: q, mode: 'insensitive' };

    const pageNum = Number(page);
    const limitNum = Number(limit);

    const [vendors, total] = await Promise.all([
      prisma.vendor.findMany({
        where,
        include: {
          user: { select: { name: true, email: true } },
          documents: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.vendor.count({ where }),
    ]);
    res.json({ vendors, total, page: pageNum, pages: Math.ceil(total / limitNum) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/** GET /api/admin/vendors/:id */
router.get('/:id', async (req, res) => {
  try {
    const vendor = await prisma.vendor.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        documents: true,
      },
    });
    if (!vendor) return res.status(404).json({ error: 'Vendor not found.' });
    res.json(vendor);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/** PATCH /api/admin/vendors/:id/approval — approve/reject/suspend — FR-05.2 */
router.patch('/:id/approval', async (req, res) => {
  try {
    const { approvalStatus, approvalNote } = req.body;
    if (!['approved', 'rejected', 'suspended'].includes(approvalStatus)) {
      return res.status(400).json({ error: 'Invalid approval status.' });
    }
    const vendor = await prisma.vendor.update({
      where: { id: req.params.id },
      data: {
        approvalStatus,
        approvalNote,
        approvedById: req.user.userId,
        approvedAt: new Date(),
      },
    });
    res.json(vendor);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/** PATCH /api/admin/vendors/:id/commission — FR-05.10 */
router.patch('/:id/commission', async (req, res) => {
  try {
    const { commissionRate } = req.body;
    if (commissionRate < 0 || commissionRate > 100) {
      return res.status(400).json({ error: 'commissionRate must be 0–100.' });
    }
    const vendor = await prisma.vendor.update({
      where: { id: req.params.id },
      data: { commissionRate },
    });
    res.json(vendor);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
