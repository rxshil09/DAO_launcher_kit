import React from 'react';
import { motion } from 'framer-motion';

interface ActivityHeatmapProps {
  data: Array<{ timestamp: number; value: number }>;
}

const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({ data }) => {
  // Generate last 365 days
  const generateHeatmapData = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Find matching data point
      const dataPoint = data.find(d => {
        const dataDate = new Date(d.timestamp);
        return dataDate.toDateString() === date.toDateString();
      });
      
      days.push({
        date,
        value: dataPoint?.value || 0,
        intensity: Math.min((dataPoint?.value || 0) / 10, 1) // Normalize to 0-1
      });
    }
    
    return days;
  };

  const heatmapData = generateHeatmapData();
  const weeks = [];
  
  // Group days into weeks
  for (let i = 0; i < heatmapData.length; i += 7) {
    weeks.push(heatmapData.slice(i, i + 7));
  }

  const getIntensityColor = (intensity: number) => {
    if (intensity === 0) return 'bg-gray-800';
    if (intensity < 0.25) return 'bg-cyan-900/50';
    if (intensity < 0.5) return 'bg-cyan-700/70';
    if (intensity < 0.75) return 'bg-cyan-500/80';
    return 'bg-cyan-400';
  };

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="space-y-4"
    >
      {/* Month labels */}
      <div className="flex justify-between text-xs text-gray-400 font-mono px-8">
        {months.map((month) => (
          <span key={month}>{month}</span>
        ))}
      </div>

      {/* Heatmap grid */}
      <div className="flex space-x-1">
        {/* Weekday labels */}
        <div className="flex flex-col space-y-1 mr-2">
          {weekdays.map((day, index) => (
            <div
              key={day}
              className={`h-3 flex items-center text-xs text-gray-400 font-mono ${
                index % 2 === 0 ? '' : 'opacity-0'
              }`}
            >
              {index % 2 === 0 ? day : ''}
            </div>
          ))}
        </div>

        {/* Activity squares */}
        <div className="flex space-x-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col space-y-1">
              {week.map((day, dayIndex) => (
                <motion.div
                  key={`${weekIndex}-${dayIndex}`}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    delay: 0.8 + (weekIndex * 0.01) + (dayIndex * 0.005),
                    duration: 0.2 
                  }}
                  whileHover={{ 
                    scale: 1.5,
                    zIndex: 10,
                    transition: { duration: 0.1 }
                  }}
                  className={`w-3 h-3 rounded-sm ${getIntensityColor(day.intensity)} border border-gray-700/30 cursor-pointer relative group`}
                  title={`${day.date.toDateString()}: ${day.value} activities`}
                >
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 border border-gray-600 rounded text-xs text-white font-mono opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                    {day.date.toLocaleDateString()}: {day.value} activities
                  </div>
                </motion.div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs text-gray-400 font-mono">
          <span>Less</span>
          <div className="flex space-x-1">
            <div className="w-3 h-3 bg-gray-800 rounded-sm border border-gray-700/30"></div>
            <div className="w-3 h-3 bg-cyan-900/50 rounded-sm border border-gray-700/30"></div>
            <div className="w-3 h-3 bg-cyan-700/70 rounded-sm border border-gray-700/30"></div>
            <div className="w-3 h-3 bg-cyan-500/80 rounded-sm border border-gray-700/30"></div>
            <div className="w-3 h-3 bg-cyan-400 rounded-sm border border-gray-700/30"></div>
          </div>
          <span>More</span>
        </div>
        
        <div className="text-xs text-gray-400 font-mono">
          {heatmapData.filter(d => d.value > 0).length} active days
        </div>
      </div>
    </motion.div>
  );
};

export default ActivityHeatmap;