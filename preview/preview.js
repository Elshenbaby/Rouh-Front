(function () {
  const params = new URLSearchParams(location.search);
  if (params.get("queue") === "mine" && document.querySelector("[data-preview-partner-queue]")) {
    document.getElementById("partner-queue-heading").textContent = "My next actions";
    document.querySelector("[data-preview-partner-overall]").classList.remove("is-active");
    document.querySelector("[data-preview-partner-mine]").classList.add("is-active");
  }

  const partnerSample = document.querySelector("[data-preview-partner-account]");
  if (partnerSample) {
    const desks = {
      b2b: { queue: "b2b__accounts__desk-b2b.html", family: "partners", label: "Sample partner" },
      bd: { queue: "b2b__accounts__desk-bd.html", family: "partners", label: "Sample sponsor" },
      igte: { queue: "raising__igte.html", family: "raising", label: "Sample school" },
    };
    const accounts = {
      1: { action: "Check first contact", contact: "Not contacted" },
      2: { action: "Prepare for visit", contact: "Contacted", date: "2026-11-18", dateLabel: "18 Nov 2026" },
      3: { action: "Prepare for visit", contact: "Contacted", date: "2026-11-14", dateLabel: "14 Nov 2026" },
      4: { action: "Review follow-up", contact: "Contacted" },
    };
    const deskKey = Object.hasOwn(desks, params.get("desk")) ? params.get("desk") : "b2b";
    const id = Object.hasOwn(accounts, params.get("account")) ? params.get("account") : "1";
    const desk = desks[deskKey];
    const account = accounts[id];
    const title = `${desk.label} ${id}`;
    const back = partnerSample.querySelector("[data-queue-back]");
    back.href = desk.queue;
    back.dataset.queueBack = desk.family;
    back.dataset.queueRecord = `sample-${deskKey}-${id}`;
    partnerSample.querySelector("[data-partner-name]").textContent = title;
    partnerSample.querySelector("[data-partner-action]").textContent = account.action;
    partnerSample.querySelector("[data-partner-contact]").textContent = account.contact;
    partnerSample.querySelector("[data-partner-date]").textContent = account.dateLabel || "No visit date recorded";
    partnerSample.querySelector('select[name="contact_status"]').value = account.contact === "Contacted" ? "contacted" : "not_contacted";
    partnerSample.querySelector('input[name="visit_date"]').value = account.date || "";
    document.title = title + " · Rouh preview";
  }

  const handoff = document.querySelector("[data-preview-b2c-handoff]");
  if (handoff) {
    const signups = {
      1: ["Check B2C contact", "Not recorded", "Not recorded", "Not recorded"],
      2: ["Check OGX follow-up", "Yes", "No", "Not recorded"],
      3: ["Review return to process", "Yes", "Yes", "Yes"],
      4: ["Review interview and contact history", "Yes", "Yes", "No"],
    };
    const id = Object.hasOwn(signups, params.get("signup")) ? params.get("signup") : "1";
    const title = "Sample signup " + id;
    handoff.querySelector("[data-queue-back]").dataset.queueRecord = id;
    handoff.querySelector("[data-preview-review-name]").textContent = title;
    handoff.querySelector("[data-preview-review-person]").textContent = title;
    ["action", "b2c", "ogx", "return"].forEach(function (field, index) {
      handoff.querySelector(`[data-preview-review-${field}]`).textContent = signups[id][index];
    });
    document.title = title + " · Rouh preview";
  }

  const candidateStages = {
    1: ["lead", "Waiting for first contact"],
    2: ["lead", "Waiting for first contact"],
    3: ["pc_accepted", "Phone call accepted"],
    4: ["f2f_scheduled", "Interview scheduled"],
  };
  const candidate = document.querySelector("[data-preview-recruitment-candidate]");
  if (candidate) {
    const id = Object.hasOwn(candidateStages, params.get("candidate")) ? params.get("candidate") : "1";
    const [code, stage] = candidateStages[id];
    const title = "Sample candidate " + id;
    candidate.querySelector("[data-queue-back]").dataset.queueRecord = id;
    candidate.querySelector("[data-preview-review-name]").textContent = title;
    candidate.querySelector("[data-preview-review-action]").textContent = stage;
    candidate.querySelector("#l-stage").value = code;
    const markers = Array.from(candidate.querySelectorAll(".rcr-stagebar span"));
    const current = markers.findIndex(marker => marker.title === stage);
    markers.forEach(function (item, index) {
      item.classList.toggle("is-now", index === current);
      item.classList.toggle("is-done", index <= current);
    });
    document.title = title + " · Rouh preview";
  }

  const candidateDialog = document.querySelector("[data-preview-candidate-dialog]");
  if (candidateDialog) {
    document.querySelectorAll("[data-preview-candidate-quick]").forEach(function (button) {
      button.addEventListener("click", function () {
        const id = button.dataset.previewCandidateQuick;
        candidateDialog.querySelector("[data-preview-review-name]").textContent = "Sample candidate " + id;
        candidateDialog.querySelector("[data-preview-review-action]").textContent = candidateStages[id][1];
        candidateDialog.querySelector("[data-preview-candidate-open]").href = button.closest("li").querySelector("a").href;
        candidateDialog.showModal();
      });
    });
  }

  document.addEventListener("change", function (event) {
    const form = event.target.closest("[data-preview-autosave]");
    if (!form) return;
    const feedback = form.querySelector("[data-save-feedback]");
    feedback.dataset.state = "received";
    feedback.querySelector("[data-save-message]").textContent = "Preview only. Changes to this record were not saved.";
  });
  document.querySelectorAll("[data-preview-directory]").forEach(function (form) {
    const results = document.getElementById("directory-table");
    const rows = Array.from(results.querySelectorAll("[data-directory-row]"), row => ({
      row,
      searchText: `${row.cells[0].textContent} ${row.cells[1].textContent}`.toLowerCase(),
    }));
    const status = results.querySelector("[data-directory-count]");
    const empty = results.querySelector("[data-directory-empty]");
    const search = form.elements.q;

    function filterDirectory() {
      const query = search.value.trim().toLowerCase();
      let matches = 0;
      for (const { row, searchText } of rows) {
        row.hidden = !searchText.includes(query);
        if (!row.hidden) matches++;
      }
      empty.hidden = matches > 0;
      status.textContent = `${matches} ${matches === 1 ? "member" : "members"} on this page`;
    }
    search.addEventListener("input", filterDirectory);
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      filterDirectory();
    });
    filterDirectory();
  });

  document.querySelectorAll("[data-preview-report]").forEach(function (form) {
    const year = form.elements.tool;
    const month = form.elements.month;
    if (!year || !month) return;
    year.addEventListener("change", function () {
      const start = Number(year.selectedOptions[0].dataset.yearStart);
      if (!start) return;
      for (const option of month.options) {
        if (option.value === "all") continue;
        const [, number] = option.value.split("-");
        const calendarYear = start + (Number(number) < 8 ? 1 : 0);
        option.value = `${calendarYear}-${number}-01`;
        option.textContent = option.textContent.replace(/\d{4}$/, calendarYear);
      }
    });
  });

  function showFormNotice(form, message) {
    let notice = form.querySelector(".preview-action-notice");
    if (!notice) {
      notice = document.createElement("p");
      notice.className = "preview-action-notice";
      notice.setAttribute("role", "status");
      form.append(notice);
    }
    notice.textContent = message;
    return notice;
  }

  document.addEventListener("submit", function (event) {
    const form = event.target;
    if (event.defaultPrevented || form.method === "dialog") return;
    const report = form.hasAttribute("data-preview-report");
    event.preventDefault();

    let message;
    if (report) {
      const selected = Array.from(form.querySelectorAll("select"), function (select) {
        return select.selectedOptions[0]?.textContent.trim().replace(/\s+— no data$/, "");
      }).filter(Boolean);
      message = `Selected scope: ${selected.join(" · ")}. This preview has no figures for the selected scope.`;
      document.querySelectorAll("[data-preview-report-period] span").forEach(function (item, index) {
        item.textContent = selected[index] || "";
        item.hidden = !selected[index];
      });
    } else if (form.method.toLowerCase() === "post") {
      message = "Preview only. These changes were not saved.";
      if (form.hasAttribute("data-preview-draft")) form.dispatchEvent(new Event("rouh:previewSubmit"));
    } else {
      message = "This filter needs the full Rouh app. The saved rows remain visible.";
    }
    const notice = showFormNotice(form, message);
    notice.scrollIntoView({ block: "nearest" });
  });

  let unavailableNotice;
  let noticeTimer;
  function showUnavailable() {
    if (!unavailableNotice) {
      unavailableNotice = document.createElement("p");
      unavailableNotice.className = "preview-route-notice";
      unavailableNotice.setAttribute("role", "status");
      document.body.append(unavailableNotice);
    }
    unavailableNotice.hidden = false;
    unavailableNotice.textContent = "This destination needs the full Rouh app.";
    clearTimeout(noticeTimer);
    noticeTimer = setTimeout(() => { unavailableNotice.hidden = true; }, 5000);
  }
  document.addEventListener("click", function (event) {
    if (!event.target.closest('a[href="#not-in-preview"]') || event.defaultPrevented) return;
    event.preventDefault();
    showUnavailable();
  });

  document.addEventListener("htmx:beforeRequest", function (event) {
    event.preventDefault();
    const trigger = event.detail.elt;
    const link = trigger.closest("a[href]");
    if (link) {
      if (link.getAttribute("href") === "#not-in-preview") showUnavailable();
      else if (link.origin === location.origin) location.assign(link.href);
      return;
    }
    const form = trigger.closest("form");
    if (form && form.method.toLowerCase() === "get") {
      showFormNotice(form, "This filter needs the full Rouh app. The saved rows remain visible.");
    }
  });
})();
