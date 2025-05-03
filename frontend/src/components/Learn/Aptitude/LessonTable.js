"use client"
import { useState } from "react"
import { Youtube, Code, Star, Check } from "lucide-react"
import YouTubeModal from "../YouTubeModal"

const LessonTable = ({ lessons, onToggleComplete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedVideoUrl, setSelectedVideoUrl] = useState("")

  const handleYoutubeClick = (videoUrl) => {
    setSelectedVideoUrl(videoUrl)
    setIsModalOpen(true)
  }
  const handlePraticeClick = (practiceUrl) => {
    window.open(practiceUrl, '_blank', 'noopener,noreferrer');
  };

  const closeModal = () => {
    setIsModalOpen(false)
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
              STATUS
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PROBLEM</th>
            
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
              YOUTUBE
            </th>
            {/* <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
              PRACTICE
            </th> */}
            
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
              DIFFICULTY
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
              REVISION
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {lessons.map((lesson, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center justify-center">
                  <button
                    onClick={() => onToggleComplete(index)}
                    className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                      lesson.completed
                        ? "bg-green-500 border-green-500 text-white"
                        : "border-gray-300 hover:border-green-500"
                    }`}
                  >
                    {lesson.completed && <Check className="w-4 h-4" />}
                  </button>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{lesson.title}</div>
              </td>
              
              <td className="px-6 py-4 whitespace-nowrap">
                {lesson.youtube && (
                  <div className="flex justify-center">
                    <Youtube 
                      className="w-5 h-5 text-red-500 cursor-pointer hover:text-red-600" 
                      onClick={() => handleYoutubeClick(lesson.youtube)}
                    />
                  </div>
                )}
              </td>
              {/* <td className="px-6 py-4 whitespace-nowrap">
                {lesson.practice && (
                  <div className="flex justify-center">
                    <Code className="w-5 h-5 text-green-500 cursor-pointer hover:text-green-600" 
                     onClick={() => handlePraticeClick(lesson.practice)}
                    />
                  </div>
                )}
              </td> */}
              
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex justify-center">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      lesson.difficulty === "Easy"
                        ? "bg-green-100 text-green-800"
                        : lesson.difficulty === "Medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {lesson.difficulty}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex justify-center">
                  <Star
                    className={`w-5 h-5 ${lesson.starred ? "text-yellow-400" : "text-gray-300"} hover:text-yellow-400 cursor-pointer`}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <YouTubeModal 
        isOpen={isModalOpen}
        onClose={closeModal}
        videoUrl={selectedVideoUrl}
      />
    </div>
  )
}

export default LessonTable;