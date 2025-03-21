//interview.js
"use client";

import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Lightbulb, WebcamIcon } from "lucide-react";
import { Button } from "../ui/button";
import { mockInterviewStorage } from "../utils/firebaseStorage";

function Interview({ switchComponent, interviewId }) {
  // const { interviewId } = useParams();
  const [interviewData, setInterviewData] = useState(null);
  const [webCamEnabled, setWebCamEnabled] = useState(false);

  useEffect(() => {
    // Get interview details from localStorage
    const interview = mockInterviewStorage.getById(interviewId);
    if (interview) {
      setInterviewData(interview);
    }
  }, [interviewId]);

  if (!interviewData) {
    return (
      <div>
        <div className="container mx-auto px-4 py-8 text-center">
          <p>Loading interview data...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="container mx-auto px-4 py-8">
        <h2 className="font-bold text-2xl mb-6">Let's Get Started</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col p-5 rounded-lg border gap-5">
              <h2 className="text-lg">
                <strong>Job Role/Job Position: </strong>
                {interviewData.jobPosition}
              </h2>
              <h2 className="text-lg">
                <strong>Job Description/Tech Stack: </strong>
                {interviewData.jobDesc}
              </h2>
              <h2 className="text-lg">
                <strong>Years of Experience: </strong>
                {interviewData.jobExperience}
              </h2>
            </div>
            <div className="p-5 border rounded-lg border-yellow-300 bg-yellow-100">
              <h2 className="flex gap-2 items-center text-yellow-500">
                <Lightbulb />
                <strong>Information</strong>
              </h2>
              <h2 className="mt-3 text-yellow-500">
                This interview will consist of several questions related to your
                job position. You'll be able to record your answers using your
                webcam and microphone. After each answer, you'll receive
                AI-generated feedback to help you improve.
              </h2>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center">
            {webCamEnabled ? (
              <div className="bg-black rounded-lg p-5 w-full max-w-md">
                <video
                  id="webcam"
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-64 rounded"
                ></video>
              </div>
            ) : (
              <>
                <WebcamIcon className="h-72 w-full my-7 p-20 bg-secondary rounded-lg border" />
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    navigator.mediaDevices
                      .getUserMedia({ video: true, audio: true })
                      .then((stream) => {
                        setWebCamEnabled(true);
                        const videoElement = document.getElementById("webcam");
                        if (videoElement) {
                          videoElement.srcObject = stream;
                        }
                      })
                      .catch((err) => {
                        console.error("Error accessing webcam:", err);
                        alert(
                          "Failed to access webcam and microphone. Please check your permissions."
                        );
                      });
                  }}
                >
                  Enable Web Cam and Microphone
                </Button>
              </>
            )}
          </div>
        </div>
        <div className="flex justify-end mt-8">
          {/* <Link to={`/dashboard/interview/${interviewId}/start`}> */}
          <Button
            onClick={() => switchComponent("startInterview", interviewId)}
          >
            Start Interview
          </Button>
          {/* </Link> */}
        </div>
      </div>
    </div>
  );
}

export default Interview;
