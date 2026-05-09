// backend/api.js
const express = require('express');
const router = express.Router();
const inventory = require('./models');
const db = require('./db');

// Checkout transaksi
router.post('/transactions/add', (req, res) => {
  const { cart } = req.body;
  if (!cart || cart.length === 0) {
    return res.status(400).json({ error: 'Keranjang kosong' });
  }

  // Buat tabel transaksi jika belum ada
  db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id INTEGER,
      qty INTEGER,
      subtotal REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  cart.forEach(item => {
    const subtotal = item.qty * item.price;
    db.run(`INSERT INTO transactions (item_id, qty, subtotal) VALUES (?, ?, ?)`,
      [item.id, item.qty, subtotal]);
    // Kurangi stok
    inventory.reduceStock(item.id, item.qty, (err) => {
      if (err) console.error(err.message);
    });
  });

  res.json({ message: 'Transaksi berhasil disimpan' });
});


// Tambah barang baru
router.post('/inventory/add', (req, res) => {
  const { name, stock, price } = req.body;
  inventory.addItem(name, stock, price, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Item added successfully' });
  });
});


// Barang masuk
router.post('/inventory/in', (req, res) => {
  const { id, qty } = req.body;
  inventory.addStock(id, qty, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Stock increased' });
  });
});

// Barang keluar
router.post('/inventory/out', (req, res) => {
  const { id, qty } = req.body;
  inventory.reduceStock(id, qty, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Stock reduced' });
  });
});

// Ambil semua barang
router.get('/inventory', (req, res) => {
  inventory.getAllItems((err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});


module.exports = router;
