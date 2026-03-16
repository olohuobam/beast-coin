import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

// ─── Color palette ───────────────────────────────────────────────────
const C = {
  cyan:   "#00C8E0",
  pink:   "#FF2D78",
  gold:   "#FFB800",
  dark:   "#050A0F",
  darker: "#020507",
};

// ─── Utility: cn ─────────────────────────────────────────────────────
const cn = (...c) => c.filter(Boolean).join(" ");

// ═════════════════════════════════════════════════════════════════════
// 1.  THREE.JS COIN SCENE
// ═════════════════════════════════════════════════════════════════════
function CoinScene() {
  const mountRef = useRef(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    // Scene
    const scene    = new THREE.Scene();
    const w = el.clientWidth, h = el.clientHeight;
    const camera   = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.set(0, 0, 4.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);

    const gold1 = new THREE.PointLight(0xFFB800, 8, 12);
    gold1.position.set(3, 3, 3);
    scene.add(gold1);

    const cyan1 = new THREE.PointLight(0x00C8E0, 6, 12);
    cyan1.position.set(-3, -2, 3);
    scene.add(cyan1);

    const pink1 = new THREE.PointLight(0xFF2D78, 5, 10);
    pink1.position.set(0, 3, -2);
    scene.add(pink1);

    // ── Coin body ──
    const coinGeo  = new THREE.CylinderGeometry(1.5, 1.5, 0.18, 80, 1);
    const coinMat  = new THREE.MeshStandardMaterial({
      color:     0xFFB800,
      metalness: 0.95,
      roughness: 0.12,
      envMapIntensity: 1.2,
    });
    const coin = new THREE.Mesh(coinGeo, coinMat);
    coin.rotation.x = Math.PI / 2;
    scene.add(coin);

    // ── Coin rim detail ──
    const rimGeo = new THREE.TorusGeometry(1.5, 0.035, 8, 80);
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xffd040, metalness: 1, roughness: 0.08 });
    const rimF = new THREE.Mesh(rimGeo, rimMat);
    rimF.position.z = 0.09;
    scene.add(rimF);
    const rimB = rimF.clone();
    rimB.position.z = -0.09;
    scene.add(rimB);

    // ── "B" letter extruded shape ──
    const bShape = new THREE.Shape();
    bShape.moveTo(-0.35, -0.7);
    bShape.lineTo(-0.35,  0.7);
    bShape.lineTo( 0.15,  0.7);
    bShape.bezierCurveTo( 0.65,  0.7,  0.65,  0.15,  0.15,  0.15);
    bShape.lineTo(-0.05,  0.15);
    bShape.lineTo(-0.05, -0.05);
    bShape.lineTo( 0.15, -0.05);
    bShape.bezierCurveTo( 0.65, -0.05,  0.65, -0.7,   0.15, -0.7);
    bShape.lineTo(-0.35, -0.7);

    const hole1 = new THREE.Path();
    hole1.moveTo(-0.05, 0.15);
    hole1.lineTo( 0.1,  0.15);
    hole1.bezierCurveTo(0.38, 0.15, 0.38, 0.7, 0.1, 0.7);
    hole1.lineTo(-0.05, 0.7);
    hole1.lineTo(-0.05, 0.15);
    bShape.holes.push(hole1);

    const hole2 = new THREE.Path();
    hole2.moveTo(-0.05, -0.05);
    hole2.lineTo( 0.1,  -0.05);
    hole2.bezierCurveTo(0.4, -0.05, 0.4, -0.7, 0.1, -0.7);
    hole2.lineTo(-0.05, -0.7);
    hole2.lineTo(-0.05, -0.05);
    bShape.holes.push(hole2);

    const extrudeSettings = { depth: 0.08, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 4 };
    const bGeo = new THREE.ExtrudeGeometry(bShape, extrudeSettings);
    const bMat = new THREE.MeshStandardMaterial({ color: 0x00C8E0, metalness: 0.6, roughness: 0.2 });
    const bMesh = new THREE.Mesh(bGeo, bMat);
    bMesh.position.set(0.1, 0, 0.13);
    scene.add(bMesh);

    // ── Lightning bolt ──
    const lShape = new THREE.Shape();
    lShape.moveTo( 0.18,  0.6);
    lShape.lineTo(-0.05,  0.05);
    lShape.lineTo( 0.08,  0.05);
    lShape.lineTo(-0.18, -0.6);
    lShape.lineTo( 0.05, -0.05);
    lShape.lineTo(-0.08, -0.05);
    lShape.lineTo( 0.18,  0.6);
    const lGeo = new THREE.ExtrudeGeometry(lShape, { depth: 0.1, bevelEnabled: false });
    const lMat = new THREE.MeshStandardMaterial({ color: 0xFF2D78, metalness: 0.7, roughness: 0.15, emissive: 0xFF2D78, emissiveIntensity: 0.3 });
    const lMesh = new THREE.Mesh(lGeo, lMat);
    lMesh.position.set(0.05, 0, 0.17);
    scene.add(lMesh);

    // ── Floating particles ──
    const particleCount = 120;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const r = 2.2 + Math.random() * 2.5;
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.random() * Math.PI;
      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    const partGeo = new THREE.BufferGeometry();
    partGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const partMat = new THREE.PointsMaterial({ color: 0xFFB800, size: 0.04, transparent: true, opacity: 0.7 });
    const particles = new THREE.Points(partGeo, partMat);
    scene.add(particles);

    // ── Mouse interaction ──
    let mouseX = 0, mouseY = 0;
    const onMouseMove = (e) => {
      const rect = el.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width  - 0.5) * 2;
      mouseY = ((e.clientY - rect.top)  / rect.height - 0.5) * 2;
    };
    el.addEventListener("mousemove", onMouseMove);

    // ── Animation loop ──
    let frame;
    let t = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      t += 0.01;

      coin.rotation.y  += (mouseX * 0.8 - coin.rotation.y) * 0.05;
      coin.rotation.x  += (-mouseY * 0.4 - coin.rotation.x) * 0.05;
      bMesh.rotation.y  = coin.rotation.y;
      bMesh.rotation.x  = coin.rotation.x;
      lMesh.rotation.y  = coin.rotation.y;
      lMesh.rotation.x  = coin.rotation.x;
      rimF.rotation.x   = coin.rotation.x;
      rimF.rotation.y   = coin.rotation.y;
      rimB.rotation.x   = coin.rotation.x;
      rimB.rotation.y   = coin.rotation.y;

      coin.position.y   = Math.sin(t * 0.8) * 0.12;
      bMesh.position.y  = coin.position.y;
      lMesh.position.y  = coin.position.y;
      rimF.position.y   = coin.position.y;
      rimB.position.y   = coin.position.y;

      particles.rotation.y += 0.002;
      gold1.position.x = Math.sin(t * 0.6) * 3;
      cyan1.position.x = Math.cos(t * 0.7) * 3;

      renderer.render(scene, camera);
    };
    animate();

    // ── Resize ──
    const onResize = () => {
      const nw = el.clientWidth, nh = el.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} style={{ width: "100%", height: "100%", cursor: "grab" }} />;
}

