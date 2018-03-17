<template>
  <aside id='coinInput'>
    <p>Coin not shown? Add it here:</p>
    <input
      id='ticker'
      ref='ticker'
      placeholder='BTC'
      @keyup.esc='blur'
      @keyup.enter='submit'
      @keypress='setTicker'
      spellcheck='false'
      :tabindex='sharedState.activeSection === "left" ? -1 : 0'
    >
    <input
      id='amount'
      v-model='amount'
      maxlength='10'
      @keyup.esc='blur'
      @keyup.enter='submit'
      @keypress='setAmount'
      autocomplete='off'
      :placeholder='placeholder'
      :tabindex='sharedState.activeSection === "left" ? -1 : 0'
    >
  </aside>
</template>

<script>
  import store from '../store'
  import autosizeInput from 'autosize-input'
  import { locales } from '../assets/locales'
  import { getFullValueFromEvent } from '../utils/ux'
  import { validate, validateOnSubmit } from '../utils/validate'
  import { updatePortfolio } from '../actions'

  export default {
    name: 'CoinInput',
    data () {
      return {
        sharedState: store.state,
        ticker: null,
        amount: null
      }
    },
    updated: function () {
      autosizeInput(this.$el.querySelector('#ticker'), { minWidth: '90px' })
      autosizeInput(this.$el.querySelector('#amount'), { minWidth: '90px' })
    },
    computed: {
      placeholder: function () {
        const decimal = locales[this.sharedState.locale].decimal
        return `2${decimal}5`
      }
    },
    methods: {
      blur: function (event) {
        event.target.blur()
      },
      setTicker: function (event) {
        const valid = validate(event, 'ticker')

        // Note: I don't see a clear way how to dynamically prevent
        // v-model from updating value when validation fails, hence
        // below explicitly keeps the input value and data in sync
        if (valid) {
          const value = getFullValueFromEvent(event).toUpperCase()
          this.ticker = value
        }
      },
      setAmount: function (event) {
        if (event.key === 'Enter') return
        validate(event, 'amount')
      },
      submit: function (event) {
        const valid = validateOnSubmit(this.ticker, this.amount)
        if (valid) {
          updatePortfolio(this.ticker, this.amount)
          this.ticker = null
          this.$refs.ticker.value = null
          this.amount = null
          event.target.blur()
        }
      }
    }
  }
</script>

<style scoped>
  aside {
    /* width: 505px; */
    right: 0;
    bottom: 10px;
    z-index: 8;
    padding: 5px;
    padding-right: 8px;
    display: flex;
    position: fixed;
    background: darkkhaki;
    border-top-left-radius: 3px;
    border-bottom-left-radius: 3px;
  }

  p {
    color: white;
    font-size: 1.4rem;
    font-style: italic;
    line-height: 2.4rem;
    margin: 0 10px 0 5px;
  }

  input {
    color: #555;
    width: 90px;
    height: 33px;
    text-align: center;
    border: 1px solid #888;
    font-size: 2.6rem;
    padding: 3px 4px 0;
  }

  input.flash {
    color: white;
    background: #555;
  }

  input::placeholder {
    color: lightgrey;
  }

  #ticker {
    border-right: none;
    text-transform: uppercase;
    border-top-left-radius: 3px;
    border-bottom-left-radius: 3px;
  }

  #amount {
    border-top-right-radius: 3px;
    border-bottom-right-radius: 3px;
  }
</style>
