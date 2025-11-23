// ~/helpers/chart_renderer.js
import { $, $$, _on, _ready } from "../helpers/shortcut.js";
import * as FM from "../helpers/formatter.js";

window._charts = {};
const equityContainer = $('#equity-chart-container');
const equityCanvas = $('#equity-chart').getContext('2d');
const handleResizer = equityContainer.querySelector('.resizer');
const pairsCanvas = $('#pairs-chart').getContext('2d');

export function renderPairsChart(stats) {
  if (window._charts.pairs) window._charts.pairs.destroy();
  const labels = stats.map(d => `${d.pair}`);
  const values = stats.map(d => d.value);
  const colors = values.map(v => (v >= 0 ? '#1d4ed8' : '#dc2626'));
  
  const pairsChart = new Chart(pairsCanvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors,
        borderRadius: 0,
        // borderSkipped: false,
      }]
    },
    options: {
      indexAxis: 'y',
      scales: {
        x: { ticks: { display: true }, grid: { display: false } },
        y: { ticks: { display: true }, grid: { display: false } }
      },
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true }
      }
    }
  });
  window._charts.pairs = pairsChart;
}

// =======================================================
// RENDER CHART
// =======================================================
export function renderEquityChart(data) {
  if (window._charts.equity) window._charts.equity.destroy();
  const labels = data.pips.map((_, index) => index + 1); // 1, 2, 3, 4... (bisa juga kosongin "")

  const equityPips   = data.pips.map(item   => item.graph);
  const equityVpips  = data.vpips.map(item  => item.graph);
  
  const datesPips    = data.pips.map(item   => item.date);
  const datesVpips   = data.vpips.map(item  => item.date);
  const valuesPips   = data.pips.map(item   => item.value);
  const valuesVpips  = data.vpips.map(item  => item.value);
  
  new Chart(equityCanvas, {
    type: 'line',
    data: {
      labels: labels,  // hanya angka urut atau bisa diganti ["", "", ""] kalau mau kosong
      datasets: [
        {
          label: 'Equity (Pips)',
          data: equityPips,
          borderColor: '#00b894',
          backgroundColor: 'rgba(0, 184, 148, 0.1)',
          fill: true,
          tension: 0.3,
          pointRadius: 0,              // titik kecil biar clean
          pointHoverRadius: 6,
          pointHoverBackgroundColor: '#00b894',
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 2
        },
        {
          label: 'Equity (VPips)',
          data: equityVpips,
          borderColor: '#e17055',
          backgroundColor: 'rgba(225, 112, 85, 0.1)',
          fill: true,
          tension: 0.3,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: '#e17055',
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        title: {
          display: true,
          text: 'Equity Curve Comparison',
          font: { size: 16 }
        },
        legend: {
          position: 'top'
        },
        tooltip: {
          callbacks: {
            // Label X di tooltip (bisa nomor trade atau date)
            title: function(tooltipItems) {
              const idx = tooltipItems[0].dataIndex;
              const date = new Date(data.pips[idx].date); // asumsi date sama untuk kedua dataset
              return FM.dateDMY(date);
            },
            label: function(context) {
              const idx = context.dataIndex;
              const dataset = context.dataset.label.includes('Pips') ? data.pips : data.vpips;
              const val = dataset[idx].value;
              return `\( {context.dataset.label}: \){context.parsed.y.toFixed(2)} (Δ ${val.toFixed(2)})`;
            }
          }
        }
      },
      scales: {
        x: {
          ticks: {
            callback: function(value) {
              // Kosongin label X biar super clean (mirip TradingView)
              return '';
              // atau kalau mau nomor trade: return value;
            }
          },
          grid: {
            display: false
          },
          title: {
            display: true,
            text: 'Trade Sequence'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Equity (pips)'
          },
          grid: {
            color: 'rgba(0,0,0,0.05)'
          }
        }
      }
    }
  });
  
  window._charts.equity = equityChart;
  const observer = new ResizeObserver(() => equityChart.resize());
  observer.observe(equityContainer);
  enableResize(equityContainer, handleResizer, equityChart);
}


// =======================================================
// DRAG RESIZER — REFAC (Mobile + Desktop)
// =======================================================
function enableResize(container, handle, chartInstance) {
  let startY = 0;
  let startHeight = 0;
  
  const minHeight = 150;
  
  const getY = (e) => (e.touches ? e.touches[0].clientY : e.clientY);
  
  function start(e) {
    e.preventDefault();
    startY = getY(e);
    startHeight = container.offsetHeight;
    
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", stop);
    
    document.addEventListener("touchmove", move, { passive: false });
    document.addEventListener("touchend", stop);
  }
  
  function move(e) {
    e.preventDefault();
    const currentY = getY(e);
    
    let newHeight = startHeight + (currentY - startY);
    if (newHeight < minHeight) newHeight = minHeight;
    
    container.style.height = newHeight + "px";
    
    chartInstance.resize();
  }
  
  function stop() {
    document.removeEventListener("mousemove", move);
    document.removeEventListener("mouseup", stop);
    
    document.removeEventListener("touchmove", move);
    document.removeEventListener("touchend", stop);
  }
  
  handle.addEventListener("mousedown", start);
  handle.addEventListener("touchstart", start, { passive: false });
}