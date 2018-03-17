<template>
  <input
    @keyup='filter'
    v-model='sharedState.filteredValue'
    :class='{active: sharedState.filterInputActive}'
    spellcheck='false'>
</template>

<script>
  import store from '../store'
  import coins from '../assets/coins.json'
  import {
    filterCoins,
    toggleOverlay,
    toggleFilterInput,
    clearFilterInput,
    toggleCoinTransition
  } from '../actions'

  export default {
    name: 'FilterInput',
    data () {
      return { sharedState: store.state }
    },
    mounted: function () {
      document.addEventListener('keyup', this.toggle)
    },
    updated: function () {
      if (this.sharedState.filterInputActive) {
        this.$el.focus()
        document.addEventListener('click', this.handleClick)
      } else {
        document.removeEventListener('click', this.handleClick)
      }
    },
    beforeDestroy: function () {
      document.removeEventListener('keyup', this.toggle)
    },
    methods: {
      filter () {
        const value = this.sharedState.filteredValue.toUpperCase()
        const filtered = coins.filter(coin => {
          return coin.name.toUpperCase().startsWith(value) ||
                 coin.ticker.startsWith(value)
        })

        toggleCoinTransition(false)
        filterCoins(filtered)
        setTimeout(() => toggleCoinTransition(true), 0)
      },
      toggle (event) {
        const keyAliases = {
          FILTER: 70,
          ESCAPE: 27
        }

        if (event.keyCode === keyAliases.FILTER &&
            this.sharedState.filterInputActive === false &&
            this.sharedState.activeOption === false &&
            this.sharedState.selectedCoin === null &&
            this.sharedState.activeSection === 'right' &&
            !event.target.matches('input')) {
          this.show()
        } else if (event.keyCode === keyAliases.ESCAPE &&
                   this.sharedState.filterInputActive === true) {
          this.hide()
        }
      },
      show () {
        toggleFilterInput(true)
        toggleOverlay(true, true)
      },
      hide () {
        if (this.sharedState.filterInputActive) {
          clearFilterInput()
          toggleFilterInput(false)
          toggleOverlay(false)
        }
      },
      handleClick (event) {
        if (!event.target.matches('input.active')) this.hide()
      }
    }
  }
</script>

<style lang='scss' scoped>
  input {
    display: none;
    top: 200px;
    left: 50%;
    color: #555;
    width: 350px;
    height: 60px;
    border: 1px solid #888;
    z-index: 10;
    padding: 3px 3px 0;
    position: fixed;
    font-size: 4.8rem;
    transform: translateX(-50%);
    text-align: center;
    font-weight: 300;
    border-radius: 3px;
    text-transform: uppercase;

    &.active { display: block; }
  }
</style>
