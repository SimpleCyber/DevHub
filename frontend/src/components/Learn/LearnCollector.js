import React, { useState } from "react";
import { Book, Target, Code } from "lucide-react";

import Dsa from "./DSA/dsa";
import WebDev from "./WebDev/webdev";
import Aptitude from "./Aptitude/aptitude";

const LearnCollector = () => {
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [learningTracks] = useState([
    {
      id: "dsa",
      icon: <Book className="w-8 h-8 text-blue-500" />,
      title: "Data Structure and Algorithms",
      progress: 45,
      steps: 11,
      difficulty: "Medium",
    },
    {
      id: "aptitude",
      icon: <Target className="w-8 h-8 text-green-500" />,
      title: "Aptitude",
      progress: 21,
      steps: 38,
      difficulty: "Medium",
    },
    {
      id: "webdev",
      icon: <Code className="w-8 h-8 text-purple-500" />,
      title: "Web Development",
      progress: 0,
      steps: 75,
      difficulty: "Easy",
    },
  ]);

  const renderSelectedTrack = () => {
    switch (selectedTrack?.id) {
      case "dsa":
        return <Dsa onGoBack={() => setSelectedTrack(null)} />;
      case "aptitude":
        return <Aptitude onGoBack={() => setSelectedTrack(null)} />;
      case "webdev":
        return <WebDev onGoBack={() => setSelectedTrack(null)} />;
      default:
        return null;
    }
  };

  if (selectedTrack) {
    return renderSelectedTrack();
  }

  return (
    <div className="w-full">
      <div className="grid md:grid-cols-3 gap-6">
        {learningTracks.map((track) => (
          <div
            key={track.id}
            className="bg-white shadow-md rounded-lg p-6 mb-4 hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-center mb-4">
              {track.icon}
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold 
              ${
                track.difficulty === "Easy"
                  ? "bg-green-100 text-green-800"
                  : track.difficulty === "Medium"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
              }`}
              >
                {track.difficulty}
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {track.title}
            </h2>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
              <div
                className="bg-purple-500 h-2.5 rounded-full"
                style={{ width: `${track.progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-gray-600 mb-4">
              <span>{track.progress}% Complete</span>
              <span>{track.steps} Steps</span>
            </div>
            <button
              onClick={() => setSelectedTrack(track)}
              className="w-full bg-purple-600   text-white py-2 rounded-md hover:bg-purple-400 transition"
            >
              Continue Learning
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LearnCollector;
