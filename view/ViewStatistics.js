// /view/TableStat.js
import { $, $$, _on, _create, _ready } from "../helpers/shortcut.js";
import * as CR from '../helpers/chart_renderer.js';
import * as FM from "../helpers/formatter.js";
export class ViewStatistics {
	constructor() {
		this.generalContainer = $('#general-container');
		this.monthlyContainer = $('#monthly-container');
		this._setupEventListener();
	}
	
	_setupEventListener() {
		window.addEventListener('statistics-updated', (e) => {
			const { stats } = e.detail;
      this.renderGeneralTable(stats.general);
			this.renderMonthlyTable(stats.monthly); //ok
			CR.renderPairsChart(stats.symbols); //ok
			CR.renderEquityChart(stats.equity); //ok
			
		});
	}
	toggle(table){
	  const toggleBtn = document.createElement("div");
    toggleBtn.className = "toggle-wrapper";
    const toggleSwitch = document.createElement("label");
    toggleSwitch.className = "switch";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = "toggle-pips-vpips";
    const slider = document.createElement("span");
    slider.className = "slider";
    toggleSwitch.appendChild(checkbox);
    toggleSwitch.appendChild(slider);
    toggleBtn.appendChild(toggleSwitch);
    
    checkbox.addEventListener("change", () => {
      const valsMode = $$(".value", table);
      const dualMode = $$(".pivot", table);
      dualMode.forEach(e => {
        e.classList.toggle("pips-mode");
        e.classList.toggle("vpips-mode");
      });
      valsMode.forEach(e => {
        e.classList.toggle("hidden");
      });
    });
    return toggleBtn;
	}
	//========== TABLE STATS 
renderGeneralTable(stats) {
  const container = this.generalContainer;
  const tableId = "general-table"; // supaya toggle bisa target
  const metrics = [
      ["trade", "Total Trades", "int"],
      ["win", "Win Trades", "int"],
      ["loss", "Loss Trades", "int"],
      ["winrate", "Win Rate", "float"],
      ["gProfit", "Gross Profit", "float"],
      ["gLoss", "Gross Loss", "float"],
      ["netReturn", "Net Return", "float"],
      ["medReturn", "Median Return", "float"],
      ["avgReturn", "Average Return", "float"],
      ["stdReturn", "StDev Return", "float"],
      ["avgProfit", "Average Profit", "float"],
      ["avgLoss", "Average Loss", "float"],
      ["maxProfit", "Max Profit", "float"],
      ["maxLoss", "Max Loss", "float"],
      ["pFactor", "Profit Factor", "float"],
      ["avgRR", "Avg Risk:Reward", "float"],
      ["avgHold", "Average Hold", "int"],
      ["maxHold", "Max Hold", "int"]
  ];

  const table = _create("table", { id: tableId });

  // ====================== THEAD ==========================
  const thead = _create("thead");
  const trHead = _create("tr");

  // ---- Pivot XY (pojok kiri atas + toggle) ----
  const thXY = _create("th", { className: "pivot pivot-xy pips-mode" });
  thXY.appendChild(this.toggle(tableId))
  trHead.append(thXY);

  // ---- Kolom Pivot X ----
  trHead.append(_create("th", {
    className: "pivot pivot-x pips-mode",
    textContent: "All"
  }));
  trHead.append(_create("th", {
    className: "pivot pivot-x pips-mode",
    textContent: "Long"
  }));
  trHead.append(_create("th", {
    className: "pivot pivot-x pips-mode",
    textContent: "Short"
  }));

  thead.append(trHead);
  table.append(thead);


  // ====================== TBODY ==========================
  const tbody = _create("tbody");

  for (const [key, label, type] of metrics) {
    const row = _create("tr");

    // ========== pivot Y (nama metrik) ==========
    row.append(
      _create("td", {
        className: "pivot pivot-y pips-mode",
        textContent: label
      })
    );

    // ==== helper untuk kolom nilai ====
    const renderCol = (obj) => {
      const p = obj?.p ?? 0;
      const v = obj?.v ?? 0;

      const { txt: txtP, css: cssP } = FM.metricsFormat(key, type, p);
      const { txt: txtV, css: cssV } = FM.metricsFormat(key, type, v);

      return _create(
        "td",
        { className: "td-value" },
        _create("span", { className: `value ${cssP}`, textContent: txtP }),
        _create("span", { className: `value hidden ${cssV}`, textContent: txtV })
      );
    };

    row.append(renderCol(stats.a[key]));
    row.append(renderCol(stats.l[key]));
    row.append(renderCol(stats.s[key]));

    tbody.append(row);
  }

  table.append(tbody);

  container.append(table);
}	
 	
