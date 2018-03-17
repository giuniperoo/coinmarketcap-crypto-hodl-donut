import store from '../store'
import { locales } from '../assets/locales'
import {
  flash,
  getFullValueFromEvent,
  convertAmountStringToNumber
} from '../utils/ux'

export function validateOnSubmit (ticker, amount) {
  const amountAsNumber = convertAmountStringToNumber(amount)

  if (!ticker || isNaN(amountAsNumber)) {  // e.g. amount is '.', '3ś'
    if (store.debug) console.error(`ticker: ${ticker}, amount: ${amount}`)
    return false
  }
  return true
}

export function validate (event, type = 'amount') {
  const value = getFullValueFromEvent(event)
  const valid = _validate(value, type)

  if (!valid) flash(event)
  return valid
}

function _validate (value, type) {
  // decimal value (i.e. period, comma) is dynamic, based on locale
  const decimal = locales[store.state.locale].decimal

  const amount = (decimal === ',')
    ? /^\d*(,\d*)?$/
    : /^\d*(\.\d*)?$/

  const regexes = {
    // tests for digits with optional decimal value, e.g.
    //   * 2
    //   * 22.
    //   * 222,55
    //   * .555
    amount,

    // tests for up to 5 alphanumeric characters, e.g.
    //   * SC
    //   * Btc
    //   * EMC2
    //   * waves
    ticker: /^[a-zA-Z0-9]{0,5}$/
  }

  const re = regexes[type]

  if (!re.test(value)) {
    event.returnValue = false
    if (store.debug) console.log('validate: fail')
    return false
  }
  if (store.debug) console.log('validate: pass')
  return true
}
