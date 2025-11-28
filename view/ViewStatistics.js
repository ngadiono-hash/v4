// /view/TableStat.js
import { $, $$, create } from "../helpers/template.js";
import * as CR from '../helpers/chart_renderer.js';
import * as FM from "../helpers/formatter.js";
export class ViewStatistics {
	constructor() {
		this.generalContainer = $('#general-container');
		this.monthlyContainer = $('#monthly-container');
		this.propContainer = $("#prop-container");
		this._setupEventListener();
	}
	
	_setupEventListener() {
		window.addEventListener('statistics-updated', (e) => {
			const { data } = e.detail;
			this.renderDDTable(data.ddown);
      this.renderGeneralTable(data.general); // ok
			this.renderMonthlyTable(data.period.accum); //ok
			this.renderPropsTable(data.period.prop);
			CR.renderPairsChart(data.symbols); //ok
			CR.renderEquityChart(data.equity); //ok
			
		});
	}

  toggle(table) {
    const checkbox = create("input", {type: "checkbox", id: "toggle-pips-vpips" });
    
    checkbox.addEventListener("change", () => {
      $$(".pivot", table).forEach(e => {
        e.classList.toggle("pips-mode");
        e.classList.toggle("vpips-mode");
      });
      $$(".value", table).forEach(e => e.classList.toggle("hidden"));
    });
  
    return create("div", { className: "toggle-wrapper" },
      create("label", { className: "switch" },
        checkbox,
        create("span", { className: "slider" })
      )
    );
  }
  