// ═════════════════════════════════════════════════════════════════════
// 2.  PARTICLE BACKGROUND
// ═════════════════════════════════════════════════════════════════════
function ParticleBackground() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W = window.innerWidth, H = window.innerHeight;
    canvas.width = W; canvas.height = H;

    const dots = Array.from({ length: 100 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.5,
      color: [C.cyan, C.pink, C.gold][Math.floor(Math.random() * 3)],
    }));

    let frame;
    const draw = () => {
      frame = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, W, H);
      dots.forEach(d => {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0 || d.x > W) d.vx *= -1;
        if (d.y < 0 || d.y > H) d.vy *= -1;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = d.color;
        ctx.globalAlpha = 0.5;
        ctx.fill();
      });
      // Lines between close dots
      ctx.globalAlpha = 0.08;
      for (let i = 0; i < dots.length; i++)
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x, dy = dots[i].y - dots[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.strokeStyle = C.cyan;
            ctx.stroke();
          }
        }
    };
    draw();

    const onResize = () => {
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W; canvas.height = H;
    };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("resize", onResize); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
    />
  );
}

// ═════════════════════════════════════════════════════════════════════
// 3.  PARALLAX HOOK
// ═════════════════════════════════════════════════════════════════════
function useParallax(factor = 0.3) {
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    const handler = () => setOffset(window.scrollY * factor);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [factor]);
  return offset;
}

