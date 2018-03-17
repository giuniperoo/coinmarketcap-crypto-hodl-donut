<template>
  <div :class='["ticker", coin.ticker]'>
    <input
      class='amount'
      maxlength='10'
      :value='localizedAmount'
      :tabIndex='tabIndex'
      @blur='submit'
      @keyup.esc='blur'
      @keyup.enter='submit'
      @keypress='validate'
    >{{ coin.ticker }}
  </div>
</template>

<script>
  import store from '../store'
  import autosizeInput from 'autosize-input'
  import { locales } from '../assets/locales'
  import { removeZeros } from '../utils/ux'
  import { validate, validateOnSubmit } from '../utils/validate'
  import { updatePortfolio, updatePortfolioWithCoinData } from '../actions'

  export default {
    name: 'PortfolioItem',
    props: ['coin', 'tabIndex'],
    data () {
      return { sharedState: store.state }
    },
    mounted: function () {
      const input = this.$el.querySelector('input')
      autosizeInput(input)
    },
    updated: function () {
      const input = this.$el.querySelector('input')
      autosizeInput(input)
    },
    computed: {
      localizedAmount: function () {
        const decimal = locales[this.sharedState.locale].decimal
        return this.coin.amount.replace(/[.,]/, decimal)
      }
    },
    methods: {
      blur: function (event) {
        event.target.blur()
      },
      validate: function (event) {
        if (event.key === 'Enter') return
        validate(event)
      },
      submit: function (event) {
        let amount = event.target.value
        if (amount !== '') {
          amount = removeZeros(amount)
          event.target.value = amount
          autosizeInput(this.$el.querySelector('input'))
        }

        const ticker = this.coin.ticker
        const valid = validateOnSubmit(ticker, amount)

        if (valid) {
          updatePortfolio(ticker, amount)
          updatePortfolioWithCoinData()
          this.blur(event)
        }
      }
    }
  }
</script>

<style lang='scss' scoped>
  div { background: #888; }

  .ticker {
    color: white;
    height: 17px;
    padding: 1px 5px 7px 0;
    font-weight: 500;
  }

  .amount {
    height: 21px;
    margin: 1px 6px 0 2px;
    padding: 0 10px;

    // overrides for input
    border: none;
    font-size: inherit;
    font-weight: inherit;
    font-family: inherit;
  }
</style>
