'use strict';
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const { MongoClient, ObjectId } = require('mongodb');

const app  = express();
const PORT = process.env.PORT || 3000;

/* ================================================================
   MONGODB ATLAS CONNECTION
   ضع رابط الاتصال في متغير البيئة MONGODB_URI
   مثال: mongodb+srv://mahmoud:<password>@cluster0.xxxxx.mongodb.net/wa3yna
================================================================ */
const MONGODB_URI = "mongodb+srv://mahmoud:Mahmouo1o14824842@cluster0.j0wnszm.mongodb.net/wa3yna?retryWrites=true&w=majority";
const DB_NAME     = 'wa3yna';

let db; // سيتم تعيينه بعد الاتصال

async function connectDB() {
  try {
    const client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    await client.connect();
    db = client.db(DB_NAME);
    console.log('✅ MongoDB Atlas متصل بنجاح — قاعدة البيانات:', DB_NAME);
  } catch (err) {
    console.error('❌ فشل الاتصال بـ MongoDB:', err.message);
    process.exit(1);
  }
}

/* ── توليد ID فريد (بقينا نستخدمه للـ seed وللـ community posts) ── */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/* ── Middleware ── */
app.use(cors());
app.use(express.json());

/* ── Static Files ── */
const ROOT = path.join(__dirname, '..');
app.use(express.static(ROOT));

/* ================================================================
   BLOG API — مقالات محمود (collection: blog)
================================================================ */

/* GET /api/posts?type=admin  → blog collection
   GET /api/posts?type=guest  → community collection */
app.get('/api/posts', async (req, res) => {
  try {
    const collName = req.query.type === 'admin' ? 'blog' : 'community';
    const posts    = await db.collection(collName)
      .find({ published: true })
      .sort({ date: -1 })
      .toArray();

    // حوّل _id لـ string بسيط عشان الفرونت اند ما يتأثرش
    const clean = posts.map(p => ({ ...p, _id: undefined, id: p.id || p._id.toString() }));
    res.json(clean);
  } catch (err) {
    console.error('Error /api/posts:', err.message);
    res.status(500).json({ error: 'خطأ في جلب المقالات' });
  }
});

/* GET /api/post-details/:id → يبحث في blog ثم community */
app.get('/api/post-details/:id', async (req, res) => {
  try {
    const id   = req.params.id;
    let   post = await db.collection('blog').findOne({ id });

    if (!post) {
      post = await db.collection('community').findOne({ id });
    }

    if (!post) return res.status(404).json({ error: 'المقال غير موجود' });

    res.json({ ...post, _id: undefined, id: post.id || post._id.toString() });
  } catch (err) {
    console.error('Error /api/post-details:', err.message);
    res.status(500).json({ error: 'خطأ في جلب المقال' });
  }
});

/* ================================================================
   COMMUNITY API — مقالات الجمهور (collection: community)
================================================================ */

/* POST /api/community-submit → حفظ مقال جديد (published: false) */
app.post('/api/community-submit', async (req, res) => {
  try {
    const newPost = {
      id:        generateId(),
      title:     req.body.title   || '',
      author:    req.body.author  || 'زائر',
      excerpt:   req.body.excerpt || '',
      content:   req.body.content || '',
      type:      'guest',
      published: false,
      date:      new Date().toISOString().split('T')[0],
      createdAt: new Date(),
    };

    await db.collection('community').insertOne(newPost);
    res.json({ ok: true, id: newPost.id });
  } catch (err) {
    console.error('Error /api/community-submit:', err.message);
    res.status(500).json({ error: 'فشل حفظ المقال' });
  }
});

/* ================================================================
   TESTIMONIALS (collection: testimonials)
================================================================ */

app.get('/api/testimonials', async (req, res) => {
  try {
    const testimonials = await db.collection('testimonials')
      .find({ approved: true })
      .toArray();
    res.json(testimonials.map(t => ({ ...t, _id: undefined })));
  } catch (err) {
    res.status(500).json({ error: 'خطأ في جلب الشهادات' });
  }
});

app.post('/api/testimonials', async (req, res) => {
  try {
    const newTestimonial = {
      id:       generateId(),
      ...req.body,
      approved: false,
      date:     new Date().toISOString(),
    };
    await db.collection('testimonials').insertOne(newTestimonial);
    res.json({ ok: true });
  } catch (err) {
    console.error('Error /api/testimonials POST:', err.message);
    res.status(500).json({ ok: false });
  }
});

/* ================================================================
   CONTACT (collection: contacts)
================================================================ */

app.post('/api/contact', async (req, res) => {
  try {
    await db.collection('contacts').insertOne({
      id:   generateId(),
      ...req.body,
      date: new Date().toISOString(),
    });
    res.json({ ok: true });
  } catch (err) {
    console.error('Error /api/contact:', err.message);
    res.status(500).json({ ok: false });
  }
});

/* ── SPA fallback ── */
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api/')) {
    res.sendFile(path.join(ROOT, 'index.html'));
  }
});

/* ── Start: اتصل بـ MongoDB أولاً ثم شغّل السيرفر ── */
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 السيرفر يعمل على: http://localhost:${PORT}`);
  });
});









// ================= ADMIN AUTH =================

const ADMIN_USER = "admin";
const ADMIN_PASS = "1234";

// Middleware للتحقق من الأدمن
function verifyAdmin(req, res, next) {
  const token = req.headers['authorization'];

  if (token === "admin-token") {
    return next();
  }

  return res.status(403).json({
    ok: false,
    message: "Unauthorized"
  });
}

// ================= LOGIN =================

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    return res.json({
      success: true,
      token: "admin-token"
    });
  }

  res.status(401).json({
    success: false,
    message: "بيانات غير صحيحة"
  });
});

// ================= BLOG =================

// إضافة مقال
app.post('/api/blog', verifyAdmin, async (req, res) => {
  try {
    const newPost = {
      id: Date.now().toString(),
      title: req.body.title || '',
      excerpt: req.body.excerpt || '',
      content: req.body.content || '',
      published: true,
      date: new Date().toISOString().split('T')[0]
    };

    await db.collection('blog').insertOne(newPost);

    res.json({ ok: true });

  } catch (err) {
    res.status(500).json({ ok: false });
  }
});

// حذف مقال
app.delete('/api/blog/:id', verifyAdmin, async (req, res) => {
  try {
    await db.collection('blog').deleteOne({ id: req.params.id });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false });
  }
});

// ================= COMMUNITY =================

// الموافقة على مقال
app.put('/api/community/approve/:id', verifyAdmin, async (req, res) => {
  try {
    await db.collection('community').updateOne(
      { id: req.params.id },
      { $set: { published: true } }
    );

    res.json({ ok: true });

  } catch (err) {
    res.status(500).json({ ok: false });
  }
});

// حذف مقال من المجتمع
app.delete('/api/community/:id', verifyAdmin, async (req, res) => {
  try {
    await db.collection('community').deleteOne({ id: req.params.id });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false });
  }
});

// ================= CONTACTS =================

// عرض الرسائل
app.get('/api/contacts', verifyAdmin, async (req, res) => {
  try {
    const data = await db.collection('contacts').find().toArray();
    res.json(data);
  } catch (err) {
    res.status(500).json([]);
  }
});