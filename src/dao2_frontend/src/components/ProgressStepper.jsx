import React from 'react';

export default function ProgressStepper({ steps, currentStep, onStepClick, isStepComplete }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="font-semibold text-gray-900 mb-4">Setup Progress</h3>
      <nav className="space-y-2">
        {steps.map((step) => (
          <div
            key={step.id}
            onClick={() => onStepClick(step.id)}
            className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${
              currentStep === step.id
                ? 'bg-blue-50 border-l-4 border-blue-500'
                : isStepComplete(step.id)
                ? 'bg-green-50 hover:bg-green-100'
                : 'hover:bg-gray-50'
            }`}
          >
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep === step.id
                ? 'bg-blue-500 text-white'
                : isStepComplete(step.id)
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}>
              {isStepComplete(step.id) && currentStep !== step.id ? '✓' : step.id}
            </div>
            <div className="ml-3">
              <p className={`text-sm font-medium ${
                currentStep === step.id ? 'text-blue-900' : 'text-gray-900'
              }`}>
                {step.name}
              </p>
              <p className="text-xs text-gray-600">{step.description}</p>
            </div>
          </div>
        ))}
      </nav>
    </div>
  );
}