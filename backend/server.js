/* ================================================================
   SERVER.JS — Wa3yna Website Backend
   Node.js + Express | محمود أحمد الشوري
   
   Features:
   - Contact form (save to JSON + email notification)
   - Testimonials (CRUD, approval system)
   - Blog posts (CRUD with markdown)
   - Simple admin auth
   - Rate limiting
   - CORS protection
   ================================================================ */

'use strict';

const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const rateLimit  = require('express-rate-limit');
const path       = require('path');
const fs         = require('fs');
const crypto     = require('crypto');

const app  = express();
const PORT = process.env.PORT || 3000;

/* ── Database (flat JSON files — no external DB needed) ──────────── */
const DB_DIR = path.join(__dirname, 'data');
const DB = {
  contacts:     path.join(DB_DIR, 'contacts.json'),
  testimonials: path.join(DB_DIR, 'testimonials.json'),
  posts:        path.join(DB_DIR, 'posts.json'),
  comments:     path.join(DB_DIR, 'comments.json'),
};

/* Ensure data directory and files exist */
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
Object.values(DB).forEach(file => {
  if (!fs.existsSync(file)) fs.writeFileSync(file, '[]', 'utf8');
});

/* DB helpers */
const db = {
  read:  (file) => JSON.parse(fs.readFileSync(file, 'utf8') || '[]'),
  write: (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8'),
  append(file, item) {
    const all = this.read(file);
    all.unshift(item);           // newest first
    this.write(file, all);
    return item;
  },
};

/* ── Middleware ──────────────────────────────────────────────────── */
app.use(helmet({ contentSecurityPolicy: false })); // CSP handled separately
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

/* Serve static files */
app.use(express.static(path.join(__dirname, '..')));

/* ── Rate Limiters ───────────────────────────────────────────────── */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 min
  max: 60,
  message: { ok: false, message: 'طلبات كثيرة جداً، انتظر قليلاً' },
});

const postLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 10,
  message: { ok: false, message: 'تجاوزت الحد المسموح. حاول بعد ساعة.' },
});

app.use('/api/', apiLimiter);

/* ── Auth Middleware (simple token) ─────────────────────────────── */
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'wa3yna-admin-2025';
function requireAdmin(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token !== ADMIN_TOKEN) return res.status(401).json({ ok: false, message: 'غير مصرح' });
  next();
}

/* ── Validators ──────────────────────────────────────────────────── */
function sanitize(str = '') {
  return String(str).trim().slice(0, 2000)
    .replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function isEmail(str) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
}

/* ── Helper: log to file ─────────────────────────────────────────── */
const LOG_FILE = path.join(DB_DIR, 'server.log');
function log(level, msg, data = '') {
  const line = `[${new Date().toISOString()}] [${level}] ${msg} ${data ? JSON.stringify(data) : ''}\n`;
  fs.appendFileSync(LOG_FILE, line);
  if (level !== 'DEBUG') console.log(line.trim());
}

/* ================================================================
   ROUTES
   ================================================================ */

/* ── Health check ──────────────────────────────────────────────── */
app.get('/api/health', (req, res) => {
  res.json({ ok: true, status: 'running', time: new Date().toISOString() });
});

/* ── Site Info ─────────────────────────────────────────────────── */
app.get('/api/info', (req, res) => {
  res.json({
    ok: true,
    data: {
      name:       'محمود أحمد الشوري',
      nameEn:     'Mahmoud Ahmed Elshora',
      initiative: 'وعينا – Wa3yna',
      tagline:    'بصوتنا نقرر • بأيدينا نغير',
      email:      '1mahmoudelshora1@gmail.com',
      whatsapp:   '01097022361',
      governorate:'كفر الشيخ',
      grade:      'الصف الأول الثانوي',
      stats: {
        activities:    9,
        projects:      4,
        achievements:  3,
        nationalRank:  1,
      },
    },
  });
});


/* ================================================================
   CONTACT API
   ================================================================ */

/* POST /api/contact — receive a new message */
app.post('/api/contact', postLimiter, (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  // Validate
  if (!name || !email || !message) {
    return res.status(400).json({ ok: false, message: 'الاسم والبريد والرسالة مطلوبة' });
  }
  if (!isEmail(email)) {
    return res.status(400).json({ ok: false, message: 'البريد الإلكتروني غير صحيح' });
  }

  const entry = {
    id:        crypto.randomUUID(),
    name:      sanitize(name),
    email:     sanitize(email),
    phone:     sanitize(phone || ''),
    subject:   sanitize(subject || 'رسالة عامة'),
    message:   sanitize(message),
    ip:        req.ip,
    createdAt: new Date().toISOString(),
    read:      false,
  };

  db.append(DB.contacts, entry);
  log('INFO', 'New contact message', { name: entry.name, email: entry.email });

  res.status(201).json({ ok: true, message: 'تم استلام رسالتك بنجاح! سنرد عليك قريباً.', id: entry.id });
});

