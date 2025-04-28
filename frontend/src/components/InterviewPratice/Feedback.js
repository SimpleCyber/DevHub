// Feedback.jsx - Updated version
"use client";

import { useState, useEffect } from "react";
import { ChevronsUpDown } from "lucide-react";
import { Button } from "../ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { userAnswerStorage } from "../utils/firebaseStorage";

function Feedback({ switchComponent, interviewId }) {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAnswers() {
      try {
        setLoading(true);
        setError(null);
        console.log("Feedback component - interviewId received:", interviewId);
        
        if (!interviewId) {
          console.error("Interview ID is undefined or null");
          setError("No interview ID provided");
          setLoading(false);
          return;
        }
        
        // Add debugging for the userAnswerStorage object
        console.log("userAnswerStorage object:", userAnswerStorage);
        
        const answers = await userAnswerStorage.getByMockId(interviewId);
        console.log("Fetched answers:", answers, "Type:", typeof answers);
        console.log("Is array:", Array.isArray(answers), "Length:", Array.isArray(answers) ? answers.length : 'N/A');
        
        if (!answers) {
          console.warn("No answers returned from storage");
          setFeedbackList([]);
        } else if (!Array.isArray(answers)) {
          console.warn("Answers is not an array, attempting to convert");
          // Try to handle if answers is an object with values
          if (typeof answers === 'object') {
            const answersArray = Object.values(answers);
            console.log("Converted to array:", answersArray);
            setFeedbackList(answersArray);
          } else {
            setFeedbackList([]);
          }
        } else {
          setFeedbackList(answers);
        }
      } catch (error) {
        console.error("Error fetching answers:", error);
        setError("Failed to load feedback data: " + error.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchAnswers();
    
    // For development testing - uncomment to test with mock data
    /*
    if (process.env.NODE_ENV === 'development') {
      const mockFeedback = [
        {
          question: "What is React?",
          rating: "8/10",
          userAns: "React is a JavaScript library for building user interfaces.",
          correctAns: "React is a JavaScript library developed by Facebook for building user interfaces, particularly single-page applications where UI updates are frequent.",
          feedback: "Good basic definition, but could include more details about its component-based architecture and virtual DOM."
        },
        {
          question: "Explain useState in React hooks",
          rating: "7/10",
          userAns: "useState is a hook that allows functional components to have state.",
          correctAns: "useState is a React Hook that lets you add state to functional components. It returns a stateful value and a function to update it, allowing components to manage local state without writing a class.",
          feedback: "Your answer captures the basic concept but lacks examples and details about the update function."
        }
      ];
      console.log("Setting mock feedback for testing");
      setFeedbackList(mockFeedback);
      setLoading(false);
    }
    */
  }, [interviewId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mb-4"></div>
          <p className="text-gray-600">Loading feedback data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
          <div className="mt-4">
            <Button onClick={() => switchComponent("dashboard")}>Go Home</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="container mx-auto px-4 py-10">
        {feedbackList.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <h2 className="font-bold text-xl text-gray-500">
              No Interview Feedback Record Found
            </h2>
            <p className="mt-2 text-gray-500">
              This could be because no answers were recorded for this interview session.
              <br />
              If you believe this is an error, try refreshing the page or contact support.
            </p>
            <div className="mt-8">
              <Button onClick={() => switchComponent("dashboard")}>Go Home</Button>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-3xl font-bold text-green-500">
                Congratulations!
              </h2>
              <h2 className="font-bold text-2xl mt-2 mb-6">
                Here is your interview feedback
              </h2>

              <h2 className="text-sm text-gray-500 mb-6">
                Find below interview questions with correct answers, your answers,
                and feedback for improvement
              </h2>

              {feedbackList.map((item, index) => (
                <Collapsible key={index} className="mt-7">
                  <CollapsibleTrigger
                    className="p-4
                    bg-secondary rounded-lg flex justify-between
                    my-2 text-left gap-7 w-full"
                  >
                    <span className="font-medium">{item.question}</span> 
                    <ChevronsUpDown className="h-5 w-5 flex-shrink-0" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="bg-gray-50 p-4 rounded-lg mt-2">
                    <div className="flex flex-col gap-3">
                      <h2 className="text-red-500 p-3 border rounded-lg bg-white">
                        <strong>Rating: </strong>
                        {item.rating}
                      </h2>
                      <h2 className="p-3 border rounded-lg bg-red-50 text-sm text-red-900">
                        <strong>Your Answer: </strong>
                        {item.userAns}
                      </h2>
                      <h2 className="p-3 border rounded-lg bg-green-50 text-sm text-green-900">
                        <strong>Correct Answer: </strong>
                        {item.correctAns}
                      </h2>
                      <h2 className="p-3 border rounded-lg bg-blue-50 text-sm text-primary">
                        <strong>Feedback: </strong>
                        {item.feedback}
                      </h2>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}

              <div className="mt-8">
                <Button 
                  onClick={() => switchComponent("dashboard")}
                  className="bg-primary hover:bg-primary/90"
                >
                  Go Home
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Feedback;