"use client";
import { useEffect, useRef } from "react";

// Canvas fireworks background for the hero section
export default function Fireworks({ density = 1 }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let W, H, raf;
    const resize = () => {
      W = canvas.width = canvas.offsetWidth * devicePixelRatio;
      H = canvas.height = canvas.offsetHeight * devicePixelRatio;
    };
    resize();
    window.addEventListener("resize", resize);

    const COLORS = ["#e63946", "#ffd166", "#ff9e00", "#7b2cbf", "#4cc9f0", "#f72585", "#80ed99"];
    let particles = [];
    const spawn = (x, y) => {
      const color = COLORS[(Math.random() * COLORS.length) | 0];
      const n = 40 + (Math.random() * 40) | 0;
      for (let i = 0; i < n; i++) {
        const a = (Math.PI * 2 * i) / n + Math.random() * 0.4;
        const v = (1.5 + Math.random() * 3.5) * devicePixelRatio * 0.6;
        particles.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1, color, size: 1.5 * devicePixelRatio });
      }
    };
    let last = 0;
    const loop = (ts) => {
      if (ts - last > (900 / density)) {
        last = ts;
        spawn(W * (0.1 + Math.random() * 0.8), H * (0.08 + Math.random() * 0.5));
      }
      ctx.clearRect(0, 0, W, H);
      particles = particles.filter((p) => p.life > 0.02);
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        p.vy += 0.02 * devicePixelRatio; // gravity
        p.vx *= 0.985; p.vy *= 0.985;
        p.life *= 0.965;
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, [density]);

  return <canvas id="fw-canvas" ref={canvasRef} />;
}