/* GET /api/contact — admin: list all messages */
app.get('/api/contact', requireAdmin, (req, res) => {
  const all    = db.read(DB.contacts);
  const page   = parseInt(req.query.page  || 1);
  const limit  = parseInt(req.query.limit || 20);
  const unread = req.query.unread === 'true';
  const list   = unread ? all.filter(c => !c.read) : all;
  const total  = list.length;
  const items  = list.slice((page - 1) * limit, page * limit);
  res.json({ ok: true, total, page, pages: Math.ceil(total / limit), data: items });
});

/* PUT /api/contact/:id/read — mark as read */
app.put('/api/contact/:id/read', requireAdmin, (req, res) => {
  const all = db.read(DB.contacts);
  const idx = all.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ ok: false, message: 'الرسالة غير موجودة' });
  all[idx].read = true; all[idx].readAt = new Date().toISOString();
  db.write(DB.contacts, all);
  res.json({ ok: true });
});

/* DELETE /api/contact/:id */
app.delete('/api/contact/:id', requireAdmin, (req, res) => {
  const all = db.read(DB.contacts).filter(c => c.id !== req.params.id);
  db.write(DB.contacts, all);
  res.json({ ok: true });
});


/* ================================================================
   TESTIMONIALS API
   ================================================================ */

/* GET /api/testimonials — public: approved only */
app.get('/api/testimonials', (req, res) => {
  const all      = db.read(DB.testimonials);
  const approved = all.filter(t => t.approved);
  const page     = parseInt(req.query.page  || 1);
  const limit    = parseInt(req.query.limit || 12);
  const items    = approved.slice((page - 1) * limit, page * limit);
  res.json({ ok: true, total: approved.length, page, data: items });
});

/* GET /api/testimonials/all — admin: all including pending */
app.get('/api/testimonials/all', requireAdmin, (req, res) => {
  res.json({ ok: true, data: db.read(DB.testimonials) });
});

/* POST /api/testimonials — submit new testimonial */
app.post('/api/testimonials', postLimiter, (req, res) => {
  const { name, role, message, rating } = req.body;
  if (!name || !message) {
    return res.status(400).json({ ok: false, message: 'الاسم والشهادة مطلوبان' });
  }
  const entry = {
    id:        crypto.randomUUID(),
    name:      sanitize(name),
    role:      sanitize(role || 'زائر'),
    message:   sanitize(message),
    rating:    Math.min(5, Math.max(1, parseInt(rating) || 5)),
    approved:  false,   // requires admin approval
    ip:        req.ip,
    createdAt: new Date().toISOString(),
  };
  db.append(DB.testimonials, entry);
  log('INFO', 'New testimonial submitted', { name: entry.name });
  res.status(201).json({ ok: true, message: 'شكراً! سيتم نشر شهادتك بعد المراجعة.' });
});

/* PUT /api/testimonials/:id/approve — admin approve */
app.put('/api/testimonials/:id/approve', requireAdmin, (req, res) => {
  const all = db.read(DB.testimonials);
  const idx = all.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ ok: false, message: 'غير موجود' });
  all[idx].approved   = true;
  all[idx].approvedAt = new Date().toISOString();
  db.write(DB.testimonials, all);
  res.json({ ok: true });
});

/* DELETE /api/testimonials/:id */
app.delete('/api/testimonials/:id', requireAdmin, (req, res) => {
  const all = db.read(DB.testimonials).filter(t => t.id !== req.params.id);
  db.write(DB.testimonials, all);
  res.json({ ok: true });
});


/* ================================================================
   BLOG POSTS API
   ================================================================ */

/* GET /api/posts — list published posts */
app.get('/api/posts', (req, res) => {
  const all       = db.read(DB.posts);
  const published = all.filter(p => p.published);
  const page      = parseInt(req.query.page     || 1);
  const limit     = parseInt(req.query.limit    || 6);
  const cat       = req.query.category || null;
  const filtered  = cat ? published.filter(p => p.category === cat) : published;
  const total     = filtered.length;
  const items     = filtered.slice((page - 1) * limit, page * limit)
    .map(p => ({ ...p, body: undefined }));  // strip body from list view
  res.json({ ok: true, total, page, pages: Math.ceil(total / limit), data: items });
});

/* GET /api/posts/:slug — single post with full body */
app.get('/api/posts/:slug', (req, res) => {
  const post = db.read(DB.posts).find(p => p.slug === req.params.slug && p.published);
  if (!post) return res.status(404).json({ ok: false, message: 'المقال غير موجود' });
  // increment views
  const all = db.read(DB.posts);
  const idx = all.findIndex(p => p.slug === req.params.slug);
  if (idx !== -1) { all[idx].views = (all[idx].views || 0) + 1; db.write(DB.posts, all); }
  res.json({ ok: true, data: post });
});

