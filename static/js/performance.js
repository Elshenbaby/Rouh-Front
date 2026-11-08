/* Function analysis · Performance: the chosen stage week by week (or month by month), from EXPA. */
(() => {
  // EXPA can take a few seconds for new days: show that the page is working on it.
  const busy = () => document.body.classList.add("pf-loading");
  document.querySelectorAll(".pf-chip[href], .pf-step, .pf-lcs a").forEach((a) => a.addEventListener("click", busy));
  document.querySelectorAll(".pf-custom, .pf-lc").forEach((f) => f.addEventListener("submit", busy));
  window.addEventListener("pageshow", () => document.body.classList.remove("pf-loading"));
})();

(() => {
  const node = document.getElementById("pf-data");
  const el = document.querySelector('[data-pf-chart="trend"]');
  if (!node || !el || typeof echarts === "undefined") return;
  const DATA = JSON.parse(node.textContent);
  const INK = "#000000";
  const MUTED = "#727272";
  const GRID = "#ebebeb";
  const PRIMARY = "#d84d2b";
  const FONT = "Poppins, system-ui, sans-serif";
  const labels = {};
  document.querySelectorAll("[data-pf-trend-picks] [data-stage]").forEach((b) => { labels[b.dataset.stage] = b.textContent.trim(); });
  const chart = echarts.init(el, null, { renderer: "canvas" });

  function draw(stage) {
    const values = DATA.series[stage] || [];
    const total = values.reduce((sum, v) => sum + (v || 0), 0);
    chart.setOption({
      textStyle: { fontFamily: FONT, color: INK },
      animationDuration: 400,
      grid: { left: 8, right: 8, top: 24, bottom: 8, containLabel: true },
      tooltip: {
        trigger: "axis",
        backgroundColor: INK,
        borderWidth: 0,
        textStyle: { color: "#fff", fontFamily: FONT, fontSize: 12 },
        formatter: (items) => {
          const v = items[0].value;
          const share = total && v ? ` · ${Math.round((v / total) * 100)}% of the period` : "";
          return `<b>${items[0].axisValue}</b><br>${labels[stage] || stage}: ${v === null || v === undefined ? "no answer from EXPA" : v.toLocaleString("en-US")}${share}`;
        },
      },
      xAxis: { type: "category", data: DATA.labels, axisLine: { lineStyle: { color: GRID } }, axisTick: { show: false }, axisLabel: { color: MUTED, fontSize: 11 } },
      yAxis: { type: "value", minInterval: 1, splitLine: { lineStyle: { color: GRID } }, axisLabel: { color: MUTED, fontSize: 11 } },
      series: [{
        type: "bar",
        barMaxWidth: 40,
        data: values,
        itemStyle: { color: PRIMARY },
        label: { show: values.length <= 16, position: "top", color: INK, fontSize: 11, formatter: (p) => (p.value ? p.value.toLocaleString("en-US") : "") },
      }],
    }, true);
  }

  document.querySelectorAll("[data-pf-trend-picks] [data-stage]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-pf-trend-picks] [data-stage]").forEach((b) => b.classList.toggle("is-active", b === button));
      draw(button.dataset.stage);
    });
  });
  draw(DATA.stage);
  window.addEventListener("resize", () => chart.resize());
})();
