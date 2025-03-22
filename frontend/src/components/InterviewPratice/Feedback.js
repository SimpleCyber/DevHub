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

function Feedback({switchComponent, interviewId}) {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnswers() {
      try {
        setLoading(true);
        console.log("Fetching answers for interview ID:", interviewId);
        
        if (!interviewId) {
          console.error("Interview ID is undefined or null");
          setLoading(false);
          return;
        }
        
        const answers = await userAnswerStorage.getByMockId(interviewId);
        console.log("Fetched answers:", answers);
        setFeedbackList(Array.isArray(answers) ? answers : []);
      } catch (error) {
        console.error("Error fetching answers:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchAnswers();
  }, [interviewId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10 text-center">
        <p>Loading feedback data...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="container mx-auto px-4 py-10">
        {feedbackList.length === 0 ? (
          <div>
            <h2 className="font-bold text-xl text-gray-500">
              No Interview Feedback Record Found
            </h2>
            <p className="mt-2 text-gray-500">
              This could be because no answers were recorded for this interview session.
            </p>
            <div className="mt-8">
              <Button onClick={() => switchComponent("dashboard")}>Go Home</Button>
            </div>
          </div>
        ) : (
          <>
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
                  className="p-2
                  bg-secondary rounded-lg flex justify-between
                  my-2 text-left gap-7 w-full"
                >
                  {item.question} <ChevronsUpDown className="h-5 w-5" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="flex flex-col gap-2">
                    <h2 className="text-red-500 p-2 border rounded-lg">
                      <strong>Rating: </strong>
                      {item.rating}
                    </h2>
                    <h2 className="p-2 border rounded-lg bg-red-50 text-sm text-red-900">
                      <strong>Your Answer: </strong>
                      {item.userAns}
                    </h2>
                    <h2 className="p-2 border rounded-lg bg-green-50 text-sm text-green-900">
                      <strong>Correct Answer: </strong>
                      {item.correctAns}
                    </h2>
                    <h2 className="p-2 border rounded-lg bg-blue-50 text-sm text-primary">
                      <strong>Feedback: </strong>
                      {item.feedback}
                    </h2>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}

            <div className="mt-8">
              <Button onClick={() => switchComponent("dashboard")}>Go Home</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Feedback;