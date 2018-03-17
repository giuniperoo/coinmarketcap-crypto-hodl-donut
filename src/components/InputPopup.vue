<template>
  <div class='inputContainer'>
    <input
      maxlength='10'
      :value='localizedAmount'
      @blur='hide'
      @keyup.enter='submit'
      @keyup.esc='hide'
      @keypress='validate'
    >
  </div>
</template>

<script>
  import store from '../store'
  import { locales } from '../assets/locales'
  import { removeZeros } from '../utils/ux'
  import { validate, validateOnSubmit } from '../utils/validate'
  import {
    toggleOverlay,
    updatePortfolio,
    clearFilterInput,
    clearSelectedCoin
  } from '../actions'

  export default {
    name: 'InputPopup',
    props: ['ticker'],
    data () {
      return { sharedState: store.state }
    },
    mounted: function () {
      this.$el.getElementsByTagName('input')[0].focus()
      document.addEventListener('click', this.hide)
    },
    beforeDestroy: function () {
      document.removeEventListener('click', this.hide)
    },
    computed: {
      localizedAmount: function () {
        const coin = this.sharedState.portfolio.find(coin => coin.ticker === this.ticker)

        if (coin) {
          const decimal = locales[this.sharedState.locale].decimal
          return coin.amount.replace(/[.,]/, decimal)
        }
      }
    },
    methods: {
      validate: function (event) {
        if (event.key === 'Enter') return
        validate(event)
      },
      submit: function (event) {
        const ticker = this.sharedState.selectedCoin
        const amount = removeZeros(event.target.value)
        const valid = validateOnSubmit(ticker, amount)

        if (valid) {
          updatePortfolio(ticker, amount)
          this._resetDisplay()
        }
      },
      hide (event) {
        const activeElement = this.$parent.$el
        if (!activeElement.contains(event.target) ||
            event.key === 'Escape' ||
            event.type === 'blur') {
          this._resetDisplay()
        }
      },
      _resetDisplay () {
        clearSelectedCoin()
        toggleOverlay(false)
        if (this.sharedState.filteredValue) clearFilterInput()
      }
    }
  }
</script>

<style lang='scss' scoped>
  .inputContainer {
    left: calc(50% - 4px);
    width: 250px;
    position: absolute;
    transform: translateX(-50%);

    &:before {
      content: '';
      top: -10px;
      left: calc(50% - 6px);
      position: absolute;
      border-left: 10px solid transparent;
      border-right: 10px solid transparent;
      border-bottom: 10px solid #888;
    }
  }

  input {
    color: #555;
    width: 100%;
    height: 50px;
    font-size: 4rem;
    border: 1px solid #888;
    padding: 3px 3px 0;
    position: absolute;
    text-align: center;
    border-radius: 3px;
  }
</style>
