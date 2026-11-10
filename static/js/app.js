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
    const placeholder = link.querySelector("span.nav-icon");
    if (!placeholder) return;
    const segments = new URL(link.href).pathname.replace(/\.html$/, "").split(/\/|__/).filter(Boolean);
    const name = link.getAttribute("aria-label") || link.textContent.trim();
    const label = name.toLowerCase();
    link.setAttribute("aria-label", name);
    if (link.classList.contains("is-active")) link.setAttribute("aria-current", "page");
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
      brand.href = new URL("landing.html", previewHome.href).href;
      brand.setAttribute("aria-label", oldBrand.textContent.trim());
      brand.append(...oldBrand.childNodes);
      const header = document.createElement("div");
      header.className = "nav-header";
      const panel = document.createElement("div");
      panel.className = "nav-panel";
      panel.id = "rouh-nav-panel";
      const menu = document.createElement("button");
      menu.type = "button";
      menu.className = "nav-menu-toggle";
      menu.textContent = "Menu";
      menu.setAttribute("aria-expanded", "false");
      menu.setAttribute("aria-controls", panel.id);
      header.append(brand, menu);
      panel.append(...sidebar.querySelectorAll(".nav-workspace, .nav-list, .nav-feedback"));
      oldBrand.replaceWith(header, panel);

      const main = sidebar.closest(".app").querySelector("main");
      if (main && !main.id) {
        main.id = "main-content";
        main.tabIndex = -1;
        const skip = document.createElement("a");
        skip.className = "skip-link";
        skip.href = "#main-content";
        skip.textContent = "Skip to main content";
        sidebar.closest(".app").before(skip);
      }
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

  function readQueueState(key) {
    try {
      return JSON.parse(sessionStorage.getItem(key));
    } catch {
      return null;
    }
  }

  function saveQueueState(key, value) {
    try {
      if (value) sessionStorage.setItem(key, JSON.stringify(value));
      else sessionStorage.removeItem(key);
    } catch {
      // Ordinary navigation still works without browser storage.
    }
  }

  const queuePrefix = "rouh-queue:";
  const queueRestoreKey = queuePrefix + "restore";
  function queueSteps(queue, onlyFollowup, partnerGroup) {
    const steps = new Map();
    queue.querySelectorAll("[data-queue-step-url]").forEach(function (link) {
      if (onlyFollowup && !link.hasAttribute("data-queue-no-contact")) return;
      const row = link.closest("tr");
      if (partnerGroup && row?.querySelector("[data-action-group]")?.dataset.actionGroup !== partnerGroup) return;
      const record = link.dataset.queueRecord;
      const url = new URL(link.dataset.queueStepUrl, location.href);
      if (!record || url.origin !== location.origin || url.hash === "#not-in-preview") return;
      if (!steps.has(record)) {
        const date = partnerGroup === "visits" ? row.querySelector("time[datetime]")?.dateTime : "";
        steps.set(record, { record, url: url.href, date: date || "" });
      }
    });
    const ordered = Array.from(steps.values());
    return partnerGroup === "visits" ? ordered.sort((a, b) => a.date.localeCompare(b.date)) : ordered;
  }

  function initializeFollowup(root) {
    const summaries = root.matches?.("[data-followup-summary]") ? [root] : root.querySelectorAll("[data-followup-summary]");
    summaries.forEach(function (summary) {
      const queue = summary.closest('[data-queue-context="exchange"]');
      if (!queue) return;
      const steps = queueSteps(queue, true);
      const count = summary.querySelector("[data-followup-count]");
      const start = summary.querySelector("[data-followup-start]");
      count.textContent = steps.length ? count.dataset.countTemplate.replace("__count__", steps.length) : count.dataset.empty;
      if (steps.length) {
        start.href = steps[0].url;
        start.dataset.queueRecord = steps[0].record;
      }
      start.hidden = !steps.length;
      summary.hidden = false;
    });
  }
  initializeFollowup(document);
  document.addEventListener("htmx:load", event => initializeFollowup(event.detail.elt));

  function initializePartnerQueues(root) {
    const selector = "[data-partner-queue-actions]";
    const panels = root.matches?.(selector) ? [root] : root.querySelectorAll(selector);
    panels.forEach(function (panel) {
      const queue = panel.closest("[data-queue-context]");
      if (!queue) return;
      let hasActions = false;
      panel.querySelectorAll("[data-partner-start]").forEach(function (start) {
        const group = start.dataset.partnerStart;
        const steps = queueSteps(queue, false, group);
        const count = panel.querySelector(`[data-partner-count="${group}"]`);
        count.textContent = count.dataset.countTemplate.replace("__count__", steps.length);
        start.hidden = !steps.length;
        if (steps.length) {
          hasActions = true;
          start.href = steps[0].url;
          start.dataset.queueRecord = steps[0].record;
        }
      });
      panel.hidden = !hasActions;
    });
  }
  initializePartnerQueues(document);
  document.addEventListener("htmx:load", event => initializePartnerQueues(event.detail.elt));

  document.addEventListener("click", function (event) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey ||
        event.shiftKey || event.altKey) return;
    const link = event.target.closest("a[data-queue-record]");
    if (!link || link.target && link.target !== "_self" ||
        link.origin !== location.origin || link.getAttribute("href") === "#not-in-preview") return;
    if (link.hasAttribute("data-queue-next")) {
      if (link.getAttribute("aria-disabled") === "true") {
        event.preventDefault();
        return;
      }
      const key = queuePrefix + link.dataset.queueFamily;
      const state = readQueueState(key);
      if (state?.steps?.some(step => step.record === link.dataset.queueRecord && step.url === link.href)) {
        state.record = link.dataset.queueRecord;
        saveQueueState(key, state);
      }
      return;
    }
    if (link.dataset.queueBack) {
      const state = readQueueState(queuePrefix + link.dataset.queueBack);
      if (state?.record === link.dataset.queueRecord && state.url === link.href) {
        saveQueueState(queueRestoreKey, state);
      }
      return;
    }
    const queue = link.closest("[data-queue-context]");
    if (!queue) return;
    saveQueueState(queuePrefix + queue.dataset.queueContext, {
      record: link.dataset.queueRecord,
      url: location.href,
      scrollY: window.scrollY,
      tableX: queue.querySelector(".table-wrap")?.scrollLeft || 0,
      steps: queueSteps(queue, link.hasAttribute("data-followup-start"), link.dataset.partnerStart),
    });
  });

  document.querySelectorAll("a[data-queue-back]").forEach(function (link) {
    const state = readQueueState(queuePrefix + link.dataset.queueBack);
    if (!state || state.record !== link.dataset.queueRecord ||
        typeof state.url !== "string" || !state.url.startsWith(location.origin + "/")) return;
    link.href = state.url;
    link.textContent = link.dataset.queueReturnLabel || "Back to queue";
    if (!Array.isArray(state.steps)) return;
    const index = state.steps.findIndex(step => step.record === state.record);
    if (index < 0) return;
    const next = state.steps[index + 1];
    document.querySelectorAll("[data-queue-step]").forEach(function (panel) {
      const position = panel.querySelector("[data-queue-position]");
      position.textContent = position.dataset.positionTemplate
        .replace("__current__", index + 1)
        .replace("__total__", state.steps.length);
      const nextLink = panel.querySelector("[data-queue-next]");
      if (next && typeof next.url === "string" && next.url.startsWith(location.origin + "/")) {
        nextLink.href = next.url;
        nextLink.dataset.queueRecord = next.record;
        nextLink.dataset.queueFamily = link.dataset.queueBack;
        nextLink.hidden = false;
      } else {
        panel.querySelector("[data-queue-end]").hidden = false;
      }
      panel.hidden = false;
    });
  });

  window.addEventListener("pageshow", function () {
    const state = readQueueState(queueRestoreKey);
    if (!state || state.url !== location.href) return;
    const table = document.querySelector("[data-queue-context] .table-wrap");
    saveQueueState(queueRestoreKey, null);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (table) table.scrollLeft = state.tableX;
      window.scrollTo(0, state.scrollY);
    }));
  });

  function showAutosave(form, state) {
    const feedback = form.querySelector("[data-save-feedback]");
    if (!feedback) return;
    feedback.dataset.state = state;
    feedback.querySelector("[data-save-message]").textContent = feedback.dataset[state];
    const retry = feedback.querySelector("[data-save-retry]");
    retry.hidden = state !== "failed";
    retry.disabled = state === "saving";
    const saving = !!document.querySelector('[data-save-feedback][data-state="saving"]');
    document.querySelectorAll("[data-queue-next]:not([hidden])").forEach(function (next) {
      next.setAttribute("aria-disabled", String(saving));
    });
  }

  document.addEventListener("htmx:beforeRequest", function (event) {
    const form = event.detail.elt;
    if (form.matches("[data-autosave]") && !form.hasAttribute("data-preview-autosave")) {
      showAutosave(form, "saving");
    }
  });
  document.addEventListener("htmx:afterRequest", function (event) {
    const { elt: form, successful, xhr } = event.detail;
    if (!form.matches("[data-autosave]") || form.hasAttribute("data-preview-autosave")) return;
    const error = xhr.responseText.includes("data-autosave-error");
    if (!successful || error) showAutosave(form, "failed");
    else showAutosave(form, xhr.getResponseHeader("X-Rouh-Save-State") === "saved" ? "saved" : "received");
  });

  const draftForms = Array.from(document.querySelectorAll("[data-protect-draft]"));
  const dirtyForms = new Set();
  function warnAboutDrafts(event) {
    event.preventDefault();
    event.returnValue = true;
  }
  function syncDraftWarning() {
    if (dirtyForms.size) window.addEventListener("beforeunload", warnAboutDrafts);
    else window.removeEventListener("beforeunload", warnAboutDrafts);
  }
  draftForms.forEach(function (form) {
    const signature = () => JSON.stringify(Array.from(new FormData(form)));
    let baseline = signature();
    function detectChanges() {
      if (signature() === baseline) dirtyForms.delete(form);
      else dirtyForms.add(form);
      syncDraftWarning();
    }
    form.addEventListener("input", detectChanges);
    form.addEventListener("change", detectChanges);
    form.addEventListener("submit", function (event) {
      if (event.defaultPrevented || form.hasAttribute("data-preview-draft")) return;
      dirtyForms.delete(form);
      syncDraftWarning();
    });
    form.addEventListener("rouh:previewSubmit", function () {
      baseline = signature();
      detectChanges();
    });
  });

  const bulkForms = new WeakSet();
  function initializeBulkForms(root) {
    const forms = root.matches?.("[data-bulk-form]") ? [root] : root.querySelectorAll("[data-bulk-form]");
    forms.forEach(function (form) {
      if (bulkForms.has(form)) return;
      const toolbar = form.querySelector("[data-bulk-toolbar]");
      const selectAll = form.querySelector("[data-bulk-all]");
      if (!toolbar || !selectAll) return;
      bulkForms.add(form);

      const rows = Array.from(form.querySelectorAll("[data-bulk-row]:enabled"));
      const count = toolbar.querySelector("[data-bulk-count]");
      const clear = toolbar.querySelector("[data-bulk-clear]");
      const selectPage = toolbar.querySelector("[data-bulk-select]");
      const actions = toolbar.querySelector("[data-bulk-actions]");
      toolbar.hidden = rows.length === 0;
      selectAll.disabled = rows.length === 0;

      function updateSelection() {
        const checked = rows.filter(row => row.checked);
        count.textContent = new Set(checked.map(row => row.value)).size;
        selectAll.checked = rows.length > 0 && checked.length === rows.length;
        selectAll.indeterminate = checked.length > 0 && !selectAll.checked;
        actions.disabled = clear.disabled = checked.length === 0;
        selectPage.disabled = selectAll.checked;
      }

      function selectRows(checked) {
        rows.forEach(row => { row.checked = checked; });
        updateSelection();
      }

      selectAll.addEventListener("change", () => selectRows(selectAll.checked));
      selectPage.addEventListener("click", function () {
        selectRows(true);
        clear.focus();
      });
      clear.addEventListener("click", function () {
        selectRows(false);
        selectPage.focus();
      });
      form.addEventListener("change", function (event) {
        const row = event.target;
        if (!row.matches("[data-bulk-row]")) return;
        // APD rows can point to the same person. The action assigns that person once.
        rows.filter(other => other.value === row.value).forEach(other => { other.checked = row.checked; });
        updateSelection();
      });
      form.addEventListener("submit", function (event) {
        if (!rows.some(row => row.checked)) event.preventDefault();
      });
      form.addEventListener("formdata", function (event) {
        if (!rows.length) return;
        const name = rows[0].name;
        const ids = new Set(event.formData.getAll(name));
        event.formData.delete(name);
        ids.forEach(id => event.formData.append(name, id));
      });
      updateSelection();
    });
  }

  initializeBulkForms(document);
  document.addEventListener("htmx:load", event => initializeBulkForms(event.detail.elt));

  const scrollTables = new WeakMap();
  const tableObserver = new ResizeObserver(function (entries) {
    for (const { target } of entries) {
      const overflows = target.scrollWidth > target.clientWidth + 1;
      const hint = scrollTables.get(target);
      if (!hint && !overflows) continue;
      if (!hint) {
        const message = document.createElement("p");
        message.className = "table-scroll-hint";
        message.textContent = document.body.dataset.scrollTableHint || "Scroll sideways to see more columns.";
        target.before(message);
        scrollTables.set(target, message);
      } else {
        hint.hidden = !overflows;
      }
      if (overflows) {
        target.tabIndex = 0;
        target.setAttribute("role", "region");
        target.setAttribute("aria-label", document.body.dataset.scrollTableLabel || "Scrollable table");
      } else {
        target.removeAttribute("tabindex");
        target.removeAttribute("role");
        target.removeAttribute("aria-label");
      }
    }
  });

  function observeTables(root) {
    const tables = root.matches?.(".table-wrap") ? [root] : root.querySelectorAll(".table-wrap");
    tables.forEach(function (table) {
      if (table.closest("main") && !table.matches("[tabindex], [role], [aria-label]")) {
        tableObserver.observe(table);
      }
    });
  }
  observeTables(document);
  document.addEventListener("htmx:load", event => observeTables(event.detail.elt));
  document.addEventListener("htmx:beforeCleanupElement", function (event) {
    if (!event.detail.elt.matches(".table-wrap")) return;
    tableObserver.unobserve(event.detail.elt);
    scrollTables.get(event.detail.elt)?.remove();
  });

  document.addEventListener("alpine:init", function () {
    Alpine.data("attendanceSelection", () => ({
      selected: [],
      state: "",
      applied: false,

      attendanceRows() {
        return Array.from(this.$root.querySelectorAll("[data-attendance-row]"));
      },

      selectPage(checked) {
        this.selected = checked ? this.attendanceRows().map(row => row.dataset.attendanceRow) : [];
        this.applied = false;
      },

      applyState() {
        for (const row of this.attendanceRows()) {
          if (!this.selected.includes(row.dataset.attendanceRow)) continue;
          const mark = Array.from(row.querySelectorAll('input[type="radio"]')).find(input => input.value === this.state);
          if (mark) mark.checked = true;
        }
        this.applied = true;
        this.$root.dispatchEvent(new Event("change", { bubbles: true }));
      },
    }));

    Alpine.data("recruitmentAssignment", () => ({
      selected: 0,
      available: 0,
      pageSelected: false,
      all: false,
      recruiter: "",

      init() {
        this.$nextTick(() => this.syncSelection());
      },

      leadRows() {
        return Array.from(this.$refs.form.elements).filter(field => field.name === "lead");
      },

      syncSelection() {
        const rows = this.leadRows();
        this.available = rows.length;
        this.selected = rows.filter(row => row.checked).length;
        this.pageSelected = this.available > 0 && this.selected === this.available;
        this.$refs.selectAll.checked = this.all || this.pageSelected;
        this.$refs.selectAll.indeterminate = !this.all && this.selected > 0 && !this.pageSelected;
      },

      selectPage(checked) {
        this.all = false;
        this.leadRows().forEach(row => { row.checked = checked; });
        this.syncSelection();
      },

      guardSubmit(event) {
        this.syncSelection();
        if ((!this.all && !this.selected) || (event.submitter?.value === "give" && !this.recruiter)) {
          event.preventDefault();
          return;
        }
        if (this.all && !window.confirm(this.$refs.form.dataset.confirmMatching)) {
          event.preventDefault();
        }
      },
    }));
  });

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
