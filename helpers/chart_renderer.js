export function renderChart(canvasId, config) {
  const ctx = document.getElementById(canvasId).getContext('2d');

  // Hapus chart sebelumnya jika ada
  if (window._charts === undefined) window._charts = {};
  if (window._charts[canvasId]) {
    window._charts[canvasId].destroy();
  }

  window._charts[canvasId] = new Chart(ctx, config);
}