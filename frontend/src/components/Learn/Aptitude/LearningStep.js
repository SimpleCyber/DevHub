"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

const LearningStep = ({ title, currentStep, totalSteps, children }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-white rounded-lg shadow-sm mb-4 overflow-hidden">
      <div className="border-b border-gray-200">
        <div className="flex justify-between items-center p-4">
          <h2 className="text-xl font-bold text-red-600">{title}</h2>
          <div className="flex items-center">
            <span className="text-sm text-gray-500 mr-4">
              {currentStep} / {totalSteps}
            </span>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-500 hover:text-gray-700"
            >
              {isExpanded ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
      {isExpanded && <div className="p-4">{children}</div>}
    </div>
  );
};

export default LearningStep;
