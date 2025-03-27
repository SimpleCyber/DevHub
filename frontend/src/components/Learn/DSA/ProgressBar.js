"use client"
import { Shuffle } from "lucide-react"

const ProgressBar = ({ current, total, percentage, onShowRevision }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm text-gray-600">
          Your Progress:{" "}
          <span className="font-medium">
            {current}/{total}
          </span>
        </div>
        <div className="text-orange-500 font-medium">{percentage}% complete</div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-orange-500 h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <div className="flex justify-end mt-2">
        <button onClick={onShowRevision} className="flex items-center text-gray-600 hover:text-gray-800">
          <Shuffle className="w-4 h-4 mr-1" />
          <span className="text-sm">Show Revision</span>
        </button>
      </div>
    </div>
  )
}

export default ProgressBar

