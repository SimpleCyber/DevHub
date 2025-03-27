import React, { useState } from "react";
import LearningStep from "./LearningStep";
import LearningTopic from "./LearningTopic";
import LessonTable from "./LessonTable";
import {  X } from "lucide-react";
import {Sidebar} from "../../sidebar/sidebar"

const Dsa = ({ onGoBack }) => {

  // Initial data for Lecture 1
  const [lecture1Lessons, setLecture1Lessons] = useState([
    {
      title: "User Input / Output",
      completed: true,
      article: true,
      youtube: true,
      practice: true,
      note: true,
      difficulty: "Easy",
      starred: false,
    },
    {
      title: "Data Types",
      completed: true,
      article: false,
      youtube: true,
      practice: true,
      note: true,
      difficulty: "Easy",
      starred: false,
    },
    {
      title: "If Else statements",
      completed: true,
      article: true,
      youtube: true,
      practice: true,
      note: true,
      difficulty: "Easy",
      starred: false,
    },
    {
      title: "Switch Statement",
      completed: true,
      article: true,
      youtube: true,
      practice: true,
      note: true,
      difficulty: "Easy",
      starred: false,
    },
    {
      title: "What are arrays, strings?",
      completed: true,
      article: false,
      youtube: true,
      practice: false,
      note: true,
      difficulty: "Easy",
      starred: false,
    },
    {
      title: "For loops",
      completed: true,
      article: true,
      youtube: true,
      practice: true,
      note: true,
      difficulty: "Easy",
      starred: false,
    },
    {
      title: "While loops",
      completed: true,
      article: true,
      youtube: true,
      practice: true,
      note: true,
      difficulty: "Easy",
      starred: false,
    },
    {
      title: "Functions (Pass by Reference and Value)",
      completed: true,
      article: false,
      youtube: true,
      practice: true,
      note: true,
      difficulty: "Easy",
      starred: false,
    },
    {
      title: "Time Complexity (Learn Basics, and then analyse in next Steps)",
      completed: true,
      article: true,
      youtube: true,
      practice: false,
      note: true,
      difficulty: "Easy",
      starred: false,
    },
  ]);

  // Initial data for Lecture 2
  const [lecture2Lessons, setLecture2Lessons] = useState([
    {
      title: "Arrays Introduction",
      completed: true,
      article: true,
      youtube: true,
      practice: true,
      note: true,
      difficulty: "Easy",
      starred: false,
    },
    {
      title: "Array Operations",
      completed: true,
      article: true,
      youtube: true,
      practice: true,
      note: false,
      difficulty: "Easy",
      starred: false,
    },
    {
      title: "Linked Lists Basics",
      completed: false,
      article: true,
      youtube: true,
      practice: true,
      note: true,
      difficulty: "Medium",
      starred: false,
    },
    {
      title: "Stacks and Queues",
      completed: false,
      article: true,
      youtube: true,
      practice: true,
      note: false,
      difficulty: "Medium",
      starred: false,
    },
    {
      title: "Recursion Fundamentals",
      completed: false,
      article: true,
      youtube: true,
      practice: true,
      note: true,
      difficulty: "Medium",
      starred: false,
    },
  ]);

  const [progressData, setProgressData] = useState({
    current: 118,
    total: 455,
    percentage: 25,
  });

  // Calculate completed lessons
  const completedLecture1Lessons = lecture1Lessons.filter(
    (lesson) => lesson.completed
  ).length;
  const completedLecture2Lessons = lecture2Lessons.filter(
    (lesson) => lesson.completed
  ).length;

  // Handle toggling lesson completion for Lecture 1
  const handleToggleCompleteLecture1 = (index) => {
    const updatedLessons = [...lecture1Lessons];
    updatedLessons[index].completed = !updatedLessons[index].completed;
    setLecture1Lessons(updatedLessons);

    // Update overall progress
    updateOverallProgress(updatedLessons[index].completed);
  };

  // Handle toggling lesson completion for Lecture 2
  const handleToggleCompleteLecture2 = (index) => {
    const updatedLessons = [...lecture2Lessons];
    updatedLessons[index].completed = !updatedLessons[index].completed;
    setLecture2Lessons(updatedLessons);

    // Update overall progress
    updateOverallProgress(updatedLessons[index].completed);
  };

  // Update overall progress
  const updateOverallProgress = (isCompleted) => {
    const newCurrent = progressData.current + (isCompleted ? 1 : -1);
    const newPercentage = Math.round((newCurrent / progressData.total) * 100);

    setProgressData({
      ...progressData,
      current: newCurrent,
      percentage: newPercentage,
    });
  };

  return (
    <div className="flex h-screen bg-gray-50 ml-64">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-center gap-2 mb-4">
          

            <h1 className="text-2xl font-bold text-gray-800">
              Data Structures and Algorithms
            </h1>

            <button
              onClick={onGoBack}
              className="p-2 bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm mb-6 p-4 relative">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm text-gray-600">
                Your Progress:{" "}
                <span className="font-medium">
                  {progressData.current}/{progressData.total}
                </span>
              </div>
              <div className="text-[#ff5631] font-medium">
                {progressData.percentage}% complete
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-[#ff5631] h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progressData.percentage}%` }}
              ></div>
            </div>
          </div>

          <LearningStep
            title="Step 1 : Learn the basics"
            currentStep={31}
            totalSteps={31}
          >
            <LearningTopic
              title="Lec 1: Things to Know in C++/Java/Python or any language"
              currentLesson={9}
              totalLessons={9}
              completedLessons={completedLecture1Lessons}
            >
              <LessonTable
                lessons={lecture1Lessons}
                onToggleComplete={handleToggleCompleteLecture1}
              />
            </LearningTopic>

            <LearningTopic
              title="Lec 2: Data Structures Fundamentals"
              currentLesson={2}
              totalLessons={5}
              completedLessons={completedLecture2Lessons}
            >
              <LessonTable
                lessons={lecture2Lessons}
                onToggleComplete={handleToggleCompleteLecture2}
              />
            </LearningTopic>
          </LearningStep>
        </div>
      </div>
    </div>
  );
};

export default Dsa;
