(() => {
  const INK = "#000000";
  const MUTED = "#727272";
  const GRID = "#ebebeb";
  const FONT = { family: "Poppins, system-ui, sans-serif", size: 11 };
  const COLORS = ["#d84d2b", "#05047e", "#037ef3", "#004f32"];

  const charts = [];

  function clearCharts() {
    while (charts.length) {
      const chart = charts.pop();
      try {
        chart.destroy();
      } catch (_err) {
        /* already gone */
      }
    }
  }

  function axis(opts = {}) {
    return {
      grid: { color: GRID, drawBorder: false },
      border: { display: false },
      ticks: { font: FONT, color: MUTED, precision: 0 },
      ...opts,
    };
  }

  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { top: 4, right: 8 } },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: INK,
        padding: 10,
        cornerRadius: 0,
        displayColors: false,
      },
    },
  };

  function paint(id, config) {
    const canvas = document.getElementById(id);
    if (!canvas || typeof Chart === "undefined") return;
    const empty = canvas.parentElement?.querySelector(".chart-empty");
    const labels = config.data?.labels || [];
    const datasets = config.data?.datasets || [];
    const hasValues = datasets.some((set) => (set.data || []).some((n) => Number(n) > 0));
    if (!labels.length || !hasValues) {
      if (empty) empty.hidden = false;
      canvas.hidden = true;
      return;
    }
    if (empty) empty.hidden = true;
    canvas.hidden = false;
    charts.push(new Chart(canvas, config));
  }

  function draw() {
    const payloadEl = document.getElementById("b2b-analysis-charts");
    if (!payloadEl || typeof Chart === "undefined") return;
    let data;
    try {
      data = JSON.parse(payloadEl.textContent);
    } catch (_err) {
      return;
    }
    clearCharts();
    Chart.defaults.font.family = FONT.family;
    Chart.defaults.color = MUTED;

    if (data.products) {
      paint("chart-b2b-products", {
        type: "bar",
        data: {
          labels: data.products.labels,
          datasets: [
            {
              label: "Slots",
              data: data.products.slots,
              backgroundColor: COLORS,
              borderWidth: 0,
              barPercentage: 0.55,
            },
          ],
        },
        options: {
          ...baseOptions,
          scales: { x: axis({ grid: { display: false } }), y: axis({ beginAtZero: true }) },
        },
      });
    }

    if (data.fill) {
      paint("chart-b2b-fill", {
        type: "doughnut",
        data: {
          labels: data.fill.labels,
          datasets: [
            {
              data: data.fill.values,
              backgroundColor: ["#05047e", "#037ef3"],
              borderWidth: 0,
            },
          ],
        },
        options: {
          ...baseOptions,
          cutout: "62%",
          plugins: {
            ...baseOptions.plugins,
            legend: { display: true, position: "bottom", labels: { boxWidth: 12, font: FONT } },
            tooltip: { ...baseOptions.plugins.tooltip, displayColors: true },
          },
        },
      });
    }

    if (data.demand) {
      paint("chart-b2b-demand", {
        type: "bar",
        data: {
          labels: data.demand.labels,
          datasets: [
            {
              label: "Openings",
              data: data.demand.openings,
              backgroundColor: "#05047e",
              borderWidth: 0,
            },
            {
              label: "Applicants",
              data: data.demand.applicants,
              backgroundColor: "#d84d2b",
              borderWidth: 0,
            },
          ],
        },
        options: {
          ...baseOptions,
          interaction: { mode: "index", intersect: false },
          plugins: {
            ...baseOptions.plugins,
            legend: { display: true, position: "bottom", labels: { boxWidth: 12, font: FONT } },
            tooltip: { ...baseOptions.plugins.tooltip, displayColors: true },
          },
          scales: {
            x: axis({ grid: { display: false } }),
            y: axis({ beginAtZero: true }),
          },
        },
      });
    }

    if (data.lcs) {
      paint("chart-b2b-lcs", {
        type: "bar",
        data: {
          labels: data.lcs.labels,
          datasets: [
            {
              label: "Openings",
              data: data.lcs.openings,
              backgroundColor: "#05047e",
              borderWidth: 0,
            },
            {
              label: "Available",
              data: data.lcs.available,
              backgroundColor: "#037ef3",
              borderWidth: 0,
            },
          ],
        },
        options: {
          ...baseOptions,
          indexAxis: "y",
          interaction: { mode: "index", intersect: false },
          plugins: {
            ...baseOptions.plugins,
            legend: { display: true, position: "bottom", labels: { boxWidth: 12, font: FONT } },
            tooltip: { ...baseOptions.plugins.tooltip, displayColors: true },
          },
          scales: {
            x: axis({ beginAtZero: true }),
            y: axis({ grid: { display: false } }),
          },
        },
      });
    }

    if (data.months) {
      paint("chart-b2b-months", {
        type: "bar",
        data: {
          labels: data.months.labels,
          datasets: [
            {
              label: "Slots",
              data: data.months.slots,
              backgroundColor: "#d84d2b",
              borderWidth: 0,
            },
            {
              label: "Openings",
              data: data.months.openings,
              backgroundColor: "#05047e",
              borderWidth: 0,
            },
            {
              label: "Available",
              data: data.months.available,
              backgroundColor: "#037ef3",
              borderWidth: 0,
            },
          ],
        },
        options: {
          ...baseOptions,
          interaction: { mode: "index", intersect: false },
          plugins: {
            ...baseOptions.plugins,
            legend: { display: true, position: "bottom", labels: { boxWidth: 12, font: FONT } },
            tooltip: { ...baseOptions.plugins.tooltip, displayColors: true },
          },
          scales: {
            x: axis({ grid: { display: false } }),
            y: axis({ beginAtZero: true }),
          },
        },
      });
    }
  }

  document.addEventListener("DOMContentLoaded", draw);
  document.body.addEventListener("htmx:afterSwap", (event) => {
    if (event.detail?.target?.id === "analysis-body") draw();
  });
})();
