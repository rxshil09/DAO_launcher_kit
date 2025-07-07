import React from 'react';
import { motion } from 'framer-motion';

// COMPLETELY INDEPENDENT BACKGROUND COMPONENT - NEVER RE-RENDERS
const BackgroundParticles = React.memo(() => {
  // Generate particles with truly random but well-distributed positions
  const particles = React.useMemo(() => {
    return [...Array(80)].map((_, i) => {
      // Create better initial distribution using grid-like approach
      const gridCols = 10;
      const gridRows = 8;
      const col = i % gridCols;
      const row = Math.floor(i / gridCols);
      
      // Calculate initial position with some randomness but better spread
      const baseX = (col / (gridCols - 1)) * 90 + 5; // 5% to 95% spread
      const baseY = (row / (gridRows - 1)) * 90 + 5; // 5% to 95% spread
      
      // Add some randomness to avoid perfect grid
      const randomOffsetX = (Math.random() - 0.5) * 15; // ±7.5% variation
      const randomOffsetY = (Math.random() - 0.5) * 15; // ±7.5% variation
      
      const finalX = Math.max(2, Math.min(98, baseX + randomOffsetX));
      const finalY = Math.max(2, Math.min(98, baseY + randomOffsetY));
      
      return {
        id: i,
        x: finalX,
        y: finalY,
        size: i % 5 === 0 ? 'w-3 h-3' : i % 5 === 1 ? 'w-2 h-2' : i % 5 === 2 ? 'w-1.5 h-1.5' : i % 5 === 3 ? 'w-2.5 h-2.5' : 'w-1 h-1',
        color: i % 5 === 0 ? 'bg-cyan-300/55' : i % 5 === 1 ? 'bg-purple-300/55' : i % 5 === 2 ? 'bg-pink-300/55' : i % 5 === 3 ? 'bg-blue-300/55' : 'bg-green-300/55',
        duration: Math.random() * 25 + 15,
        delay: Math.random() * 10
      };
    });
  }, []);

  const shapes = React.useMemo(() => {
    const shapePositions = [
      { x: 15, y: 20 }, { x: 85, y: 25 }, { x: 25, y: 75 }, { x: 75, y: 80 },
      { x: 35, y: 35 }, { x: 65, y: 45 }, { x: 45, y: 85 }, { x: 55, y: 15 },
      { x: 5, y: 65 }, { x: 95, y: 35 }, { x: 25, y: 55 }, { x: 75, y: 65 }
    ];
    
    return [...Array(12)].map((_, i) => ({
      id: i,
      x: shapePositions[i].x,
      y: shapePositions[i].y,
      className: i % 3 === 0 ? 'w-8 h-8 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-full' :
                 i % 3 === 1 ? 'w-6 h-6 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rotate-45' :
                 'w-4 h-8 bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-full',
      rotateDuration: Math.random() * 30 + 20,
      scaleDuration: Math.random() * 4 + 3
    }));
  }, []);

  const orbs = React.useMemo(() => {
    const orbPositions = [
      { x: 20, y: 30 }, { x: 80, y: 40 }, { x: 30, y: 70 },
      { x: 70, y: 20 }, { x: 10, y: 60 }, { x: 90, y: 75 }
    ];
    
    return [...Array(6)].map((_, i) => ({
      id: i,
      x: orbPositions[i].x,
      y: orbPositions[i].y,
      duration: Math.random() * 6 + 4
    }));
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-cyan-900/20"></div>
      
      {/* Enhanced Floating Particles - TRULY INDEPENDENT */}
      {particles.map((particle) => (
        <motion.div
          key={`particle-${particle.id}`}
          className={`absolute rounded-full ${particle.size} ${particle.color}`}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            x: [
              0, 
              (Math.random() - 0.5) * 80, 
              (Math.random() - 0.5) * 60,
              (Math.random() - 0.5) * 70,
              0
            ],
            y: [
              0, 
              (Math.random() - 0.5) * 80, 
              (Math.random() - 0.5) * 60,
              (Math.random() - 0.5) * 70,
              0
            ],
            opacity: [0.2, 0.5, 0.3, 0.4, 0.2],
            scale: [1, 1.3, 0.8, 1.2, 1],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: particle.delay,
          }}
          whileHover={{
            scale: 2,
            opacity: 0.9,
            transition: { duration: 0.3 }
          }}
        />
      ))}

      {/* Interactive Grid Pattern */}
      <div className="absolute inset-0 opacity-3">
        <div className="grid grid-cols-20 grid-rows-20 h-full w-full">
          {[...Array(400)].map((_, i) => (
            <motion.div 
              key={`grid-${i}`}
              className="border border-cyan-500/10"
              whileHover={{
                backgroundColor: 'rgba(6, 182, 212, 0.05)',
                transition: { duration: 0.2 }
              }}
            />
          ))}
        </div>
      </div>

      {/* Floating Geometric Shapes */}
      {shapes.map((shape) => (
        <motion.div
          key={`shape-${shape.id}`}
          className={`absolute ${shape.className}`}
          style={{
            left: `${shape.x}%`,
            top: `${shape.y}%`,
          }}
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: { duration: shape.rotateDuration, repeat: Infinity, ease: "linear" },
            scale: { duration: shape.scaleDuration, repeat: Infinity, ease: "easeInOut" }
          }}
          whileHover={{
            scale: 1.5,
            rotate: 180,
            transition: { duration: 0.5 }
          }}
        />
      ))}

      {/* Pulsing Orbs */}
      {orbs.map((orb) => (
        <motion.div
          key={`orb-${orb.id}`}
          className="absolute w-16 h-16 rounded-full bg-gradient-to-r from-cyan-400/12 to-purple-400/12 backdrop-blur-sm"
          style={{
            left: `${orb.x}%`,
            top: `${orb.y}%`,
          }}
          animate={{
            scale: [0.5, 1.2, 0.5],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          whileHover={{
            scale: 2,
            opacity: 0.9,
            transition: { duration: 0.3 }
          }}
        />
      ))}
    </div>
  );
});

export default BackgroundParticles;