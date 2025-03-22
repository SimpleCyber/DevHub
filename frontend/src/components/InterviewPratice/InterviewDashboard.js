"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import AddNewInterview from "./AddNewInterview";
import { mockInterviewStorage } from "../utils/firebaseStorage";
import { ArrowLeft } from "lucide-react"; // Import arrow icon for back button

function InterviewDashboard({ switchComponent }) {
  const { user } = useUser();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
  
    const fetchInterviews = async () => {
      try {
        const allInterviews = await mockInterviewStorage.getAll();
        const userInterviews = allInterviews.filter(
          (interview) =>
            interview.createdBy === user?.primaryEmailAddress?.emailAddress
        );
        setInterviews(userInterviews);
      } catch (error) {
        console.error("Error fetching interviews:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchInterviews();
  }, [user, navigate]);
  

  if (loading) {
    return <div className="text-center mt-8 text-gray-600">Loading...</div>;
  }

  return (
    <div>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => switchComponent('home')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            <span>Back to Home</span>
          </button>
          <h1 className="text-2xl font-bold">Your Interview Sessions</h1>
          <div className="w-24"></div> {/* Spacer for centering the title */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Add new interview */}
          <AddNewInterview
  onInterviewCreated={async () => {
    const allInterviews = await mockInterviewStorage.getAll();
    const userInterviews = allInterviews.filter(
      (interview) =>
        interview.createdBy === user?.primaryEmailAddress?.emailAddress
    );
    setInterviews(userInterviews);
  }}
  switchComponent={switchComponent}
/>

          {interviews.map((interview) => (
            <div
              key={interview.mockId}
              className="p-6 border rounded-lg hover:shadow-md transition-all cursor-pointer"
              onClick={() => {
                // You'll need to handle this based on your requirements
                // For now, let's assume you want to show interview details in the future
                console.log("Interview selected:", interview.mockId);
                // switchComponent('interviewDetail', interview.mockId); // For future implementation
              }}
            >
              <h2 className="text-xl font-semibold">{interview.jobPosition}</h2>
              <p className="text-gray-600 mt-2">{interview.jobDesc}</p>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  Experience: {interview.jobExperience} years
                </span>
                <span className="text-sm text-gray-500">
                  {interview.createdAt}
                </span>
              </div>
            </div>
          ))}
        </div>

        {interviews.length === 0 && (
          <div className="text-center mt-8 p-8 bg-gray-50 rounded-lg">
            <p className="text-gray-600">
              You haven't created any interview sessions yet.
            </p>
            <p className="text-gray-600 mt-2">
              Click on "+ Add New" to create your first interview session.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default InterviewDashboard;