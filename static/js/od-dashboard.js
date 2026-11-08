(() => {
  const raw = document.getElementById("od-charts");
  if (!raw || typeof Chart === "undefined") return;
  let data;
  try {
    data = JSON.parse(raw.textContent);
  } catch (e) {
    return;
  }

  Chart.defaults.font.family = "Poppins, system-ui, sans-serif";
  Chart.defaults.font.size = 12;
  Chart.defaults.color = "#727272";
  Chart.defaults.plugins.tooltip.backgroundColor = "#000";
  Chart.defaults.plugins.tooltip.titleColor = "#fff";
  Chart.defaults.plugins.tooltip.bodyColor = "#fff";
  Chart.defaults.plugins.tooltip.cornerRadius = 0;
  Chart.defaults.plugins.tooltip.padding = 10;
  Chart.defaults.plugins.legend.labels.boxWidth = 10;
  Chart.defaults.plugins.legend.labels.padding = 14;

  const clusterEl = document.getElementById("od-chart-clusters");
  if (clusterEl && data.cluster_mix) {
    new Chart(clusterEl, {
      type: "doughnut",
      data: {
        labels: data.cluster_mix.labels,
        datasets: [
          {
            data: data.cluster_mix.values,
            backgroundColor: data.cluster_mix.colors,
            borderWidth: 0,
            hoverOffset: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom", labels: { usePointStyle: true, pointStyle: "rect" } },
        },
        cutout: "62%",
      },
    });
  }

  const secondary = document.getElementById("od-chart-secondary");
  if (secondary) {
    if (data.radar && data.radar.labels && data.radar.labels.length) {
      new Chart(secondary, {
        type: "radar",
        data: {
          labels: data.radar.labels,
          datasets: [
            {
              label: "Pillars",
              data: data.radar.values,
              borderColor: "#d84d2b",
              backgroundColor: "rgba(216, 77, 43, 0.14)",
              pointBackgroundColor: "#d84d2b",
              pointBorderColor: "#fff",
              pointBorderWidth: 1,
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            r: {
              min: 0,
              max: 100,
              ticks: { stepSize: 25, backdropColor: "transparent", showLabelBackdrop: false },
              grid: { color: "#ebebeb" },
              angleLines: { color: "#ebebeb" },
              pointLabels: { color: "#404040", font: { size: 11 } },
            },
          },
          plugins: { legend: { display: false } },
        },
      });
    } else if (data.odi_bars) {
      new Chart(secondary, {
        type: "bar",
        data: {
          labels: data.odi_bars.labels,
          datasets: [
            {
              label: "ODI",
              data: data.odi_bars.odi,
              backgroundColor: data.odi_bars.colors,
              borderWidth: 0,
              barThickness: 14,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: "y",
          scales: {
            x: {
              min: 0,
              max: 100,
              grid: { color: "#f0f0f0", drawBorder: false },
              ticks: { callback: (v) => `${v}%` },
            },
            y: { grid: { display: false }, ticks: { color: "#404040" } },
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label(ctx) {
                  return `ODI ${ctx.parsed.x}%`;
                },
              },
            },
          },
        },
      });
    }
  }

  const scatterEl = document.getElementById("od-chart-scatter");
  if (scatterEl && data.scatter && data.scatter.length) {
    const byColor = {};
    data.scatter.forEach((pt) => {
      const key = pt.color || "#000";
      if (!byColor[key]) byColor[key] = [];
      byColor[key].push({ x: pt.x, y: pt.y, label: pt.label });
    });
    new Chart(scatterEl, {
      type: "scatter",
      data: {
        datasets: Object.entries(byColor).map(([color, points]) => ({
          label: color,
          data: points,
          backgroundColor: color,
          borderColor: "#fff",
          borderWidth: 1,
          pointRadius: 6,
          pointHoverRadius: 8,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label(ctx) {
                const pt = ctx.raw || {};
                return `${pt.label || ""} · OPI ${pt.x}% · OHI ${pt.y}%`;
              },
            },
          },
        },
        scales: {
          x: {
            min: 0,
            max: 100,
            title: { display: true, text: "OPI %", color: "#727272" },
            grid: { color: "#f0f0f0", drawBorder: false },
          },
          y: {
            min: 0,
            max: 100,
            title: { display: true, text: "OHI %", color: "#727272" },
            grid: { color: "#f0f0f0", drawBorder: false },
          },
        },
      },
    });
  }
})();
