"use client"
import { useState, useEffect } from "react"
import { X, Maximize, Minimize, ExternalLink } from "lucide-react"

const YouTubeModal = ({ isOpen, onClose, videoUrl }) => {
  const [videoId, setVideoId] = useState("")
  const [isFullScreen, setIsFullScreen] = useState(false)

  useEffect(() => {
    if (videoUrl) {
      // Extract YouTube video ID from URL
      let id = ""
      if (videoUrl.includes("youtu.be/")) {
        id = videoUrl.split("youtu.be/")[1]
      } else if (videoUrl.includes("v=")) {
        id = videoUrl.split("v=")[1]
        const ampersandPosition = id.indexOf("&")
        if (ampersandPosition !== -1) {
          id = id.substring(0, ampersandPosition)
        }
      } else {
        // Use the URL directly if it's already just the ID
        id = videoUrl
      }
      setVideoId(id)
    }
  }, [videoUrl])

  // Handle escape key press to close modal
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }

    window.addEventListener("keydown", handleEscKey)
    return () => window.removeEventListener("keydown", handleEscKey)
  }, [isOpen, onClose])

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen)
  }

  const openYouTube = () => {
    if (videoId) {
      window.open(`https://www.youtube.com/watch?v=${videoId}`, "_blank")
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className={`bg-gray-900 rounded-lg relative overflow-hidden shadow-2xl transition-all duration-300 ${
          isFullScreen ? "w-full h-full max-w-none" : "w-full max-w-4xl"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex justify-between items-center p-4 bg-gray-800 text-white">
          <h3 className="font-medium truncate">Video Lecture</h3>
          <div className="flex space-x-2">
            <button 
              onClick={openYouTube} 
              className="p-2 hover:bg-gray-700 rounded-full transition-colors" 
              title="Open in YouTube"
            >
              <ExternalLink className="w-5 h-5 text-gray-300 hover:text-white" />
            </button>
            <button 
              onClick={toggleFullScreen} 
              className="p-2 hover:bg-gray-700 rounded-full transition-colors"
              title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
            >
              {isFullScreen ? (
                <Minimize className="w-5 h-5 text-gray-300 hover:text-white" />
              ) : (
                <Maximize className="w-5 h-5 text-gray-300 hover:text-white" />
              )}
            </button>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-gray-700 rounded-full transition-colors"
              title="Close"
            >
              <X className="w-5 h-5 text-gray-300 hover:text-white" />
            </button>
          </div>
        </div>
        
        {/* Video container */}
        <div className={`relative ${isFullScreen ? "h-[calc(100%-64px)]" : "aspect-video"}`}>
          {videoId ? (
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
              title="YouTube video player"
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-gray-800 text-gray-400">
              Loading video...
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default YouTubeModal