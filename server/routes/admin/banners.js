const express = require('express');
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const { uploadToS3 } = require('../../lib/s3');
const { verifyToken } = require('../../middleware/auth');
const { requireRole } = require('../../middleware/rbac');

const router = express.Router();
const prisma = new PrismaClient();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.use(verifyToken);
router.use(requireRole('super_admin', 'branch_manager'));

// Upload image to S3
router.post('/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image provided' });
    const key = `banners/${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const result = await uploadToS3({
      key,
      body: req.file.buffer,
      contentType: req.file.mimetype,
      isPrivate: false,
    });
    res.json({ imageUrl: result.url });
  } catch (error) {
    console.error('S3 upload error:', error);
    res.status(500).json({ error: error.message || 'S3 upload failed' });
  }
});

// Get all banners
router.get('/', async (req, res) => {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ banners });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create banner
router.post('/', async (req, res) => {
  try {
    const { title, subtitle, image, vertical, isActive } = req.body;
    const banner = await prisma.banner.create({
      data: {
        title,
        subtitle,
        image,
        vertical: vertical || 'shop',
        isActive: isActive !== undefined ? isActive : true
      }
    });
    res.status(201).json({ banner });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update banner
router.put('/:id', async (req, res) => {
  try {
    const { title, subtitle, image, vertical, isActive } = req.body;
    const banner = await prisma.banner.update({
      where: { id: req.params.id },
      data: { title, subtitle, image, vertical, isActive }
    });
    res.json({ banner });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete banner
router.delete('/:id', async (req, res) => {
  try {
    await prisma.banner.delete({
      where: { id: req.params.id }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Toggle status
router.patch('/:id/toggle', async (req, res) => {
  try {
    const existing = await prisma.banner.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Not found' });
    
    const banner = await prisma.banner.update({
      where: { id: req.params.id },
      data: { isActive: !existing.isActive }
    });
    res.json({ banner });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
