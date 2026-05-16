// backend/api.js

const express = require('express');

const router = express.Router();

const inventory =
  require('./models');

const db =
  require('./db-pg');


// CHECKOUT TRANSACTION

router.post(
  '/transactions/add',
  async (req, res) => {

    const client =
      await db.connect();

    try {

      const {

        cashier_name,

        payment_method,

        total,

        paid_amount,

        change_amount,

        status,

        cart

      } = req.body;

      if (
        !cart ||
        cart.length === 0
      ) {

        return res
          .status(400)
          .json({

            error:
              'Keranjang kosong'

          });

      }

      // CREATE TABLES

      await client.query(`

        CREATE TABLE IF NOT EXISTS transactions (

          id SERIAL PRIMARY KEY,

          cashier_name TEXT,

          payment_method TEXT,

          total NUMERIC(12,2),

          paid_amount NUMERIC(12,2),

          change_amount NUMERIC(12,2),

          status TEXT DEFAULT 'paid',

          created_at TIMESTAMP
          DEFAULT CURRENT_TIMESTAMP

        )

      `);

      await client.query(`

        CREATE TABLE IF NOT EXISTS transaction_items (

          id SERIAL PRIMARY KEY,

          transaction_id INTEGER NOT NULL,

          item_id INTEGER NOT NULL,

          barcode TEXT,

          item_name TEXT NOT NULL,

          qty INTEGER NOT NULL,

          price NUMERIC(12,2) NOT NULL,

          discount NUMERIC(12,2)
          DEFAULT 0,

          tax NUMERIC(12,2)
          DEFAULT 0,

          subtotal NUMERIC(12,2)
          NOT NULL,

          created_at TIMESTAMP
          DEFAULT CURRENT_TIMESTAMP,

          CONSTRAINT fk_transaction

            FOREIGN KEY(transaction_id)

            REFERENCES transactions(id)

            ON DELETE CASCADE

        )

      `);

      // BEGIN TRANSACTION

      await client.query(
        'BEGIN'
      );

      // INSERT MASTER TRANSACTION

      const trxResult =
        await client.query(

          `
          INSERT INTO transactions
          (

            cashier_name,
            payment_method,
            total,
            paid_amount,
            change_amount,
            status

          )

          VALUES
          (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6
          )

          RETURNING id
          `,

          [

            cashier_name,

            payment_method,

            total,

            paid_amount,

            change_amount,

            status

          ]

        );

      const transactionId =
        trxResult.rows[0].id;

      console.log(
        'transactionId:',
        transactionId
      );

      // INSERT DETAIL ITEMS

      for (const item of cart) {

        const subtotal =

          (
            item.qty *
            item.price
          )

          -

          (
            item.discount || 0
          )

          +

          (
            item.tax || 0
          );

        console.log(item);

        await client.query(

          `
          INSERT INTO transaction_items
          (

            transaction_id,
            item_id,
            barcode,
            item_name,
            qty,
            price,
            discount,
            tax,
            subtotal

          )

          VALUES
          (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            $8,
            $9
          )
          `,

          [

            transactionId,

            item.id,

            item.barcode || null,

            item.name,

            item.qty,

            item.price,

            item.discount || 0,

            item.tax || 0,

            subtotal

          ]

        );

        // REDUCE STOCK

        await inventory.reduceStock(

          item.id,

          item.qty

        );

      }

      // COMMIT

      await client.query(
        'COMMIT'
      );

      res.json({

        success: true,

        transaction_id:
          transactionId,

        message:
          'Transaksi berhasil disimpan'

      });

    }

    catch(err) {

      await client.query(
        'ROLLBACK'
      );

      console.error(err);

      res.status(500).json({

        error:
          err.message

      });

    }

    finally {

      client.release();

    }

  }
);

module.exports = router;


// Tambah barang baru
router.post('/inventory/add', async (req, res) => {
  try {
    const { name, stock, price } = req.body;

    await inventory.addItem(name, stock, price);

    res.json({
      message: 'Item added successfully'
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});


// Barang masuk
router.post('/inventory/in', async (req, res) => {
  try {
    const { id, qty } = req.body;

    await inventory.addStock(id, qty);

    res.json({
      message: 'Stock increased'
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});


// Barang keluar
router.post('/inventory/out', async (req, res) => {
  try {
    const { id, qty } = req.body;

    await inventory.reduceStock(id, qty);

    res.json({
      message: 'Stock reduced'
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});


// Ambil semua barang
router.get('/inventory', async (req, res) => {
  try {
    const rows = await inventory.getAllItems();

    res.json(rows);

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

module.exports = router;