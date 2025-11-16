// metrics.pips.js
// Compute pips for a trade and determine pip value for given pair & lotSize.

export function computePips(trade = {}, pair = '') {
  // returns signed pips (positive for profitable TP or negative for SL)
  // trade fields expected: priceEN, priceTP, priceSL, result ('TP'|'SL'), type ('Buy'|'Sell')
  const en = parseFloat(trade.priceEN);
  const tp = parseFloat(trade.priceTP);
  const sl = parseFloat(trade.priceSL);

  if (Number.isNaN(en)) return 0;

  let diff = 0;

  if (trade.result === 'TP') {
    if (trade.type === 'Buy') diff = tp - en;
    else diff = en - tp;
  } else if (trade.result === 'SL') {
    if (trade.type === 'Buy') diff = sl - en;
    else diff = en - sl;
  } else {
    // if neither TP nor SL (e.g., manual close), attempt to use priceEX if present
    const ex = parseFloat(trade.priceEX) || en;
    if (trade.type === 'Buy') diff = ex - en;
    else diff = en - ex;
  }

  // multiplier depending on instrument
  if (/JPY$/.test(String(pair))) return diff * 100; // JPY pairs: pip = 0.01 -> *100
  if (/XAUUSD$/.test(String(pair))) return diff * 10; // Gold: treat 0.1 increments -> *10
  return diff * 10000; // Majors: pip = 0.0001 -> *10000
}

export function getPipValue(pair = '', lotSize = 0.1) {
  // returns USD value per pip for the given lotSize (default 0.1)
  // Note: these are approximations suitable for P&L calculations in this system.
  // Majors: 1 pip (0.0001) for 1 lot ≈ $10; for 0.1 lot => $1. For convenience return per 0.1 lot baseline.
  const lot = Number(lotSize) || 0.1;

  if (/JPY$/.test(String(pair))) {
    // Rough approximation: 1 pip in JPY pair (0.01) for 1 standard lot ~ 1000 JPY.
    // Convert to USD by dividing by an assumed USD/JPY ~ 110 (approx). For flexibility keep formula:
    // We'll return value scaled to 'lot' units.
    // (1000 / 100) * lot -> original code intended ~0.909 for lot=0.1
    return ((1000 / 100) * lot); // units consistent with how computePips returns pips for JPY
  }

  if (/XAUUSD$/.test(String(pair))) {
    // For XAUUSD, earlier logic used 1 pip = 0.1 price movement -> approximate $1 per lot.
    // Return per 'lot' accordingly:
    return (1 * lot * 10); // keep compatibility with previous logic (scaled)
  }

  // Majors
  return 10 * lot;
}