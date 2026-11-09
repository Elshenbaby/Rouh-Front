(function () {
  let scrollY = 0;

  const navIcons = new Map(Object.entries({
    home: "home", people: "people", icomm: "megaphone", events: "calendar",
    sd: "balance", "supply-demand": "balance", qs: "target", nes: "survey",
    ogv: "volunteer-out", igv: "volunteer-in", ogta: "talent-out", igta: "talent-in",
    ogte: "teach-out", igte: "teach-in", b2b: "business", bd: "partnership", b2c: "customer",
    lcp: "compass", presidency: "compass", tm: "talent", fin: "finance", finance: "finance",
    org: "structure", structure: "structure", join: "request", "join-requests": "request",
    activity: "history", logs: "history", audit: "history", analysis: "chart", od: "chart",
    settings: "settings",
  }));
  const navLabelIcons = new Map(Object.entries({
    "supply & demand": "balance", "fill the nes": "survey", talent: "talent",
    "join requests": "request",
  }));
  const sprite = new URL("../img/navigation-icons.svg", document.currentScript.src);
  const svgNamespace = "http://www.w3.org/2000/svg";

  document.querySelectorAll(".nav-link[href]").forEach(function (link) {
    const placeholder = link.querySelector(".nav-icon");
    if (!placeholder) return;
    const segments = new URL(link.href).pathname.replace(/\.html$/, "").split(/\/|__/).filter(Boolean);
    const name = link.getAttribute("aria-label") || link.textContent.trim();
    const label = name.toLowerCase();
    link.setAttribute("aria-label", name);
    const key = link.hash === "#not-in-preview"
      ? navLabelIcons.get(label) || navIcons.get(label)
      : navIcons.get(segments.at(-1)) || navLabelIcons.get(label) || navIcons.get(label) ||
        navIcons.get(segments.at(-2)) || (segments.length === 0 ? "home" : null);
    const icon = document.createElementNS(svgNamespace, "svg");
    const glyph = document.createElementNS(svgNamespace, "use");
    icon.setAttribute("class", "nav-icon has-icon");
    icon.setAttribute("width", "18");
    icon.setAttribute("height", "18");
    icon.setAttribute("aria-hidden", "true");
    icon.setAttribute("focusable", "false");
    glyph.setAttribute("href", sprite.href + "#" + (key || "page"));
    icon.append(glyph);
    placeholder.replaceWith(icon);
  });

  const sidebar = document.querySelector(".nav");
  const sidebarToggle = sidebar?.querySelector(".nav-collapse");
  if (sidebarToggle) {
    // Saved previews still contain the original Alpine sidebar bindings.
    sidebar.removeAttribute(":class");
    sidebarToggle.removeAttribute("@click");
    const oldBrand = sidebar.querySelector("div.nav-brand");
    const previewHome = sidebar.querySelector('.nav-link[href="home.html"]');
    if (oldBrand && previewHome) {
      const brand = document.createElement("a");
      brand.className = oldBrand.className;
      brand.href = previewHome.href;
      brand.setAttribute("aria-label", oldBrand.textContent.trim());
      brand.append(...oldBrand.childNodes);
      oldBrand.replaceWith(brand);
    }

    const storageKey = "rouh-sidebar-collapsed";
    const collapseText = sidebarToggle.firstElementChild?.textContent.trim() || sidebarToggle.textContent.trim();
    const collapseLabel = sidebarToggle.dataset.collapseLabel || "Collapse sidebar";
    const expandLabel = sidebarToggle.dataset.expandLabel || "Expand sidebar";
    const desktop = window.matchMedia("(min-width: 801px)");
    const hint = document.createElement("span");
    hint.className = "nav-label-hint";
    hint.hidden = true;
    hint.setAttribute("aria-hidden", "true");
    document.body.append(hint);

    function hideHint() {
      hint.hidden = true;
    }

    function setCollapsed(collapsed) {
      hideHint();
      sidebar.classList.toggle("is-collapsed", collapsed);
      sidebarToggle.textContent = collapsed ? "»" : collapseText;
      sidebarToggle.setAttribute("aria-label", collapsed ? expandLabel : collapseLabel);
    }

    let collapsed = false;
    try {
      collapsed = sessionStorage.getItem(storageKey) === "true";
    } catch {
      // The sidebar still works when browser storage is unavailable.
    }
    setCollapsed(collapsed);
    sidebar.classList.add("has-sidebar-toggle");
    sidebarToggle.addEventListener("click", function () {
      collapsed = !collapsed;
      setCollapsed(collapsed);
      try {
        sessionStorage.setItem(storageKey, String(collapsed));
      } catch {
        // Keep the current page's state even if it cannot be saved.
      }
    });

    sidebar.querySelectorAll("a.nav-brand, .nav-link, .nav-ws").forEach(function (link) {
      function showHint() {
        if (!desktop.matches || !collapsed) return;
        const bounds = link.getBoundingClientRect();
        hint.textContent = link.getAttribute("aria-label");
        hint.style.left = sidebar.getBoundingClientRect().right + 6 + "px";
        hint.style.top = bounds.top + bounds.height / 2 + "px";
        hint.hidden = false;
      }

      link.addEventListener("pointerenter", showHint);
      link.addEventListener("pointerleave", hideHint);
      link.addEventListener("focus", function () {
        if (link.matches(":focus-visible")) showHint();
      });
      link.addEventListener("blur", hideHint);
    });
    window.addEventListener("scroll", hideHint, { capture: true, passive: true });
    window.addEventListener("resize", hideHint);
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") hideHint();
    });
  }

  const navToggle = document.querySelector(".nav-menu-toggle");
  if (navToggle) {
    const nav = navToggle.closest(".nav");
    nav.classList.add("has-menu-toggle");
    navToggle.addEventListener("click", function () {
      const open = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("is-menu-open", !open);
    });
    nav.addEventListener("keydown", function (event) {
      if (event.key !== "Escape" || !navToggle.offsetWidth ||
          navToggle.getAttribute("aria-expanded") !== "true") return;
      event.preventDefault();
      navToggle.click();
      navToggle.focus();
    });
  }

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
