const express = require('express');
const multer = require('multer');
const { uploadToS3 } = require('../../lib/s3');
const prisma = require('../../lib/prisma');
const { verifyToken } = require('../../middleware/auth');
const { requireRole } = require('../../middleware/rbac');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
router.use(verifyToken);
router.use(requireRole('super_admin', 'branch_manager'));

function slugify(name) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// POST /api/admin/categories/upload-image
router.post('/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image provided' });
    const key = `categories/${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const result = await uploadToS3({
      key,
      body: req.file.buffer,
      contentType: req.file.mimetype,
      isPrivate: false,
    });
    res.json({ imageUrl: result.url });
  } catch (e) {
    console.error('S3 upload error:', e);
    res.status(500).json({ error: e.message || 'S3 upload failed' });
  }
});

// GET /api/admin/categories — list with product counts
router.get('/', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: [{ vertical: 'asc' }, { sortOrder: 'asc' }],
      include: { _count: { select: { products: true } } },
    });
    res.json({ categories });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/admin/categories — create
router.post('/', async (req, res) => {
  try {
    const { name, vertical = 'shop', image, sortOrder = 0, slug } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    
    // Check duplicate
    const existing = await prisma.category.findFirst({ where: { name, vertical } });
    if (existing) return res.status(409).json({ error: `Category '${name}' already exists in '${vertical}'` });

    const category = await prisma.category.create({
      data: {
        name,
        vertical,
        image: image || null,
        sortOrder: Number(sortOrder || 0),
        slug: slug || slugify(name) || null,
      },
    });
    res.status(201).json({ category });
  } catch (e) {
    if (e.code === 'P2002') return res.status(409).json({ error: 'Slug already exists' });
    res.status(400).json({ error: e.message });
  }
});

// PATCH /api/admin/categories/:id — update
router.patch('/:id', async (req, res) => {
  try {
    const { name, vertical, image, sortOrder, slug } = req.body;
    
    if (name) {
      const checkVertical = vertical || (await prisma.category.findUnique({ where: { id: req.params.id } })).vertical;
      const existing = await prisma.category.findFirst({ where: { name, vertical: checkVertical, id: { not: req.params.id } } });
      if (existing) return res.status(409).json({ error: `Category '${name}' already exists in '${checkVertical}'` });
    }

    const data = {};
    if (name !== undefined) data.name = name;
    if (vertical !== undefined) data.vertical = vertical;
    if (image !== undefined) data.image = image;
    if (sortOrder !== undefined) data.sortOrder = Number(sortOrder);
    if (slug !== undefined) data.slug = slug;
    const category = await prisma.category.update({ where: { id: req.params.id }, data });
    res.json({ category });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PATCH /api/admin/categories/:id/toggle
router.patch('/:id/toggle', async (req, res) => {
  try {
    const existing = await prisma.category.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Category not found' });
    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: { isActive: !existing.isActive },
    });
    res.json({ category });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE /api/admin/categories/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.product.updateMany({ where: { categoryId: req.params.id }, data: { categoryId: null } });
    await prisma.category.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;