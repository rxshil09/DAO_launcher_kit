import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface TrendChartProps {
  data: Array<{ timestamp: number; value: number }>;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'cyan';
  height?: number;
  format?: 'number' | 'currency';
  delay?: number;
}

const TrendChart: React.FC<TrendChartProps> = ({
  data,
  color,
  height = 200,
  format = 'number',
  delay = 0
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  const getColorValue = () => {
    switch (color) {
      case 'blue': return '#3b82f6';
      case 'green': return '#10b981';
      case 'purple': return '#8b5cf6';
      case 'orange': return '#f59e0b';
      case 'red': return '#ef4444';
      case 'cyan': return '#06b6d4';
      default: return '#6b7280';
    }
  };

  const getGradientId = () => `gradient-${color}`;

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;

    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    const width = rect.width;
    const padding = 20;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Find min and max values
    const values = data.map(d => d.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const valueRange = maxValue - minValue || 1;

    // Create path
    const points = data.map((d, i) => {
      const x = padding + (i / (data.length - 1)) * chartWidth;
      const y = padding + chartHeight - ((d.value - minValue) / valueRange) * chartHeight;
      return `${x},${y}`;
    });

    const pathData = `M ${points.join(' L ')}`;
    
    // Create area path for gradient fill
    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];
    const areaPath = `${pathData} L ${lastPoint.split(',')[0]},${height - padding} L ${firstPoint.split(',')[0]},${height - padding} Z`;

    // Update SVG content
    svg.innerHTML = `
      <defs>
        <linearGradient id="${getGradientId()}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:${getColorValue()};stop-opacity:0.3" />
          <stop offset="100%" style="stop-color:${getColorValue()};stop-opacity:0.05" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <path
        d="${areaPath}"
        fill="url(#${getGradientId()})"
        opacity="0.6"
      />
      <path
        d="${pathData}"
        fill="none"
        stroke="${getColorValue()}"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
        filter="url(#glow)"
        style="
          stroke-dasharray: ${points.length * 10};
          stroke-dashoffset: ${points.length * 10};
          animation: drawLine 2s ease-out forwards;
        "
      />
      <style>
        @keyframes drawLine {
          to {
            stroke-dashoffset: 0;
          }
        }
      </style>
    `;

    // Add data points
    points.forEach((point, i) => {
      const [x, y] = point.split(',').map(Number);
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', x.toString());
      circle.setAttribute('cy', y.toString());
      circle.setAttribute('r', '4');
      circle.setAttribute('fill', getColorValue());
      circle.setAttribute('stroke', '#ffffff');
      circle.setAttribute('stroke-width', '2');
      circle.style.opacity = '0';
      circle.style.animation = `fadeInPoint 0.5s ease-out ${0.5 + i * 0.1}s forwards`;
      
      // Add hover effect
      circle.addEventListener('mouseenter', () => {
        circle.setAttribute('r', '6');
        circle.style.filter = 'drop-shadow(0 0 8px ' + getColorValue() + ')';
      });
      
      circle.addEventListener('mouseleave', () => {
        circle.setAttribute('r', '4');
        circle.style.filter = 'none';
      });

      svg.appendChild(circle);
    });

    // Add CSS for point animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeInPoint {
        to {
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, [data, color, height]);

  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        if (val >= 1000000) {
          return `$${(val / 1000000).toFixed(1)}M`;
        } else if (val >= 1000) {
          return `$${(val / 1000).toFixed(1)}K`;
        }
        return `$${val.toFixed(0)}`;
      default:
        return val.toLocaleString();
    }
  };

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm font-mono">Loading chart data...</p>
        </div>
      </div>
    );
  }

  const latestValue = data[data.length - 1]?.value || 0;
  const previousValue = data[data.length - 2]?.value || 0;
  const valueChange = latestValue - previousValue;
  const percentChange = previousValue !== 0 ? (valueChange / previousValue) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
      className="relative"
    >
      {/* Chart Info */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-400 font-mono">
          Current: <span className="text-white font-bold">{formatValue(latestValue)}</span>
        </div>
        {valueChange !== 0 && (
          <div className={`flex items-center space-x-1 text-sm ${
            valueChange >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {valueChange >= 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span className="font-mono">
              {valueChange >= 0 ? '+' : ''}{percentChange.toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      {/* SVG Chart */}
      <svg
        ref={svgRef}
        width="100%"
        height={height}
        className="overflow-visible"
        style={{ filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))' }}
      />

      {/* Hover overlay for interactivity */}
      <div className="absolute inset-0 bg-transparent hover:bg-white/5 transition-colors rounded-lg pointer-events-auto"></div>
    </motion.div>
  );
};

export default TrendChart;
