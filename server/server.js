const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ── FIREBASE ADMIN INIT ──
const credentials = process.env.FIREBASE_CREDENTIALS
  ? JSON.parse(process.env.FIREBASE_CREDENTIALS)
  : require('./firebase-credentials.json');

admin.initializeApp({
  credential: admin.credential.cert(credentials)
});

const db = admin.firestore();

// ── CATEGORIES ──
app.get('/api/categories', async (req, res) => {
  try {
    const snap = await db.collection('categories').orderBy('order').get();
    const categories = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

app.post('/api/categories', async (req, res) => {
  try {
    const { name, icon } = req.body;
    const snap = await db.collection('categories').get();
    const order = snap.size;
    const ref = await db.collection('categories').add({ name, icon, order });
    res.json({ id: ref.id, name, icon, order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add category' });
  }
});

app.put('/api/categories/:id', async (req, res) => {
  try {
    await db.collection('categories').doc(req.params.id).update(req.body);
    res.json({ id: req.params.id, ...req.body });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  try {
    await db.collection('categories').doc(req.params.id).delete();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// ── VENDORS ──
app.get('/api/vendors', async (req, res) => {
  try {
    const { catId } = req.query;
    let query = db.collection('vendors');
    if (catId) query = query.where('catId', '==', catId);
    const snap = await query.get();
    const vendors = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json(vendors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch vendors' });
  }
});

app.get('/api/vendors/:id', async (req, res) => {
  try {
    const doc = await db.collection('vendors').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Not found' });
    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch vendor' });
  }
});

app.post('/api/vendors', async (req, res) => {
  try {
    const vendorData = {
      catId: req.body.catId,
      name: req.body.name,
      place: req.body.place,
      phone: req.body.phone,
      email: req.body.email || '',
      price: req.body.price || '',
      rating: parseInt(req.body.rating) || 0,
      notes: req.body.notes || '',
      instaId: req.body.instaId || '',
      photos: req.body.photos || [],
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    const ref = await db.collection('vendors').add(vendorData);
    res.json({ id: ref.id, ...vendorData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add vendor' });
  }
});

app.put('/api/vendors/:id', async (req, res) => {
  try {
    const vendorData = {
      catId: req.body.catId,
      name: req.body.name,
      place: req.body.place,
      phone: req.body.phone,
      email: req.body.email || '',
      price: req.body.price || '',
      rating: parseInt(req.body.rating) || 0,
      notes: req.body.notes || '',
      instaId: req.body.instaId || '',
      photos: req.body.photos || [],
    };
    await db.collection('vendors').doc(req.params.id).update(vendorData);
    res.json({ id: req.params.id, ...vendorData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update vendor' });
  }
});

app.delete('/api/vendors/:id', async (req, res) => {
  try {
    await db.collection('vendors').doc(req.params.id).delete();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete vendor' });
  }
});

app.listen(3000, () => console.log('✅ Server running at http://localhost:3000'));