  enderGeneralTable(stats) {
    const container = this.generalContainer;
    if (!stats || Object.keys(stats).length === 0) {
      container.innerHTML = `
        <table id="general-table">
          <tbody>
            <tr><td style="padding:20px; text-align:center;">Nothing to show</td></tr>
          </tbody>
        </table>`;
      return;
    }
    const frag = document.createDocumentFragment();
    
    const table = document.createElement("table");
    table.id = "general-table";
  
    const thead = document.createElement("thead");
    
    table.appendChild(thead);
  
    const tbody = document.createElement("tbody");
  
    const metricsConfig = [
      ["trade", "Total Trades", "int"],
      ["win", "Win Trades", "int"],
      ["loss", "Loss Trades", "int"],
      ["winrate", "Win Rate", "float"],
      ["gProfit", "Gross Profit", "float"],
      ["gLoss", "Gross Loss", "float"],
      ["netReturn", "Net Return", "float"],
      ["medReturn", "Median Return", "float"],
      ["avgReturn", "Average Return", "float"],
      ["stdReturn", "StDev Return", "float"],
      ["avgProfit", "Average Profit", "float"],
      ["avgLoss", "Average Loss", "float"],
      ["maxProfit", "Max Profit", "float"],
      ["maxLoss", "Max Loss", "float"],
      ["pFactor", "Profit Factor", "float"],
      ["avgRR", "Avg Risk:Reward", "float"],
      ["avgHold", "Average Hold", "int"],
      ["maxHold", "Max Hold", "int"]
    ];
    


  const makePV = (metricKey, obj) => {
    const wrap = document.createElement("td");
  
  
    const pVal = metricsFormat(metricKey, obj.p);
    const vVal = metricsFormat(metricKey, obj.v);
  
    wrap.innerHTML = `
      <span class="value ${pCls}">${pVal}</span>
      <span class="value hidden ${vCls}">${vVal}</span>
    `;
    return wrap;
  };
  
    for (const [key, label, type] of metrics) {
      const row = document.createElement("tr");
  
      const tdLabel = document.createElement("td");
      tdLabel.textContent = label;
      tdLabel.className = "label";
      row.appendChild(tdLabel);
  
      const mA = stats.a[key];
      const mL = stats.l[key];
      const mS = stats.s[key];
  
      if (!mA || !mL || !mS) {
        row.appendChild(document.createElement("td"));
        row.appendChild(document.createElement("td"));
        row.appendChild(document.createElement("td"));
        tbody.appendChild(row);
        continue;
      }
  
      row.appendChild(makePV(key, mA, type));
      row.appendChild(makePV(key, mL, type));
      row.appendChild(makePV(key, mS, type));
  
      tbody.appendChild(row);
    }
  
    table.appendChild(tbody);
    frag.appendChild(table);
    container.append(frag);
  }
	//========== TABLE MONTHLY
  renderMonthlyTable(stats) {
    const container = this.monthlyContainer;
    if (!stats || !stats.monthly || Object.keys(stats.monthly).length === 0) {
      container.innerHTML = `
        <table id="monthly-table">
          <tbody>
            <tr><td style="padding:20px; text-align:center;">Nothing to show</td></tr>
          </tbody>
        </table>`;
      return;
    }
    const MONTHS = ['01','02','03','04','05','06','07','08','09','10','11','12'];
    const table = document.createElement("table");
    table.id = "monthly-table";
    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");
    // ------------------ HEADER ------------------ //
    const headerRow = document.createElement("tr");
    const pivotXY = document.createElement("th");
    pivotXY.className = "pivot pivot-xy pips-mode";
    pivotXY.appendChild(this.toggle(table));
    headerRow.appendChild(pivotXY);
  
    ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
      .forEach(text => {
        const th = document.createElement("th");
        th.className = "pivot pivot-x pips-mode";
        th.textContent = text;
        headerRow.appendChild(th);
      });
  
    const thYtd = document.createElement("th");
    thYtd.className = "pivot pivot-x pips-mode";
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
      yearCell.className = "pivot pivot-y pips-mode";
      yearCell.textContent = year;
      row.appendChild(yearCell);
  
      let yP = 0, yV = 0;
  
      MONTHS.forEach(m => {
        const key = `${year}-${m}`;
        const entry = stats.monthly[key];
  
        const td = document.createElement("td");
  
        const spanP = document.createElement("span");
        spanP.className = "value";
  
        const spanV = document.createElement("span");
        spanV.className = "value hidden";
  
        if (entry) {
          const p = entry.pips ?? 0;
          const v = entry.vpips ?? 0;
  
          yP += p;  
          yV += v;
  
          grandPips += p;
          grandVPips += v;
  
          td.classList.add(p > 0 ? "positive" : p < 0 ? "negative" : "zero");
  
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
      ypSpan.className = "value";
      ypSpan.textContent = FM.num(yP, 1);
  
      const yvSpan = document.createElement("span");
      yvSpan.className = "value hidden";
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
    gpSpan.className = "value";
    gpSpan.textContent = FM.num(grandPips, 1);
  
    const gvSpan = document.createElement("span");
    gvSpan.className = "value hidden";
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
    
  }
	
	
}

new ViewStatistics();