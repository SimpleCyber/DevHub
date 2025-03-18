"use client";

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import AddNewInterview from "./AddNewInterview";
import { mockInterviewStorage } from "../utils/firebaseStorage";
import { Sidebar } from "../sidebar/sidebar";

function InterviewDashboard() {
  const { user } = useUser();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // if (user === undefined) return; // Prevent navigation before user state is set
    // if (!user) {
    //   // navigate("/auth");
    //   navigate("/dashboard");
    //   return;
    // }
  
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
        <h1 className="text-2xl font-bold mb-6">Your Interview Sessions</h1>




        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Add new interview */}
          <AddNewInterview
            onInterviewCreated={async () => {
              const allInterviews = await mockInterviewStorage.getAll();
              const userInterviews = allInterviews.filter(
                (interview) =>
                  interview.createdBy === user.primaryEmailAddress?.emailAddress
              );
              setInterviews(userInterviews);
            }}
          />




          {interviews.map((interview) => (
            <Link
              to={`/dashboard/interview/${interview.mockId}`}
              key={interview.mockId}
              className="p-6 border rounded-lg hover:shadow-md transition-all"
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
            </Link>
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