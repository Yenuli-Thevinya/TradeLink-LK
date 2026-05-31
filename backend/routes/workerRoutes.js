const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Worker = require('../models/Worker');

const JWT_SECRET = process.env.JWT_SECRET || 'changeme_in_production';
const JWT_EXPIRES = '7d';

// ── Auth middleware ────────────────────────────────────
const requireAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorised — no token provided' });
  }
  try {
    req.worker = jwt.verify(auth.split(' ')[1], JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: 'Unauthorised — invalid or expired token' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.worker?.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden — admins only' });
  }
  next();
};

// POST /api/workers/register
// Body: { name, email, password, phone?, category?, role? }
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, phone, category, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    const exists = await Worker.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    const worker = await Worker.create({ name, email, password, phone, category, role });
    const token = jwt.sign(
      { id: worker._id, role: worker.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );
    res.status(201).json({ token, worker });
  } catch (err) {
    next(err);
  }
});

// POST /api/workers/login
// Body: { email, password }
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const worker = await Worker.findOne({ email });
    if (!worker || !(await worker.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (!worker.isActive) {
      return res.status(403).json({ message: 'Account is deactivated' });
    }
    const token = jwt.sign(
      { id: worker._id, role: worker.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );
    res.json({ token, worker });
  } catch (err) {
    next(err);
  }
});

// GET /api/workers/me — own profile
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const worker = await Worker.findById(req.worker.id);
    if (!worker) return res.status(404).json({ message: 'Worker not found' });
    res.json(worker);
  } catch (err) {
    next(err);
  }
});

// GET /api/workers — list all workers (admin only)
router.get('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const workers = await Worker.find().sort({ createdAt: -1 });
    res.json(workers);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/workers/:id — update own profile (or admin updates any)
router.patch('/:id', requireAuth, async (req, res, next) => {
  try {
    const isOwn = req.worker.id === req.params.id;
    const isAdmin = req.worker.role === 'admin';
    if (!isOwn && !isAdmin) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const allowed = ['name', 'phone', 'category'];
    if (isAdmin) allowed.push('role', 'isActive');
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => allowed.includes(k))
    );
    const worker = await Worker.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!worker) return res.status(404).json({ message: 'Worker not found' });
    res.json(worker);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/workers/:id — admin only
router.delete('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const worker = await Worker.findByIdAndDelete(req.params.id);
    if (!worker) return res.status(404).json({ message: 'Worker not found' });
    res.json({ message: 'Worker deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = { router, requireAuth, requireAdmin };