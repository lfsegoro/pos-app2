import { fsm }
from './fsm.js';

import { createKeypad }
from './keypad.js';

let cart = [];

let currentItem = null;

const itemInput =
  document.getElementById(
    'itemInput'
  );

const qtyInput =
  document.getElementById(
    'qtyInput'
  );

async function getItem(id) {

  const res =
    await fetch('/api/inventory');

  const items =
    await res.json();

  return items.find(
    item => item.id == id
  );

}

function calculateTotal() {

  return cart.reduce(

    (sum, item) => {

      return sum +
        (item.qty * item.price);

    },

    0

  );

}

function renderView() {

  document
    .getElementById(
      'view-item'
    )
    .classList.toggle(
      'hidden',
      fsm.state !== 'inputItem'
    );

  document
    .getElementById(
      'view-qty'
    )
    .classList.toggle(
      'hidden',
      fsm.state !== 'inputQty'
    );

}

function renderCart() {

  const body =
    document.getElementById(
      'cartBody'
    );

  body.innerHTML = '';

  let total = 0;

  cart.forEach(item => {

    const subtotal =
      item.qty * item.price;

    total += subtotal;

    body.innerHTML += `

      <tr>

        <td>${item.name}</td>

        <td>${item.qty}</td>

        <td>${subtotal}</td>

      </tr>

    `;

  });

  document
    .getElementById(
      'totalAmount'
    )
    .textContent = total;

}

createKeypad(

  document.getElementById(
    'itemKeypad'
  ),

  async key => {

    if (key === 'C') {

      itemInput.value = '';

      return;

    }

    if (key === 'OK') {

      if (!itemInput.value) {

        return;

      }

      const item =
        await getItem(
          itemInput.value
        );

      if (!item) {

        alert(
          'Barang tidak ditemukan'
        );

        return;

      }

      currentItem = item;

      qtyInput.value = '';

      fsm.send('NEXT');

      renderView();

      return;

    }

    itemInput.value += key;

  }

);

createKeypad(

  document.getElementById(
    'qtyKeypad'
  ),

  key => {

    if (key === 'C') {

      qtyInput.value = '';

      return;

    }

    if (key === 'OK') {

      const qty =
        parseInt(
          qtyInput.value
        );

      if (!qty || qty <= 0) {

        alert(
          'Qty tidak valid'
        );

        return;

      }

      cart.push({

        id:
          currentItem.id,

        barcode:
          currentItem.barcode || null,

        name:
          currentItem.name,

        qty,

        price:
          parseFloat(
            currentItem.price
          ),

        discount: 0,

        tax: 0

      });

      renderCart();

      itemInput.value = '';

      qtyInput.value = '';

      currentItem = null;

      fsm.send('ADD');

      renderView();

      return;

    }

    qtyInput.value += key;

  }

);


// CHECKOUT

document
  .getElementById(
    'checkoutBtn'
  )
  .addEventListener(
    'click',
    async () => {

      try {

        if (cart.length === 0) {

          alert(
            'Keranjang kosong'
          );

          return;

        }

        const total =
          calculateTotal();

        // sementara hardcoded
        // nanti bisa dari login/session

        const cashier_name =
          'Agun';

        const payment_method =
          'cash';

        const paid_amount =
          total;

        const change_amount =
          0;

        const payload = {

          cashier_name,

          payment_method,

          total,

          paid_amount,

          change_amount,

          status: 'paid',

          cart

        };

        console.log(
          'CHECKOUT PAYLOAD:',
          payload
        );

        const res =
          await fetch(

            '/api/transactions/add',

            {

              method: 'POST',

              headers: {

                'Content-Type':
                  'application/json'

              },

              body:
                JSON.stringify(
                  payload
                )

            }

          );

        const result =
          await res.json();

        console.log(result);

        if (!res.ok) {

          alert(

            result.error ||

            'Checkout gagal'

          );

          return;

        }

        alert(
          'Checkout berhasil'
        );

        // reset cart

        cart = [];

        renderCart();

      }

      catch(err) {

        console.error(err);

        alert(
          'Terjadi error checkout'
        );

      }

    }

  );

renderView();

renderCart();