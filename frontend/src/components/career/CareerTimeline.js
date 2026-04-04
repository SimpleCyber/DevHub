import React, { useState } from "react";
import { Code, CheckCircle, Hourglass, Sparkles, ChevronDown, ChevronRight } from "lucide-react";

const getStatusColor = (status) => {
  switch (status) {
    case "Completed":
      return "bg-green-100 text-green-700";
    case "Started":
      return "bg-blue-100 text-blue-700";
    case "Pending":
    default:
      return "bg-orange-50 text-orange-600";
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case "Completed":
      return <CheckCircle className="w-3 h-3 mr-1" />;
    case "Started":
      return <Hourglass className="w-3 h-3 mr-1" />;
    case "Pending":
    default:
      return <Hourglass className="w-3 h-3 mr-1" />;
  }
};

const getCircleColor = (index) => {
  const colors = [
    "bg-purple-500",
    "bg-blue-500",
    "bg-emerald-500",
    "bg-orange-500",
    "bg-indigo-500",
    "bg-pink-500",
    "bg-rose-500"
  ];
  return colors[index % colors.length];
};

const CareerTimeline = ({ roadmapName, steps = [], progress = 0, onToggleSubtask }) => {
  const [expandedSteps, setExpandedSteps] = useState(new Set());

  const toggleStep = (index) => {
    setExpandedSteps(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  if (!roadmapName || steps.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-white rounded-3xl shadow-sm border border-gray-100 min-h-[600px] m-4">
        <Sparkles className="w-16 h-16 text-blue-200 mb-4" />
        <h3 className="text-xl font-bold text-slate-700">No Roadmap Selected</h3>
        <p className="text-slate-500 mt-2 max-w-sm">Generate AI suggestions on the left, then select one to see your step-by-step career roadmap here.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 m-4 w-full h-full overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex items-start gap-4 p-4 bg-[#f8fafc] rounded-2xl mb-8">
        <div className="w-12 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-white shrink-0 shadow-md">
          <Code className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Roadmap: {roadmapName}</h2>
          <p className="text-sm text-slate-500">Step-by-step path to become a {roadmapName}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="px-2 mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-slate-700">Overall Progress</span>
          <span className="text-sm font-bold text-slate-900">{progress}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2.5">
          <div
            className="bg-indigo-500 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative px-4">
        {/* Vertical Line */}
        <div className="absolute left-[39px] top-6 bottom-6 w-0.5 bg-slate-200"></div>

        {steps.map((step, index) => (
          <div key={index} className="flex relative items-start gap-6 mb-8 group">
            {/* Number Circle */}
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shrink-0 shadow-sm relative z-10 ${getCircleColor(index)}`}>
              {index + 1}
            </div>

            {/* Content Box */}
            <div className="flex-1 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm transition-shadow hover:shadow-md">
              <div 
                className={`flex justify-between items-start ${step.subtasks?.length > 0 ? "cursor-pointer" : ""}`} 
                onClick={() => { if(step.subtasks?.length > 0) toggleStep(index); }}
              >
                <div className="pr-4">
                  <h3 className="text-base font-bold text-slate-800 mb-1">{step.title}</h3>
                  <p className="text-sm text-slate-500">{step.description}</p>
                </div>
                {/* Status Badge + Chevron */}
                <div className="flex items-center gap-2">
                  <div className={`flex items-center px-3 py-1 rounded-full text-xs font-semibold shrink-0 whitespace-nowrap ${getStatusColor(step.status || "Pending")}`}>
                    {getStatusIcon(step.status || "Pending")}
                    {step.status || "Pending"}
                  </div>
                  {step.subtasks && step.subtasks.length > 0 && (
                    <div className="text-slate-400 hover:text-slate-600 transition-colors">
                      {expandedSteps.has(index) ? <ChevronDown className="w-5 h-5"/> : <ChevronRight className="w-5 h-5"/>}
                    </div>
                  )}
                </div>
              </div>

              {/* Subtasks */}
              {step.subtasks && step.subtasks.length > 0 && expandedSteps.has(index) && (
                <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-3">
                  {step.subtasks.map((sub, sIdx) => (
                    <label key={sIdx} className="flex items-start gap-3 cursor-pointer group/label">
                      <input 
                        type="checkbox" 
                        checked={sub.completed}
                        onChange={() => onToggleSubtask && onToggleSubtask(index, sIdx)}
                        className="w-4 h-4 mt-0.5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                      />
                      <span className={`text-sm select-none transition-colors ${sub.completed ? 'text-slate-400 line-through' : 'text-slate-700 group-hover/label:text-slate-900'}`}>
                        {sub.title}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CareerTimeline;
