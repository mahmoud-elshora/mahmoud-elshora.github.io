'use strict';

/* =======================
   ENV + IMPORTS
======================= */
require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const path    = require('path');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;

/* =======================
   MONGODB CONNECTION
======================= */
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'wa3yna';

let db;

async function connectDB() {
  try {
    const client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    await client.connect();
    db = client.db(DB_NAME);

    console.log('✅ MongoDB Connected:', DB_NAME);
  } catch (err) {
    console.error('❌ MongoDB Error:', err.message);
    process.exit(1);
  }
}

/* =======================
   MIDDLEWARE
======================= */
app.use(cors());
app.use(express.json());

/* =======================
   STATIC FRONTEND
======================= */
const ROOT = path.join(__dirname, '..');
app.use(express.static(ROOT));

/* =======================
   UTIL
======================= */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/* =======================
   BLOG & COMMUNITY API
======================= */

// Get posts
app.get('/api/posts', async (req, res) => {
  try {
    const coll = req.query.type === 'admin' ? 'blog' : 'community';

    const posts = await db.collection(coll)
      .find({ published: true })
      .sort({ date: -1 })
      .toArray();

    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching posts' });
  }
});

// Post details
app.get('/api/post-details/:id', async (req, res) => {
  try {
    const id = req.params.id;

    let post = await db.collection('blog').findOne({ id });
    if (!post) post = await db.collection('community').findOne({ id });

    if (!post) return res.status(404).json({ error: 'Not found' });

    res.json(post);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching post' });
  }
});

// Submit community post
app.post('/api/community-submit', async (req, res) => {
  try {
    const newPost = {
      id: generateId(),
      title: req.body.title || '',
      author: req.body.author || 'guest',
      excerpt: req.body.excerpt || '',
      content: req.body.content || '',
      type: 'guest',
      published: false,
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date()
    };

    await db.collection('community').insertOne(newPost);

    res.json({ ok: true, id: newPost.id });
  } catch (err) {
    res.status(500).json({ error: 'Submit failed' });
  }
});

/* =======================
   TESTIMONIALS
======================= */

app.get('/api/testimonials', async (req, res) => {
  try {
    const data = await db.collection('testimonials')
      .find({ approved: true })
      .toArray();

    res.json(data);
  } catch (err) {
    res.status(500).json([]);
  }
});

app.post('/api/testimonials', async (req, res) => {
  try {
    const newItem = {
      id: generateId(),
      ...req.body,
      approved: false,
      date: new Date().toISOString()
    };

    await db.collection('testimonials').insertOne(newItem);

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false });
  }
});

/* =======================
   CONTACT
======================= */

app.post('/api/contact', async (req, res) => {
  try {
    await db.collection('contacts').insertOne({
      id: generateId(),
      ...req.body,
      date: new Date().toISOString()
    });

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false });
  }
});

/* =======================
   ADMIN AUTH
======================= */

const ADMIN_USER = process.env.ADMIN_USER;
const ADMIN_PASS = process.env.ADMIN_PASS;

function verifyAdmin(req, res, next) {
  const token = req.headers['authorization'];

  if (token === "admin-token") return next();

  return res.status(403).json({ message: "Unauthorized" });
}

/* =======================
   LOGIN
======================= */

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    return res.json({ success: true, token: "admin-token" });
  }

  res.status(401).json({ success: false });
});

/* =======================
   BLOG ADMIN
======================= */

app.post('/api/blog', verifyAdmin, async (req, res) => {
  try {
    const post = {
      id: generateId(),
      title: req.body.title,
      excerpt: req.body.excerpt,
      content: req.body.content,
      published: true,
      date: new Date().toISOString().split('T')[0]
    };

    await db.collection('blog').insertOne(post);

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false });
  }
});

app.delete('/api/blog/:id', verifyAdmin, async (req, res) => {
  try {
    await db.collection('blog').deleteOne({ id: req.params.id });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ ok: false });
  }
});

/* =======================
   COMMUNITY ADMIN
======================= */

app.put('/api/community/approve/:id', verifyAdmin, async (req, res) => {
  try {
    await db.collection('community').updateOne(
      { id: req.params.id },
      { $set: { published: true } }
    );

    res.json({ ok: true });
  } catch {
    res.status(500).json({ ok: false });
  }
});

app.delete('/api/community/:id', verifyAdmin, async (req, res) => {
  try {
    await db.collection('community').deleteOne({ id: req.params.id });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ ok: false });
  }
});

/* =======================
   CONTACTS ADMIN
======================= */

app.get('/api/contacts', verifyAdmin, async (req, res) => {
  try {
    const data = await db.collection('contacts').find().toArray();
    res.json(data);
  } catch {
    res.status(500).json([]);
  }
});

/* =======================
   SPA ROUTE
======================= */

app.get('*', (req, res) => {
  if (!req.path.startsWith('/api/')) {
    res.sendFile(path.join(ROOT, 'index.html'));
  }
});

/* =======================
   START SERVER
======================= */

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});