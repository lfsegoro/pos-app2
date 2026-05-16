const { Pool } = require('pg');

const pool = new Pool({
  user: 'u0_a277',
  host: 'localhost',
  database: 'posdb',
  password: '',
  port: 5432,
});

pool.connect((err, client, release) => {
  if (err) {
    return console.error(
      'Error connecting to PostgreSQL:',
      err.message
    );
  }

  console.log('Connected to PostgreSQL');

  release();
});

module.exports = pool;