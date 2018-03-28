<template>
  <section>
    <ul :class='["coins", sharedState.coinTransition ? "" : "no-transition"]'>
      <li v-for='coin in sharedState.coins' :class='{ active: sharedState.selectedCoin === coin.ticker }'>
        <coin :ticker='coin.ticker' />
      </li>
    </ul>
    <coinInput />
    <filterInput />
  </section>
</template>

<script>
  import Coin from './Coin'
  import store from '../store'
  import { loadCoins } from '../actions'
  import CoinInput from './CoinInput'
  import FilterInput from './FilterInput'

  export default {
    name: 'Coins',
    components: {
      coin: Coin,
      coinInput: CoinInput,
      filterInput: FilterInput
    },
    data () {
      return { sharedState: store.state }
    },
    mounted: function () {
      loadCoins()
    }
  }
</script>

<style>
  .coins .active i {
    filter: grayscale(0);
    transform: scale(1.2);
  }

  .no-transition .cc {
    transition: none !important;
  }
</style>

<style scoped>
  section {
    width: 50%;
    flex-grow: 1;
    overflow: scroll;
  }

  li {
    display: inline-block;
    position: relative;
  }

  .active { z-index: 9; }

  .coins {
    margin: 0;
    padding: 50px 50px 80px;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }
</style>
