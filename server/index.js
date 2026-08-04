require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const prisma = require('./lib/prisma');

const app = express();
const PORT = process.env.PORT || 5001;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Rate limiter — 200 req/15 min per IP (Section 10: API Security)
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
}));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok', engine: 'PostgreSQL/RDS', ts: new Date() }));

app.use('/api/auth', require('./routes/auth'));

// Public storefront catalog
app.use('/api/products', require('./routes/products'));

// Admin routes (all guarded by verifyToken + requireRole in each route file)
app.use('/api/admin/dashboard',    require('./routes/admin/dashboard'));
app.use('/api/admin/users',        require('./routes/admin/users'));
app.use('/api/admin/vendors',      require('./routes/admin/vendors'));
app.use('/api/admin/products',     require('./routes/admin/products'));
app.use('/api/admin/orders',       require('./routes/admin/orders'));
app.use('/api/admin/branches',     require('./routes/admin/branches'));
app.use('/api/admin/rbac',         require('./routes/admin/rbac'));
app.use('/api/admin/service-areas',require('./routes/admin/serviceAreas'));
app.use('/api/admin/support',      require('./routes/admin/support'));
app.use('/api/admin/commissions',  require('./routes/admin/commissions'));

// Vendor routes (guarded by verifyToken + requireRole('vendor') in each file)
app.use('/api/vendor/auth',       require('./routes/vendor/auth'));
app.use('/api/vendor/products',   require('./routes/vendor/products'));
app.use('/api/vendor/orders',     require('./routes/vendor/orders'));
app.use('/api/vendor/analytics',  require('./routes/vendor/analytics'));
app.use('/api/vendor/wallet',     require('./routes/vendor/wallet'));

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// ─── Start ────────────────────────────────────────────────────────────────────
prisma.$connect()
  .then(() => {
    console.log(`✅ PostgreSQL / Amazon RDS connected via Prisma ORM`);
    app.listen(PORT, () => console.log(`🚀 Server listening on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('❌ RDS connection failed:', err.message);
    process.exit(1);
  });
