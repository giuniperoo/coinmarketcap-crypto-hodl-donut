<template>
  <aside id='updater' @click='updateCoinData'>

    <span v-if='sharedState.lastUpdate'>
      Last updated {{ sharedState.lastUpdate }}
    </span>
    <span v-else>
      Refresh
    </span>
    <span class='updateIcon' v-html='updateIcon' :class='{ spin: isUpdating }'></span>
  </aside>
</template>

<script>
  import store from '../store'
  import updateIcon from '../assets/spinner.svg'
  import { fetchCoinData } from '../services/CoinService'
  import {
    storeCoinData,
    recordLastUpdate,
    updatePortfolioWithCoinData,
    loadLastUpdateFromLocalStorage
  } from '../actions'

  export default {
    name: 'Updater',
    data () {
      return {
        sharedState: store.state,
        isUpdating: false,
        updateIcon
      }
    },
    mounted: function () {
      document.addEventListener('keyup', this.toggleView)
      loadLastUpdateFromLocalStorage()
    },
    methods: {
      updateCoinData (event) {
        this.isUpdating = true
        fetchCoinData().then(response => {
          this.isUpdating = false
          recordLastUpdate()
          storeCoinData(response.data)
          updatePortfolioWithCoinData()
        }, response => {
          this.isUpdating = false
          console.error('Unable to fetch coin data', response)
        })
      }
    }
  }
</script>

<style lang='scss'>
  .updateIcon {
    &.spin > svg {
      animation-name: spin;
      animation-duration: 1.5s;
      animation-timing-function: linear;
      animation-iteration-count: infinite;
    }

    > svg {
      top: 8px;
      margin: 5px;
      position: relative;
    }
  }

  @keyframes spin {
    0%   { transform: rotate(0deg);   }
    100% { transform: rotate(360deg); }
  }
</style>

<style scoped>
  aside {
    left: 50%;
    bottom: 30px;
    height: 50px;
    margin: 10px;
    cursor: pointer;
    position: absolute;
    transform: translateX(-50%);
  }
</style>
