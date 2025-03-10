"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { v4 as uuidv4 } from "uuid"
import { useUser } from "../context/UserContext"
import { mockInterviewStorage } from "../utils/firebaseStorage"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog"
import { toast } from "../ui/sonner"

function AddNewInterview({ onInterviewCreated }) {
  const [openDialog, setOpenDialog] = useState(false)
  const [jobPosition, setJobPosition] = useState("")
  const [jobDesc, setJobDesc] = useState("")
  const [jobExperience, setJobExperience] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { user } = useUser()

  // Mock AI response generator
  const generateMockInterviewQuestions = (position, description, experience) => {
    // This is a simplified mock of what an AI would return
    const questions = [
      {
        question: `Tell me about your experience with ${description}?`,
        answer: `When answering about ${description} experience, focus on specific projects, technologies used, and outcomes achieved. Quantify results when possible and explain how you've grown in this area.`,
      },
      {
        question: `How would you handle a situation where a project using ${description} is falling behind schedule?`,
        answer: `Describe your approach to project management and prioritization. Mention communication with stakeholders, reassessing timelines, and possibly bringing in additional resources if needed.`,
      },
      {
        question: `What do you consider your biggest achievement as a ${position}?`,
        answer: `Choose a significant accomplishment relevant to the role that demonstrates your skills with ${description}. Explain the challenge, your approach, and the positive outcome.`,
      },
      {
        question: `Where do you see yourself in 5 years as a ${position}?`,
        answer: `Discuss your career aspirations while staying relevant to the ${position} role. Mention skills you want to develop and how you plan to grow professionally.`,
      },
      {
        question: `What makes you the right candidate for this ${position} position?`,
        answer: `Highlight your relevant skills, especially in ${description}, and explain how your ${experience} years of experience have prepared you for this role. Connect your background directly to the job requirements.`,
      },
    ]

    return JSON.stringify(questions)
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Generate mock interview questions
      const mockJsonResp = generateMockInterviewQuestions(jobPosition, jobDesc, jobExperience)

      // Create a new interview in localStorage
      const mockId = uuidv4()
      const currentDate = new Date().toLocaleDateString("en-GB")

      const newInterview = {
        mockId,
        jsonMockResp: mockJsonResp,
        jobPosition,
        jobDesc,
        jobExperience,
        createdBy: user?.primaryEmailAddress?.emailAddress,
        createdAt: currentDate,
      }

      mockInterviewStorage.create(newInterview)

      // Notify parent component
      if (onInterviewCreated) {
        onInterviewCreated()
      }

      setOpenDialog(false)
      navigate(`/dashboard/interview/${mockId}`)
    } catch (error) {
      console.error("Error creating interview:", error)
      toast.error("Failed to create interview. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div
        className="p-10 border rounded-lg bg-secondary
        hover:scale-105 hover:shadow-md cursor-pointer
         transition-all border-dashed"
        onClick={() => setOpenDialog(true)}
      >
        <h2 className="text-lg text-center">+ Add New</h2>
      </div>

      <Dialog open={openDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Tell us more about your job interview</DialogTitle>
            <DialogDescription>
              <form onSubmit={onSubmit}>
                <div>
                  <h2>Add details about your job position/role, job description and years of experience</h2>

                  <div className="mt-7 my-3">
                    <label>Job Role/Job Position</label>
                    <Input
                      placeholder="Ex. Full Stack Developer"
                      required
                      onChange={(event) => setJobPosition(event.target.value)}
                    />
                  </div>
                  <div className="my-3">
                    <label>Job Description/ Tech Stack (In Short)</label>
                    <Textarea
                      placeholder="Ex. React, Angular, NodeJs, MySQL etc"
                      required
                      onChange={(event) => setJobDesc(event.target.value)}
                    />
                  </div>
                  <div className="my-3">
                    <label>Years of experience</label>
                    <Input
                      placeholder="Ex. 5"
                      type="number"
                      max="100"
                      required
                      onChange={(event) => setJobExperience(event.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-5 justify-end mt-4">
                  <Button type="button" variant="ghost" onClick={() => setOpenDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Generating from AI
                      </>
                    ) : (
                      "Start Interview"
                    )}
                  </Button>
                </div>
              </form>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AddNewInterview