/* POST /api/posts — admin: create post */
app.post('/api/posts', requireAdmin, (req, res) => {
  const { title, titleEn, body, category, coverEmoji, published } = req.body;
  if (!title || !body) return res.status(400).json({ ok: false, message: 'العنوان والمحتوى مطلوبان' });
  const slug = title.trim()
    .replace(/\s+/g, '-')
    .replace(/[^\u0600-\u06FFa-zA-Z0-9-]/g, '')
    .slice(0, 80) + '-' + Date.now();
  const post = {
    id:          crypto.randomUUID(),
    slug,
    title:       sanitize(title),
    titleEn:     sanitize(titleEn || ''),
    body:        body.slice(0, 50000),
    category:    sanitize(category || 'عام'),
    coverEmoji:  sanitize(coverEmoji || '📝'),
    published:   Boolean(published),
    views:       0,
    createdAt:   new Date().toISOString(),
    updatedAt:   new Date().toISOString(),
  };
  db.append(DB.posts, post);
  log('INFO', 'New post created', { title: post.title, slug: post.slug });
  res.status(201).json({ ok: true, data: { id: post.id, slug: post.slug } });
});

/* PUT /api/posts/:id — admin: update */
app.put('/api/posts/:id', requireAdmin, (req, res) => {
  const all = db.read(DB.posts);
  const idx = all.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ ok: false, message: 'المقال غير موجود' });
  const allowed = ['title','titleEn','body','category','coverEmoji','published'];
  allowed.forEach(k => { if (req.body[k] !== undefined) all[idx][k] = req.body[k]; });
  all[idx].updatedAt = new Date().toISOString();
  db.write(DB.posts, all);
  res.json({ ok: true });
});

/* DELETE /api/posts/:id */
app.delete('/api/posts/:id', requireAdmin, (req, res) => {
  const all = db.read(DB.posts).filter(p => p.id !== req.params.id);
  db.write(DB.posts, all);
  res.json({ ok: true });
});


/* ================================================================
   COMMENTS API
   ================================================================ */

/* GET /api/comments?postSlug=xxx */
app.get('/api/comments', (req, res) => {
  const { postSlug } = req.query;
  if (!postSlug) return res.status(400).json({ ok: false, message: 'postSlug مطلوب' });
  const all = db.read(DB.comments).filter(c => c.postSlug === postSlug && c.approved);
  res.json({ ok: true, total: all.length, data: all });
});

/* POST /api/comments */
app.post('/api/comments', postLimiter, (req, res) => {
  const { postSlug, name, message } = req.body;
  if (!postSlug || !name || !message) {
    return res.status(400).json({ ok: false, message: 'جميع الحقول مطلوبة' });
  }
  const entry = {
    id:        crypto.randomUUID(),
    postSlug:  sanitize(postSlug),
    name:      sanitize(name),
    message:   sanitize(message),
    approved:  false,
    ip:        req.ip,
    createdAt: new Date().toISOString(),
  };
  db.append(DB.comments, entry);
  res.status(201).json({ ok: true, message: 'سيظهر تعليقك بعد المراجعة.' });
});

/* PUT /api/comments/:id/approve */
app.put('/api/comments/:id/approve', requireAdmin, (req, res) => {
  const all = db.read(DB.comments);
  const idx = all.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ ok: false, message: 'غير موجود' });
  all[idx].approved   = true;
  all[idx].approvedAt = new Date().toISOString();
  db.write(DB.comments, all);
  res.json({ ok: true });
});


/* ================================================================
   ADMIN DASHBOARD DATA
   ================================================================ */

app.get('/api/admin/summary', requireAdmin, (req, res) => {
  const contacts     = db.read(DB.contacts);
  const testimonials = db.read(DB.testimonials);
  const posts        = db.read(DB.posts);
  const comments     = db.read(DB.comments);
  res.json({
    ok: true,
    data: {
      contacts:     { total: contacts.length,     unread: contacts.filter(c => !c.read).length },
      testimonials: { total: testimonials.length, pending: testimonials.filter(t => !t.approved).length },
      posts:        { total: posts.length,        published: posts.filter(p => p.published).length, totalViews: posts.reduce((s, p) => s + (p.views || 0), 0) },
      comments:     { total: comments.length,     pending: comments.filter(c => !c.approved).length },
    },
  });
});


/* ── 404 handler ─────────────────────────────────────────────────── */
app.use('/api/*', (req, res) => {
  res.status(404).json({ ok: false, message: 'المسار غير موجود' });
});

/* Serve index.html for SPA routing */
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

/* ── Global error handler ────────────────────────────────────────── */
app.use((err, req, res, next) => {
  log('ERROR', err.message, { path: req.path });
  res.status(500).json({ ok: false, message: 'خطأ في الخادم، حاول لاحقاً' });
});

/* ── Start ───────────────────────────────────────────────────────── */
app.listen(PORT, () => {
  log('INFO', `🚀 Wa3yna Server running on http://localhost:${PORT}`);
  log('INFO', `Admin token: ${ADMIN_TOKEN}`);
});

module.exports = app;
