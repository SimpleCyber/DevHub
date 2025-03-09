"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useUser } from "../context/UserContext"
import AddNewInterview from "./AddNewInterview"
import { mockInterviewStorage } from "../utils/localStorage"

function InterviewDashboard() {
  const { user, signIn } = useUser()
  const [interviews, setInterviews] = useState([])
  const [showLoginForm, setShowLoginForm] = useState(false)
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")

  useEffect(() => {
    if (user) {
      // Load interviews from localStorage
      const allInterviews = mockInterviewStorage.getAll()
      const userInterviews = allInterviews.filter(
        (interview) => interview.createdBy === user.primaryEmailAddress?.emailAddress,
      )
      setInterviews(userInterviews)
    }
  }, [user])

  const handleLogin = (e) => {
    e.preventDefault()
    if (email && name) {
      signIn(email, name)
      setShowLoginForm(false)
    }
  }

  if (!user) {
    return (
      <div>
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow">
            <div className="text-center">
              <h1 className="text-2xl font-bold">Welcome to AI Interview Coach</h1>
              <p className="mt-2 text-gray-600">Sign in to continue</p>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleLogin}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <button type="submit" className="w-full px-4 py-2 text-white bg-primary rounded-md hover:bg-primary/90">
                  Sign In
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Your Interview Sessions</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AddNewInterview
            onInterviewCreated={() => {
              const allInterviews = mockInterviewStorage.getAll()
              const userInterviews = allInterviews.filter(
                (interview) => interview.createdBy === user.primaryEmailAddress?.emailAddress,
              )
              setInterviews(userInterviews)
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
                <span className="text-sm text-gray-500">Experience: {interview.jobExperience} years</span>
                <span className="text-sm text-gray-500">{interview.createdAt}</span>
              </div>
            </Link>
          ))}
        </div>

        {interviews.length === 0 && (
          <div className="text-center mt-8 p-8 bg-gray-50 rounded-lg">
            <p className="text-gray-600">You haven't created any interview sessions yet.</p>
            <p className="text-gray-600 mt-2">Click on "+ Add New" to create your first interview session.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default InterviewDashboard

