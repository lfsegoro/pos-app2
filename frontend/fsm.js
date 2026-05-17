export const fsm = {

  state: 'inputItem',

  transitions: {

    inputItem: {

      NEXT: 'inputQty'

    },

    inputQty: {

      ADD: 'inputItem'

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