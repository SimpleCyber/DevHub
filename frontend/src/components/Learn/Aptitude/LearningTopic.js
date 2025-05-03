"use client"

import { useState } from "react"
import { ChevronUp, ChevronDown } from "lucide-react"

const LearningTopic = ({ title, currentLesson, totalLessons, completedLessons, children }) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const progressPercentage = Math.round((completedLessons / totalLessons) * 100)

  return (
    <div className="bg-white rounded-lg shadow-sm mb-4 overflow-hidden">
      <div className="border-b border-gray-200">
        <div className="flex justify-between items-center p-4">
          <h3 className="text-md font-bold text-gray-500">{title}</h3>
          <div className="flex items-center">
            <span className="text-sm text-gray-500 mr-4">
              {currentLesson} / {totalLessons}
            </span>
            <button onClick={() => setIsExpanded(!isExpanded)} className="text-gray-500 hover:text-gray-700">
              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
        </div>
        <div className="px-4 pb-4">
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-purple-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>
      {isExpanded && <div>{children}</div>}
    </div>
  )
}

export default LearningTopic

