// backend/models.js

const db = require('./db-pg');


// Inisialisasi tabel
async function initDB() {

  // Tabel inventory
  await db.query(`
    CREATE TABLE IF NOT EXISTS inventory (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      stock INTEGER DEFAULT 0,
      price NUMERIC DEFAULT 0
    )
  `);

  // Tabel transactions
  await db.query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
      item_id INTEGER,
      qty INTEGER,
      subtotal NUMERIC,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('Database tables ready');
}


// Tambah barang baru
async function addItem(name, stock = 0, price = 0) {

  const result = await db.query(
    `INSERT INTO inventory (name, stock, price)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [name, stock, price]
  );

  return result.rows[0];
}


// Barang masuk
async function addStock(id, qty) {

  const result = await db.query(
    `UPDATE inventory
     SET stock = stock + $1
     WHERE id = $2
     RETURNING *`,
    [qty, id]
  );

  return result.rows[0];
}


// Barang keluar
async function reduceStock(id, qty) {

  const result = await db.query(
    `UPDATE inventory
     SET stock = stock - $1
     WHERE id = $2
       AND stock >= $1
     RETURNING *`,
    [qty, id]
  );

  if (result.rowCount === 0) {
    throw new Error('Stock tidak cukup');
  }

  return result.rows[0];
}


// Ambil semua barang
async function getAllItems() {

  const result = await db.query(
    `SELECT * FROM inventory
     ORDER BY id ASC`
  );

  return result.rows;
}


// Export
module.exports = {
  initDB,
  addItem,
  addStock,
  reduceStock,
  getAllItems
};