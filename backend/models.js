// backend/models.js
const db = require('./db');

db.run(`
  CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    stock INTEGER DEFAULT 0,
    price REAL DEFAULT 0
  )
`);
// Buat tabel transactions
db.run(`
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER,
    qty INTEGER,
    subtotal REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Tambah barang baru dengan harga
function addItem(name, stock = 0, price = 0, callback) {
  db.run(`INSERT INTO inventory (name, stock, price) VALUES (?, ?, ?)`, [name, stock, price], callback);
}

// Barang masuk
function addStock(id, qty, callback) {
  db.run(`UPDATE inventory SET stock = stock + ? WHERE id = ?`, [qty, id], callback);
}

// Barang keluar
function reduceStock(id, qty, callback) {
  db.run(`UPDATE inventory SET stock = stock - ? WHERE id = ? AND stock >= ?`, [qty, id, qty], callback);
}

// Ambil semua barang
function getAllItems(callback) {
  db.all(`SELECT * FROM inventory`, [], callback);
}

module.exports = { addItem, addStock, reduceStock, getAllItems };
