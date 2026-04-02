const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const SPREADSHEET_ID = '1V0WYlZ7N6f90boqeYiibYekLwQrc1eUrThCDPdVdsr8';

// Load credentials from the JSON file you downloaded
const credentials = process.env.GOOGLE_CREDENTIALS 
  ? JSON.parse(process.env.GOOGLE_CREDENTIALS)
  : require('./credentials.json');

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

async function getSheets() {
  const client = await auth.getClient();
  return google.sheets({ version: 'v4', auth: client });
}

// ── CATEGORIES ──
app.get('/api/categories', async (req, res) => {
  try {
    const sheets = await getSheets();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'categories!A2:C',
    });
    const rows = response.data.values || [];
    const categories = rows.map(row => ({
      id: row[0], name: row[1], icon: row[2]
    }));
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

app.post('/api/categories', async (req, res) => {
  try {
    const { name, icon } = req.body;
    const id = 'cat_' + Date.now();
    const sheets = await getSheets();
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'categories!A:C',
      valueInputOption: 'RAW',
      resource: { values: [[id, name, icon]] },
    });
    res.json({ id, name, icon });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add category' });
  }
});

// ── VENDORS ──
app.get('/api/vendors', async (req, res) => {
  try {
    const { catId } = req.query;
    const sheets = await getSheets();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'vendors!A2:J',
    });
    const rows = response.data.values || [];
    let vendors = rows.map(row => ({
      id: row[0], catId: row[1], name: row[2],
      place: row[3], phone: row[4], email: row[5],
      price: row[6], rating: parseInt(row[7]) || 0,
      notes: row[8], instaId: row[9]
    }));
    if (catId) vendors = vendors.filter(v => v.catId === catId);
    res.json(vendors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch vendors' });
  }
});

app.get('/api/vendors/:id', async (req, res) => {
  try {
    const sheets = await getSheets();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'vendors!A2:J',
    });
    const rows = response.data.values || [];
    const row = rows.find(r => r[0] === req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json({
      id: row[0], catId: row[1], name: row[2],
      place: row[3], phone: row[4], email: row[5],
      price: row[6], rating: parseInt(row[7]) || 0,
      notes: row[8], instaId: row[9]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch vendor' });
  }
});

app.post('/api/vendors', async (req, res) => {
  try {
    const { catId, name, place, phone, email, price, rating, notes, instaId } = req.body;
    const id = 'v_' + Date.now();
    const sheets = await getSheets();
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'vendors!A:J',
      valueInputOption: 'RAW',
      resource: { values: [[id, catId, name, place, phone, email || '', price || '', rating || 0, notes || '', instaId || '']] },
    });
    res.json({ id, catId, name, place, phone, email, price, rating, notes, instaId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add vendor' });
  }
});

app.put('/api/vendors/:id', async (req, res) => {
  try {
    const sheets = await getSheets();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'vendors!A2:J',
    });
    const rows = response.data.values || [];
    const rowIndex = rows.findIndex(r => r[0] === req.params.id);
    if (rowIndex === -1) return res.status(404).json({ error: 'Not found' });

    const { catId, name, place, phone, email, price, rating, notes, instaId } = req.body;
    const sheetRow = rowIndex + 2;

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `vendors!A${sheetRow}:J${sheetRow}`,
      valueInputOption: 'RAW',
      resource: { values: [[req.params.id, catId, name, place, phone, email || '', price || '', rating || 0, notes || '', instaId || '']] },
    });
    res.json({ id: req.params.id, ...req.body });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update vendor' });
  }
});

app.delete('/api/vendors/:id', async (req, res) => {
  try {
    const sheets = await getSheets();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'vendors!A2:J',
    });
    const rows = response.data.values || [];
    const rowIndex = rows.findIndex(r => r[0] === req.params.id);
    if (rowIndex === -1) return res.status(404).json({ error: 'Not found' });

    const sheetRow = rowIndex + 2;
    await sheets.spreadsheets.values.clear({
      spreadsheetId: SPREADSHEET_ID,
      range: `vendors!A${sheetRow}:J${sheetRow}`,
    });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete vendor' });
  }
});

app.listen(3000, () => console.log('✅ Server running at http://localhost:3000'));