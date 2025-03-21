"use client"

import { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { v4 as uuidv4 } from "uuid"
import { useUser } from "../context/UserContext"
import { mockInterviewStorage } from "../utils/firebaseStorage"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog"
import { toast } from "../ui/sonner"
import { Upload, FileText, X } from "lucide-react"

function AddNewInterview({ onInterviewCreated }) {
  const [openDialog, setOpenDialog] = useState(false)
  const [jobPosition, setJobPosition] = useState("")
  const [jobDesc, setJobDesc] = useState("")
  const [jobExperience, setJobExperience] = useState("")
  const [loading, setLoading] = useState(false)
  const [resume, setResume] = useState(null)
  const fileInputRef = useRef(null)
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

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setResume(file)
    }
  }

  const handleRemoveFile = () => {
    setResume(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Generate mock interview questions
      if (!user) {
        toast.error("Please sign in to create an interview")
        setLoading(false)
        return
      }

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
      resumeFileName: resume ? resume.name : null,
      createdBy: user.primaryEmailAddress?.emailAddress || "anonymous@example.com", // Add fallback
      userName: user.fullName || "Anonymous User",
      userId: user.userId || `temp_${Date.now()}`,
      createdAt: currentDate,
    }



      // In a real app, you'd upload the resume file here
      await mockInterviewStorage.create(newInterview)


      // Notify parent component
    if (onInterviewCreated) {
      onInterviewCreated()
    }

    setOpenDialog(false)
    navigate(`/dashboard/interview/${mockId}`)
  } catch (error) {
    console.error("Error creating interview:", error)
    
    if (error.code === 'permission-denied') {
      toast.error("Permission denied. Please check if you're properly signed in.")
    } else if (error.message.includes('invalid data')) {
      toast.error("Some data is invalid. Please check all fields.")
    } else {
      toast.error("Failed to create interview. Please try again.")
    }
  } finally {
    setLoading(false)
  }
}

  return (
    <div>
      <div
        className="p-10 border rounded-lg bg-white shadow-sm
        hover:scale-105 hover:shadow-md cursor-pointer
         transition-all border-dashed"
        onClick={() => setOpenDialog(true)}
      >
        <h2 className="text-lg text-center font-medium">+ Add New Interview</h2>
      </div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent 
          className="w-full p-0 overflow-hidden bg-white rounded-lg"
          style={{ minWidth: "800px" }}
        >
          <DialogHeader className="p-6 border-b">
            <DialogTitle className="text-2xl">Tell us more about your job interview</DialogTitle>
            <DialogDescription className="text-gray-500 mt-1">
              Fill in the details below to create a personalized mock interview
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit}>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left column - Job details */}
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Job Position</label>
                    <Input
                      placeholder="Ex. Full Stack Developer"
                      required
                      value={jobPosition}
                      onChange={(event) => setJobPosition(event.target.value)}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Tech Skills & Job description</label>
                    <Textarea
                      placeholder="Ex. React, Angular, NodeJs, MySQL etc"
                      required
                      value={jobDesc}
                      onChange={(event) => setJobDesc(event.target.value)}
                      className="w-full min-h-28"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Years of Experience</label>
                    <Input
                      placeholder="Ex. 5"
                      type="number"
                      min="0"
                      max="100"
                      required
                      value={jobExperience}
                      onChange={(event) => setJobExperience(event.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Right column - Resume upload */}
                <div>
                  <label className="block text-sm font-medium mb-3">Upload Resume</label>
                  
                  <div className="border-2 border-dashed rounded-lg flex flex-col items-center justify-center bg-gray-50" style={{ minHeight: "17rem" }}>
                    {!resume ? (
                      <div 
                        className="flex flex-col items-center justify-center w-full h-full cursor-pointer p-4" 
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <div className="mb-4 text-gray-400">
                          <Upload size={40} />
                        </div>
                        <p className="text-sm text-center text-gray-500 mb-3">
                          Drop your resume here or click to browse
                        </p>
                        <input
                          type="file"
                          id="resumeUpload"
                          ref={fileInputRef}
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Browse files
                        </Button>
                        <p className="text-xs text-gray-400 mt-2">Supports PDF, DOC, DOCX (Max 5MB)</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center p-6">
                        <div className="mb-4 text-gray-600">
                          <FileText size={40} />
                        </div>
                        <p className="text-sm font-medium mb-1">{resume.name}</p>
                        <p className="text-xs text-gray-500 mb-5">
                          {(resume.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          className="flex items-center"
                          onClick={handleRemoveFile}
                        >
                          <X size={16} className="mr-1" />
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-end p-6 border-t bg-gray-50">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpenDialog(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="px-6"
              >
                {loading ? (
                  <div className="flex items-center">
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
                  </div>
                ) : (
                  "Start Interview"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AddNewInterview