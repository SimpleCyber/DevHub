// StartInterview.jsx
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import QuestionsSection from "./QuestionSection";
import RecordAnswerSection from "./RecordAnswerSection";
import { mockInterviewStorage } from "../utils/firebaseStorage";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { toast } from "../ui/sonner";

function StartInterview({ switchComponent, interviewId }) {
  const [interviewData, setInterviewData] = useState(null);
  const [mockInterviewQuestions, setMockInterviewQuestions] = useState([]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [savedAnswers, setSavedAnswers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch interview data asynchronously
    async function fetchInterviewData() {
      try {
        setLoading(true);
        console.log("Attempting to fetch interview with ID:", interviewId);
        
        if (!interviewId) {
          console.error("Interview ID is undefined or null");
          return;
        }
        
        const interview = await mockInterviewStorage.getById(interviewId);
        console.log("Fetched interview:", interview);
        
        if (interview) {
          setInterviewData(interview);
          
          // Parse the JSON string to get the questions array
          const questions = JSON.parse(interview.jsonMockResp);
          setMockInterviewQuestions(questions);
          
          // Initialize savedAnswers array to track completion
          setSavedAnswers(new Array(questions.length).fill(false));
        } else {
          console.error("Interview not found");
          toast.error("Interview not found");
        }
      } catch (error) {
        console.error("Error fetching interview:", error);
        toast.error("Failed to load interview questions");
      } finally {
        setLoading(false);
      }
    }
    
    fetchInterviewData();
  }, [interviewId]);

  // Handle when an answer is saved
  const handleAnswerSaved = (questionIndex) => {
    setSavedAnswers(prev => {
      const updated = [...prev];
      updated[questionIndex] = true;
      return updated;
    });
    
    // Automatically move to next question if not the last one
    if (questionIndex < mockInterviewQuestions.length - 1) {
      setTimeout(() => {
        setActiveQuestionIndex(questionIndex + 1);
      }, 1000);
    }
  };

  // Calculate completion percentage
  const completionPercentage = savedAnswers.filter(Boolean).length / savedAnswers.length * 100;

  // Check if interview can be completed
  const canCompleteInterview = savedAnswers.some(Boolean);

  if (loading) {
    return (
      <div className="bg-[#e9effe] min-h-screen">
        <div className="container mx-auto px-4 py-8 text-center">
          <p>Loading interview questions...</p>
        </div>
      </div>
    );
  }

  if (!interviewData || mockInterviewQuestions.length === 0) {
    return (
      <div className="bg-[#e9effe] min-h-screen">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-red-500">Failed to load interview data.</p>
          <Button 
            onClick={() => switchComponent("interviewDashboard")}
            className="mt-4"
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#e9effe] min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Interview Progress</span>
            <span className="text-sm font-medium">{Math.round(completionPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-green-600 h-2.5 rounded-full" 
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Questions */}
          <QuestionsSection
            mockInterviewQuestions={mockInterviewQuestions}
            activeQuestionIndex={activeQuestionIndex}
          />

          {/* Video/Audio Recording */}
          <RecordAnswerSection
            questions={mockInterviewQuestions}
            currentIndex={activeQuestionIndex}
            interviewData={interviewData}
            onAnswerSaved={handleAnswerSaved}
          />
        </div>
        <div className="flex justify-between mt-8">
          <div>
            {activeQuestionIndex > 0 && (
              <Button
                onClick={() => setActiveQuestionIndex(activeQuestionIndex - 1)}
                className="bg-gray-500 text-white px-4 py-2 flex items-center gap-2 rounded-md hover:bg-gray-600 transition-all duration-200 shadow-md"
              >
                <ArrowLeft size={18} /> Previous Question
              </Button>
            )}
          </div>
          
          <div className="flex gap-4">
            {activeQuestionIndex !== mockInterviewQuestions.length - 1 && (
              <Button
                onClick={() => setActiveQuestionIndex(activeQuestionIndex + 1)}
                className="bg-blue-600 text-white px-4 py-2 flex items-center gap-2 rounded-md hover:bg-blue-700 transition-all duration-200 shadow-md"
              >
                Next Question <ArrowRight size={18} />
              </Button>
            )}
            
            {canCompleteInterview && (
              <Button 
                onClick={() => {
                  if (completionPercentage < 100) {
                    const result = window.confirm("You haven't completed all questions. Are you sure you want to end the interview?");
                    if (result) {
                      switchComponent("feedback", interviewId);
                    }
                  } else {
                    switchComponent("feedback", interviewId);
                  }
                }}
                className={`text-white px-4 py-2 flex items-center gap-2 rounded-md transition-all duration-200 shadow-md ${
                  completionPercentage === 100 ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                <CheckCircle size={18} />
                {completionPercentage === 100 ? 'Complete Interview' : 'End Interview'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StartInterview;