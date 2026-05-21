export const fsm = {

  state: 'inputItem',

  transitions: {

    // =================
    // INPUT ITEM NORMAL
    // =================

    inputItem: {

      NEXT: 'inputQty',

      NO_ID: 'inputPrice'

    },

    // =================
    // INPUT HARGA MANUAL
    // =================

    inputPrice: {

      NEXT: 'inputQty',

      CANCEL: 'inputItem'

    },

    // =================
    // INPUT QUANTITY
    // =================

    inputQty: {

      ADD: 'inputItem',

      CANCEL: 'inputItem'

    }

  },

  send(event) {

    const next =

      this.transitions
      [this.state]
      [event];

    if (next) {

      this.state = next;

    }

  }

};