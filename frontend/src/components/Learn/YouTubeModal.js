"use client";
import { useState, useEffect } from "react";
import { X, Maximize, Minimize, ExternalLink, Users } from "lucide-react";
import JitsiCall from "./JitsiCall";
import { useUser } from "../context/UserContext";

const YouTubeModal = ({ isOpen, onClose, videoUrl }) => {
  const [videoId, setVideoId] = useState("");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showJitsi, setShowJitsi] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    if (videoUrl) {
      // Extract YouTube video ID from URL
      let id = "";
      if (videoUrl.includes("youtu.be/")) {
        id = videoUrl.split("youtu.be/")[1];
      } else if (videoUrl.includes("v=")) {
        id = videoUrl.split("v=")[1];
        const ampersandPosition = id.indexOf("&");
        if (ampersandPosition !== -1) {
          id = id.substring(0, ampersandPosition);
        }
      } else {
        // Use the URL directly if it's already just the ID
        id = videoUrl;
      }
      setVideoId(id);
    }
  }, [videoUrl]);

  // Handle escape key press to close modal
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscKey);
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [isOpen, onClose]);

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const openYouTube = () => {
    if (videoId) {
      window.open(`https://www.youtube.com/watch?v=${videoId}`, "_blank");
    }
  };

  const toggleJitsi = () => {
    setShowJitsi(!showJitsi);
  };

  if (!isOpen) return null;

  // Use videoId or a hash of videoUrl for room name to ensure friends land in same room
  const roomName = `DevHub-Learn-${videoId || "shared"}`;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`bg-gray-900 rounded-lg relative overflow-hidden shadow-2xl transition-all duration-300 ${
          isFullScreen
            ? "w-full h-full max-w-none"
            : showJitsi
              ? "w-full max-w-7xl"
              : "w-full max-w-4xl"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex justify-between items-center p-4 bg-gray-800 text-white">
          <div className="flex items-center space-x-4 overflow-hidden">
            <h3 className="font-medium truncate">Video Lecture</h3>
            {showJitsi && (
              <span className="flex items-center text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full border border-green-500/30">
                <Users className="w-3 h-3 mr-1" /> Multi-Learn Active
              </span>
            )}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={toggleJitsi}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-full transition-all duration-200 ${
                showJitsi
                  ? "bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-900/20"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"
              }`}
              title={
                showJitsi
                  ? "Stop Watch Together"
                  : "Watch Together with Friends"
              }
            >
              <Users
                className={`w-4 h-4 ${showJitsi ? "animate-pulse" : ""}`}
              />
              <span className="text-sm font-medium mr-1">
                {showJitsi ? "Connecting..." : "Watch Together"}
              </span>
            </button>

            <div className="w-px h-6 bg-gray-700 mx-1 self-center" />

            <button
              onClick={openYouTube}
              className="p-2 hover:bg-gray-700 rounded-full transition-colors underline decoration-purple-500/50 underline-offset-4"
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
              className="p-2 hover:bg-gray-700 rounded-full transition-colors group"
              title="Close"
            >
              <X className="w-5 h-5 text-gray-300 group-hover:text-red-400 transition-colors" />
            </button>
          </div>
        </div>

        {/* Action Bar / Room Info if Jitsi is active */}
        {showJitsi && (
          <>
            <div className="text-gray-400 flex items-center gap-2">
              Share this room name:{" "}
              <span className="text-purple-400 font-mono font-bold select-all">
                {roomName}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(roomName);
                  alert("Room name copied!");
                }}
                className="ml-2 text-purple-500 hover:text-purple-400 text-[10px] font-bold underline"
              >
                Copy
              </button>
            </div>
            <div className="flex space-x-4">
              <span className="text-gray-500">
                Auto-muted upon entry for clear audio
              </span>
            </div>
          </>
        )}

        {/* Main Content Area */}
        <div
          className={`flex ${showJitsi ? "flex-col lg:flex-row h-[70vh] lg:h-[600px]" : ""}`}
        >
          {/* Video container */}
          <div
            className={`relative bg-black flex-1 ${
              showJitsi
                ? "w-full lg:w-3/5"
                : isFullScreen
                  ? "h-[calc(100vh-64px)]"
                  : "aspect-video"
            }`}
          >
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
              <div className="flex items-center justify-center w-full h-full bg-gray-900 text-gray-400">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4" />
                  <span>Loading lecture...</span>
                </div>
              </div>
            )}
          </div>

          {/* Jitsi Sidebar */}
          {showJitsi && (
            <div className="w-full lg:w-2/5 bg-gray-800 border-l border-gray-700 flex flex-col">
              <div className="flex-1 min-h-[300px] lg:min-h-0">
                <JitsiCall
                  roomName={roomName}
                  userName={
                    user?.displayName || user?.email?.split("@")[0] || "Student"
                  }
                />
              </div>
              <div className="p-3 bg-gray-900/50 border-t border-gray-700">
                <p className="text-[10px] text-gray-500 text-center italic">
                  Collaborative Learning Mode: Maximum 4 participants
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default YouTubeModal;
