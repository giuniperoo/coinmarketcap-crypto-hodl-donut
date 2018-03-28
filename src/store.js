export default {
  debug: process.env.NODE_ENV !== 'production',
  state: {
    activeOption: false,
    activeSection: 'right',
    coinData: [],
    coinTransition: true,
    coins: [],
    filterInputActive: false,
    filteredValue: '',
    lastUpdate: '',
    locale: 'en-US',
    options: {
      apiLimit: '100',
      currency: 'usd',
      percentChange: '24h'
    },
    overlay: {
      active: false,
      clickThru: false
    },
    portfolio: [],
    portfolioModified: false,
    selectedCoin: null
  }
}
