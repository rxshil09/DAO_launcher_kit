import React from 'react';
import { Vote, Wallet, Zap, BarChart3 } from 'lucide-react';

const moduleIcons = {
  governance: Vote,
  treasury: Wallet,
  staking: Zap,
  analytics: BarChart3
};

export default function ModuleSelector({ modules, selectedModules, onModuleToggle }) {
  return (
    <div className="space-y-6">
      {Object.entries(modules).map(([category, categoryData]) => {
        const Icon = moduleIcons[category];
        return (
          <div key={category} className="border rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-4">
              <Icon className="h-6 w-6 text-blue-600" />
              <div>
                <h4 className="font-semibold text-gray-900">{categoryData.name}</h4>
                <p className="text-sm text-gray-600">{categoryData.description}</p>
              </div>
            </div>
            <div className="space-y-2">
              {categoryData.modules.map((module) => (
                <label key={module.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={selectedModules[category]?.[module.id] || false}
                    onChange={() => onModuleToggle(category, module.id)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{module.name}</div>
                    <div className="text-sm text-gray-600">{module.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}