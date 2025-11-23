// __tests__/metrics_pips.test.js
import { computePips } from '../helpers/metrics_pips.js';

describe('computePips function', () => {
  
  test('Buy trade hits TP', () => {
    const trade = {
      priceEN: '1.1000',
      priceTP: '1.1050',
      priceSL: '1.0950',
      result: 'TP',
      type: 'Buy'
    };
    const pair = 'EURUSD';

    const { pips, vpips } = computePips(trade, pair);

    expect(pips).toBeCloseTo(0.005 * 10000); // 50 pips
    expect(vpips).toBeCloseTo(50 * 1.5);     // 75 vpips
  });

  test('Sell trade hits SL', () => {
    const trade = {
      priceEN: '1.2000',
      priceTP: '1.1900',
      priceSL: '1.2050',
      result: 'SL',
      type: 'Sell'
    };
    const pair = 'GBPUSD';

    const { pips, vpips } = computePips(trade, pair);

    expect(pips).toBeCloseTo(1.2000 - 1.2050 * 10000); // -50 pips
    expect(vpips).toBeCloseTo(-50 * 1.5);              // -75 vpips
  });

  test('JPY pair Buy TP', () => {
    const trade = {
      priceEN: '110.00',
      priceTP: '110.50',
      priceSL: '109.50',
      result: 'TP',
      type: 'Buy'
    };
    const pair = 'USDJPY';

    const { pips, vpips } = computePips(trade, pair);

    expect(pips).toBeCloseTo(0.50 * 100);  // JPY factor = 100 → 50 pips
    expect(vpips).toBeCloseTo(50 * 1);     // mul=1
  });

  test('XAUUSD pair Sell SL', () => {
    const trade = {
      priceEN: '2000.0',
      priceTP: '1995.0',
      priceSL: '2005.0',
      result: 'SL',
      type: 'Sell'
    };
    const pair = 'XAUUSD';

    const { pips, vpips } = computePips(trade, pair);

    expect(pips).toBeCloseTo(2005 - 2000 * 10); // 50 pips
    expect(vpips).toBeCloseTo(50 * 0.5);       // mul=0.5
  });

});