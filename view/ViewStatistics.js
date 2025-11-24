// /view/TableStat.js
import { $, $$, _on, _ready } from "../helpers/shortcut.js";
import * as CR from '../helpers/chart_renderer.js';
import * as FM from "../helpers/formatter.js";
export class ViewStatistics {
	constructor() {
		this.statsContainer = $('#stats-table-container');
		this.monthlyContainer = $('#monthly-table-container');
		this._setupEventListener();
		//this._renderStatsSkeleton();
		//this._renderMonthlySkeleton();
	}
	
	_setupEventListener() {
		window.addEventListener('statistics-updated', (e) => {
			const { stats } = e.detail;
			//this.renderStatsTable(stats);
			this.renderMonthlyTable(stats.monthly);
			CR.renderPairsChart(stats.symbols); //ok
			
			CR.renderEquityChart(stats.equity); //ok
			
		});
	}
	//========== TABLE STATS  
	_renderStatsSkeleton() {
		this.statsContainer.innerHTML = `
      <table id="stats-table">
        <tbody id="stats-table-body">
          <tr><td colspan="4" class="period">Loading statistics...</td></tr>
        </tbody>
      </table>
    `;
	}
	
	
	renderStatsTable(stats) {
		const { period, total } = stats;
		const { long: L, short: S, all: A } = total;
		
		const r = [];
		const R = this.Row;
		const f = this.fmt;
		r.push(R.period(`${period.start} → ${period.end} (${period.months} months)`));
		r.push(R.header());
		const M = (label, a, l, s) => r.push(R.metric(label, a, l, s));
		M("Total Trades", A.trades, L.trades, S.trades);
		M("Win Trades", A.wintrades, L.wintrades, S.wintrades);
		M("Loss Trades", A.losstrades, L.losstrades, S.losstrades);
		M("Winrate", f.percent(A.winrate), f.percent(L.winrate), f.percent(S.winrate));
		M("Net Profit Pips", f.pips(A.netPips), f.pips(L.netPips), f.pips(S.netPips));
		M("", f.raw(A.netVPips, 'VP'), f.raw(L.netVPips, 'VP'), f.raw(S.netVPips, 'VP'));
		M("Gross Profit", f.raw(A.grossProfitPips, 'pips'), f.raw(L.grossProfitPips, 'pips'), f.raw(S.grossProfitPips, 'pips'));
		M("Gross Loss", f.raw(A.grossLossPips, 'pips'), f.raw(L.grossLossPips, 'pips'), f.raw(S.grossLossPips, 'pips'));
		M("Profit Factor", f.raw(A.profitFactor), f.raw(L.profitFactor), f.raw(S.profitFactor));
		M("Consecutive Profit", A.maxWinStreak, "—", "—");
		M("Consecutive Loss", A.maxLossStreak, "—", "—");
		M("Min Monthly Net", f.pips(A.monthly.minNetPips), "—", "—");
		M("Max Monthly Net", f.pips(A.monthly.maxNetPips), "—", "—");
		M("Stability", f.percent(A.monthly.stability), "—", "—");
		
		M("Avg Profit", f.raw(A.avgProfitPips, "pips"), f.raw(L.avgProfitPips, "pips"), f.raw(S.avgProfitPips, "pips"));
		M("Avg Loss", f.raw(A.avgLossPips, "pips"), f.raw(L.avgLossPips, "pips"), f.raw(S.avgLossPips, "pips"));
		M("Avg RiskReward", A.riskReward, "—", "—");
		M("Avg Trade / Month", FM.num(A.avgTradePerMonth, 1), "—", "—");
		M("Avg Net / Month", f.pips(A.profitPerMonthPips), "—", "—");
		M("Avg Profit / Trade", f.pips(A.profitPerTradePips), f.pips(L.profitPerTradePips), f.pips(S.profitPerTradePips));
		
		M("Max Drawdown", f.raw(A.maxDrawdownPips, "pips"), "—", "—");
		M("Max Drawdown", `${A.maxDrawdownPercent}%`, "—", "—");
		M("RecoveryFactor", FM.num(A.recoveryFactor), "", "");
		//M("AverageDrawdown", "—", "—", "—");
		M("Max Recovery Time", A.maxRecoveryTime, "", "");
		M("Avg Recovery Time", A.avgRecoveryTime, "", "");
		M("Avg Trade Hold", A.avgTradeHoldTime, L.avgTradeHoldTime, S.avgTradeHoldTime);
		M("Max Trade Hold", A.maxTradeHoldTime, L.maxTradeHoldTime, S.maxTradeHoldTime);
		
		// === FINAL RENDER ===
		$('#stats-table-body').innerHTML = r.join('');
	}
	
