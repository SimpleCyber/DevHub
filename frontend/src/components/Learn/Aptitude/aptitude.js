import React from "react";
import { X } from "lucide-react";
import { Sidebar } from "../../sidebar/sidebar";

const Aptitude = ({ onGoBack }) => {
  return (
    <div className="min-h-screen bg-gray-100 p-6 ml-64">
      <Sidebar />
      <div className="container mx-auto">
        <div className="flex justify-between items-center gap-2 mb-4">
          <h1 className="text-2xl font-bold text-gray-800">
            Aptitude
          </h1>

          <button
            onClick={onGoBack}
            className="p-2 bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Add Aptitude specific content here */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p>Aptitude Learning Track Content</p>
        </div>
      </div>
    </div>
  );
};

export default Aptitude;
