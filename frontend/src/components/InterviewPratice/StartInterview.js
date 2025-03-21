"use client";

import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "../ui/button";
import QuestionsSection from "./QuestionSection";
import RecordAnswerSection from "./RecordAnswerSection";
import { mockInterviewStorage } from "../utils/firebaseStorage";

function StartInterview() {
  const { interviewId } = useParams();
  const [interviewData, setInterviewData] = useState(null);
  const [mockInterviewQuestions, setMockInterviewQuestions] = useState([]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

  useEffect(() => {
    // Get interview details from localStorage
    const interview = mockInterviewStorage.getById(interviewId);
    if (interview) {
      setInterviewData(interview);
      const questions = JSON.parse(interview.jsonMockResp);
      setMockInterviewQuestions(questions);
    }
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
            <Link to={`/dashboard/interview/${interviewData.mockId}/feedback`}>
              <Button>End Interview</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default StartInterview;
