(() => {
  window.visitCalendar = function visitCalendar() {
    const root = document.querySelector(".visit-cal");
    return {
      selected: (root && root.dataset.selected) || (root && root.dataset.today) || "",
      openDay(iso) {
        this.selected = iso;
        if (!window.matchMedia("(max-width: 800px)").matches) return;
        const agenda = document.querySelector(`[data-agenda-day="${iso}"]`);
        const target = agenda || document.querySelector(`[data-day="${iso}"]`);
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      },
    };
  };
})();
