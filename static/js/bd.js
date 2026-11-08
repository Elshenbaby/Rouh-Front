/* BD dashboard: approved cash-ins by month against the BD plan. */
(() => {
  const node = document.getElementById("bd-data");
  const el = document.querySelector('[data-bd-chart="months"]');
  if (!node || !el || typeof echarts === "undefined") return;
  const DATA = JSON.parse(node.textContent);
  const INK = "#000000";
  const MUTED = "#727272";
  const GRID = "#ebebeb";
  const PRIMARY = "#d84d2b";
  const FADED = "#f2c4b8";
  const FONT = "Poppins, system-ui, sans-serif";
  const inPeriod = new Set(DATA.period);
  const money = (n) => (n === null || n === undefined ? "—" : `EGP ${Math.round(n).toLocaleString("en-US")}`);
  const short = (n) => (n >= 1e6 ? `${(n / 1e6).toFixed(n >= 1e7 ? 0 : 1)}M` : n >= 1e3 ? `${Math.round(n / 1e3)}k` : `${n}`);

  const chart = echarts.init(el, null, { renderer: "canvas" });
  chart.setOption({
    textStyle: { fontFamily: FONT, color: INK },
    animationDuration: 500,
    grid: { left: 8, right: 8, top: 36, bottom: 8, containLabel: true },
    legend: { top: 0, left: 0, itemWidth: 12, itemHeight: 8, textStyle: { color: MUTED, fontSize: 12 }, data: ["Collected", "Plan"] },
    tooltip: {
      trigger: "axis",
      backgroundColor: INK,
      borderWidth: 0,
      textStyle: { color: "#fff", fontFamily: FONT, fontSize: 12 },
      formatter: (items) => {
        const i = items[0].dataIndex;
        const got = DATA.collected[i];
        const plan = DATA.plan[i];
        const pct = plan && got !== null ? ` · ${Math.round((got / plan) * 100)}% of plan` : "";
        return `<b>${DATA.months[i]}</b><br>Collected: ${got === null ? "not yet" : money(got)}${pct}<br>Plan: ${money(plan)}`;
      },
    },
    xAxis: {
      type: "category",
      data: DATA.months,
      axisLine: { lineStyle: { color: GRID } },
      axisTick: { show: false },
      axisLabel: { color: (v, i) => (inPeriod.has(i) ? INK : MUTED), fontSize: 11, fontWeight: (v, i) => (inPeriod.has(i) ? 600 : 400) },
    },
    yAxis: {
      type: "value",
      splitLine: { lineStyle: { color: GRID } },
      axisLabel: { color: MUTED, fontSize: 11, formatter: short },
    },
    series: [
      {
        name: "Collected",
        type: "bar",
        itemStyle: { color: PRIMARY },
        barMaxWidth: 34,
        data: DATA.collected.map((v, i) => ({ value: v, itemStyle: { color: inPeriod.has(i) ? PRIMARY : FADED } })),
        label: { show: true, position: "top", color: INK, fontSize: 10, formatter: (p) => (p.value ? short(p.value) : "") },
      },
      {
        name: "Plan",
        type: "line",
        data: DATA.plan,
        symbol: "circle",
        symbolSize: 6,
        lineStyle: { color: INK, width: 1.5, type: "dashed" },
        itemStyle: { color: INK },
      },
    ],
  });
  window.addEventListener("resize", () => chart.resize());
})();
