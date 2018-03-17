export const locales = {
  // https://github.com/d3/d3-format/blob/master/locale/de-DE.json
  'de-DE': {
    decimal: ',',
    thousands: '.',
    grouping: [3],
    currency: ['', '\u00a0€']
  },
  // https://github.com/d3/d3-format/blob/master/locale/en-US.json
  'en-US': {
    decimal: '.',
    thousands: ',',
    grouping: [3],
    currency: ['$', '']
  },
  // use en-US locale, but apply bitcoin symbol and space
  'btc': {
    decimal: '.',
    thousands: ',',
    grouping: [3],
    currency: ['₿\u00a0', '']
  }
}