	//========== TABLE MONTHLY

renderMonthlyTable(stats) {
  const container = this.monthlyContainer;
  container.innerHTML = "";

  if (!stats || !stats.monthly || Object.keys(stats.monthly).length === 0) {
    container.innerHTML = `
      <div class="monthly-title">Monthly Performance</div>
      <table id="monthly-table">
        <tbody>
          <tr><td style="padding:20px; text-align:center;">Tidak ada data trade</td></tr>
        </tbody>
      </table>`;
    return;
  }

  const MONTHS = ['01','02','03','04','05','06','07','08','09','10','11','12'];

  // =====================================================
  // 1. GLOBAL TOGGLE SWITCH
  // =====================================================
  const toggleWrapper = document.createElement("div");
  toggleWrapper.className = "toggle-wrapper dual-toggle";

  const toggleLabel = document.createElement("label");
  toggleLabel.textContent = "Pips";

  const toggleSwitch = document.createElement("label");
  toggleSwitch.className = "switch";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.id = "toggle-pips-vpips";

  const slider = document.createElement("span");
  slider.className = "slider";

  toggleSwitch.appendChild(checkbox);
  toggleSwitch.appendChild(slider);

  toggleWrapper.appendChild(toggleSwitch);
  toggleWrapper.appendChild(toggleLabel);

  // =====================================================
  // 2. TITLE
  // =====================================================
  const title = document.createElement("div");
  title.className = "monthly-title";
  title.textContent = "Monthly Performance (Pips)";

  // Inject into container (no extra wrapper)
  container.appendChild(title);
  container.appendChild(toggleWrapper);

  // =====================================================
  // 3. TABLE
  // =====================================================
  const table = document.createElement("table");
  table.id = "monthly-table";
  table.classList.add("pips-mode"); // default

  const thead = document.createElement("thead");
  const tbody = document.createElement("tbody");

  // ------------------ HEADER ------------------ //
  const headerRow = document.createElement("tr");

  const thYear = document.createElement("th");
  thYear.className = "sticky-year dual-mode";
  thYear.textContent = "Year";
  headerRow.appendChild(thYear);

  ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
    .forEach(text => {
      const th = document.createElement("th");
      th.className = "dual-mode";
      th.textContent = text;
      headerRow.appendChild(th);
    });

  const thYtd = document.createElement("th");
  thYtd.className = "dual-mode";
  thYtd.textContent = "Total";
  headerRow.appendChild(thYtd);

  thead.appendChild(headerRow);


  // ------------------ BODY ------------------ //
  const years = [...new Set(Object.keys(stats.monthly).map(k => k.split("-")[0]))].sort();

  let grandPips = 0;
  let grandVPips = 0;

  years.forEach(year => {
    const row = document.createElement("tr");

    const yearCell = document.createElement("td");
    yearCell.className = "sticky-year dual-mode";
    yearCell.textContent = year;
    row.appendChild(yearCell);

    let yP = 0, yV = 0;

    MONTHS.forEach(m => {
      const key = `${year}-${m}`;
      const entry = stats.monthly[key];

      const td = document.createElement("td");

      const spanP = document.createElement("span");
      spanP.className = "pips-value";

      const spanV = document.createElement("span");
      spanV.className = "vpips-value hidden";

      if (entry) {
        const p = entry.pips ?? 0;
        const v = entry.vpips ?? 0;

        yP += p;  
        yV += v;

        grandPips += p;
        grandVPips += v;

        td.classList.add(
          p > 0 ? "positive" : p < 0 ? "negative" : "zero"
        );

        spanP.textContent = FM.num(p, 1);
        spanV.textContent = FM.num(v, 1);

      } else {
        td.classList.add("pips-null");
        spanP.textContent = "—";
        spanV.textContent = "—";
      }

      td.appendChild(spanP);
      td.appendChild(spanV);
      row.appendChild(td);
    });

    // ---- TOTAL/YTD ---- //
    const ytd = document.createElement("td");
    ytd.className = yP > 0 ? "positive" : yP < 0 ? "negative" : "zero";

    const ypSpan = document.createElement("span");
    ypSpan.className = "pips-value";
    ypSpan.textContent = FM.num(yP, 1);

    const yvSpan = document.createElement("span");
    yvSpan.className = "vpips-value hidden";
    yvSpan.textContent = FM.num(yV, 1);

    ytd.appendChild(ypSpan);
    ytd.appendChild(yvSpan);
    row.appendChild(ytd);

    tbody.appendChild(row);
  });

  // ------------------ GRAND TOTAL ------------------ //
  const totalRow = document.createElement("tr");
  totalRow.className = "grand-total-row";

  const label = document.createElement("td");
  label.colSpan = 13; // 12 months + year
  label.textContent = "Grand Total";

  const cell = document.createElement("td");
  cell.className = grandPips > 0 ? "positive" : grandPips < 0 ? "negative" : "zero";

  const gpSpan = document.createElement("span");
  gpSpan.className = "pips-value";
  gpSpan.textContent = FM.num(grandPips, 1);

  const gvSpan = document.createElement("span");
  gvSpan.className = "vpips-value hidden";
  gvSpan.textContent = FM.num(grandVPips, 1);

  cell.appendChild(gpSpan);
  cell.appendChild(gvSpan);

  totalRow.appendChild(label);
  totalRow.appendChild(cell);
  tbody.appendChild(totalRow);

  // Final assembly
  table.appendChild(thead);
  table.appendChild(tbody);
  container.appendChild(table);

  // =====================================================
  // 4. TOGGLE LISTENER (GLOBAL)
  // =====================================================
  checkbox.addEventListener("change", () => {
    const pips = table.querySelectorAll(".pips-value");
    const vpips = table.querySelectorAll(".vpips-value");
    const dualHeaders = table.querySelectorAll(".dual-mode");

    if (checkbox.checked) {
      // VPIPS MODE
      table.classList.remove("pips-mode");
      table.classList.add("vpips-mode");
      title.textContent = "Monthly Performance (VPips)";
      toggleLabel.textContent = "VPips";

      pips.forEach(e => e.classList.add("hidden"));
      vpips.forEach(e => e.classList.remove("hidden"));

    } else {
      // PIPS MODE
      table.classList.add("pips-mode");
      table.classList.remove("vpips-mode");
      title.textContent = "Monthly Performance (Pips)";
      toggleLabel.textContent = "Pips";

      pips.forEach(e => e.classList.remove("hidden"));
      vpips.forEach(e => e.classList.add("hidden"));
    }
  });
}
	
	
}

new ViewStatistics();