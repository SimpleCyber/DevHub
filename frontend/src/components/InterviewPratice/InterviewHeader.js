import React from "react";

const InterviewHeader = () => {
  return (
    <div className="w-full bg-gradient-to-b from-[#26234e] to-[#181a25] text-white py-16 px-8 relative overflow-hidden rounded-2xl">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
        {/* Left side content */}
        <div className="z-10 mb-8 md:mb-0">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Get Interview-Ready with AI-
            <br />
            Powered Practice & Feedback
          </h1>
          <p className="text-xl mb-8 text-gray-300">
            Practice real interview questions & get instant feedback
          </p>
          <button className="bg-purple-200 hover:bg-purple-300 text-purple-900 font-medium py-3 px-8 rounded-full transition-colors">
            Start an Interview
          </button>
        </div>

        {/* Right side with robot and badges */}
        <div className="relative">
          {/* CSS Badge */}
          <div className="absolute -top-6 right-16">
            <div className="bg-green-200 text-green-800 p-2 rounded-lg rotate-6 shadow-md">
              <span className="font-bold">CSS</span>
            </div>
          </div>

          {/* Robot image */}
          <img
            src="/robot.png"
            alt="AI Interview Robot"
            className="w-64 h-auto z-0 max-sm:hidden"
          />
        </div>
      </div>
    </div>
  );
};

export default InterviewHeader;
