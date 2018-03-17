export function flash (event) {
  event.target.classList.add('flash')

  setTimeout(function () {
    this.classList.remove('flash')
  }.bind(event.target), 100)
}

export function getFullValueFromEvent (event) {
  const key = String.fromCharCode(event.keyCode)
  return event.target.value + key
}

// user-entered amounts are strings that can contain commas as decimal values
// these need to be replaced before converting into a number
// there is probably a smarter way to do this (e.g. using d3.format)!
export function convertAmountStringToNumber (amount) {
  return +amount.replace(',', '.')
}

// remove leading and trailing zeros, e.g.
//   * 00250 => 250
//   * 0356.90 => 356.9
export function removeZeros (amount) {
  // if amount contains decimal value
  if (/[.,]/.test(amount)) {
    // ..remove leading and trailing zeros
    return amount.replace(/^0+|0+$/g, '')
  }
  // otherwise remove only leading zeros
  return amount.replace(/^0+/, '')
}
