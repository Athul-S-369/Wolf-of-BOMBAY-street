'use strict'

const NSE_SYMBOLS = [
  'RELIANCE', 'JIOFIN', 'NETWORK18', 'HATHWAY', 'DEN', 'GTPL', 'RIIL',
  'TCS', 'TMPV', 'TMCV', 'TATASTEEL', 'TITAN', 'TATACONSUM', 'TATAPOWER',
  'TATACOMM', 'TATAELXSI', 'TATACHEM', 'INDHOTEL', 'VOLTAS', 'TATATECH',
  'TRENT', 'TATAINVEST',
  'ADANIENT', 'ADANIPORTS', 'ADANIGREEN', 'ATGL', 'ADANIPOWER', 'AWL', 'NDTV',
  'HDFCBANK', 'HDFCLIFE', 'HDFCAMC', 'ICICIBANK', 'SBIN', 'AXISBANK',
  'KOTAKBANK', 'INDUSINDBK', 'BANDHANBNK',
  'BAJFINANCE', 'BAJAJFINSV', 'BAJAJ-AUTO', 'BAJAJHLDNG',
  'INFY', 'WIPRO', 'HCLTECH', 'TECHM',
  'MARUTI', 'M&M',
  'SUNPHARMA', 'DRREDDY',
  'ONGC', 'NTPC', 'POWERGRID', 'COALINDIA',
  'JSWSTEEL', 'LT',
  'BHARTIARTL', 'IDEA',
  'ITC', 'HINDUNILVR', 'NESTLEIND', 'BRITANNIA',
  'ASIANPAINT', 'PIDILITIND',
  'ULTRACEMCO', 'GRASIM', 'HINDALCO', 'ABCAPITAL',
  'JUSTDIAL', 'NYKAA', 'ETERNAL', 'PAYTM', 'DMART',
]

const YAHOO_OVERRIDE = {
  'M&M': 'M%26M.NS',
}

function toYahoo(sym) {
  return YAHOO_OVERRIDE[sym] || `${sym}.NS`
}

function fromYahoo(ySymbol) {
  for (const [nse, yfSym] of Object.entries(YAHOO_OVERRIDE)) {
    if (ySymbol === yfSym || ySymbol.replace('%26', '&').replace('.NS', '') === nse) return nse
  }
  return ySymbol.replace('.NS', '')
}

module.exports = { NSE_SYMBOLS, YAHOO_OVERRIDE, toYahoo, fromYahoo }
