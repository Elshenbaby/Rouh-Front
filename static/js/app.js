(function () {
  let scrollY = 0;

  document.addEventListener("htmx:beforeSwap", function () {
    scrollY = window.scrollY;
  });

  function restoreScroll() {
    window.scrollTo(0, scrollY);
  }

  document.addEventListener("htmx:afterSwap", restoreScroll);
  document.addEventListener("htmx:afterSettle", restoreScroll);

  function sortableRoot(node) {
    return node && node.closest ? node.closest("[data-sortable]") : null;
  }

  document.addEventListener("dragstart", function (event) {
    const card = event.target.closest("[data-kanban-card][draggable='true']");
    if (card && event.dataTransfer) {
      const board = card.closest("[data-kanban]");
      if (!board) return;
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", card.dataset.member || "");
      card.classList.add("is-dragging");
      board._dragCard = card;
      board._fromCol = card.closest("[data-kanban-col]");
      return;
    }
    const row = event.target.closest("[data-sortable] [draggable='true']");
    const root = sortableRoot(row);
    if (!root || !row || !event.dataTransfer) return;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", row.dataset.id || "");
    row.classList.add("is-dragging");
    root._dragRow = row;
  });

  document.addEventListener("dragover", function (event) {
    const board = event.target.closest("[data-kanban]");
    if (board && board._dragCard) {
      event.preventDefault();
      const col = event.target.closest("[data-kanban-col]");
      board.querySelectorAll("[data-kanban-col].is-drop").forEach(function (node) {
        node.classList.remove("is-drop");
      });
      if (col) col.classList.add("is-drop");
      if (!col) return;
      const over = event.target.closest("[data-kanban-card]");
      const empty = col.querySelector(".tm-board-empty");
      if (empty) empty.remove();
      if (over && over !== board._dragCard && over.parentElement === col) {
        const rect = over.getBoundingClientRect();
        const before = event.clientY < rect.top + rect.height / 2;
        col.insertBefore(board._dragCard, before ? over : over.nextSibling);
      } else if (!over) {
        col.appendChild(board._dragCard);
      }
      return;
    }

    const root = sortableRoot(event.target);
    if (!root || !root._dragRow) return;
    event.preventDefault();
    const over = event.target.closest("[draggable='true']");
    if (!over || over === root._dragRow || over.parentElement !== root._dragRow.parentElement) return;
    const rect = over.getBoundingClientRect();
    const before = event.clientY < rect.top + rect.height / 2;
    over.parentElement.insertBefore(root._dragRow, before ? over : over.nextSibling);
  });

  document.addEventListener("drop", function (event) {
    if (event.target.closest("[data-kanban]") || sortableRoot(event.target)) {
      event.preventDefault();
    }
  });

  document.addEventListener("dragend", function (event) {
    const card = event.target.closest("[data-kanban-card]");
    if (card) card.classList.remove("is-dragging");
    document.querySelectorAll("[data-kanban]").forEach(function (board) {
      board.querySelectorAll("[data-kanban-col].is-drop").forEach(function (node) {
        node.classList.remove("is-drop");
      });
      const dragged = board._dragCard;
      if (!dragged) return;
      dragged.classList.remove("is-dragging");
      const col = dragged.closest("[data-kanban-col]");
      const from = board._fromCol;
      board._dragCard = null;
      board._fromCol = null;
      if (!col || !from) return;
      if (col === from && col.dataset.step === from.dataset.step) return;
      const url = board.getAttribute("data-kanban-url");
      if (!url || typeof htmx === "undefined") return;
      if (col.dataset.ends === "1") {
        const edit = dragged.dataset.editUrl;
        if (edit) {
          window.location = edit + (edit.indexOf("?") >= 0 ? "&" : "?") + "step=" + encodeURIComponent(col.dataset.step);
        }
        return;
      }
      htmx.ajax("POST", url, {
        target: board.getAttribute("data-kanban-target") || "#tm-hr-board",
        swap: board.getAttribute("data-kanban-swap") || "outerHTML show:none focus-scroll:false",
        values: { member: dragged.dataset.member, step: col.dataset.step },
      });
    });

    document.querySelectorAll("[data-sortable]").forEach(function (root) {
      if (!root._dragRow) return;
      root._dragRow.classList.remove("is-dragging");
      const url = root.getAttribute("data-sortable-url");
      const ids = Array.from(root.querySelectorAll("[draggable='true']"))
        .map(function (el) {
          return el.dataset.id;
        })
        .filter(Boolean);
      root._dragRow = null;
      if (!url || typeof htmx === "undefined" || !ids.length) return;
      htmx.ajax("POST", url, {
        target: root.getAttribute("data-sortable-target") || root,
        swap: root.getAttribute("data-sortable-swap") || "none",
        values: { intent: "reorder", order: ids.join(",") },
      });
    });
  });
})();
