import React, { useState, useEffect } from "react";
import { Sidebar } from "../sidebar/sidebar";
import LearnCollector from "./LearnCollector";
import { useUser } from "../context/UserContext";
import { useSidebar } from "../context/SidebarContext";
import { Video, X, Plus, Copy, Check } from "lucide-react";
import JitsiCall from "./JitsiCall";
import "./learn.css";

const Learn = () => {
  const { user } = useUser();
  const { isOpen } = useSidebar();
  const [showActiveCall, setShowActiveCall] = useState(false);
  const [callRoomName, setCallRoomName] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const room = params.get("room");
    if (room) {
      setCallRoomName(room);
      setShowActiveCall(true);
    }
  }, []);

  const handleStartCall = () => {
    if (!user) return;
    setCallRoomName(`DevHub-Study-${user.uid}`);
    setShowActiveCall(true);
  };

  const copyInviteLink = () => {
    const url = `${window.location.origin}/learn?room=${callRoomName}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#e9effe] min-h-screen font-sans">
      <Sidebar />
      <div
        className={`transition-all duration-300 flex flex-col h-screen overflow-hidden`}
        // style={{ marginLeft: isOpen ? "256px" : "64px" }}
      >
        <div className="learn-container">
          {/* Main Content Area */}
          <div className="learn-main-content bg-blue-50">
            {/* Header with Start Call Button */}
            <div className="sticky top-0 z-20 bg-blue-50/80 backdrop-blur-md px-4 py-4 flex items-center justify-between border-b border-blue-100">
              <h1 className="text-2xl font-bold text-gray-800">
                Learning Center
              </h1>
              <button onClick={handleStartCall} className="start-call-btn">
                <Video className="w-4 h-4" />
                <span>Start Study Session</span>
              </button>
            </div>

            <div className="p-6">
              <LearnCollector />
            </div>
          </div>

          {/* Right Sidebar for Video Call */}
          <div className={`video-sidebar ${showActiveCall ? "active" : ""}`}>
            {showActiveCall && (
              <>
                <div className="video-header">
                  <div className="flex flex-col">
                    <h3 className="text-white font-bold text-sm flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      Live Study Session
                    </h3>
                    <button
                      onClick={copyInviteLink}
                      className="text-[10px] text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1 mt-0.5 transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check className="w-2.5 h-2.5" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-2.5 h-2.5" /> Copy Invite Link
                        </>
                      )}
                    </button>
                  </div>
                  <button
                    onClick={() => setShowActiveCall(false)}
                    className="p-1.5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="video-container">
                  <JitsiCall
                    roomName={callRoomName}
                    userName={user?.displayName || "Student"}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Learn;
