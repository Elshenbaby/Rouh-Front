/* RCR tool: the daily activity chart (new leads a day as bars, lead steps logged as a line, one count axis). */
(() => {
  const node = document.getElementById("rcr-data");
  if (!node || typeof echarts === "undefined") return;
  const DATA = JSON.parse(node.textContent);
  const INK = "#000000";
  const MUTED = "#727272";
  const GRID = "#efefef";
  const LEADS = "#d84d2b";
  const FONT = "Poppins, system-ui, sans-serif";
  const fmt = (n) => (n === null || n === undefined ? "—" : Number(n).toLocaleString("en-US"));
  const charts = [];

  const el = document.querySelector('[data-rcr-chart="daily"]');
  if (el && DATA.daily) {
    const days = DATA.daily.map((d) => d.day);
    const label = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    const chart = echarts.init(el, null, { renderer: "canvas" });
    charts.push(chart);
    chart.setOption({
      textStyle: { fontFamily: FONT, color: INK },
      animationDuration: 400,
      grid: { left: 36, right: 12, top: 34, bottom: 28 },
      legend: { top: 0, left: 0, itemWidth: 10, itemHeight: 10, itemGap: 14, icon: "roundRect", textStyle: { color: MUTED, fontSize: 11 } },
      tooltip: {
        trigger: "axis", axisPointer: { type: "line", lineStyle: { color: MUTED } },
        backgroundColor: INK, borderWidth: 0, padding: [8, 10], textStyle: { color: "#fff", fontFamily: FONT, fontSize: 12 },
        formatter: (items) => `<b>${label(days[items[0].dataIndex])}</b><br>` + items.map((i) => `${i.marker}${i.seriesName}: <b>${fmt(i.value)}</b>`).join("<br>"),
      },
      xAxis: {
        type: "category", data: days, axisTick: { show: false }, axisLine: { lineStyle: { color: GRID } },
        axisLabel: { color: MUTED, fontSize: 11, formatter: label, interval: Math.max(0, Math.floor(days.length / 8) - 1) },
      },
      yAxis: { type: "value", minInterval: 1, splitLine: { lineStyle: { color: GRID } }, axisLabel: { color: MUTED, fontSize: 11 } },
      series: [
        { name: "New leads", type: "bar", data: DATA.daily.map((d) => d.leads), barMaxWidth: 14, itemStyle: { color: LEADS, borderRadius: [4, 4, 0, 0] } },
        { name: "Lead steps logged", type: "line", data: DATA.daily.map((d) => d.moved), symbol: "circle", symbolSize: 8, lineStyle: { width: 2, color: INK }, itemStyle: { color: INK, borderColor: "#fff", borderWidth: 2 } },
      ],
    });
  }
  window.addEventListener("resize", () => charts.forEach((c) => c.resize()));
})();
