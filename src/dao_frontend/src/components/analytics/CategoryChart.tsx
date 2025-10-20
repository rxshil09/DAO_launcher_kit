import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface CategoryData {
  category: string;
  count: number;
  percentage: number;
  color: string;
}

const CategoryChart: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const data: CategoryData[] = [
    { category: 'DeFi', count: 45, percentage: 35, color: '#10b981' },
    { category: 'Gaming', count: 32, percentage: 25, color: '#8b5cf6' },
    { category: 'Social', count: 28, percentage: 22, color: '#3b82f6' },
    { category: 'NFT', count: 15, percentage: 12, color: '#f59e0b' },
    { category: 'Other', count: 8, percentage: 6, color: '#6b7280' }
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let currentAngle = -Math.PI / 2; // Start from top

    // Draw pie slices with animation
    data.forEach((item, index) => {
      const sliceAngle = (item.percentage / 100) * 2 * Math.PI;
      
      // Create gradient
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
      gradient.addColorStop(0, item.color + '80'); // Semi-transparent center
      gradient.addColorStop(1, item.color);

      // Draw slice
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      // Add stroke
      ctx.strokeStyle = '#1f2937';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Add hover effect (simplified)
      ctx.shadowColor = item.color;
      ctx.shadowBlur = 0;

      currentAngle += sliceAngle;
    });

    // Draw center circle for donut effect
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.4, 0, 2 * Math.PI);
    ctx.fillStyle = '#111827';
    ctx.fill();
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Add center text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('128', centerX, centerY - 8);
    ctx.font = '12px monospace';
    ctx.fillStyle = '#9ca3af';
    ctx.fillText('Total DAOs', centerX, centerY + 8);

  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.5 }}
      className="relative"
    >
      <canvas
        ref={canvasRef}
        width={300}
        height={300}
        className="max-w-full h-auto"
      />
      
      {/* Interactive legend */}
      <div className="absolute top-4 right-4 space-y-2">
        {data.map((item, index) => (
          <motion.div
            key={item.category}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 + index * 0.1 }}
            className="flex items-center space-x-2 bg-gray-900/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-700/50"
          >
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            ></div>
            <div className="text-xs">
              <div className="text-white font-semibold">{item.category}</div>
              <div className="text-gray-400 font-mono">{item.count} DAOs</div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default CategoryChart;