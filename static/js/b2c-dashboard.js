(() => {
  const payloadEl = document.getElementById("b2c-dashboard-charts");
  if (!payloadEl || typeof Chart === "undefined") return;

  let data;
  try {
    data = JSON.parse(payloadEl.textContent);
  } catch (_err) {
    return;
  }

  const INK = "#000000";
  const MUTED = "#727272";
  const GRID = "#ebebeb";
  const FONT = { family: "Poppins, system-ui, sans-serif", size: 11 };

  Chart.defaults.font.family = FONT.family;
  Chart.defaults.color = MUTED;

  const axis = (opts = {}) => ({
    grid: { color: GRID, drawBorder: false },
    border: { display: false },
    ticks: { font: FONT, color: MUTED, precision: 0 },
    ...opts,
  });

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
    if (!canvas) return;
    const labels = config.data?.labels || [];
    const datasets = config.data?.datasets || [];
    const hasValues = datasets.some((set) => (set.data || []).some((n) => Number(n) > 0));
    if (!labels.length || !hasValues) {
      const empty = canvas.parentElement?.querySelector(".chart-empty");
      if (empty) empty.hidden = false;
      canvas.hidden = true;
      return;
    }
    new Chart(canvas, config);
  }

  // Overall funnel — SU → APP → ACC → APD.
  if (data.overall_funnel) {
    paint("chart-overall-funnel", {
      type: "bar",
      data: {
        labels: data.overall_funnel.labels,
        datasets: [
          {
            data: data.overall_funnel.values,
            backgroundColor: ["#d84d2b", "#05047e", "#037ef3", "#004f32"],
            borderWidth: 0,
            barPercentage: 0.6,
          },
        ],
      },
      options: {
        ...baseOptions,
        scales: { x: axis({ grid: { display: false } }), y: axis({ beginAtZero: true }) },
      },
    });
  }

  // Signups by month — trend line with APP/APD alongside.
  if (data.months) {
    paint("chart-months", {
      type: "line",
      data: {
        labels: data.months.labels,
        datasets: [
          {
            label: "SUs",
            data: data.months.su,
            borderColor: "#d84d2b",
            backgroundColor: "rgba(216,77,43,0.12)",
            fill: true,
            tension: 0.3,
            pointRadius: 3,
          },
          {
            label: "APPs",
            data: data.months.app,
            borderColor: "#05047e",
            backgroundColor: "transparent",
            tension: 0.3,
            pointRadius: 3,
          },
          {
            label: "APDs",
            data: data.months.apd,
            borderColor: "#004f32",
            backgroundColor: "transparent",
            tension: 0.3,
            pointRadius: 3,
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
        scales: { x: axis({ grid: { display: false } }), y: axis({ beginAtZero: true }) },
      },
    });
  }

  // Signups per campaign — horizontal ranking.
  if (data.campaigns) {
    paint("chart-campaigns", {
      type: "bar",
      data: {
        labels: data.campaigns.labels,
        datasets: [
          { label: "SUs", data: data.campaigns.su, backgroundColor: "#d84d2b", borderWidth: 0 },
          { label: "APPs", data: data.campaigns.app, backgroundColor: "#05047e", borderWidth: 0 },
          { label: "APDs", data: data.campaigns.apd, backgroundColor: "#004f32", borderWidth: 0 },
        ],
      },
      options: {
        ...baseOptions,
        indexAxis: "y",
        plugins: {
          ...baseOptions.plugins,
          legend: { display: true, position: "bottom", labels: { boxWidth: 12, font: FONT } },
          tooltip: { ...baseOptions.plugins.tooltip, displayColors: true },
        },
        scales: { x: axis({ beginAtZero: true }), y: axis({ grid: { display: false } }) },
      },
    });
  }

  // Interviews completed per member.
  if (data.member_interviews) {
    paint("chart-member-interviews", {
      type: "bar",
      data: {
        labels: data.member_interviews.labels,
        datasets: [
          {
            label: "Completed",
            data: data.member_interviews.completed,
            backgroundColor: "#004f32",
            borderWidth: 0,
            barPercentage: 0.7,
          },
        ],
      },
      options: {
        ...baseOptions,
        indexAxis: "y",
        scales: { x: axis({ beginAtZero: true }), y: axis({ grid: { display: false } }) },
      },
    });
  }

  // The OGX charts plot signup volume next to the contact rate: contacting is often near
  // zero, and a lone rate series would just render as a flat, empty frame.
  const UNCONTACTED = "#d8d8e4";
  const legend = { display: true, position: "bottom", labels: { font: FONT, color: MUTED, boxWidth: 10 } };
  const contactTooltip = (block) => ({
    ...baseOptions.plugins.tooltip,
    callbacks: {
      afterBody: (items) => {
        const i = items[0]?.dataIndex ?? 0;
        return `${block.contacted?.[i] ?? 0} of ${block.su?.[i] ?? 0} contacted · ${block.contact_rate?.[i] ?? 0}%`;
      },
    },
  });
  const pctAxis = (opts = {}) =>
    axis({
      beginAtZero: true,
      max: 100,
      ticks: { font: FONT, color: MUTED, callback: (v) => `${v}%` },
      ...opts,
    });

  // Contacted vs not contacted per campaign — the filled share is the contact rate.
  if (data.ogx?.campaign_contact) {
    const block = data.ogx.campaign_contact;
    paint("chart-ogx-campaign-contact", {
      type: "bar",
      data: {
        labels: block.labels,
        datasets: [
          { label: "Contacted", data: block.contacted, backgroundColor: "#05047e", borderWidth: 0 },
          { label: "Not contacted", data: block.not_contacted, backgroundColor: UNCONTACTED, borderWidth: 0 },
        ],
      },
      options: {
        ...baseOptions,
        indexAxis: "y",
        plugins: { ...baseOptions.plugins, legend, tooltip: contactTooltip(block) },
        scales: {
          x: axis({ stacked: true, beginAtZero: true }),
          y: axis({ stacked: true, grid: { display: false } }),
        },
      },
    });
  }

  // Signups per month as bars, contact rate as a line on its own axis.
  if (data.ogx?.monthly_contact) {
    const block = data.ogx.monthly_contact;
    paint("chart-ogx-monthly-contact", {
      type: "bar",
      data: {
        labels: block.labels,
        datasets: [
          { label: "Signups", data: block.su, backgroundColor: UNCONTACTED, borderWidth: 0, order: 2 },
          {
            type: "line",
            label: "Contact rate %",
            data: block.contact_rate,
            borderColor: "#05047e",
            backgroundColor: "#05047e",
            tension: 0.3,
            pointRadius: 3,
            yAxisID: "y1",
            order: 1,
          },
        ],
      },
      options: {
        ...baseOptions,
        interaction: { mode: "index", intersect: false },
        plugins: { ...baseOptions.plugins, legend, tooltip: contactTooltip(block) },
        scales: {
          x: axis({ grid: { display: false } }),
          y: axis({ beginAtZero: true }),
          y1: pctAxis({ position: "right", grid: { display: false } }),
        },
      },
    });
  }

  // Back to process — small share view of the interview verdict.
  if (data.ci_return) {
    paint("chart-ci-return", {
      type: "doughnut",
      data: {
        labels: data.ci_return.labels,
        datasets: [
          {
            data: data.ci_return.values,
            backgroundColor: ["#004f32", "#d84d2b", "#727272"],
            borderColor: "#ffffff",
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "58%",
        plugins: {
          legend: { position: "bottom", labels: { boxWidth: 12, font: FONT } },
          tooltip: { backgroundColor: INK, padding: 10, cornerRadius: 0 },
        },
      },
    });
  }
})();
