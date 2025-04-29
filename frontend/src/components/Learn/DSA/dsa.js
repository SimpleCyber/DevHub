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
      completed: false,
      youtube: "https://youtu.be/EAR7De6Goz4?si=ZIn7meMTrrXLbAkO",
      practice: false,
      difficulty: "Easy",
      starred: false,
    },
    {
      title: "Patterns",
      completed: false,
       
      youtube: "https://www.youtube.com/watch?v=tNm_NNSB3_w&list=PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BHz&index=3",
      practice: false,
       
      difficulty: "Easy",
      starred: false,
    },
    {
      title: "C++ STL",
      completed: false,
       
      youtube: "https://www.youtube.com/watch?v=RRVYpIET_RU",
      practice: false,
       
      difficulty: "Easy",
      starred: false,
    },
    {
      title: "Know the basic Maths",
      completed: false,
       
      youtube: "https://www.youtube.com/watch?v=1xNbjMdbjug",
      practice: false,
       
      difficulty: "Medium",
      starred: false,
    },
    {
      title: "Learn Basic Recursion",
      completed: false,
       
      youtube: "https://www.youtube.com/watch?v=yVdKa8dnKiE&list=PLgUwDviBIf0rGlzIn_7rsaR2FQ5e6ZOL9",
      practice: "https://leetcode.com/problems/valid-palindrome/",
       
      difficulty: "Hard",
      starred: false,
    },


    {
      title: "Learn Basic Hashing",
      completed: false,
       
      youtube: "https://www.youtube.com/watch?v=KEs5UyBJ39g",
      practice: "https://leetcode.com/problems/frequency-of-the-most-frequent-element/",
       
      difficulty: "Medium",
      starred: false,
    },
  ]);





  // Initial data for Lecture 2
  const [lecture2Lessons, setLecture2Lessons] = useState([
    {
      title: "Selection Sort",
      completed: false,
       
      youtube: "https://www.youtube.com/watch?t=167&v=HGk_ypEuS24",
      practice: "https://leetcode.com/problems/rotate-list/description/",
       
      difficulty: "Easy",
      starred: false,
    },
    {
      title: "Bubble Sort",
      completed: false,
       
      youtube: "https://www.youtube.com/watch?t=1061&v=HGk_ypEuS24",
      practice: "https://leetcode.com/problems/sort-list/description/",
      note: false,
      difficulty: "Easy",
      starred: false,
    },
    {
      title: "Insertion Sort",
      completed: false,
       
      youtube: "https://www.youtube.com/watch?t=1900&v=HGk_ypEuS24",
      practice: "https://leetcode.com/problems/insertion-sort-list/description/",
       
      difficulty: "Medium",
      starred: false,
    },


    {
      title: "Merge Sort",
      completed: false,
       
      youtube: "https://www.youtube.com/watch?v=ogjf7ORKfd8",
      practice: "https://leetcode.com/problems/merge-intervals/description/",
      note: false,
      difficulty: "Medium",
      starred: false,
    },

    {
      title: "Quick Sort",
      completed: false,
       
      youtube: "https://www.youtube.com/watch?v=WIrA4YexLRQ",
      practice: "https://leetcode.com/problems/count-subarrays-where-max-element-appears-at-least-k-times/description/?envType=daily-question&envId=2025-04-29",
       
      difficulty: "Medium",
      starred: false,
    },
  ]);

  const [progressData, setProgressData] = useState({
    current: 0,
    total: 455,
    percentage: 0,
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
    <div className="flex h-screen bg-[#e9effe] ml-64">
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
                <span className="font-bold">
                  {progressData.current} / {progressData.total}
                </span>
              </div>
              <div className="text-purple-500 font-bold">
                {progressData.percentage}% complete
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-[#9050ff] h-2.5 rounded-full transition-all duration-500"
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
              title="Lec 1: Learn the basics "
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
              title="Lec 2: Learn importance of Sorting Techniques"
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
