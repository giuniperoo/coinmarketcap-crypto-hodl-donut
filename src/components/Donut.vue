<template>
  <section>
    <div id='chart'></div>
    <updater />
  </section>
</template>

<script>
  import Vue from 'vue'
  import * as d3 from 'd3'
  import store from '../store'
  import filter from 'lodash.filter'
  import coins from '../assets/coins.json'
  import Updater from '@/components/Updater'
  import donutChart from '../assets/third-party/js/donutChart'
  import { fetchCoinData } from '../services/CoinService'
  import {
    storeCoinData,
    recordLastUpdate,
    updatePortfolioWithCoinData
  } from '../actions'

  export default {
    name: 'Donut',
    components: {
      updater: Updater
    },
    data () {
      return { sharedState: store.state }
    },
    methods: {
      initializeDonut: function () {
        const defaultColor = '#888'
        const getOptions = () => this.sharedState.options

        // gets a "sanitized" version of the portfolio, i.e.
        // remove all coins from portfolio which do not have a value set
        // (can occur if user enters a ticker value not recognized by api)
        const getSanitizedPortfolio = () => {
          return filter(this.sharedState.portfolio, coin => !!coin.value)
        }

        this.donut = donutChart()
          .width(850)
          .height(520)
          .transTime(500)
          .cornerRadius(3)
          .colour(ticker => {
            const coin = coins.find(coin => coin.ticker === ticker)
            return coin ? coin.color : defaultColor
          })
          .padAngle(0.01)
          .variable('value')
          .category('ticker')
          .getOptions(getOptions)
          .toolTipHTML((data) => {
            let arrow
            (data.data.percentChange.charAt(0) === '-')
              ? arrow = '&#x2B07;'
              : arrow = '&#x2B06;'

            const currencyFormat = getOptions().currency === 'btc' ? '$,.5f' : '$,.2f'
            const coin = store.state.coinData.find(coin => coin.symbol === data.data.ticker)
            const coinName = (coin && coin.name) || ''

            return (
              `<i class="cc ${data.data.ticker}"></i>
               <p class='name'>${coinName}</p>
               <p class='price'>${d3.format(currencyFormat)(data.data.price)}</p>
               <span class='arrow'>${arrow}</span>
               <span class='percentChange'>
                 ${d3.format('.2f')(data.data.percentChange)}% (${getOptions().percentChange})
               </span>`
            )
          })
          .defaultCenterInfo(() => {
            const total = d3.sum(getSanitizedPortfolio(), coin => coin.value)
            const currencyFormat = getOptions().currency === 'btc' ? '$,.5f' : '$,.2f'

            let totalPercentChange = getSanitizedPortfolio().reduce((accumulator, coin) => {
              const percentage = coin.value / total
              return accumulator + Number(coin.percentChange) * percentage
            }, 0)
            totalPercentChange = d3.format('.2f')(totalPercentChange)

            let arrow
            (totalPercentChange.charAt(0) === '-')
              ? arrow = '&#x2B07;'
              : arrow = '&#x2B06;'

            return (
              `<div>
                 <p class='totalValue'>${d3.format(currencyFormat)(total)}</p>
                 <span class='arrow'>${arrow}</span>
                 <span class='percentChange'>
                   ${totalPercentChange}% (${getOptions().percentChange})
                 </span>
               </div>`
            )
          })
          .handleSliceClick((data) => {
            const url = 'https://coinmarketcap.com/currencies/'
            window.open(`${url}${data.data.id}`, '_blank')
          })

        d3.select('#chart')
          .data(getSanitizedPortfolio())
          .call(this.donut)
      }
    },
    watch: {
      'sharedState.activeSection': function () {
        if (this.sharedState.activeSection === 'left') {
          if (!this.sharedState.coinData.length) {
            fetchCoinData().then(response => {
              storeCoinData(response.data)
              updatePortfolioWithCoinData()
              recordLastUpdate()
            }, response => {
              console.error('Unable to fetch coin data', response)
              const coinData = Vue.ls.get('coinData')

              if (coinData) {
                storeCoinData(coinData)
                updatePortfolioWithCoinData()
                this.donut
                  .data(this.sharedState.portfolio)
                  .updateCenterInfo()
              }
            })
          } else {
            if (this.sharedState.portfolioModified) {
              updatePortfolioWithCoinData()
            }
          }
        }
      },
      'sharedState.lastUpdate': {
        handler () {
          if (!this.donut) this.initializeDonut()
          this.donut
            .data(this.sharedState.portfolio)
            .updateCenterInfo()
        }
      },
      'sharedState.portfolio': {
        handler () {
          if (!this.donut) return
          this.donut
            .data(this.sharedState.portfolio)
            .updateCenterInfo()
        },
        deep: true
      }
    }
  }
</script>

<style lang='scss'>
  #chart {
    .labelName {
      font-size: 0.9em;
      font-style: italic;

      text { cursor: pointer; }

      tspan {
        font-style: normal;
        font-weight: 700;
      }
    }

    .lines { pointer-events: none; }

    polyline {
      fill: none;
      stroke-width: 2px;
    }

    path { cursor: pointer; }

    foreignObject {
      transform: translateX(-100px) translateY(-100px);

      > div {
        width: 200px;
        text-align: center;
      }

      .cc {
        height: 56px;
        display: block;
        font-size: 3em;
      }

      .name {
        margin-top: 6px;
        font-weight: 500;
      }

      .price {
        margin: 23px 0;
        font-weight: 700;
      }

      .totalValue {
        margin: 75px 0 41px;
        font-size: 25px;
      }

      .arrow {
        display: inline-block;
        font-size: 2em;
      }

      .percentChange {
        margin: 8px 0px;
        vertical-align: top;
        display: inline-block;
      }
    }
  }
</style>

<style scoped>
  section {
    width: 50%;
    position: relative;
  }

  #chart {
    height: 100%;
    flex-grow: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
