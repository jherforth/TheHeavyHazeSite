// The Heavy Haze — smoke & interactions
(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.getElementById("year").textContent = new Date().getFullYear();

  // Header wordmark appears once the hero title has scrolled away
  const onScroll = () => document.body.classList.toggle("scrolled", scrollY > innerHeight * 0.6);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Mobile nav
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("nav");
  const setNav = open => {
    nav.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", open);
    toggle.textContent = open ? "Close" : "Menu";
  };
  toggle.addEventListener("click", () => setNav(!nav.classList.contains("open")));
  nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => setNav(false)));

  // Sections drift in out of a blur
  if (!reduced && "IntersectionObserver" in window) {
    const targets = document.querySelectorAll(".section > *");
    targets.forEach(t => t.classList.add("reveal"));
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); }
    }), { threshold: 0.12 });
    targets.forEach(t => io.observe(t));
  }

  // Smoke
  const c = document.getElementById("smoke");
  const ctx = c.getContext("2d");
  let W, H, dpr;
  const resize = () => {
    dpr = Math.min(devicePixelRatio || 1, 1.5);
    W = innerWidth; H = innerHeight;
    c.width = W * dpr; c.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  addEventListener("resize", resize);

  // Pre-render a few irregular, wispy puff sprites
  const makeSprite = seed => {
    const s = 256, cv = document.createElement("canvas");
    cv.width = cv.height = s;
    const g = cv.getContext("2d");
    let r = seed;
    const rand = () => (r = (r * 9301 + 49297) % 233280) / 233280;
    for (let i = 0; i < 26; i++) {
      const x = s / 2 + (rand() - 0.5) * s * 0.45;
      const y = s / 2 + (rand() - 0.5) * s * 0.45;
      const rad = s * (0.12 + rand() * 0.22);
      const grd = g.createRadialGradient(x, y, 0, x, y, rad);
      grd.addColorStop(0, "rgba(235,232,228,0.10)");
      grd.addColorStop(1, "rgba(235,232,228,0)");
      g.fillStyle = grd;
      g.beginPath(); g.arc(x, y, rad, 0, Math.PI * 2); g.fill();
    }
    return cv;
  };
  const sprites = [11, 42, 77, 123, 999].map(makeSprite);

  const puffs = [];
  const spawn = (x, y, burst) => ({
    x, y,
    size: burst ? 80 + Math.random() * 90 : 260 + Math.random() * 380,
    grow: burst ? 0.9 : 0.25 + Math.random() * 0.3,
    vx: (Math.random() - 0.5) * (burst ? 0.8 : 0.25),
    vy: burst ? -0.3 - Math.random() * 0.5 : -0.25 - Math.random() * 0.45,
    rot: Math.random() * Math.PI * 2,
    vr: (Math.random() - 0.5) * 0.002,
    life: 0,
    max: burst ? 260 + Math.random() * 120 : 1400 + Math.random() * 900,
    peak: burst ? 0.35 : 0.22 + Math.random() * 0.25,
    sprite: sprites[(Math.random() * sprites.length) | 0],
    phase: Math.random() * 100,
  });

  const ambient = () => spawn(Math.random() * W, H + 100 + Math.random() * 200, false);
  for (let i = 0; i < 18; i++) {
    const p = ambient();
    p.y = Math.random() * H * 1.3;
    p.life = Math.random() * p.max;
    puffs.push(p);
  }

  // Moving the pointer stirs up the smoke
  let last = 0;
  addEventListener("pointermove", e => {
    const now = performance.now();
    if (reduced || now - last < 70 || puffs.length > 70) return;
    last = now;
    puffs.push(spawn(e.clientX, e.clientY, true));
  }, { passive: true });

  const step = () => {
    ctx.clearRect(0, 0, W, H);
    for (let i = puffs.length - 1; i >= 0; i--) {
      const p = puffs[i];
      p.life++;
      p.phase += 0.004;
      p.x += p.vx + Math.sin(p.phase) * 0.25;
      p.y += p.vy;
      p.size += p.grow;
      p.rot += p.vr;
      const t = p.life / p.max;
      const alpha = p.peak * Math.sin(Math.PI * Math.min(t, 1));
      if (t >= 1) {
        if (p.grow > 0.8) puffs.splice(i, 1); // pointer puff: gone
        else puffs[i] = ambient();
        continue;
      }
      ctx.globalAlpha = alpha;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.drawImage(p.sprite, -p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    if (!reduced) requestAnimationFrame(step);
  };
  step();
})();
