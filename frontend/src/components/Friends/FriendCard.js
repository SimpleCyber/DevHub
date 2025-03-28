// components/FriendCard.js
import { BookOpen } from "lucide-react";

const FriendCard = ({ friend }) => {
  return (
    <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
      <div className="flex">
        {/* Left Side - Friend Info */}
        <div className="w-1/2 p-6 border-r border-gray-200">
          <div className="flex items-center mb-4">
            <img
              src={friend.avatar}
              alt={friend.name}
              className="w-16 h-16 rounded-full mr-4 object-cover"
            />
            <div>
              <h3 className="text-xl font-bold text-gray-800">{friend.name}</h3>
              <span className="text-sm font-semibold text-gray-500">
              {friend.stats.streak} Day Streak
            </span>



            </div>
          </div>

          {/* Problem Stats */}
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            Problems Solved
          </h4>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-green-50 p-2 rounded-lg text-center">
              <div className="flex justify-center items-center mb-1">
                <span className="font-bold text-green-800">
                  {friend.stats.easy}
                </span>
              </div>
              <span className="text-xs font-semibold text-gray-600">Easy</span>
            </div>
            <div className="bg-yellow-50 p-2 rounded-lg text-center">
              <div className="flex justify-center items-center mb-1">
                <span className="font-bold text-yellow-800">
                  {friend.stats.medium}
                </span>
              </div>
              <span className="text-xs font-semibold text-gray-600">
                Medium
              </span>
            </div>
            <div className="bg-red-50 p-2 rounded-lg text-center">
              <div className="flex justify-center items-center mb-1">
                <span className="font-bold text-red-800">
                  {friend.stats.hard}
                </span>
              </div>
              <span className="text-xs font-semibold text-gray-600">Hard</span>
            </div>
          </div>

          {/* Lectures Stats */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              Lectures
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-blue-50 p-2 rounded-lg text-center flex flex-col items-center">
                <span className="font-bold text-blue-800 mb-2">
                  {friend.stats.lectures.dsa}
                </span>
                <span className="text-xs font-semibold text-gray-600">DSA</span>
              </div>
              <div className="bg-purple-50 p-2 rounded-lg text-center flex flex-col items-center">
                <span className="font-bold text-purple-800 mb-2">
                  {friend.stats.lectures.flutter}
                </span>
                <span className="text-xs font-semibold text-gray-600">
                  Flutter
                </span>
              </div>
              <div className="bg-pink-50 p-2 rounded-lg text-center flex flex-col items-center">
                <span className="font-bold text-pink-800 mb-2">
                  {friend.stats.lectures.webDev}
                </span>
                <span className="text-xs font-semibold text-gray-600">
                  Web Dev
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Daily Tasks */}
        <div className="w-1/2 p-6 bg-gray-50">
          <h3 className="text-lg font-bold mb-4 flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-purple-600" />
            Daily Tasks
          </h3>
          <div className="space-y-3 mb-6">
            {friend.dailyTasks.map((task, index) => (
              <div key={index} className="flex items-center">
                <input
                  type="checkbox"
                  id={`task-${index}`}
                  className="mr-3 rounded text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor={`task-${index}`}
                  className="text-sm text-gray-700"
                >
                  {task}
                </label>
              </div>
            ))}
          </div>

          
        </div>
      </div>
    </div>
  );
};

export default FriendCard;
