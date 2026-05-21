import { fsm }
from './fsm.js';

import { createKeypad }
from './keypad.js';

let cart = [];
let editingIndex = null;
let currentItem = null;
const priceView =
  document.getElementById(
    'view-price'
  );
  const priceInput =
  document.getElementById(
    'priceInput'
  );
  
document
  .getElementById(
    'noIdBtn'
  )
  .addEventListener(
    'click',
    () => {

      currentItem = {

  manual: true,

  id: 0,

  barcode: 'MANUAL',

  name: 'Manual Item'

};

      fsm.send(
        'NO_ID'
      );

      renderView();

    }
  );
function submitPrice() {

  const price =
    parseFloat(
      priceInput.value
    );

  if (!price || price <= 0) {

    alert(
      'Harga tidak valid'
    );

    return;

  }

  currentItem.price =
    price;

  fsm.send(
    'NEXT'
  );

  renderView();

}

createKeypad(

  document.getElementById(
    'priceKeypad'
  ),

  key => {

    if (key === 'C') {

      priceInput.value = '';

      return;

    }

    if (key === 'OK') {

      submitPrice();

      return;

    }

    priceInput.value += key;

  }

);

priceInput.addEventListener(
  'click',
  submitPrice
);



const itemInput =
  document.getElementById(
    'itemInput'
  );
  
itemInput.addEventListener(
  'click',
  submitItem
);

async function submitItem() {

  const id =
    itemInput.value;

  if (!id) {

    return;

  }

  const item =
    await getItem(id);

  if (!item) {

    alert(
      'Barang tidak ditemukan'
    );

    return;

  }

  // UPDATE VARIABLE SAJA

  currentItem = item;

  // PINDAH VIEW FSM

  fsm.send(
    'NEXT'
  );

  renderView();

}

const qtyInput =
  document.getElementById(
    'qtyInput'
  );
qtyInput.addEventListener(
  'click',
  submitQty
);

function submitQty() {

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
priceInput.value = '';
  qtyInput.value = '';

  currentItem = null;

  fsm.send('ADD');

  renderView();

}

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
    priceView.classList.toggle(
  'hidden',
  fsm.state !== 'inputPrice'
);

}

function renderCart() {

  const body =
    document.getElementById(
      'cartBody'
    );

  body.innerHTML = '';

  let total = 0;

  cart.forEach(

    (item, index) => {

      const subtotal =
        item.qty * item.price;

      total += subtotal;

      body.innerHTML += `

        <tr>

          <td>
            ${item.id}
          </td>

      <td>
  ${item.name} @ ${item.price}
</td>

          <td>

            <button

              class="qty-btn"

              data-index="${index}"

            >

              ${item.qty}

            </button>

          </td>

          <td>
            ${subtotal}
          </td>

        </tr>

      `;

    }

  );

  document
    .getElementById(
      'totalAmount'
    )
    .textContent = total;

  setupQtyEditor();

}

function setupQtyEditor() {

document
  .querySelectorAll(
    '.qty-btn'
  )
  .forEach(btn => {

    btn.addEventListener(
      'click',
      () => {

        editingIndex =
          parseInt(
            btn.dataset.index
          );

        const item =
          cart[editingIndex];

        document
          .getElementById(
            'modalQtyInput'
          )
          .value = item.qty;

        document
          .getElementById(
            'qtyModal'
          )
          .classList
          .remove(
            'hidden'
          );

        const qtyInput =
          document.getElementById(
            'modalQtyInput'
          );

        qtyInput.focus();

        qtyInput.select();

      }
    );

  });

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

  submitQty();

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
document
  .getElementById(
    'saveQtyBtn'
  )
  .addEventListener(
    'click',
    () => {

      const qty =
        parseInt(

          document
            .getElementById(
              'modalQtyInput'
            )
            .value

        );

      if (
        !qty ||
        qty <= 0
      ) {

        alert(
          'Qty tidak valid'
        );

        return;

      }

      cart[editingIndex].qty =
        qty;

      closeQtyModal();

      renderCart();

    }
  );

document
  .getElementById(
    'deleteQtyBtn'
  )
  .addEventListener(
    'click',
    () => {

      const confirmDelete =
        confirm(
          'Hapus item ini?'
        );

      if (!confirmDelete) {

        return;

      }

      cart.splice(
        editingIndex,
        1
      );

      closeQtyModal();

      renderCart();

    }
  );

document
  .getElementById(
    'cancelQtyBtn'
  )
  .addEventListener(
    'click',
    closeQtyModal
  );

function closeQtyModal() {

  document
    .getElementById(
      'qtyModal'
    )
    .classList
    .add(
      'hidden'
    );

  editingIndex = null;

}
renderView();

renderCart();