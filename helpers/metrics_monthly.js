// /helpers/metrics_monthly.js
// Group trades by month and calculate monthly statistics.

import { standardDeviation } from './metrics_utils.js';

export function groupByMonth(trades = []) {
  // trades should have dateEN as a Date object
  const map = {};
  trades.forEach(t => {
    const dt = t.dateEN instanceof Date ? t.dateEN : new Date(t.dateEN);
    const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
    if (!map[key]) map[key] = [];
    map[key].push(t);
  });
  return map;
}

export function calculateMonthlyStats(monthlyGroups = {}) {
  const groups = Object.values(monthlyGroups || {});
  const netsPips = groups.map(g => g.reduce((s, t) => s + (Number(t.pipsSigned) || 0), 0));
  const netsDollar = groups.map(g => g.reduce((s, t) => s + (Number(t.profitDollarSigned) || 0), 0));

  if (netsPips.length === 0) {
    return {
      minPips: 0,
      maxPips: 0,
      avgPips: 0,
      minDollar: 0,
      maxDollar: 0,
      avgDollar: 0,
      stability: 0
    };
  }

  const avgPips = netsPips.reduce((a, b) => a + b, 0) / netsPips.length;
  const avgDollar = netsDollar.reduce((a, b) => a + b, 0) / netsDollar.length;

  const stab = avgPips === 0 ? 0 : (standardDeviation(netsPips) / Math.abs(avgPips)) * 100;

  return {
    minPips: Math.min(...netsPips),
    maxPips: Math.max(...netsPips),
    avgPips,
    minDollar: Math.min(...netsDollar),
    maxDollar: Math.max(...netsDollar),
    avgDollar,
    stability: Number(stab.toFixed(2))
  };
}

export function aggregateMonthlyPips(trades) {
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const map = {};

  for (const t of trades) {
    const d = t.dateEX;
    if (!d || !(d instanceof Date)) continue;

    const year = d.getFullYear();
    const month = MONTHS[d.getMonth()];
    const pips = Number(t.pipsSigned) || 0;

    if (!map[year]) {
      map[year] = {};
      MONTHS.forEach(m => map[year][m] = null); // null → belum ada data
      map[year].YTD = 0;
    }

    map[year][month] = (map[year][month] || 0) + pips;
    map[year].YTD += pips;
  }

  return map;
}