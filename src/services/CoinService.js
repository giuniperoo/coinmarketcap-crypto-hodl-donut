import Vue from 'vue'
import store from '../store'
import VueResource from 'vue-resource'

Vue.use(VueResource)

// https://coinmarketcap.com/api/

function prepareQueryString () {
  const limit = store.state.options.apiLimit

  // default response returns 100 items
  let limitQuery = ''
  switch (limit) {
    case '500':
      limitQuery = '&limit=500'
      break
    case 'All':
      // returns > 1500 items
      limitQuery = '&limit=0'
      break
  }

  // setting currency to EUR enables response to include all three
  // (BTC, USD, EUR) as USD and BTC are included by default

  return `?convert=EUR${limitQuery}`
}

export function fetchCoinData () {
  const queryString = prepareQueryString()
  return Vue.http.get(`https://api.coinmarketcap.com/v1/ticker/${queryString}`)
}
