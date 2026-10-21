/* Hakuna Matata Kranspoort */
(() => {
  "use strict";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  const WA_NUMBER = "27842088639";
  const EMAIL = "kranspoort.hakunamatata@gmail.com";

  const year = $("[data-year]");
  if (year) year.textContent = new Date().getFullYear();

  if (!hasGsap) document.documentElement.classList.remove("js");

  /* ---------- split headlines into masked words ---------- */
  $$("[data-split]").forEach((el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.setAttribute("aria-label", el.textContent.trim());
    el.innerHTML = words.map((w) => `<span class="w" aria-hidden="true"><span>${w}</span></span>`).join(" ");
  });

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);
  if (!reduce && window.Lenis && hasGsap) {
    lenis = new Lenis({ duration: 1.15, easing: (t) => 1 - Math.pow(1 - t, 4) });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const scrollToEl = (target) => {
    if (lenis) lenis.scrollTo(target, { offset: target.id === "top" ? 0 : -64, duration: 1.4 });
    else target.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href");
    const target = id.length > 1 && document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    closeMenu();
    scrollToEl(target);
    history.replaceState(null, "", id === "#top" ? location.pathname : id);
  });

  /* ---------- mobile menu ---------- */
  const menu = $("[data-menu]");
  const toggle = $("[data-menu-toggle]");
  function openMenu() {
    menu.hidden = false;
    document.body.classList.add("menu-open");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close menu");
    lenis && lenis.stop();
    if (hasGsap && !reduce) {
      gsap.fromTo(menu, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 0.7, ease: "expo.out" });
      gsap.fromTo($$(".menu__links a, .menu__foot", menu), { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.8, stagger: 0.05, ease: "expo.out", delay: 0.1 });
    }
  }
  function closeMenu() {
    if (!menu || menu.hidden) return;
    document.body.classList.remove("menu-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
    lenis && lenis.start();
    menu.hidden = true;
  }
  toggle && toggle.addEventListener("click", () => (menu.hidden ? openMenu() : closeMenu()));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });

  /* ---------- nav state + WhatsApp button ---------- */
  const nav = $("[data-nav]");
  const fab = $("[data-fab]");
  const hero = $("[data-hero]");
  if (hasGsap) {
    ScrollTrigger.create({
      start: 0, end: "max",
      onUpdate: (self) => {
        const y = self.scroll();
        nav.classList.toggle("is-solid", y > hero.offsetHeight * 0.92);
        fab.classList.toggle("is-in", y > window.innerHeight * 0.9);
        const past = y > window.innerHeight * 1.2;
        nav.classList.toggle("is-hidden", past && self.direction === 1 && !document.body.classList.contains("menu-open"));
      },
    });
  } else {
    nav.classList.add("is-solid"); fab.classList.add("is-in");
  }

  /* ---------- hero: arch window that opens to full screen ---------- */
  const media = $("[data-hero-media]");
  const slot = $("[data-slot]");
  const FULL = "inset(0px 0px 0px 0px round 0px 0px 0px 0px / 0px 0px 0px 0px)";
  function archClip(collapsed) {
    const h = hero.getBoundingClientRect();
    const s = slot.getBoundingClientRect();
    const t = s.top - h.top, l = s.left - h.left, r = h.right - s.right, b = Math.max(0, h.bottom - s.bottom);
    const rx = s.width / 2, ry = Math.min(s.height * 0.42, s.width / 2);
    const top = collapsed ? t + s.height : t;
    return `inset(${top}px ${r}px ${b}px ${l}px round ${rx}px ${rx}px 0px 0px / ${ry}px ${ry}px 0px 0px)`;
  }

  // cinematic frame sequence inside the window
  const frames = $$("[data-frame]");
  const bars = $$("[data-progress] i");
  const HOLD = 7;
  let current = 0;
  function kenBurns(frame) {
    const img = $("img", frame);
    gsap.fromTo(img, { scale: 1.16, xPercent: parseFloat(frame.dataset.fx || 0), yPercent: parseFloat(frame.dataset.fy || 0) },
      { scale: 1.03, xPercent: 0, yPercent: 0, duration: HOLD + 2.4, ease: "none" });
  }
  function markBars(i) {
    bars.forEach((b, n) => {
      b.classList.remove("is-on", "is-done");
      b.style.setProperty("--dur", HOLD + "s");
      if (n < i) b.classList.add("is-done");
    });
    void bars[i]?.offsetWidth;
    bars[i]?.classList.add("is-on");
  }
  function nextFrame() {
    const prev = frames[current];
    current = (current + 1) % frames.length;
    const next = frames[current];
    $("img", next).loading = "eager";
    next.classList.add("is-active");
    gsap.fromTo(next, { opacity: 0 }, { opacity: 1, duration: 2, ease: "power2.inOut" });
    gsap.to(prev, { opacity: 0, duration: 2, ease: "power2.inOut", onComplete: () => prev.classList.remove("is-active") });
    kenBurns(next);
    markBars(current);
  }

  if (hasGsap && !reduce) {
    frames.forEach((f, i) => gsap.set(f, { opacity: i === 0 ? 1 : 0 }));
    window.addEventListener("load", () => frames.slice(1).forEach((f) => { $("img", f).loading = "eager"; }));
    kenBurns(frames[0]);
    markBars(0);
    let timer = setInterval(nextFrame, HOLD * 1000);
    document.addEventListener("visibilitychange", () => {
      clearInterval(timer);
      if (!document.hidden) timer = setInterval(nextFrame, HOLD * 1000);
    });

    // load: the window rises like the sun, the masthead slides up
    const intro = gsap.timeline({ defaults: { ease: "expo.out" }, delay: 0.1 });
    intro.fromTo(media, { clipPath: () => archClip(true) }, { clipPath: () => archClip(false), duration: 1.8, ease: "expo.inOut" }, 0)
      .from(".hero__mark-line > span", { yPercent: 105, duration: 1.4, stagger: 0.1 }, 0.2)
      .from("[data-hero-copy] > *", { y: 26, opacity: 0, duration: 1.1, stagger: 0.1 }, 0.7)
      .from(".nav__inner", { opacity: 0, duration: 1.2, ease: "power2.out" }, 0.6);

    // scroll: the arch opens out to full screen and the warthog pops in
    const open = gsap.timeline({
      scrollTrigger: {
        trigger: hero, start: "top top", end: () => "+=" + window.innerHeight * 1.1,
        pin: true, scrub: 1, invalidateOnRefresh: true,
        onUpdate: (self) => nav.classList.toggle("is-over", self.progress > 0.4),
        onRefresh: (self) => { if (self.progress === 0 && !intro.isActive()) gsap.set(media, { clipPath: archClip(false) }); },
      },
    });
    open.fromTo(media, { clipPath: () => archClip(false) }, { clipPath: FULL, ease: "power2.inOut", duration: 1, immediateRender: false }, 0)
      .to("[data-mark], [data-hero-copy]", { y: -60, opacity: 0, duration: 0.45, ease: "power1.in" }, 0)
      .to("[data-hero-shade]", { opacity: 1, duration: 0.5 }, 0.45)
      .fromTo("[data-sticker]", { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(1.8)", immediateRender: false }, 0.68)
      .to({}, { duration: 0.2 });
  } else {
    const place = () => (media.style.clipPath = archClip(false));
    place();
    addEventListener("resize", place);
  }

  /* ---------- magnetic primary CTA ---------- */
  if (finePointer && !reduce && hasGsap) {
    $$("[data-magnetic]").forEach((el) => {
      const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "elastic.out(1, .4)" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "elastic.out(1, .4)" });
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.25);
        yTo((e.clientY - r.top - r.height / 2) * 0.35);
      });
      el.addEventListener("pointerleave", () => { xTo(0); yTo(0); });
    });
  }

  /* ---------- scroll reveals ---------- */
  if (hasGsap && !reduce) {
    $$("[data-split]").forEach((el) => {
      gsap.from($$(".w > span", el), {
        yPercent: 110, duration: 1.2, ease: "expo.out", stagger: 0.06,
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
      });
    });
    ScrollTrigger.batch("[data-reveal]", {
      start: "top 88%", once: true,
      onEnter: (els) => gsap.fromTo(els, { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, ease: "expo.out", stagger: 0.1 }),
    });
    $$("[data-reveal-group]").forEach((g) => {
      gsap.fromTo(g.children, { y: 36, opacity: 0 }, {
        y: 0, opacity: 1, duration: 1.1, ease: "expo.out", stagger: 0.08,
        scrollTrigger: { trigger: g, start: "top 85%", once: true },
      });
    });
    $$("[data-clip]").forEach((el) => {
      gsap.fromTo(el, { clipPath: "inset(100% 0% 0% 0%)" }, {
        clipPath: "inset(0% 0% 0% 0%)", duration: 1.6, ease: "expo.inOut",
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
      });
    });
    $$("[data-parallax]").forEach((img) => {
      gsap.fromTo(img, { yPercent: -parseFloat(img.dataset.parallax) }, {
        yPercent: parseFloat(img.dataset.parallax), ease: "none",
        scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: true },
      });
    });
    $$("[data-zoom]").forEach((wrap) => {
      gsap.fromTo($("[data-zoom-img]", wrap), { scale: 1.25 }, {
        scale: 1, ease: "none",
        scrollTrigger: { trigger: wrap, start: "top bottom", end: "bottom center", scrub: true },
      });
    });
  } else {
    $$("[data-reveal], [data-reveal-group] > *").forEach((el) => (el.style.opacity = 1));
  }

  /* ---------- outdoors: sticky photo follows the space in view ---------- */
  const spaces = $$("[data-space]");
  const spaceImgs = $$("[data-space-img]");
  function showSpace(i) {
    spaces.forEach((s) => s.classList.toggle("is-on", s.dataset.space === String(i)));
    spaceImgs.forEach((im) => {
      const on = im.dataset.spaceImg === String(i);
      if (on) im.loading = "eager";
      im.classList.toggle("is-on", on);
    });
  }
  if (hasGsap) {
    spaces.forEach((s) => ScrollTrigger.create({
      trigger: s, start: "top 60%", end: "bottom 60%",
      onToggle: (self) => self.isActive && showSpace(s.dataset.space),
    }));
  }

  /* ---------- wildlife strips ---------- */
  const strips = $$("[data-strips] .strip");
  function openStrip(s) {
    strips.forEach((o) => { o.classList.toggle("is-open", o === s); o.setAttribute("aria-expanded", String(o === s)); });
  }
  strips.forEach((s) => {
    s.addEventListener("click", () => openStrip(s));
    s.addEventListener("focus", () => openStrip(s));
    if (finePointer) s.addEventListener("pointerenter", () => openStrip(s));
  });

  /* ---------- dusk: sundowners to starlight ---------- */
  (function dusk() {
    const section = $("[data-dusk]");
    const c = $("[data-sky]");
    if (!section || !c) return;
    const ctx = c.getContext("2d");
    let w, h, dpr, stars = [], band, raf, running = false, t = 0, angle = 0, shoot = null, nextShoot = 3;

    function resize() {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = c.clientWidth; h = c.clientHeight;
      c.width = w * dpr; c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const R = Math.hypot(w, h);
      const n = Math.round(Math.min(900, (w * h) / 1500));
      stars = Array.from({ length: n }, () => {
        const tint = Math.random();
        return {
          x: (Math.random() - 0.5) * R * 1.6, y: (Math.random() - 0.5) * R * 1.6,
          r: Math.random() < 0.93 ? 0.45 + Math.random() * 0.85 : 1.2 + Math.random() * 1.2,
          a: 0.45 + Math.random() * 0.55, tw: 0.5 + Math.random() * 2.5, ph: Math.random() * 6.3,
          c: tint < 0.12 ? "255,214,170" : tint < 0.24 ? "190,210,255" : "255,255,255",
        };
      });
      band = document.createElement("canvas");
      band.width = Math.ceil(R * 1.6); band.height = Math.ceil(R * 1.6);
      const b = band.getContext("2d");
      b.translate(band.width / 2, band.height / 2); b.rotate(-0.55);
      for (let i = 0; i < 70; i++) {
        const x = (Math.random() - 0.5) * band.width, y = (Math.random() - 0.5) * R * 0.16;
        const r = 40 + Math.random() * 140;
        const g = b.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, `rgba(200,205,230,${0.025 + Math.random() * 0.03})`);
        g.addColorStop(1, "rgba(200,205,230,0)");
        b.fillStyle = g; b.fillRect(x - r, y - r, r * 2, r * 2);
      }
      for (let i = 0; i < 2400; i++) {
        const x = (Math.random() - 0.5) * band.width, y = (Math.random() - 0.5) * R * 0.14 * (Math.random() + Math.random());
        b.fillStyle = `rgba(255,255,255,${Math.random() * 0.35})`;
        b.fillRect(x, y, 0.8, 0.8);
      }
      draw(0);
    }
    function draw(dt) {
      t += dt; angle += dt * 0.0035;
      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.translate(w * 0.5, -h * 0.35);
      ctx.rotate(angle);
      ctx.drawImage(band, -band.width / 2, -band.height / 2 + h * 0.6);
      for (const s of stars) {
        const tw = reduce ? 1 : 0.55 + 0.45 * Math.sin(t * s.tw + s.ph);
        ctx.globalAlpha = s.a * tw;
        ctx.fillStyle = `rgb(${s.c})`;
        ctx.beginPath(); ctx.arc(s.x, s.y + h * 0.6, s.r, 0, 6.283); ctx.fill();
        if (s.r > 1.3) {
          ctx.globalAlpha = s.a * tw * 0.12;
          ctx.beginPath(); ctx.arc(s.x, s.y + h * 0.6, s.r * 4, 0, 6.283); ctx.fill();
        }
      }
      ctx.restore();
      ctx.globalAlpha = 1;
      if (reduce) return;
      nextShoot -= dt;
      if (!shoot && nextShoot <= 0) {
        shoot = { x: w * (0.15 + Math.random() * 0.6), y: h * (0.05 + Math.random() * 0.25), vx: 9 + Math.random() * 5, vy: 3 + Math.random() * 3, life: 0 };
        nextShoot = 5 + Math.random() * 8;
      }
      if (shoot) {
        shoot.life += dt;
        const k = Math.min(1, shoot.life / 0.9);
        const hx = shoot.x + shoot.vx * shoot.life * 60, hy = shoot.y + shoot.vy * shoot.life * 60;
        const g = ctx.createLinearGradient(hx, hy, hx - shoot.vx * 14, hy - shoot.vy * 14);
        g.addColorStop(0, `rgba(255,255,255,${0.9 * (1 - k)})`);
        g.addColorStop(1, "rgba(255,255,255,0)");
        ctx.strokeStyle = g; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx - shoot.vx * 14, hy - shoot.vy * 14); ctx.stroke();
        if (k >= 1) shoot = null;
      }
    }
    let last = 0;
    function loop(now) {
      const dt = Math.min(0.05, (now - (last || now)) / 1000);
      last = now;
      draw(dt);
      raf = requestAnimationFrame(loop);
    }
    resize();
    addEventListener("resize", resize);

    if (reduce || !hasGsap) {
      $("[data-night]").style.opacity = 1;
      c.style.opacity = 1;
      $("[data-sun]").style.opacity = 0;
      $("[data-dusk-one]").style.opacity = 0;
      $("[data-dusk-two]").style.opacity = 1;
      return;
    }
    new IntersectionObserver(([en]) => {
      if (en.isIntersecting && !running) { running = true; last = 0; raf = requestAnimationFrame(loop); }
      else if (!en.isIntersecting) { running = false; cancelAnimationFrame(raf); }
    }, { rootMargin: "100px" }).observe(section);

    gsap.timeline({
      scrollTrigger: { trigger: section, start: "top top", end: () => "+=" + window.innerHeight * 1.6, pin: true, scrub: 1, invalidateOnRefresh: true },
    })
      .to("[data-sun]", { y: () => window.innerHeight * 0.5, scale: 0.9, filter: "saturate(1.6) hue-rotate(-12deg)", ease: "power1.in", duration: 0.8 }, 0)
      .to("[data-sun]", { opacity: 0, duration: 0.2 }, 0.65)
      .to("[data-dusk-one]", { opacity: 0, y: -40, duration: 0.25 }, 0.3)
      .to("[data-night]", { opacity: 1, duration: 0.5, ease: "none" }, 0.35)
      .to(c, { opacity: 1, duration: 0.45, ease: "none" }, 0.55)
      .fromTo("[data-dusk-two]", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.3 }, 0.72)
      .to({}, { duration: 0.25 });
  })();

  /* ---------- lightbox ---------- */
  const gallery = [
    ["bedroom-main-2", "Main bedroom"], ["lounge-tall", "Lounge"], ["dining-arch", "Dining room"],
    ["bedroom-two", "Double bedroom"], ["bunk-room", "Bunk room"], ["kitchen-lounge", "Kitchen and lounge"],
    ["bedroom-three", "Double bedroom with garden view"], ["bedroom-twin", "Bedroom with two beds"], ["kitchen", "Kitchen"],
    ["dining", "Dining table"], ["bathroom", "Bathroom with bath"], ["shower", "Shower room"],
    ["kitchenette", "Kitchenette"], ["suite-corner", "Coffee corner with bar fridge"], ["lapa", "The lapa"],
    ["deck-view", "The deck"], ["pool-floats", "The pool"], ["garden-pool", "Garden and pool"],
    ["house-deck", "The house and upper deck"], ["lantern-path", "Lantern-lit path at night"], ["night-pool", "The house and pool at night"],
  ];
  const lb = $("[data-lightbox]");
  const lbImg = $("[data-lb-img]");
  const lbCap = $("[data-lb-cap]");
  let lbIndex = 0, lastFocus = null;
  function showLb(i) {
    lbIndex = (i + gallery.length) % gallery.length;
    const [file, cap] = gallery[lbIndex];
    lbImg.src = `assets/img/${file}.webp`;
    lbImg.alt = cap;
    lbCap.textContent = `${cap}  (${lbIndex + 1} of ${gallery.length})`;
    if (hasGsap && !reduce) gsap.fromTo(lbImg, { opacity: 0, scale: 0.98 }, { opacity: 1, scale: 1, duration: 0.6, ease: "expo.out" });
  }
  function openLb(i) {
    lastFocus = document.activeElement;
    lb.hidden = false;
    lenis && lenis.stop();
    document.body.style.overflow = "hidden";
    showLb(i);
    $("[data-lb-close]").focus();
  }
  function closeLb() {
    lb.hidden = true;
    lenis && lenis.start();
    document.body.style.overflow = "";
    lastFocus && lastFocus.focus();
  }
  $$("[data-open]").forEach((b) => b.addEventListener("click", () => openLb(+b.dataset.open)));
  $("[data-lb-close]").addEventListener("click", closeLb);
  $("[data-lb-prev]").addEventListener("click", () => showLb(lbIndex - 1));
  $("[data-lb-next]").addEventListener("click", () => showLb(lbIndex + 1));
  lb.addEventListener("click", (e) => { if (e.target === lb) closeLb(); });
  document.addEventListener("keydown", (e) => {
    if (lb.hidden) return;
    if (e.key === "Escape") closeLb();
    if (e.key === "ArrowLeft") showLb(lbIndex - 1);
    if (e.key === "ArrowRight") showLb(lbIndex + 1);
  });
  let touchX = null;
  lb.addEventListener("touchstart", (e) => (touchX = e.touches[0].clientX), { passive: true });
  lb.addEventListener("touchend", (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) showLb(lbIndex + (dx < 0 ? 1 : -1));
    touchX = null;
  });

  /* ---------- booking ---------- */
  const form = $("[data-booking]");
  if (!form) return;
  const fIn = $("#f-in"), fOut = $("#f-out"), fAdults = $("#f-adults"), fKids = $("#f-kids");
  const est = $("[data-estimate]");

  const RATES = {
    standard: { mid: 1500, weekend: 1600, long: 1700, label: "Standard rate" },
    special: { mid: 800, weekend: 900, long: 1000, label: "Special rate" },
  };
  // South African public holidays (observed dates)
  const HOLIDAYS = new Set([
    "2026-01-01", "2026-03-21", "2026-04-03", "2026-04-06", "2026-04-27", "2026-05-01", "2026-06-16", "2026-08-10", "2026-09-24", "2026-12-16", "2026-12-25", "2026-12-26",
    "2027-01-01", "2027-03-22", "2027-03-26", "2027-03-29", "2027-04-27", "2027-05-01", "2027-06-16", "2027-08-09", "2027-09-24", "2027-12-16", "2027-12-25", "2027-12-27",
    "2028-01-01", "2028-03-21", "2028-04-14", "2028-04-17", "2028-04-27", "2028-05-01", "2028-06-16", "2028-08-09", "2028-09-25", "2028-12-16", "2028-12-25", "2028-12-26",
  ]);
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const parse = (v) => { const [y, m, d] = v.split("-").map(Number); return new Date(y, m - 1, d); };
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const offDay = (d) => d.getDay() === 0 || d.getDay() === 6 || HOLIDAYS.has(iso(d));
  function inLongWeekend(d) {
    if (!offDay(d)) return false;
    let a = d, b = d, len = 1;
    while (offDay(addDays(a, -1))) { a = addDays(a, -1); len++; }
    while (offDay(addDays(b, 1))) { b = addDays(b, 1); len++; }
    return len >= 3;
  }
  // a night is priced by the day you wake up on
  function nightType(d) {
    const morning = addDays(d, 1);
    if (inLongWeekend(morning)) return "long";
    if (morning.getDay() === 6 || morning.getDay() === 0) return "weekend";
    return "mid";
  }
  const rand = (n) => "R" + n.toLocaleString("en-ZA").replace(/,/g, " ").replace(/ /g, " ");
  const fmtDate = (d) => d.toLocaleDateString("en-ZA", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

  const today = new Date(); today.setHours(0, 0, 0, 0);
  fIn.min = iso(today);
  fOut.min = iso(addDays(today, 1));

  function quote() {
    if (!fIn.value || !fOut.value) return null;
    const a = parse(fIn.value), b = parse(fOut.value);
    const nights = Math.round((b - a) / 864e5);
    if (nights < 1) return null;
    const adults = +fAdults.value || 0, kids = +fKids.value || 0;
    const plan = adults <= 2 && kids <= 2 ? "special" : "standard";
    const count = { mid: 0, weekend: 0, long: 0 };
    for (let i = 0; i < nights; i++) count[nightType(addDays(a, i))]++;
    const r = RATES[plan];
    const total = count.mid * r.mid + count.weekend * r.weekend + count.long * r.long;
    return { a, b, nights, plan, count, total, r };
  }
  function renderQuote() {
    const q = quote();
    if (!q) { est.innerHTML = '<p class="estimate__empty">Choose your dates to see an estimate.</p>'; return; }
    const names = { mid: "mid-week", weekend: "weekend", long: "long weekend" };
    const lines = Object.entries(q.count).filter(([, n]) => n).map(([k, n]) => `<span>${n} ${names[k]} night${n > 1 ? "s" : ""} at ${rand(q.r[k])}</span>`).join("");
    est.innerHTML = `<div class="estimate__top"><span>${q.nights} night${q.nights > 1 ? "s" : ""}, ${q.r.label.toLowerCase()}</span><strong>${rand(q.total)}</strong></div><p class="estimate__lines">${lines}<span>Estimate only. Lindi will confirm availability and the final price.</span></p>`;
  }

  fIn.addEventListener("change", () => {
    if (fIn.value) {
      const minOut = iso(addDays(parse(fIn.value), 1));
      fOut.min = minOut;
      if (!fOut.value || fOut.value <= fIn.value) fOut.value = iso(addDays(parse(fIn.value), 2));
    }
    clearErr(fIn); clearErr(fOut); renderQuote();
  });
  fOut.addEventListener("change", () => { clearErr(fOut); renderQuote(); });

  $$("[data-stepper]").forEach((st) => {
    const input = $("input", st);
    $$("button", st).forEach((btn) => btn.addEventListener("click", () => {
      const v = Math.min(+input.max, Math.max(+input.min, (+input.value || 0) + +btn.dataset.step));
      input.value = v;
      input.dispatchEvent(new Event("input"));
    }));
    input.addEventListener("input", () => { guestsOk(); renderQuote(); });
  });

  function setErr(input) { input.closest(".field").classList.add("has-error"); input.setAttribute("aria-invalid", "true"); }
  function clearErr(input) { input.closest(".field").classList.remove("has-error"); input.removeAttribute("aria-invalid"); }
  ["#f-name", "#f-phone"].forEach((s) => $(s).addEventListener("input", (e) => clearErr(e.target)));
  function guestsOk() {
    const ok = (+fAdults.value || 0) + (+fKids.value || 0) <= 9 && (+fAdults.value || 0) >= 1;
    $("#e-guests").classList.toggle("is-shown", !ok);
    return ok;
  }

  let via = "whatsapp";
  $$('button[type="submit"]', form).forEach((b) => b.addEventListener("click", () => (via = b.value)));

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $("#f-name"), phone = $("#f-phone");
    let first = null;
    const fail = (el) => { setErr(el); first = first || el; };
    if (!name.value.trim()) fail(name);
    if (phone.value.replace(/\D/g, "").length < 9) fail(phone);
    if (!fIn.value) fail(fIn);
    if (!fOut.value || (fIn.value && fOut.value <= fIn.value)) fail(fOut);
    const gOk = guestsOk();
    if (first || !gOk) { (first || fAdults).focus(); return; }

    const q = quote();
    const adults = +fAdults.value, kids = +fKids.value;
    const guests = `${adults} adult${adults > 1 ? "s" : ""}${kids ? `, ${kids} kid${kids > 1 ? "s" : ""} under 14` : ""}`;
    const msg = $("#f-msg").value.trim();
    const lines = [
      "Hi Lindi, I'd like to book Hakuna Matata Kranspoort.",
      "",
      `Name: ${name.value.trim()}`,
      `Phone: ${phone.value.trim()}`,
      `Check-in: ${fmtDate(q.a)}`,
      `Check-out: ${fmtDate(q.b)} (${q.nights} night${q.nights > 1 ? "s" : ""})`,
      `Guests: ${guests}`,
      `Website estimate: ${rand(q.total)} (${q.r.label.toLowerCase()})`,
    ];
    if (msg) lines.push("", msg);
    const text = lines.join("\n");

    if (via === "email") {
      const subject = `Booking enquiry: ${fmtDate(q.a)} to ${fmtDate(q.b)}`;
      location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text.replace(/\n/g, "\r\n"))}`;
    } else {
      window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    }
  });

  window.addEventListener("load", () => hasGsap && ScrollTrigger.refresh());
})();
