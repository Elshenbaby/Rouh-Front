/* BD cash-in approvals: select several and approve them together. */
(() => {
  const all = document.querySelector("[data-cr-all]");
  const picks = [...document.querySelectorAll("[data-cr-pick]")];
  const bulk = document.querySelector("[data-cr-bulk]");
  if (!all || !bulk) return;
  const sync = () => {
    const n = picks.filter((p) => p.checked).length;
    bulk.disabled = n === 0;
    bulk.textContent = n ? `Approve ${n} selected` : "Approve selected";
    all.checked = n === picks.length;
    all.indeterminate = n > 0 && n < picks.length;
  };
  all.addEventListener("change", () => { picks.forEach((p) => { p.checked = all.checked; }); sync(); });
  picks.forEach((p) => p.addEventListener("change", sync));
  bulk.closest("form").addEventListener("submit", (e) => {
    const n = picks.filter((p) => p.checked).length;
    if (!confirm(`Approve ${n} cash-in${n === 1 ? "" : "s"}? They will count for the ranking and ICOMM.`)) e.preventDefault();
  });
})();
