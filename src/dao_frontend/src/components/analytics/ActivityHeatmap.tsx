import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface ActivityHeatmapProps {
  data: Array<{ timestamp: number; value: number }>;
}

const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({ data }) => {
  // Memoize heatmap data generation
  const heatmapData = useMemo(() => {
    const days = [];
    const today = new Date();
    
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const dataPoint = data.find(d => {
        const dataDate = new Date(d.timestamp);
        return dataDate.toDateString() === date.toDateString();
      });
      
      days.push({
        date,
        value: dataPoint?.value || 0,
        intensity: Math.min((dataPoint?.value || 0) / 10, 1)
      });
    }
    
    return days;
  }, [data]);

  // Memoize month grouping
  const monthGroups = useMemo(() => {
    const monthGroups: { [key: string]: typeof heatmapData } = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    heatmapData.forEach(day => {
      const monthYear = `${monthNames[day.date.getMonth()]} ${day.date.getFullYear()}`;
      if (!monthGroups[monthYear]) {
        monthGroups[monthYear] = [];
      }
      monthGroups[monthYear].push(day);
    });
    
    return monthGroups;
  }, [heatmapData]);

  const getIntensityColor = (intensity: number) => {
    if (intensity === 0) return 'bg-gray-800';
    if (intensity < 0.25) return 'bg-cyan-900/50';
    if (intensity < 0.5) return 'bg-cyan-700/70';
    if (intensity < 0.75) return 'bg-cyan-500/80';
    return 'bg-cyan-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Month sections - Only animate container */}
      <div className="flex gap-2 justify-between">
        {Object.entries(monthGroups).map(([monthYear, days]) => (
          <div key={monthYear} className="flex flex-col flex-shrink-0">
            {/* Month label */}
            <div className="text-xs text-gray-300 font-mono mb-1.5 font-semibold text-center">
              {monthYear.split(' ')[0]}
            </div>
            
            {/* Days grid - Use regular divs instead of motion.div */}
            <div className="grid grid-cols-7 gap-0.5">
              {days.map((day, dayIndex) => (
                <div
                  key={`${monthYear}-${dayIndex}`}
                  className={`w-2.5 h-2.5 rounded-sm ${getIntensityColor(day.intensity)} border border-gray-700/30 cursor-pointer relative group transition-transform hover:scale-150 hover:z-10`}
                  title={`${day.date.toDateString()}: ${day.value} activities`}
                >
                  {/* Tooltip - only rendered on hover with CSS */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 border border-gray-600 rounded text-xs text-white font-mono opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                    {day.date.toLocaleDateString()}: {day.value} activities
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
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