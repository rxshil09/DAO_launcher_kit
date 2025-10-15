// BackgroundParticles.jsx
import React from "react";
import { motion } from "framer-motion";

/** Deterministic PRNG so visuals are identical across routes */
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Fixed, route-stable animated background.
 * - Background (gradient + grid) stays still and visible
 * - Particles/ornaments animate on top
 * - Deterministic layout via `seed`
 *
 * Props (optional):
 *   seed: number -> keep visuals identical across routes (default 1337)
 *   zIndex: number|string -> keep negative so it sits behind your content (default -10)
 */
const BackgroundParticles = React.memo(function BackgroundParticles({
  seed = 1337,
  zIndex = -10,
}) {
  const rand = React.useMemo(() => mulberry32(seed), [seed]);

  // +30% density (80 -> 104)
  const particles = React.useMemo(() => {
    return [...Array(104)].map((_, i) => {
      const gridCols = 10, gridRows = 11;
      const col = i % gridCols;
      const row = Math.floor(i / gridCols);

      const baseX = (col / (gridCols - 1)) * 90 + 5;
      const baseY = (row / (gridRows - 1)) * 90 + 5;

      const x = Math.max(2, Math.min(98, baseX + (rand() - 0.5) * 15));
      const y = Math.max(2, Math.min(98, baseY + (rand() - 0.5) * 15));

      const sizes = ["w-3 h-3", "w-2 h-2", "w-1.5 h-1.5", "w-2.5 h-2.5", "w-1 h-1"];
      const palette = [
        "bg-cyan-300/55",
        "bg-purple-300/55",
        "bg-pink-300/55",
        "bg-blue-300/55",
        "bg-green-300/55",
      ];

      return {
        id: i,
        x,
        y,
        size: sizes[i % sizes.length],
        color: palette[i % palette.length],
        duration: rand() * 25 + 15,
        delay: rand() * 10,
        dx1: (rand() - 0.5) * 80,
        dx2: (rand() - 0.5) * 60,
        dx3: (rand() - 0.5) * 70,
        dy1: (rand() - 0.5) * 80,
        dy2: (rand() - 0.5) * 60,
        dy3: (rand() - 0.5) * 70,
      };
    });
  }, [rand]);

  const shapes = React.useMemo(() => {
    const pos = [
      { x: 15, y: 20 }, { x: 85, y: 25 }, { x: 25, y: 75 }, { x: 75, y: 80 },
      { x: 35, y: 35 }, { x: 65, y: 45 }, { x: 45, y: 85 }, { x: 55, y: 15 },
      { x: 5,  y: 65 }, { x: 95, y: 35 }, { x: 25, y: 55 }, { x: 75, y: 65 },
    ];
    return pos.map((p, i) => ({
      id: i,
      x: p.x,
      y: p.y,
      cls:
        i % 3 === 0
          ? "w-8 h-8 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-full"
          : i % 3 === 1
          ? "w-6 h-6 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rotate-45"
          : "w-4 h-8 bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-full",
      rotateDuration: rand() * 30 + 20,
      scaleDuration: rand() * 4 + 3,
    }));
  }, [rand]);

  const orbs = React.useMemo(() => {
    const pos = [
      { x: 20, y: 30 }, { x: 80, y: 40 }, { x: 30, y: 70 },
      { x: 70, y: 20 }, { x: 10, y: 60 }, { x: 90, y: 75 },
    ];
    return pos.map((p, i) => ({
      id: i,
      x: p.x,
      y: p.y,
      duration: rand() * 6 + 4,
    }));
  }, [rand]);

  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex,
        overflow: "hidden",
        contain: "layout paint",
        backgroundColor: "#000", // solid base, ensures visibility
      }}
    >
      {/* 1) GRADIENT LAYER — explicit div so it always renders */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to bottom right, rgba(88,28,135,0.22), rgba(15,23,42,0.22), rgba(8,145,178,0.22))",
        }}
      />

      {/* 2) GRID LAYER — slightly bolder (alpha 0.10) */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(6,182,212,0.10) 0px, rgba(6,182,212,0.10) 1px, transparent 1px, transparent 80px), repeating-linear-gradient(90deg, rgba(6,182,212,0.10) 0px, rgba(6,182,212,0.10) 1px, transparent 1px, transparent 80px)",
          backgroundBlendMode: "overlay",
        }}
      />

      {/* 3) PARTICLES */}
      {particles.map((p) => (
        <motion.div
          key={`p-${p.id}`}
          className={`absolute rounded-full ${p.size} ${p.color}`}
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            willChange: "transform, opacity",
          }}
          animate={{
            x: [0, p.dx1, p.dx2, p.dx3, 0],
            y: [0, p.dy1, p.dy2, p.dy3, 0],
            opacity: [0.25, 0.5, 0.35, 0.45, 0.25],
            scale: [1, 1.25, 0.9, 1.15, 1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: p.delay,
          }}
        />
      ))}

      {/* 4) SHAPES */}
      {shapes.map((s) => (
        <motion.div
          key={`s-${s.id}`}
          className={`absolute ${s.cls}`}
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            willChange: "transform, opacity",
          }}
          animate={{ rotate: 360, scale: [1, 1.1, 1] }}
          transition={{
            rotate: { duration: s.rotateDuration, repeat: Infinity, ease: "linear" },
            scale: { duration: s.scaleDuration, repeat: Infinity, ease: "easeInOut" },
          }}
        />
      ))}

      {/* 5) ORBS */}
      {orbs.map((o) => (
        <motion.div
          key={`o-${o.id}`}
          className="absolute w-16 h-16 rounded-full bg-gradient-to-r from-cyan-400/12 to-purple-400/12 backdrop-blur-sm"
          style={{
            left: `${o.x}%`,
            top: `${o.y}%`,
            willChange: "transform, opacity",
          }}
          animate={{ scale: [0.5, 1.2, 0.5], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: o.duration, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
});

export default BackgroundParticles;