	//========== TABLE STATS 
  renderGeneralTable(stats) {
    const container = this.generalContainer;
    container.innerHTML = "";
  
    const table = create("table", { id: "general-table" });
    const thead = create("thead", {},
      create("tr", {},
        create("th", { className: "pivot pivot-xy pips-mode" }, this.toggle(table)),
        create("th", { className: "pivot pivot-x pips-mode", textContent: "All" }),
        create("th", { className: "pivot pivot-x pips-mode", textContent: "Long" }),
        create("th", { className: "pivot pivot-x pips-mode", textContent: "Short" })
      )
    );
    table.append(thead);
    const tbody = create("tbody", {});
    const renderCol = (Obj) => {
      const { txt: txtP, css: cssP } = FM.metricFormat(Obj.p, Obj.t);
      const { txt: txtV, css: cssV } = FM.metricFormat(Obj.v, Obj.t);
    
      return create("td", {},
        create("span", { className: `value ${cssP}`.trim(), textContent: txtP }),
        create("span", { className: `value hidden ${cssV}`.trim(), textContent: txtV })
      );
    };
    Object.keys(stats.a).forEach(metricName => {
      tbody.append(
        create("tr", {},
          create("td", {
            className: "pivot pivot-y pips-mode",
            textContent: FM.toTitle(metricName)
          }),
          renderCol(stats.a[metricName]),
          renderCol(stats.l[metricName]),
          renderCol(stats.s[metricName])
        )
      );
    });
    
    table.append(tbody);
    container.append(table);
  }	
  //========== TABLE MONTHLY
  renderMonthlyTable(stats) {
    const container = this.monthlyContainer;
    container.innerHTML = "";
  
    const MONTHS = ['01','02','03','04','05','06','07','08','09','10','11','12'];
    const HEADER = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Total"];
  
    const years = [...new Set(
      Object.keys(stats.monthly).map(k => k.split("-")[0])
    )].sort();
  
    // =========================
    // Helpers
    // =========================
    const cls = (n) => {
      if (n === null || n === undefined) return "null";
      const x = Number(n);
      if (Number.isNaN(x)) return "null";
      if (x > 0) return "pos";
      if (x < 0) return "neg";
      return "zero";
    };
  
    const fmt = (n) => {
      if (n === null || n === undefined) return "—";
      const x = Number(n);
      return Number.isNaN(x) ? "—" : FM.num(x, 1);
    };
  
    const tdCell = (p, v) =>
      create("td", {},
        create("span", {
          className: `value ${cls(p)}`,
          textContent: fmt(p)
        }),
        create("span", {
          className: `value hidden ${cls(v)}`,
          textContent: fmt(v)
        })
      );
  
    // =========================
    // Build table
    // =========================
    const table = create("table", { id: "monthly-table" });
  
    // HEADER
    const headerRow = create("tr", {},
      create("th", { className: "pivot pivot-xy pips-mode" },
        this.toggle(table)
      ),
      ...HEADER.map(text =>
        create("th", {
          className: "pivot pivot-x pips-mode",
          textContent: text
        })
      )
    );
  
    // BODY ROWS
    const bodyRows = years.map(year => {
      const monthCells = MONTHS.map(m => {
        const e = stats.monthly[`${year}-${m}`];
        return e ? tdCell(e.p, e.v) : tdCell(null, null);
      });
  
      const y = stats.yearly[year] ?? { p: null, v: null };
      const totalCell = tdCell(y.p, y.v);
  
      return create("tr", {},
        create("td", {
          className: "pivot pivot-y pips-mode",
          textContent: year
        }),
        ...monthCells,
        totalCell
      );
    });
  
    // GRAND TOTAL
    const g = stats.total ?? { p: null, v: null };
    const grandRow = create("tr", { className: "grand-total-row" },
      create("td", { colSpan: 13, textContent: "Grand Total" }),
      tdCell(g.p, g.v)
    );
  
    // Append everything
    table.append(
      create("thead", {}, headerRow),
      create("tbody", {}, ...bodyRows, grandRow)
    );
  
    container.append(table);
  }
	//========== PROPERTY TABLE
  renderPropsTable(stats) {
    const container = this.propContainer;
    container.innerHTML = "";
    
    const table = create("table", { id: "props-table" });
  
    const th = create("tr", {},
      create("th", { className: "pivot pivot-x pips-mode", textContent: "Period" }),
      create("th", { className: "pivot pivot-x pips-mode", textContent: stats.period })
    );
    table.append(th);
  
    const renderRows = (sectionObj) => {
      Object.entries(sectionObj).forEach(([key, obj]) => {
        const { txt: txtP, css: cssP } = FM.metricFormat(obj.p, obj.t);
        const { txt: txtV, css: cssV } = FM.metricFormat(obj.v, obj.t);
        table.append(
          create("tr", {},
            create("td", {
              className: "pivot pivot-y pips-mode",
              textContent: FM.toTitle(key)
            }),
            create("td", {},
              create("span", {
                className: `value ${cssP}`,
                textContent: txtP
              }),
              create("span", {
                className: `value hidden ${cssV}`,
                textContent: txtV
              })
            )
          )
        );
      });
    };
    table.append(create("tr",{}, create("td", { className: "pivot sprt pips-mode", colSpan: 2, textContent: `Summary Performance of ${stats.months}` })));
    renderRows(stats.monthly);
    table.append(create("tr",{}, create("td", { className: "pivot sprt pips-mode", colSpan: 2, textContent: `Summary Performance of ${stats.years}` })));
    renderRows(stats.yearly);
  
    container.append(table);
    container.prepend(this.toggle(table))
  }
  //========== DRAWDOWN TABLE
  renderDDTable(stats) {
    const container = $("#drawdown-container");
    container.innerHTML = "";
  
    // ========== SUMMARY SECTION ==========
    const summaryTable = create("table", { id: "dd-summary" });
    const summaryHead = create("tr", {},
      create("th", { className: "pivot pivot-x pips-mode" }, ""),
      create("th", { className: "pivot pivot-x pips-mode" }, "P"),
      create("th", { className: "pivot pivot-x pips-mode" }, "V")
    );
  
    summaryTable.append(summaryHead);
  
    const summaryMetrics = [
      ["maxDrawdown",      "float"],
      ["maxDrawdownPercentage", "%"],
      ["avgDrawdown",      "float"],
      ["avgDrawdownPercentage", "%"],
      ["maxRecoveryDuration", "ms"],
      ["avgRecoveryDuration", "ms"],
    ];
  
    summaryMetrics.forEach(([prop, type]) => {
      const row = create("tr", {},
        create("td", { className: "pivot pivot-y pips-mode" }, FM.toTitle(prop)),
        create("td", { className: "value" }, FM.metricFormat(stats.p[prop], type).txt),
        create("td", { className: "value" }, FM.metricFormat(stats.v[prop], type).txt)
      );
      summaryTable.append(row);
    });
  
    container.append(summaryTable);
  
    // ========== EVENTS SECTION ==========
    const renderEventTable = (events, label) => {
      const wrap = create("div", { className: "dd-events-group" });
  
      wrap.append(
        create("h3", { className: "dd-title" }, `${label} Drawdown Events`)
      );
  
      const table = create("table", { id: "dd-events" });
      
      const head = create("tr", {},
        create("th", { className: "pivot pivot-x pips-mode" }, "#"),
        create("th", { className: "pivot pivot-x pips-mode" }, "Peak"),
        create("th", { className: "pivot pivot-x pips-mode" }, "Trough"),
        create("th", { className: "pivot pivot-x pips-mode" }, "Recovery"),
        create("th", { className: "pivot pivot-x pips-mode" }, "Abs DD"),
        create("th", { className: "pivot pivot-x pips-mode" }, "%"),
        create("th", { className: "pivot pivot-x pips-mode" }, "Duration")
      );
      table.append(head);
  
      events.forEach((ev, i) => {
        const row = create("tr", {},
          create("td", { className: "value", textContent: `${i + 1}`}),
          create("td", { className: "value" }, FM.metricFormat(ev.peakEquity).txt),
          create("td", { className: "value" }, FM.metricFormat(ev.troughEquity).txt),
          create("td", { className: "value" }, FM.metricFormat(ev.recoveryEquity).txt),
          create("td", { className: "value" }, FM.metricFormat(ev.absoluteDD).txt),
          create("td", { className: "value" }, FM.metricFormat(ev.percentageDD, "%").txt),
          create("td", { className: "value" }, FM.metricFormat(ev.recoveryDuration, "ms").txt)
        );
        table.append(row);
      });
  
      wrap.append(table);
      return wrap;
    };
  
    container.append(renderEventTable(stats.p.events, "P"));
    container.append(renderEventTable(stats.v.events, "V"));
  
    return container;
  }



}

new ViewStatistics();