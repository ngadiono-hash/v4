// metrics.time.js
// Date parsing, estimate bars held and convert bars to human time.

const MONTHS = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
};

export function parseDate(dateStr, defaultHour = '12:00') {
  // Accept either Date object or "DD-MMM-YY" format like "23-Feb-22"
  if (!dateStr) return null;
  if (dateStr instanceof Date) return dateStr;
  const parts = String(dateStr).split('-').map(p => p.trim());
  if (parts.length < 3) {
    // fallback to Date constructor
    return new Date(String(dateStr));
  }
  const [d, m, y] = parts;
  const year = y.length === 2 ? `20${y}` : y;
  const monthIndex = MONTHS[m] !== undefined ? MONTHS[m] : (Number(m) - 1);
  const day = String(d).padStart(2, '0');
  const month = String((typeof monthIndex === 'number' ? monthIndex + 1 : 1)).padStart(2, '0');
  const iso = `${year}-${month}-${day}T${defaultHour}:00`;
  return new Date(iso);
}

export function estimateBarsHeld(dateEN, dateEX) {
  // returns approximate number of 4-hour bars between entry and exit, excluding full weekend days
  const entry = parseDate(dateEN);
  const exit = parseDate(dateEX);
  if (!entry || !exit) return 1;
  if (+entry === +exit) return 1;

  let hours = (exit - entry) / (1000 * 60 * 60); // total hours

  // subtract weekend full-day hours (Sat & Sun)
  const startDay = new Date(entry.getFullYear(), entry.getMonth(), entry.getDate());
  const endDay = new Date(exit.getFullYear(), exit.getMonth(), exit.getDate());
  for (let d = new Date(startDay); d <= endDay; d.setDate(d.getDate() + 1)) {
    const day = d.getDay();
    if (day === 6 || day === 0) {
      // subtract 24 hours for that day only if that day falls within the interval
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);
      const overlapStart = Math.max(dayStart, entry);
      const overlapEnd = Math.min(dayEnd, exit);
      if (overlapEnd > overlapStart) {
        hours -= (overlapEnd - overlapStart) / (1000 * 60 * 60);
      }
    }
  }

  const bars = Math.max(1, Math.round(hours / 4));
  return bars;
}

export function barsToTime(bars = 0) {
  const totalHours = Math.max(0, Number(bars) || 0) * 4;
  const days = Math.floor(totalHours / 24);
  const hours = Math.round(totalHours % 24);
  if (days > 0) {
    return `${days} days ${hours} hours`;
  }
  return `${hours} hours`;
}