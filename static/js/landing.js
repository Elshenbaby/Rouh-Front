(() => {
  // Role tabs work with or without GSAP.
  const tabs = Array.from(document.querySelectorAll('.lp-tabs [role="tab"]'));
  const select = (tab, focus) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute("aria-controls"));
      if (panel) panel.hidden = !on;
    });
    if (focus) tab.focus();
    const panel = document.getElementById(tab.getAttribute("aria-controls"));
    if (panel && typeof gsap !== "undefined" && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.fromTo(panel.querySelectorAll(".lp-panel-copy > *, .lp-panel-mock"), { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.45, stagger: 0.06, ease: "power3.out" });
      gsap.fromTo(panel.querySelectorAll(".lp-bar > span"), { scaleX: 0 }, { scaleX: 1, duration: 0.8, stagger: 0.08, ease: "power3.out" });
    }
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => select(tab, false));
    tab.addEventListener("keydown", (e) => {
      const keys = { ArrowRight: 1, ArrowLeft: -1, Home: -i, End: tabs.length - 1 - i };
      if (!(e.key in keys)) return;
      e.preventDefault();
      select(tabs[(i + keys[e.key] + tabs.length) % tabs.length], true);
    });
  });

  if (typeof gsap === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);

  const mm = gsap.matchMedia();

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // Intro: everything starts from a visible state if the script fails before this runs.
    const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
    intro
      .from(".lp-hero .lp-in", { y: 28, autoAlpha: 0, duration: 0.7, stagger: 0.08 })
      .from(".lp-app", { y: 40, rotateX: 8, autoAlpha: 0, duration: 0.9 }, 0.15)
      .from(".lp-float", { scale: 0.6, autoAlpha: 0, duration: 0.5, stagger: 0.12, ease: "back.out(2)" }, 0.7)
      .from(".lp-app .lp-bar > span", { scaleX: 0, duration: 0.9, stagger: 0.1 }, 0.7)
      .from(".lp-queue li", { x: 18, autoAlpha: 0, duration: 0.45, stagger: 0.08 }, 0.8);

    // Count the hero numbers up.
    document.querySelectorAll(".lp-hero [data-count]").forEach((el) => {
      const end = Number(el.dataset.count);
      const state = { v: 0 };
      gsap.to(state, {
        v: end,
        duration: 1.4,
        delay: 0.5,
        ease: "power2.out",
        onUpdate: () => { el.textContent = Math.round(state.v); },
      });
    });

    // Rotating word in the headline.
    const word = document.querySelector(".lp-rotator-word");
    if (word && word.dataset.words) {
      const words = word.dataset.words.split("|");
      let i = 0;
      const next = () => {
        i = (i + 1) % words.length;
        gsap.timeline()
          .to(word, { yPercent: -100, autoAlpha: 0, duration: 0.35, ease: "power2.in" })
          .set(word, { yPercent: 100 })
          .call(() => { word.textContent = words[i]; })
          .to(word, { yPercent: 0, autoAlpha: 1, duration: 0.45, ease: "power3.out" });
      };
      const timer = setInterval(next, 2400);
      return () => clearInterval(timer);
    }
  });

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    gsap.to(".lp-float-a", { y: 10, duration: 2.6, yoyo: true, repeat: -1, ease: "sine.inOut" });
    gsap.to(".lp-float-b", { y: -8, duration: 3.1, yoyo: true, repeat: -1, ease: "sine.inOut" });

    const track = document.querySelector(".lp-marquee-track");
    if (track) gsap.to(track, { xPercent: -50, duration: 26, ease: "none", repeat: -1 });

    gsap.utils.toArray(".lp-bento, .lp-step-list").forEach((group) => {
      gsap.from(group.querySelectorAll(".lp-up"), {
        y: 36,
        autoAlpha: 0,
        duration: 0.65,
        stagger: 0.09,
        ease: "power3.out",
        scrollTrigger: { trigger: group, start: "top 82%" },
      });
    });
    gsap.from(".lp-t-kpi .lp-bar > span", {
      scaleX: 0,
      duration: 1,
      stagger: 0.12,
      ease: "power3.out",
      scrollTrigger: { trigger: ".lp-t-kpi", start: "top 85%" },
    });
    gsap.from(".lp-band-inner > *", {
      y: 28,
      autoAlpha: 0,
      duration: 0.7,
      stagger: 0.1,
      ease: "power3.out",
      scrollTrigger: { trigger: ".lp-band", start: "top 80%" },
    });
  });

  // Mouse tilt on the app screen, only for a real pointer.
  mm.add("(prefers-reduced-motion: no-preference) and (hover: hover) and (min-width: 1001px)", () => {
    const stage = document.querySelector(".lp-stage");
    const app = document.querySelector("[data-tilt]");
    if (!stage || !app) return;
    const rx = gsap.quickTo(app, "rotationX", { duration: 0.6, ease: "power3.out" });
    const ry = gsap.quickTo(app, "rotationY", { duration: 0.6, ease: "power3.out" });
    const move = (e) => {
      const r = stage.getBoundingClientRect();
      ry(((e.clientX - r.left) / r.width - 0.5) * 10);
      rx(-((e.clientY - r.top) / r.height - 0.5) * 8);
    };
    const leave = () => { rx(0); ry(0); };
    stage.addEventListener("pointermove", move);
    stage.addEventListener("pointerleave", leave);
    return () => {
      stage.removeEventListener("pointermove", move);
      stage.removeEventListener("pointerleave", leave);
    };
  });
})();
