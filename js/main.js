// The Heavy Haze — atmosphere & interactions
(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Year
  document.getElementById("year").textContent = new Date().getFullYear();

  // Mobile nav
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("nav");
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open);
    toggle.textContent = open ? "Close" : "Menu";
  });
  nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.textContent = "Menu";
  }));

  // Rose window (generated stained glass)
  const rose = document.getElementById("rose");
  const NS = "http://www.w3.org/2000/svg";
  const el = (tag, attrs) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  };
  const glass = ["#6e0f14", "#9b1b22", "#2b1f4a", "#4a3a55", "#1d3a3a", "#8a6f3d"];
  const lead = { fill: "none", stroke: "#c6a15b", "stroke-width": 0.6 };
  rose.appendChild(el("circle", { r: 96, ...lead, "stroke-width": 1.5 }));
  rose.appendChild(el("circle", { r: 90, ...lead }));
  const rings = [{ n: 16, r1: 58, r2: 88 }, { n: 8, r1: 28, r2: 56 }];
  rings.forEach(({ n, r1, r2 }, ri) => {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2, w = (Math.PI / n) * 0.82;
      const p = (r, t) => `${(Math.cos(t) * r).toFixed(2)} ${(Math.sin(t) * r).toFixed(2)}`;
      const d = `M${p(r1, a - w * 0.6)} L${p(r2 * 0.85, a - w)} A${r2} ${r2} 0 0 1 ${p(r2 * 0.85, a + w)} L${p(r1, a + w * 0.6)} Z`;
      rose.appendChild(el("path", { d, ...lead, fill: glass[(i + ri * 2) % glass.length], "fill-opacity": 0.7 }));
      const cx = Math.cos(a) * (r2 + 2), cy = Math.sin(a) * (r2 + 2);
      if (ri === 0) rose.appendChild(el("circle", { cx, cy, r: 3.5, ...lead, fill: "#9b1b22" }));
    }
  });
  rose.appendChild(el("circle", { r: 24, ...lead, fill: "#140d0f", "stroke-width": 1.2 }));
  rose.appendChild(el("path", { d: "M-3 -18h6v12h12v6H3v18h-6V0h-12v-6h12z", fill: "#c6a15b" }));

  // Scroll reveal
  const targets = document.querySelectorAll(".section > *");
  if (!reduced && "IntersectionObserver" in window) {
    targets.forEach(t => t.classList.add("reveal"));
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); }
    }), { threshold: 0.15 });
    targets.forEach(t => io.observe(t));
  }

  // Drifting haze / incense smoke
  const c = document.getElementById("haze");
  const ctx = c.getContext("2d");
  let W, H, puffs = [];
  const resize = () => {
    W = c.width = innerWidth; H = c.height = innerHeight;
  };
  resize(); addEventListener("resize", resize);
  const colors = ["110,15,20", "74,58,85", "60,50,60", "90,70,80"];
  const spawn = (init) => ({
    x: Math.random() * W,
    y: init ? Math.random() * H : H + 200,
    r: 120 + Math.random() * 260,
    vx: (Math.random() - 0.5) * 0.25,
    vy: -0.15 - Math.random() * 0.35,
    a: 0.04 + Math.random() * 0.08,
    col: colors[(Math.random() * colors.length) | 0],
    t: Math.random() * 1000,
  });
  for (let i = 0; i < 22; i++) puffs.push(spawn(true));

  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    for (const p of puffs) {
      p.t += 0.005;
      p.x += p.vx + Math.sin(p.t) * 0.3;
      p.y += p.vy;
      p.r += 0.08;
      if (p.y + p.r < -100) Object.assign(p, spawn(false));
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
      g.addColorStop(0, `rgba(${p.col},${p.a})`);
      g.addColorStop(1, `rgba(${p.col},0)`);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    }
    if (!reduced) requestAnimationFrame(draw);
  };
  draw();
})();
