const vue = new Vue({
  el: '#app',
  data: {
    procent: 0.04,
    price: 1,
    btcWallet: '1KnGh4Wo5MEfxveQV72a2G2BimTSm11mpM',
    ethWallet: '0x887f054DFf781dc624633ee3370d70cD143Eb450',
    currencies: [
      {
        name: 'BTC',
        type: 'crypto',
        decimals: 8,
      },
      {
        name: 'ETH',
        type: 'crypto',
        decimals: 8,
      },
      {
        name: 'USD',
        type: 'fiat',
        decimals: 2,
      },
      {
        name: 'EUR',
        type: 'fiat',
        decimals: 2,
      },
    ],
    nominal: {
      amount: '0',
      currency: null,
    },
    limit: {
      amount: '100',
      currency: null,
    }
  },
  methods: {
    getLastPrice: async function(callback) {
      const url = `https://min-api.cryptocompare.com/data/price?fsym=${this.nominal.currency.name}&tsyms=${this.limit.currency.name}`;

      const price = await fetch(url, { mode:'cors' }).then(r => r.json()).then(r => r[this.limit.currency.name]);

      this.price = Big(price).times(1 + this.procent).round(this.limit.currency.decimals).toString();

      if (callback) callback();
    },
    validateAmount: function(field) {
        if (isNaN(field.amount)) {
          return field.amount = '';
        }
        if (
          field.amount.indexOf('.') > -1 && 
          field.amount.split('.')[1].length > field.currency.decimals
        ) {
          return field.amount = Big(field.amount).round(field.currency.decimals).toString();
        }
    },
    onNominalInput: function() {
      this.validateAmount(this.nominal)
      if (this.nominal.amount === '0' || this.nominal.amount === '') {
        return this.limit.amount = '0';
      }

      // Counting another field
      Big.RM = 3;
      const result = Big(this.nominal.amount).times(this.price).round(this.limit.currency.decimals).toString();
      this.limit.amount = result;
      Big.RM = 0;
      // End counting
     
    },
    onLimitInput: function() {
      this.validateAmount(this.limit)
      if (this.limit.amount === '0' || this.limit.amount === '') {
        return this.nominal.amount = '0';
      }
      // Counting another field
      Big.RM = 0;
      const result = Big(this.limit.amount).div(this.price).round(this.nominal.currency.decimals).toString();
      this.nominal.amount = result;
      // End counting
      
    },
    getCurrency: function(name) {
      return this.currencies.find(currency => currency.name === name);
    }
  },
  created: function() {
    // set nominal and limit
    this.nominal.currency = this.getCurrency('BTC');
    this.limit.currency = this.getCurrency('USD');
    // get last Price
    this.getLastPrice(this.onLimitInput);
  }
})