// ═════════════════════════════════════════════════════════════════════
// 4.  ANIMATED COUNTER
// ═════════════════════════════════════════════════════════════════════
function Counter({ target, suffix = "", prefix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      let start = 0;
      const step = target / 80;
      const timer = setInterval(() => {
        start += step;
        if (start >= target) { setCount(target); clearInterval(timer); }
        else setCount(Math.floor(start));
      }, 20);
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

// ═════════════════════════════════════════════════════════════════════
// 5.  GLITCH TEXT
// ═════════════════════════════════════════════════════════════════════
function GlitchText({ children, className = "" }) {
  return (
    <span className={cn("glitch", className)} data-text={children}>
      {children}
    </span>
  );
}

// ═════════════════════════════════════════════════════════════════════
// 6.  CARD (tilt on hover)
// ═════════════════════════════════════════════════════════════════════
function TiltCard({ children, className = "", style = {} }) {
  const ref = useRef(null);
  const onMove = (e) => {
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = (e.clientX - left) / width  - 0.5;
    const y = (e.clientY - top)  / height - 0.5;
    ref.current.style.transform = `perspective(600px) rotateY(${x * 16}deg) rotateX(${-y * 16}deg) scale(1.03)`;
  };
  const onLeave = () => { ref.current.style.transform = "perspective(600px) rotateY(0) rotateX(0) scale(1)"; };
  return (
    <div
      ref={ref}
      className={cn("tilt-card", className)}
      style={{ transition: "transform 0.15s ease", ...style }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════
// 7.  SECTION WRAPPER (fade-in on scroll)
// ═════════════════════════════════════════════════════════════════════
function Section({ children, className = "", id = "" }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <section
      id={id}
      ref={ref}
      className={cn("section-wrapper", vis && "visible", className)}
    >
      {children}
    </section>
  );
}

// ═════════════════════════════════════════════════════════════════════
// 8.  NAVBAR
// ═════════════════════════════════════════════════════════════════════
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <nav className={cn("navbar", scrolled && "scrolled")}>
      <div className="nav-logo">
        <span className="logo-beast">$BEAST</span>
        <span className="logo-tag">on Solana</span>
      </div>
      <div className="nav-links">
        <a href="#about">About</a>
        <a href="#tokenomics">Tokenomics</a>
        <a href="#ecosystem">Ecosystem</a>
        <a href="#howto">Buy</a>
        <a href="https://www.youtube.com/channel/UCX6OQ3DkcsbYNE6H8uQQuVA" target="_blank" rel="noreferrer" className="nav-yt">▶ YouTube</a>
      </div>
      <a href="#howto" className="btn-primary nav-cta">Buy $BEAST</a>
    </nav>
  );
}

// ═════════════════════════════════════════════════════════════════════
// 9.  HERO SECTION
// ═════════════════════════════════════════════════════════════════════
function Hero() {
  const pY = useParallax(0.25);
  return (
    <section className="hero" id="hero">
      <div className="hero-text" style={{ transform: `translateY(${pY}px)` }}>
        <div className="hero-badge">🚀 Now Live on Solana</div>
        <h1 className="hero-title">
          <GlitchText>$BEAST</GlitchText>
          <br />
          <span className="hero-sub">The Official MrBeast Coin</span>
        </h1>
        <p className="hero-desc">
          The boldest meme coin on Solana — backed by the world's most viral creator.
          Join millions of fans and own a piece of the Beast empire.
        </p>
        <div className="hero-buttons">
          <a href="#howto" className="btn-primary btn-xl">
            <span>🔥</span> Buy $BEAST Now
          </a>
          <a href="https://www.youtube.com/channel/UCX6OQ3DkcsbYNE6H8uQQuVA" target="_blank" rel="noreferrer" className="btn-outline btn-xl">
            <span>▶</span> Watch MrBeast
          </a>
        </div>
        <div className="hero-stats">
          <div className="stat"><Counter target={285000} suffix="+" /><span>Holders</span></div>
          <div className="stat-div" />
          <div className="stat"><Counter target={42} suffix="M+" prefix="$" /><span>Market Cap</span></div>
          <div className="stat-div" />
          <div className="stat"><Counter target={100000000000} suffix="" /><span>Total Supply</span></div>
        </div>
      </div>
      <div className="hero-coin">
        <CoinScene />
        <div className="coin-glow" />
      </div>
    </section>
  );
}

// ═════════════════════════════════════════════════════════════════════
// 10.  TICKER TAPE
// ═════════════════════════════════════════════════════════════════════
function Ticker() {
  const items = ["$BEAST 🔥 NOW LIVE", "POWERED BY SOLANA ⚡", "MRBEAST OFFICIAL COIN 👑",
    "FEASTABLES CHOCOLATE 🍫", "MRBEAST MERCH 👕", "285K+ HOLDERS 🚀",
    "BUY $BEAST TODAY 💎", "JOIN THE BEAST ARMY 🦁", "$BEAST 🔥 NOW LIVE",
    "POWERED BY SOLANA ⚡"];
  return (
    <div className="ticker">
      <div className="ticker-inner">
        {[...items, ...items].map((t, i) => (
          <span key={i} className="ticker-item">{t}</span>
        ))}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════
// 11.  ABOUT / FEATURES
// ═════════════════════════════════════════════════════════════════════
function About() {
  const pY = useParallax(0.12);
  const features = [
    { icon: "⚡", title: "Solana Speed", desc: "Lightning-fast transactions. Sub-second finality. Near-zero fees. The best blockchain for the best creator." },
    { icon: "🦁", title: "Beast Brand Power", desc: "Backed by MrBeast's 300M+ subscribers and the most viral YouTube empire on the planet." },
    { icon: "🍫", title: "Feastables Integration", desc: "Real-world utility linked to MrBeast's premium chocolate brand and merchandise ecosystem." },
    { icon: "🎁", title: "Epic Giveaways", desc: "Holders get exclusive access to MrBeast-style challenges, prizes, and community events." },
    { icon: "🔒", title: "LP Locked", desc: "Liquidity is permanently locked. Rug-proof and community-first by design." },
    { icon: "🌍", title: "Global Community", desc: "Millions of fans worldwide uniting under one token. The biggest meme coin army ever assembled." },
  ];

  return (
    <Section id="about" className="about">
      <div className="section-inner" style={{ transform: `translateY(${pY * 0.5}px)` }}>
        <div className="section-header">
          <span className="section-tag">Why $BEAST?</span>
          <h2>Built for the <span className="text-cyan">Beast Army</span></h2>
          <p>More than a meme coin — it's the token of the world's biggest creator.</p>
        </div>
        <div className="features-grid">
          {features.map((f, i) => (
            <TiltCard key={i} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </TiltCard>
          ))}
        </div>
      </div>
    </Section>
  );
}

// ═════════════════════════════════════════════════════════════════════
// 12.  TOKENOMICS
// ═════════════════════════════════════════════════════════════════════
function Tokenomics() {
  const segments = [
    { label: "Community", pct: 40, color: C.cyan },
    { label: "Liquidity", pct: 25, color: C.gold },
    { label: "Marketing", pct: 15, color: C.pink },
    { label: "Dev & Team", pct: 10, color: "#a855f7" },
    { label: "Reserve",   pct: 10, color: "#22c55e" },
  ];

  // SVG donut
  const r = 80, cx = 100, cy = 100;
  const circ = 2 * Math.PI * r;
  let cumulative = 0;
  const arcs = segments.map(s => {
    const dashArr = (s.pct / 100) * circ;
    const dashOff = circ - dashArr;
    const rotate  = -90 + (cumulative / 100) * 360;
    cumulative   += s.pct;
    return { ...s, dashArr, dashOff, rotate };
  });

  return (
    <Section id="tokenomics" className="tokenomics">
      <div className="section-inner">
        <div className="section-header">
          <span className="section-tag">Tokenomics</span>
          <h2>100 Billion <span className="text-pink">$BEAST</span></h2>
          <p>Fair, transparent, community-first distribution.</p>
        </div>
        <div className="token-layout">
          <div className="donut-wrap">
            <svg viewBox="0 0 200 200" className="donut-svg">
              {arcs.map((a, i) => (
                <circle
                  key={i}
                  cx={cx} cy={cy} r={r}
                  fill="none"
                  stroke={a.color}
                  strokeWidth="28"
                  strokeDasharray={`${a.dashArr} ${circ - a.dashArr}`}
                  strokeDashoffset={a.dashOff + circ * (cumulative - a.pct) / 100 - circ * cumulative / 100 + circ}
                  transform={`rotate(${a.rotate} ${cx} ${cy})`}
                  style={{ filter: `drop-shadow(0 0 6px ${a.color})` }}
                />
              ))}
              <text x="100" y="95"  textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">100B</text>
              <text x="100" y="112" textAnchor="middle" fill="#aaa"  fontSize="8">$BEAST</text>
            </svg>
          </div>
          <div className="token-legend">
            {segments.map((s, i) => (
              <div key={i} className="legend-row">
                <div className="legend-dot" style={{ background: s.color, boxShadow: `0 0 8px ${s.color}` }} />
                <span className="legend-label">{s.label}</span>
                <span className="legend-pct" style={{ color: s.color }}>{s.pct}%</span>
                <div className="legend-bar-wrap">
                  <div className="legend-bar" style={{ width: `${s.pct * 2}%`, background: s.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="token-info-grid">
          {[
            { label: "Token Name", value: "$BEAST" },
            { label: "Blockchain", value: "Solana (SOL)" },
            { label: "Total Supply", value: "100,000,000,000" },
            { label: "Contract", value: "Coming Soon" },
            { label: "Tax", value: "0% Buy / 0% Sell" },
            { label: "LP Status", value: "🔒 Locked Forever" },
          ].map((d, i) => (
            <div key={i} className="token-info-card">
              <span className="ti-label">{d.label}</span>
              <span className="ti-value">{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

// ═════════════════════════════════════════════════════════════════════
// 13.  ECOSYSTEM (MrBeast links)
// ═════════════════════════════════════════════════════════════════════
function Ecosystem() {
  const items = [
    {
      title: "MrBeast Store",
      desc: "Official merch — hoodies, tees, hats. Wear the Beast.",
      icon: "👕",
      url: "https://mrbeast.store",
      cta: "Shop Merch",
      color: C.cyan,
    },
    {
      title: "Feastables",
      desc: "MrBeast's premium chocolate brand. Delicious and wild.",
      icon: "🍫",
      url: "https://feastables.com",
      cta: "Get Chocolate",
      color: C.pink,
    },
    {
      title: "YouTube Channel",
      desc: "300M+ subscribers. The most insane videos on the internet.",
      icon: "▶",
      url: "https://www.youtube.com/channel/UCX6OQ3DkcsbYNE6H8uQQuVA",
      cta: "Watch Now",
      color: C.gold,
    },
  ];

  return (
    <Section id="ecosystem" className="ecosystem">
      <div className="section-inner">
        <div className="section-header">
          <span className="section-tag">The Beast Empire</span>
          <h2>One Brand, <span className="text-gold">Infinite Power</span></h2>
          <p>$BEAST connects you to the entire MrBeast universe.</p>
        </div>
        <div className="eco-grid">
          {items.map((item, i) => (
            <TiltCard key={i} className="eco-card" style={{ "--accent": item.color }}>
              <div className="eco-icon" style={{ color: item.color, borderColor: item.color, boxShadow: `0 0 20px ${item.color}40` }}>
                {item.icon}
              </div>
              <h3 style={{ color: item.color }}>{item.title}</h3>
              <p>{item.desc}</p>
              <a href={item.url} target="_blank" rel="noreferrer" className="eco-btn" style={{ background: item.color }}>
                {item.cta} →
              </a>
            </TiltCard>
          ))}
        </div>
      </div>
    </Section>
  );
}

// ═════════════════════════════════════════════════════════════════════
// 14.  HOW TO BUY
// ═════════════════════════════════════════════════════════════════════
function HowToBuy() {
  const steps = [
    { n: "01", title: "Get a Solana Wallet", desc: "Download Phantom or Solflare wallet on your phone or browser extension.", icon: "👛" },
    { n: "02", title: "Buy SOL", desc: "Purchase SOL from any major exchange like Coinbase, Binance, or Kraken.", icon: "💰" },
    { n: "03", title: "Go to Jupiter or Raydium", desc: "Visit jup.ag or raydium.io and connect your wallet.", icon: "🔗" },
    { n: "04", title: "Swap for $BEAST", desc: "Paste the $BEAST contract address, enter your amount, and swap!", icon: "⚡" },
  ];

  return (
    <Section id="howto" className="howto">
      <div className="section-inner">
        <div className="section-header">
          <span className="section-tag">How To Buy</span>
          <h2>Get <span className="text-cyan">$BEAST</span> in 4 Steps</h2>
          <p>Simple, fast, and on the Solana network — lowest fees ever.</p>
        </div>
        <div className="steps-grid">
          {steps.map((s, i) => (
            <TiltCard key={i} className="step-card">
              <div className="step-num">{s.n}</div>
              <div className="step-icon">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              {i < steps.length - 1 && <div className="step-arrow">→</div>}
            </TiltCard>
          ))}
        </div>
        <div className="buy-ctas">
          <a href="https://jup.ag" target="_blank" rel="noreferrer" className="btn-primary btn-xl">Buy on Jupiter ⚡</a>
          <a href="https://raydium.io" target="_blank" rel="noreferrer" className="btn-outline btn-xl">Buy on Raydium 🌊</a>
        </div>
      </div>
    </Section>
  );
}

// ═════════════════════════════════════════════════════════════════════
// 15.  COMMUNITY / CTA BANNER
// ═════════════════════════════════════════════════════════════════════
function Community() {
  return (
    <Section className="community">
      <div className="community-inner">
        <div className="community-glow" />
        <div className="section-tag">Join the Movement</div>
        <h2>The <GlitchText>Beast Army</GlitchText> is Growing 🦁</h2>
        <p>285,000+ holders and counting. Don't miss the revolution.</p>
        <div className="social-links">
          {[
            { icon: "🐦", label: "Twitter / X",  href: "#" },
            { icon: "💬", label: "Telegram",      href: "#" },
            { icon: "🎮", label: "Discord",       href: "#" },
            { icon: "▶",  label: "YouTube",       href: "https://www.youtube.com/channel/UCX6OQ3DkcsbYNE6H8uQQuVA" },
          ].map((s, i) => (
            <a key={i} href={s.href} target="_blank" rel="noreferrer" className="social-btn">
              <span>{s.icon}</span> {s.label}
            </a>
          ))}
        </div>
        <a href="#howto" className="btn-primary btn-xl btn-glow">🔥 Buy $BEAST — Join Now</a>
      </div>
    </Section>
  );
}

// ═════════════════════════════════════════════════════════════════════
// 16.  FOOTER
// ═════════════════════════════════════════════════════════════════════
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-logo">$BEAST</div>
        <p className="footer-disclaimer">
          $BEAST is a community meme token on Solana. Not financial advice. Always DYOR.
          MrBeast brand assets used for fan/community purposes only.
        </p>
        <div className="footer-links">
          <a href="https://mrbeast.store" target="_blank" rel="noreferrer">MrBeast Store</a>
          <a href="https://feastables.com" target="_blank" rel="noreferrer">Feastables</a>
          <a href="https://www.youtube.com/channel/UCX6OQ3DkcsbYNE6H8uQQuVA" target="_blank" rel="noreferrer">YouTube</a>
        </div>
        <p className="footer-copy">© 2025 $BEAST Community · Built on Solana ⚡</p>
      </div>
    </footer>
  );
}

// ═════════════════════════════════════════════════════════════════════
// 17.  ROOT APP
// ═════════════════════════════════════════════════════════════════════
export default function App() {
  return (
    <>
      <style>{CSS}</style>
      <ParticleBackground />
      <Navbar />
      <main>
        <Hero />
        <Ticker />
        <About />
        <Tokenomics />
        <Ecosystem />
        <HowToBuy />
        <Community />
      </main>
      <Footer />
    </>
  );
}

// ═════════════════════════════════════════════════════════════════════
// 18.  CSS
// ═════════════════════════════════════════════════════════════════════
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --cyan:   #00C8E0;
    --pink:   #FF2D78;
    --gold:   #FFB800;
    --dark:   #050A0F;
    --darker: #020507;
    --text:   #e8f0f5;
    --muted:  #6b7fa0;
  }

  html { scroll-behavior: smooth; }

  body {
    background: var(--darker);
    color: var(--text);
    font-family: 'Space Grotesk', sans-serif;
    overflow-x: hidden;
  }

  /* ── SCROLLBAR ── */
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: var(--darker); }
  ::-webkit-scrollbar-thumb { background: var(--cyan); border-radius: 3px; }

  /* ── GLITCH ── */
  .glitch {
    position: relative;
    color: var(--cyan);
  }
  .glitch::before, .glitch::after {
    content: attr(data-text);
    position: absolute;
    top: 0; left: 0;
    width: 100%;
  }
  .glitch::before {
    color: var(--pink);
    animation: glitch1 3s infinite;
    clip-path: polygon(0 30%, 100% 30%, 100% 60%, 0 60%);
  }
  .glitch::after {
    color: var(--cyan);
    animation: glitch2 3s infinite;
    clip-path: polygon(0 60%, 100% 60%, 100% 80%, 0 80%);
  }
  @keyframes glitch1 {
    0%,90%,100% { transform: translate(0); }
    92% { transform: translate(-3px, 1px); }
    94% { transform: translate(3px, -1px); }
    96% { transform: translate(-2px, 2px); }
  }
  @keyframes glitch2 {
    0%,88%,100% { transform: translate(0); }
    90% { transform: translate(3px, -2px); }
    93% { transform: translate(-3px, 2px); }
  }

  /* ── SECTION FADE-IN ── */
  .section-wrapper {
    opacity: 0;
    transform: translateY(40px);
    transition: opacity 0.8s ease, transform 0.8s ease;
  }
  .section-wrapper.visible {
    opacity: 1;
    transform: translateY(0);
  }

  /* ── NAVBAR ── */
  .navbar {
    position: fixed;
    top: 0; left: 0; right: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 40px;
    transition: all 0.3s ease;
  }
  .navbar.scrolled {
    background: rgba(2, 5, 7, 0.92);
    backdrop-filter: blur(16px);
    padding: 14px 40px;
    border-bottom: 1px solid rgba(0, 200, 224, 0.15);
  }
  .nav-logo { display: flex; flex-direction: column; line-height: 1; }
  .logo-beast { font-family: 'Bebas Neue', sans-serif; font-size: 28px; color: var(--cyan); letter-spacing: 2px; }
  .logo-tag   { font-size: 9px; color: var(--gold); letter-spacing: 3px; text-transform: uppercase; }
  .nav-links  { display: flex; gap: 28px; }
  .nav-links a { color: var(--muted); font-size: 14px; font-weight: 500; text-decoration: none; transition: color 0.2s; }
  .nav-links a:hover { color: var(--cyan); }
  .nav-yt { color: var(--pink) !important; }
  .nav-cta { display: none; }
  @media (min-width: 900px) { .nav-cta { display: block; } }

  /* ── BUTTONS ── */
  .btn-primary {
    display: inline-flex; align-items: center; gap: 8px;
    background: linear-gradient(135deg, var(--cyan), #0099b0);
    color: #000;
    font-weight: 700;
    font-size: 14px;
    padding: 12px 24px;
    border-radius: 8px;
    text-decoration: none;
    transition: all 0.2s;
    border: none; cursor: pointer;
    letter-spacing: 0.5px;
  }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,200,224,0.4); }
  .btn-outline {
    display: inline-flex; align-items: center; gap: 8px;
    background: transparent;
    color: var(--text);
    font-weight: 600;
    font-size: 14px;
    padding: 12px 24px;
    border-radius: 8px;
    text-decoration: none;
    border: 1.5px solid rgba(255,255,255,0.2);
    transition: all 0.2s;
    cursor: pointer;
  }
  .btn-outline:hover { border-color: var(--cyan); color: var(--cyan); transform: translateY(-2px); }
  .btn-xl { padding: 16px 36px; font-size: 16px; border-radius: 10px; }
  .btn-glow { box-shadow: 0 0 30px rgba(0,200,224,0.5); animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100% { box-shadow: 0 0 20px rgba(0,200,224,0.5); } 50% { box-shadow: 0 0 40px rgba(0,200,224,0.8); } }

  /* ── HERO ── */
  .hero {
    position: relative;
    min-height: 100vh;
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
    padding: 120px 60px 80px;
    gap: 40px;
    overflow: hidden;
  }
  .hero::before {
    content: '';
    position: absolute;
    top: -200px; left: -200px;
    width: 700px; height: 700px;
    background: radial-gradient(circle, rgba(0,200,224,0.07) 0%, transparent 70%);
    pointer-events: none;
  }
  .hero-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(0,200,224,0.1);
    border: 1px solid rgba(0,200,224,0.3);
    color: var(--cyan);
    font-size: 13px;
    font-weight: 600;
    padding: 6px 16px;
    border-radius: 100px;
    margin-bottom: 24px;
    letter-spacing: 0.5px;
  }
  .hero-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(72px, 10vw, 130px);
    line-height: 0.9;
    margin-bottom: 24px;
  }
  .hero-sub {
    font-size: clamp(18px, 3vw, 30px);
    color: var(--muted);
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 300;
    letter-spacing: 2px;
    text-transform: uppercase;
  }
  .hero-desc {
    color: var(--muted);
    font-size: 17px;
    line-height: 1.7;
    max-width: 480px;
    margin-bottom: 36px;
  }
  .hero-buttons { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 48px; }
  .hero-stats {
    display: flex; align-items: center; gap: 24px;
    padding: 20px 24px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 12px;
    width: fit-content;
  }
  .stat { display: flex; flex-direction: column; align-items: center; }
  .stat span:first-child { font-family: 'Bebas Neue'; font-size: 28px; color: var(--cyan); }
  .stat span:last-child  { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; }
  .stat-div { width: 1px; height: 40px; background: rgba(255,255,255,0.1); }
  .hero-coin { position: relative; height: 520px; }
  .coin-glow {
    position: absolute; bottom: 60px; left: 50%; transform: translateX(-50%);
    width: 300px; height: 60px;
    background: radial-gradient(ellipse, rgba(255,184,0,0.35) 0%, transparent 70%);
    filter: blur(20px);
    pointer-events: none;
  }

  /* ── TICKER ── */
  .ticker {
    background: linear-gradient(90deg, var(--pink), var(--cyan), var(--gold), var(--pink));
    background-size: 200%;
    animation: bgShift 4s linear infinite;
    padding: 12px 0;
    overflow: hidden;
    white-space: nowrap;
  }
  @keyframes bgShift { 0%{background-position:0%} 100%{background-position:200%} }
  .ticker-inner {
    display: inline-flex;
    animation: ticker 30s linear infinite;
  }
  .ticker-item {
    color: #000;
    font-weight: 800;
    font-size: 13px;
    letter-spacing: 2px;
    padding: 0 36px;
  }
  @keyframes ticker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }

  /* ── SECTIONS ── */
  .section-inner { max-width: 1200px; margin: 0 auto; padding: 0 40px; }
  section { padding: 100px 0; position: relative; }
  .section-header { text-align: center; margin-bottom: 64px; }
  .section-tag {
    display: inline-block;
    font-size: 11px; font-weight: 700;
    letter-spacing: 3px; text-transform: uppercase;
    color: var(--cyan);
    background: rgba(0,200,224,0.08);
    border: 1px solid rgba(0,200,224,0.2);
    padding: 6px 16px;
    border-radius: 100px;
    margin-bottom: 16px;
  }
  .section-header h2 { font-family: 'Bebas Neue'; font-size: clamp(40px,6vw,72px); margin-bottom: 16px; }
  .section-header p   { color: var(--muted); font-size: 17px; max-width: 520px; margin: 0 auto; }
  .text-cyan  { color: var(--cyan); }
  .text-pink  { color: var(--pink); }
  .text-gold  { color: var(--gold); }

  /* ── FEATURES ── */
  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;
  }
  .feature-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px;
    padding: 32px;
    transition: border-color 0.3s;
  }
  .feature-card:hover { border-color: rgba(0,200,224,0.3); }
  .feature-icon { font-size: 36px; margin-bottom: 16px; }
  .feature-card h3 { font-size: 18px; font-weight: 700; margin-bottom: 10px; }
  .feature-card p  { color: var(--muted); font-size: 14px; line-height: 1.7; }

  /* ── TOKENOMICS ── */
  .tokenomics { background: rgba(0,200,224,0.02); }
  .token-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; margin-bottom: 60px; }
  .donut-wrap { display: flex; justify-content: center; }
  .donut-svg  { width: 280px; height: 280px; }
  .token-legend { display: flex; flex-direction: column; gap: 18px; }
  .legend-row {
    display: grid;
    grid-template-columns: 12px 140px 48px 1fr;
    align-items: center;
    gap: 12px;
  }
  .legend-dot   { width: 12px; height: 12px; border-radius: 50%; }
  .legend-label { font-size: 14px; color: var(--text); }
  .legend-pct   { font-family: 'Bebas Neue'; font-size: 20px; }
  .legend-bar-wrap { height: 4px; background: rgba(255,255,255,0.06); border-radius: 2px; }
  .legend-bar   { height: 100%; border-radius: 2px; }
  .token-info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 16px;
  }
  .token-info-card {
    display: flex; flex-direction: column; gap: 6px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 12px;
    padding: 20px;
  }
  .ti-label { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 1.5px; }
  .ti-value  { font-size: 16px; font-weight: 700; color: var(--cyan); }

  /* ── ECOSYSTEM ── */
  .eco-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px,1fr)); gap: 32px; }
  .eco-card {
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 20px;
    padding: 40px 32px;
    text-align: center;
    transition: border-color 0.3s;
  }
  .eco-card:hover { border-color: var(--accent); }
  .eco-icon {
    display: inline-flex; align-items: center; justify-content: center;
    width: 72px; height: 72px;
    border-radius: 20px;
    border: 1.5px solid;
    font-size: 28px;
    margin-bottom: 20px;
  }
  .eco-card h3 { font-family: 'Bebas Neue'; font-size: 28px; margin-bottom: 12px; }
  .eco-card p  { color: var(--muted); font-size: 14px; line-height: 1.7; margin-bottom: 24px; }
  .eco-btn {
    display: inline-block;
    padding: 12px 28px;
    border-radius: 8px;
    text-decoration: none;
    color: #000;
    font-weight: 700;
    font-size: 14px;
    transition: opacity 0.2s, transform 0.2s;
  }
  .eco-btn:hover { opacity: 0.85; transform: translateY(-2px); }

  /* ── HOW TO BUY ── */
  .steps-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px,1fr)); gap: 24px; margin-bottom: 48px; }
  .step-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px;
    padding: 36px 28px;
    position: relative;
    text-align: center;
    transition: border-color 0.3s;
  }
  .step-card:hover { border-color: var(--cyan); }
  .step-num  { font-family:'Bebas Neue'; font-size:56px; color:rgba(0,200,224,0.15); line-height:1; margin-bottom:8px; }
  .step-icon { font-size: 36px; margin-bottom: 16px; }
  .step-card h3 { font-size: 17px; font-weight: 700; margin-bottom: 10px; }
  .step-card p  { color: var(--muted); font-size: 14px; line-height: 1.6; }
  .step-arrow {
    position: absolute;
    top: 50%; right: -20px;
    transform: translateY(-50%);
    color: var(--cyan);
    font-size: 24px;
    font-weight: bold;
    z-index: 1;
  }
  .buy-ctas { display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; }

  /* ── COMMUNITY ── */
  .community { text-align: center; }
  .community-inner {
    max-width: 800px;
    margin: 0 auto;
    padding: 80px 40px;
    background: rgba(0,200,224,0.04);
    border: 1px solid rgba(0,200,224,0.12);
    border-radius: 32px;
    position: relative;
    overflow: hidden;
  }
  .community-glow {
    position: absolute;
    top: -100px; left: 50%; transform: translateX(-50%);
    width: 500px; height: 300px;
    background: radial-gradient(ellipse, rgba(0,200,224,0.1) 0%, transparent 70%);
    pointer-events: none;
  }
  .community h2 { font-family: 'Bebas Neue'; font-size: clamp(40px,6vw,72px); margin: 16px 0 16px; }
  .community p  { color: var(--muted); font-size: 17px; margin-bottom: 36px; }
  .social-links { display: flex; justify-content: center; gap: 16px; flex-wrap: wrap; margin-bottom: 36px; }
  .social-btn {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    color: var(--text);
    padding: 12px 20px;
    border-radius: 10px;
    text-decoration: none;
    font-size: 14px;
    font-weight: 600;
    transition: all 0.2s;
  }
  .social-btn:hover { background: rgba(0,200,224,0.1); border-color: var(--cyan); color: var(--cyan); }

  /* ── FOOTER ── */
  .footer { border-top: 1px solid rgba(255,255,255,0.07); padding: 60px 0 40px; }
  .footer-inner { max-width: 1200px; margin: 0 auto; padding: 0 40px; text-align: center; }
  .footer-logo { font-family: 'Bebas Neue'; font-size: 48px; color: var(--cyan); margin-bottom: 16px; letter-spacing: 4px; }
  .footer-disclaimer { color: var(--muted); font-size: 13px; max-width: 600px; margin: 0 auto 24px; line-height: 1.6; }
  .footer-links { display: flex; justify-content: center; gap: 28px; margin-bottom: 24px; }
  .footer-links a { color: var(--muted); text-decoration: none; font-size: 14px; transition: color 0.2s; }
  .footer-links a:hover { color: var(--cyan); }
  .footer-copy { color: rgba(255,255,255,0.2); font-size: 12px; }

  /* ── RESPONSIVE ── */
  @media (max-width: 900px) {
    .hero { grid-template-columns: 1fr; padding: 100px 24px 60px; }
    .hero-coin { height: 360px; }
    .navbar { padding: 16px 24px; }
    .nav-links { display: none; }
    .token-layout { grid-template-columns: 1fr; }
    .section-inner { padding: 0 24px; }
    .step-arrow { display: none; }
  }
`;
