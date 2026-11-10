/* RCR tool: the lead panel beside the boards, "show more" on long columns, live find, and short messages.
   Nothing is dragged: every change is a button, a dropdown or a form, and saving keeps the page true. */
(() => {
  function toast(message, kind = "error") {
    let box = document.querySelector(".rcr-toasts");
    if (!box) {
      box = document.createElement("div");
      box.className = "rcr-toasts";
      box.setAttribute("role", "status");
      document.body.appendChild(box);
    }
    const item = document.createElement("p");
    item.className = `rcr-toast is-${kind}`;
    item.textContent = message;
    box.appendChild(item);
    setTimeout(() => item.classList.add("is-gone"), 2600);
    setTimeout(() => item.remove(), 3200);
  }
  window.rcrToast = toast;

  function nodeFrom(html) {
    const t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  function swap(el, html) {
    const node = nodeFrom(html);
    if (!node) { el.remove(); return null; }
    el.replaceWith(node);
    if (window.htmx) window.htmx.process(node);
    return node;
  }

  function bump(list, delta) {
    const col = list && list.closest("[data-col]");
    const counter = col && col.querySelector("[data-count]");
    if (counter) counter.textContent = Math.max(0, Number(counter.textContent || 0) + delta);
    if (col) col.classList.toggle("is-empty", !col.querySelector("[data-card]"));
  }

  // A lead changed in the panel: put its card in the column its step (or its out lane) says, or take it off
  // this board when that column isn't on it.
  function place(card) {
    if (!card || !card.dataset || !card.dataset.stage) return;
    const current = card.parentElement;
    if (!current || !current.closest(".rcr-board")) return;
    const outcome = card.dataset.outcome || "active";
    const home = document.getElementById(outcome !== "active" ? `lane-${outcome}` : `col-${card.dataset.stage}`);
    if (home === current) return;
    bump(current, -1);
    if (!home) { card.remove(); return; }
    home.prepend(card);
    bump(home, 1);
    card.classList.add("is-moved");
    setTimeout(() => card.classList.remove("is-moved"), 1200);
  }

  let drawerTrigger;
  function openDrawer(trigger) {
    const drawer = document.getElementById("rcr-drawer");
    if (!drawer || drawer.classList.contains("is-open")) return;
    drawerTrigger = trigger instanceof HTMLElement && !drawer.contains(trigger) ? trigger : document.activeElement;
    drawer.classList.add("is-open");
    drawer.querySelector(".rcr-drawer-close")?.focus();
  }
  function closeDrawer() {
    const drawer = document.getElementById("rcr-drawer");
    if (!drawer?.classList.contains("is-open")) return;
    drawer.classList.remove("is-open");
    if (drawerTrigger?.isConnected) drawerTrigger.focus({ preventScroll: true });
    drawerTrigger = null;
  }
  window.rcrCloseDrawer = closeDrawer;

  // "Show more" at the foot of a long column.
  document.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-more]");
    if (!button) return;
    event.preventDefault();
    const list = document.getElementById(button.dataset.more);
    const offset = Number(button.dataset.offset || 0);
    button.disabled = true;
    try {
      const url = `${button.dataset.url}${button.dataset.url.includes("?") ? "&" : "?"}offset=${offset}`;
      const html = await (await fetch(url, { credentials: "same-origin" })).text();
      const t = document.createElement("template");
      t.innerHTML = html;
      const count = t.content.children.length;
      list.append(...t.content.children);
      if (window.htmx) window.htmx.process(list);
      button.dataset.offset = offset + count;
      if (offset + count >= Number(button.dataset.total || 0) || count === 0) button.remove();
    } catch (e) {
      toast("Couldn't load more.");
    } finally {
      button.disabled = false;
    }
  });

  // The panel saved a lead: refresh its card on the board.
  document.addEventListener("rcr:card", async (event) => {
    const id = event.detail && (event.detail.value || event.detail);
    const card = document.querySelector(`[data-card][data-id="${id}"]`);
    const url = card && card.dataset.cardUrl;
    if (!url) return;
    try {
      const fresh = swap(card, await (await fetch(url, { credentials: "same-origin" })).text());
      place(fresh);
    } catch (e) { /* the board refreshes on the next load */ }
  });

  // Live find in a list ("Waiting for a slot", "Waiting for a GD").
  document.addEventListener("input", (event) => {
    const box = event.target.closest("[data-filter]");
    if (!box) return;
    const needle = box.value.trim().toLowerCase();
    document.querySelectorAll(`#${box.dataset.filter} [data-card]`).forEach((card) => {
      card.hidden = Boolean(needle) && !card.textContent.toLowerCase().includes(needle);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeDrawer();
    if ((event.key === "Enter" || event.key === " ") && event.target.matches("[data-card][hx-get]")) {
      event.preventDefault();
      event.target.click();
    }
  });

  document.body.addEventListener("htmx:afterSwap", (event) => {
    if (event.detail.target && event.detail.target.id === "rcr-drawer-body") {
      openDrawer(event.detail.requestConfig?.elt);
    }
  });
  // A step clicked in the panel: move the card to that column, then show the panel fresh.
  document.body.addEventListener("htmx:afterRequest", (event) => {
    const button = event.detail.elt;
    if (!button || !button.dataset || !button.dataset.step || !event.detail.successful) return;
    const card = document.querySelector(`[data-card][data-id="${button.dataset.lead}"]`);
    if (card) place(swap(card, event.detail.xhr.responseText));
    if (window.htmx) window.htmx.ajax("GET", button.dataset.drawer, { target: "#rcr-drawer-body" });
  });
  document.body.addEventListener("htmx:responseError", (event) => {
    const text = event.detail.xhr.responseText || "";
    toast(text && text.length < 200 ? text : "That didn't save. Try again.");
  });
})();
