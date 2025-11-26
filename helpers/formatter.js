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

export function barsToTime(bars = 0) {
  const totalHours = Math.max(0, Number(bars) || 0) * 4;
  const days = Math.floor(totalHours / 24);
  const hours = Math.round(totalHours % 24);
  if (days > 0) {
    if (hours > 3) return `${days}d, ${hours}h`;
    return `${days}d`;
  } else {
    return `${hours}h`;  
  }
  
}

export const metricsFormat = (key, type, value) => {
    let css = "";
    let txt = value;
    if (type === "float") {
      txt = num(value);
    }
    
    if (key === "winrate") {
      txt = num(value) + "%";
    }
  
    if (key.includes("Hold")) {
      txt = barsToTime(value);
    }
  
    // ========== 2. TENTUKAN METRIC RETURN (tanpa helper) ==========
    const isReturnMetric =
      key === "netReturn"   ||
      key === "medReturn"   ||
      key === "avgReturn"   ||
      key === "stdReturn"   ||
      key === "pFactor"     ||
      key === "avgRR";
  
    // ========== 3. WARNA (hanya metric return) ==========
    if (isReturnMetric) {
      css = (value > 0) ? "pos" :"neg";
    }
  
    // ========== 4. PREFIX + / - dan avgRR (khusus return metric KECUALI profit factor) ==========
    const needsPrefix = isReturnMetric && key !== "pFactor" && key !== "avgRR";
  
    if (needsPrefix && type === "float") {
      if (value > 0) txt = "+" + txt;
    }
  
    // ========== 5. RETURNNYA ADALAH OBJEK ==========
    return { txt, css };
  }
