// backend/db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Buat atau buka file database
const dbPath = path.join(__dirname, 'pos.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database at', dbPath);
  }
});

module.exports = db;
