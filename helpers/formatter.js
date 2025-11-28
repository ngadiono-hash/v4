// ~/helpers/formatter.js

const MONTHS = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
const MONTH_NAMES = Object.keys(MONTHS);

export function dateLocal(dateISO) {
  return dateISO.toLocaleDateString('id-ID', {day: 'numeric',month: 'short',year: 'numeric'});
}

export function dateDMY(dateISO) {
    const d = dateISO.getDate().toString().padStart(2, '0');
    const m = MONTH_NAMES[dateISO.getMonth()];
    const y = dateISO.getFullYear().toString().slice(2);
    return `${d}-${m}-${y}`;
  }

export function num(val = 0, decimals = 2) {
  const n = Number(val);
  return n.toLocaleString('en-us', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function barsToTime(bars = 0, barHours = 4) {
  const totalMinutes = Math.max(0, Number(bars) || 0) * barHours * 60;

  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = Math.round(totalMinutes % 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 && days === 0) parts.push(`${minutes}m`);

  return parts.join(",");
}

export function msToTime(ms = 0) {
  const totalMinutes = Math.max(0, Number(ms) || 0) / 60000;

  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = Math.round(totalMinutes % 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 && days === 0) parts.push(`${minutes}m`);

  return parts.join(",");
}

export function toTitle(str) {
  if (!str) return "";
  // 1. Ubah snake_case ke spasi
  let s = str.replace(/_/g, " ");
  // 2. Pisahkan camelCase → camel Case
  s = s.replace(/([a-z])([A-Z])/g, "$1 $2");
  // 3. Pisahkan huruf kapital beruntun → misalnya "maxDD" → "max DD"
  s = s.replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2");
  // 4. Split per kata
  return s
    .split(/\s+/)
    .map(word => {
      // Biarkan ALL CAPS tetap ALL CAPS
      if (/^[A-Z]+$/.test(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

export function metricFormat(value, type = "float", extra = "") {
  let txt = "";
  let css = "";

  switch (type) {

    case "%":
      txt = num(value) + "%";
      break;

    case "1:":
      txt = `1:${num(value)}`;
      break;

    case "R":
      txt = num(value);
      if (value > 0) txt = "+" + txt;
      css = value > 0 ? "pos" : value < 0 ? "neg" : "";
      break;

    case "time":  // bars -> waktu
      txt = barsToTime(value);
      break;
      
    case "ms":  // ms -> waktu
      txt = msToTime(value);
      break;

    case "int":
      txt = String(Math.round(value));
      break;

    case "unit":
      txt = `${num(value)} ${unit}`.trim();
      break;

    case "float":
    default:
      txt = num(value); 
  }

  return { txt, css };
}