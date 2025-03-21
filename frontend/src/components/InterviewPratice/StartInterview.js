"use client";

import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import QuestionsSection from "./QuestionSection";
import RecordAnswerSection from "./RecordAnswerSection";
import { mockInterviewStorage } from "../utils/firebaseStorage";

function StartInterview({ switchComponent, interviewId }) {
  // Remove useParams and accept interviewId as a prop
  const [interviewData, setInterviewData] = useState(null);
  const [mockInterviewQuestions, setMockInterviewQuestions] = useState([]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

  useEffect(() => {
    // Fetch interview data asynchronously
    async function fetchInterviewData() {
      try {
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
        } else {
          console.error("Interview not found");
        }
      } catch (error) {
        console.error("Error fetching interview:", error);
      }
    }
    
    fetchInterviewData();
  }, [interviewId]);

  if (!interviewData || mockInterviewQuestions.length === 0) {
    return (
      <div>
        <div className="container mx-auto px-4 py-8 text-center">
          <p>Loading interview questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Questions */}
          <QuestionsSection
            mockInterviewQuestions={mockInterviewQuestions}
            activeQuestionIndex={activeQuestionIndex}
          />

          {/* Video/Audio Recording */}
          <RecordAnswerSection
            mockInterviewQuestions={mockInterviewQuestions}
            activeQuestionIndex={activeQuestionIndex}
            interviewData={interviewData}
          />
        </div>
        <div className="flex justify-end gap-6 mt-8">
          {activeQuestionIndex > 0 && (
            <Button
              onClick={() => setActiveQuestionIndex(activeQuestionIndex - 1)}
            >
              Previous Question
            </Button>
          )}
          {activeQuestionIndex !== mockInterviewQuestions.length - 1 && (
            <Button
              onClick={() => setActiveQuestionIndex(activeQuestionIndex + 1)}
            >
              Next Question
            </Button>
          )}
          {activeQuestionIndex === mockInterviewQuestions.length - 1 && (
            <Button 
              onClick={() => switchComponent("feedback", interviewId)}
            >
              End Interview
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default StartInterview;