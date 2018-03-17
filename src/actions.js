import Vue from 'vue'
import * as d3 from 'd3'
import moment from 'moment'
import store from './store'
import coins from './assets/coins.json'
import { locales } from './assets/locales'
import { convertAmountStringToNumber } from './utils/ux'

export function clearFilterInput () {
  if (store.debug) console.log('clearFilterInput triggered')
  store.state.filteredValue = ''
  loadCoins()
}

export function clearSelectedCoin () {
  if (store.debug) console.log('clearSelectedCoin triggered')
  store.state.selectedCoin = null
}

export function filterCoins (filteredCoins) {
  if (store.debug) console.log('filterCoins triggered with', filteredCoins)
  store.state.coins = filteredCoins
}

export function loadCoins () {
  if (store.debug) console.log('loadCoins triggered')
  store.state.coins = coins
}

export function loadLastUpdateFromLocalStorage () {
  if (store.debug) console.log('loadLastUpdateFromLocalStorage triggered')

  const lastUpdate = Vue.ls.get('lastUpdate')
  if (lastUpdate) {
    if (store.debug) console.log('lastUpdate', lastUpdate)
    store.state.lastUpdate = lastUpdate
  }
}

export function loadOptionsFromLocalStorage () {
  if (store.debug) console.log('loadOptionsFromLocalStorage triggered')

  const options = Vue.ls.get('options')
  if (options) {
    if (store.debug) console.log('options', options)
    store.state.options = options
  }
}

export function loadPortfolioFromLocalStorage () {
  if (store.debug) console.log('loadPortfolioFromLocalStorage triggered')

  const portfolio = Vue.ls.get('portfolio')
  if (portfolio) {
    if (store.debug) console.log('portfolio', portfolio)
    store.state.portfolio = portfolio
  }
}

export function recordLastUpdate () {
  const timestamp = moment().format('MMMM Do, h:mm:ss a')
  if (store.debug) console.log('recordLastUpdate triggered', timestamp)
  store.state.lastUpdate = timestamp

  // update local storage
  Vue.ls.set('lastUpdate', store.state.lastUpdate)
}

export function setActiveSection (section) {
  if (store.debug) console.log('setActiveSection triggered with', section)
  store.state.activeSection = section
}

export function setLocale () {
  // locale is determined by selected currency
  let locale
  switch (store.state.options.currency) {
    case 'eur':
      locale = 'de-DE'
      break
    case 'btc':
      locale = 'btc'
      break
    default:
      locale = 'en-US'
  }

  store.state.locale = locale
  d3.formatDefaultLocale(locales[locale])

  if (store.debug) console.log('setLocale triggered; new locale:', locale)
}

export function setOptionType (type) {
  if (store.debug) console.log('setOptionType triggered with', type)

  const activeOption = store.state.activeOption
  const options = store.state.options

  Vue.set(options, activeOption, type)
  Vue.ls.set('options', options)

  // Note: the below is duplicated in OptionInput
  // where v-model is being used for data binding
  switch (activeOption) {
    case 'currency':
      setLocale()
      updatePortfolioWithCoinData()
      break
    case 'percentChange':
      updatePortfolioWithCoinData()
  }
}

export function setSelectedCoin (newValue) {
  if (store.debug) console.log('setSelectedCoin triggered with', newValue)
  if (store.state.filterInputActive) toggleFilterInput(false)
  store.state.selectedCoin = newValue
}

export function storeCoinData (response) {
  if (store.debug) console.log('storeCoinData triggered')
  store.state.coinData = response

  // update local storage
  Vue.ls.set('coinData', store.state.coinData)
}

export function toggleCoinTransition (toggle) {
  if (store.debug) console.log('toggleCoinTransition triggered with', toggle)
  store.state.coinTransition = toggle
}

export function toggleFilterInput (toggle) {
  if (store.debug) console.log('toggleFilterInput triggered with', toggle)
  store.state.filterInputActive = toggle
}

export function toggleOptions (toggle) {
  if (store.debug) console.log('toggleOptions triggered with', toggle)
  store.state.activeOption = toggle
}

export function toggleOverlay (toggle, clickThru = false) {
  if (store.debug) console.log('toggleOverlay triggered with', `${toggle} ${clickThru}`)
  store.state.overlay = { active: toggle, clickThru }
}

export function updatePortfolio (ticker, amount) {
  if (store.debug) console.log('updatePortfolio triggered with', `${ticker} ${amount}`)

  const index = store.state.portfolio.findIndex((coin) => {
    return coin.ticker === ticker
  })

  // if coin is already in portfolio, remove it if
  // entered value is equivalent to or less than 0
  if (Number(amount) <= 0) {
    if (index > -1) {
      Vue.delete(store.state.portfolio, index)
      if (store.debug) console.log('removed coin from portfolio')
    }
  } else {
    if (index > -1) {
      const coin = store.state.portfolio[index]
      Vue.set(coin, 'amount', amount)
      if (store.debug) console.log('updated coin in portfolio', coin)
    } else {
      store.state.portfolio.push({
        ticker: ticker,
        amount: amount
      })
      if (store.debug) console.log('added coin to portfolio')
    }
  }

  // update local storage
  Vue.ls.set('portfolio', store.state.portfolio)

  store.state.portfolioModified = true
}

export function updatePortfolioWithCoinData () {
  if (store.debug) console.log('updatePortfolioWithCoinData triggered')

  const options = store.state.options
  store.state.portfolio.forEach((portfolioCoin) => {
    const coin = store.state.coinData.find((c) => {
      return c.symbol === portfolioCoin.ticker
    })

    if (coin) {
      const amount = convertAmountStringToNumber(portfolioCoin.amount)

      Vue.set(portfolioCoin, 'id', coin.id)
      Vue.set(portfolioCoin, 'name', coin.name)
      Vue.set(portfolioCoin, 'price', coin[`price_${options.currency}`])
      Vue.set(portfolioCoin, 'value', amount * +portfolioCoin.price)
      Vue.set(portfolioCoin, 'percentChange', coin[`percent_change_${options.percentChange}`])
    } else {
      Vue.set(portfolioCoin, 'price', '')
      Vue.set(portfolioCoin, 'value', '')
      Vue.set(portfolioCoin, 'percentChange', '')
    }
  })

  // update local storage
  Vue.ls.set('portfolio', store.state.portfolio)

  store.state.portfolioModified = false
}
