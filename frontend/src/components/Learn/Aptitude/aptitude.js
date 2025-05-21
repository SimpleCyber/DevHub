import React, { useState } from "react";
import LearningStep from "./LearningStep";
import LearningTopic from "./LearningTopic";
import LessonTable from "./LessonTable";
import {  X } from "lucide-react";
import {Sidebar} from "../../sidebar/sidebar"

const Aptitude = ({ onGoBack }) => {

  // Initial data for Lecture 1
  const [lecture1Lessons, setLecture1Lessons] = useState([
    {
      title: "Fractions and Decimal",
      completed: true,
      youtube: "https://youtu.be/tnc9ojITRg4?si=qCRPSpbAigsajM8O",
      practice: "https://www.codechef.com/problems/NEWYEAR",
      difficulty: "Easy",
      starred: false,
    },
    {
      title: "Simplification",
      completed: true,
       
      youtube: "https://youtu.be/jAbpPTpz2bQ?si=_Mexeo_RP0WsYFg6",
      practice: "https://www.codechef.com/problems/PATTERN",
       
      difficulty: "Easy",
      starred: false,
    },
    {
      title: "Indices and Surds",
      completed: true,
       
      youtube: "https://www.youtube.com/watch?v=RRVYpIET_RU",
      practice: "https://leetcode.com/problems/minimum-domino-rotations-for-equal-row/description/?envType=daily-question&envId=2025-05-03",
       
      difficulty: "Easy",
      starred: false,
    },
    {
      title: "Permutation and Combinations",
      completed: true,
       
      youtube: "https://youtu.be/ETiRE7N7pEI?si=YjESTGNVC2uTmzYO",
      practice: "https://www.codechef.com/problems/P1_175",
       
      difficulty: "Medium",
      starred: false,
    },
    {
      title: "Proability",
      completed: true,
       
      youtube: "https://youtu.be/ximxxERGSUc?si=PhElt6Vmmloc1NwN",
      practice: "https://leetcode.com/problems/valid-palindrome/",
       
      difficulty: "Hard",
      starred: false,
    },


    {
      title: "Mixture and Alligation",
      completed: false,
       
      youtube: "https://youtu.be/OKSJDDAyqP0?si=T2N73eN7YEZ2RDxi",
       practice: "",
      difficulty: "Medium",
      starred: false,
    },

    {
      title: "Ratio and Proportions",
      completed: false,
       
      youtube: "https://youtu.be/jfoJBivWlnQ?si=FRvDfYrbkwL3pJE1",
       practice: "",
      difficulty: "Easy",
      starred: false,
    },

    {
      title: "HCF & LCM",
      completed: false,
       
      youtube: "https://youtu.be/xyyejJYeILM?si=MkvIMLc38Fhe69_j",
       practice: "",
      difficulty: "Easy",
      starred: false,
    },


    {
      title: "Work and Wages",
      completed: false,
       
      youtube: "https://youtu.be/8OOBo5C7dsc?si=x77cKc-3CrygYDVQ",
       practice: "",
      difficulty: "Easy",
      starred: false,
    },


 


    {
      title: "Compound Interest",
      completed: false,
       
      youtube: "https://youtu.be/PbUZnzncmR4?si=9XA3-RC7iL6Y9gJV",
       practice: "",
      difficulty: "Easy",
      starred: false,
    },


    {
      title: "Simple Interest",
      completed: false,
       
      youtube: "https://youtu.be/jvRq87ZWzIk?si=YwHSerMjulfQbuJn",
       practice: "",
      difficulty: "Easy",
      starred: false,
    },



    {
      title: "Profit & Loss",
      completed: false,
       
      youtube: "https://youtu.be/T2odvmxqi1I?si=3RQoXCEiuwojHW5y",
       practice: "",
      difficulty: "Medium",
      starred: false,
    },


    {
      title: "Discount",
      completed: false,
       
      youtube: "https://youtu.be/FW97hRrHcSw?si=OI2PiheM7iN5GRJ1",
       practice: "",
      difficulty: "Medium",
      starred: false,
    },


    {
      title: "Speed, Time & Distance",
      completed: false,
       
      youtube: "https://youtu.be/jzNxXm5twx4?si=3vhuoNcvPkQd6_J4",
       practice: "",
      difficulty: "Hard",
      starred: false,
    },


    {
      title: "Percentage",
      completed: false,
       
      youtube: "https://youtu.be/RWdNhJWwzSs?si=c8cCCzGJYmSpdMyc",
       practice: "",
      difficulty: "Hard",
      starred: false,
    },


    {
      title: "Pipes & Cistens",
      completed: false,
       
      youtube: "https://youtu.be/mBtBD1N7ywQ?si=7Jf_YgQJdPL-Z53C",
       practice: "",
      difficulty: "Medium",
      starred: false,
    },


    {
      title: "Time & Work",
      completed: false,
       
      youtube: "https://youtu.be/KE7tQf9spPg?si=GY_Ah8-bAm7NNko9",
       practice: "",
      difficulty: "Easy",
      starred: false,
    },


    {
      title: "Boats & Streams",
      completed: false,
       
      youtube: "https://youtu.be/-EdJ4kAW-j4?si=A6budM95AUOUnBMz",
       practice: "",
      difficulty: "Easy",
      starred: false,
    },

    {
      title: "Problems on Trains",
      completed: false,
       
      youtube: "https://youtu.be/78b4Jn4rw44?si=23xzMbtlYqkYZxpX",
       practice: "",
      difficulty: "Medium",
      starred: false,
    },

    {
      title: "Word Problems on Number",
      completed: false,
       
      youtube: "https://youtu.be/vsBpWgNYjtQ?si=MDQGoveFchmLqzvY",
       practice: "",
      difficulty: "Easy",
      starred: false,
    },

    {
      title: "Problems on Ages",
      completed: false,
       
      youtube: "https://youtu.be/tJHl73PBnwY?si=et_3Y64belvNSFzB",
       practice: "",
      difficulty: "Easy",
      starred: false,
    },

    {
      title: "Partnerships",
      completed: false,
       
      youtube: "https://youtu.be/hn9TKnr8L_8?si=xO_iIyTplZJxC2Gh",
       practice: "",
      difficulty: "Medium",
      starred: false,
    },
  ]);





  // Initial data for Lecture 2
  const [lecture2Lessons, setLecture2Lessons] = useState([
    {
      title: "Series",
      completed: true,
       
      youtube: "https://youtu.be/gXBuL_FyahE?si=ZFimqVOIE2-AU86v",
      practice: "https://leetcode.com/problems/rotate-list/description/",
       
      difficulty: "Easy",
      starred: false,
    },
    {
      title: "Syllogism ",
      completed: true,
       
      youtube: "https://youtu.be/knFLfSr35wU?si=HjJAZA7gC_eSVipD",
      practice: "https://leetcode.com/problems/sort-list/description/",
      note: false,
      difficulty: "Easy",
      starred: false,
    },
    {
      title: "Seating Arrangement",
      completed: false,
       
      youtube: "https://youtu.be/GYe98jwCn7g?si=g4SeH3cI7T1LuCS_",
      practice: "https://leetcode.com/problems/insertion-sort-list/description/",
       
      difficulty: "Medium",
      starred: false,
    },


    {
      title: "Blood Relations ",
      completed: false,
       
      youtube: "https://youtu.be/LRdLhfDupMU?si=mLsJ1Xw2fhNUT2Ho",
      practice: "https://leetcode.com/problems/merge-intervals/description/",
      note: false,
      difficulty: "Medium",
      starred: false,
    },

    {
      title: "Direction Sense Test",
      completed: false,
       
      youtube: "https://youtu.be/x0WkptLF6oE?si=55zXwphNaZAUb94u",
      practice: "https://leetcode.com/problems/count-subarrays-where-max-element-appears-at-least-k-times/description/?envType=daily-question&envId=2025-04-29",
       
      difficulty: "Medium",
      starred: false,
    },
  ]);

  const [progressData, setProgressData] = useState({
    current: 8,
    total: 38,
    percentage: 21,
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
    <div className="flex h-screen bg-[#e9effe]">
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-center gap-2 mb-4">
          

            <h1 className="text-2xl font-bold text-gray-600">
              Aptitude
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
            currentStep={8}
            totalSteps={31}
          >
            <LearningTopic
              title="Lec 1: Quantitive Aptitude "
              currentLesson={6}
              totalLessons={22}
              completedLessons={completedLecture1Lessons}
            >
              <LessonTable
                lessons={lecture1Lessons}
                onToggleComplete={handleToggleCompleteLecture1}
              />
            </LearningTopic>

            <LearningTopic
              title="Lec 2: Logical Reasoning"
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

export default Aptitude;
