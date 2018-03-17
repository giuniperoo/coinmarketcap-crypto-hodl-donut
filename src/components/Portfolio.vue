<template>
  <ul id='portfolio'>
    <li v-for='(coin, index) in sharedState.portfolio'>
      <portfolioItem
        :coin='coin'
        :tabIndex='sharedState.portfolio.length - index'
      />
    </li>
  </ul>
</template>

<script>
  import store from '../store'
  import PortfolioItem from '@/components/PortfolioItem'
  import { loadPortfolioFromLocalStorage } from '../actions'

  export default {
    name: 'Portfolio',
    components: {
      portfolioItem: PortfolioItem
    },
    data () {
      return { sharedState: store.state }
    },
    mounted: function () {
      loadPortfolioFromLocalStorage()
    }
  }
</script>

<style lang='scss' scoped>
  @import '../assets/third-party/css/cryptocoins-colors.scss';

  @each $coin, $color in $ccColors {
    .#{$coin} { background-color: $color; }
  }

  ul {
    width: 100%;
    margin: 0;
    padding: 0;
    z-index: 8;
    display: flex;
    position: fixed;
    flex-wrap: wrap;
    list-style: none;
    flex-direction: row-reverse;
    justify-content: flex-start;
  }
</style>
