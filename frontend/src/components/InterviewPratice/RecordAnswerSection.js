"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "../ui/button"
import { Mic, StopCircle } from "lucide-react"
import { toast } from "../ui/sonner"
import { userAnswerStorage } from "../utils/localStorage"
import { useUser } from "../context/UserContext"

function RecordAnswerSection({ mockInterviewQuestions, activeQuestionIndex, interviewData }) {
  const [userAnswer, setUserAnswer] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [loading, setLoading] = useState(false)
  const { user } = useUser()
  const videoRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const recognitionRef = useRef(null)

  useEffect(() => {
    // Initialize webcam
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream
          }
        })
        .catch((err) => {
          console.error("Error accessing webcam:", err)
        })
    }

    // Initialize speech recognition if available
    if ("webkitSpeechRecognition" in window) {
      const SpeechRecognition = window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = ""
        let finalTranscript = ""

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript
          } else {
            interimTranscript += event.results[i][0].transcript
          }
        }

        if (finalTranscript) {
          setUserAnswer((prev) => prev + " " + finalTranscript)
        }
      }
    }

    return () => {
      // Cleanup
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const startStopRecording = () => {
    if (isRecording) {
      // Stop recording
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      setIsRecording(false)

      // If we have an answer, process it
      if (userAnswer.trim().length > 10) {
        updateUserAnswer()
      }
    } else {
      // Start recording
      setUserAnswer("")
      if (recognitionRef.current) {
        recognitionRef.current.start()
      }
      setIsRecording(true)
    }
  }

  const updateUserAnswer = async () => {
    setLoading(true)

    try {
      // Generate mock feedback
      const feedback = generateMockFeedback(
        mockInterviewQuestions[activeQuestionIndex].question,
        userAnswer,
        mockInterviewQuestions[activeQuestionIndex].answer,
      )

      // Save user answer and feedback to localStorage
      const currentDate = new Date().toLocaleDateString("en-GB")

      userAnswerStorage.create({
        mockIdRef: interviewData.mockId,
        question: mockInterviewQuestions[activeQuestionIndex].question,
        correctAns: mockInterviewQuestions[activeQuestionIndex].answer,
        userAns: userAnswer,
        feedback: feedback.feedback,
        rating: feedback.rating,
        userEmail: user?.primaryEmailAddress?.emailAddress,
        createdAt: currentDate,
      })

      toast.success("Your answer has been recorded")
      setUserAnswer("")
    } catch (error) {
      console.error("Error saving answer:", error)
      toast.error("Failed to save your answer. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Mock feedback generator
  const generateMockFeedback = (question, userAnswer, correctAnswer) => {
    // Simple algorithm to generate feedback
    const userAnswerWords = userAnswer.toLowerCase().split(" ")
    const correctAnswerWords = correctAnswer.toLowerCase().split(" ")

    // Count matching keywords
    const keywordMatches = correctAnswerWords.filter((word) => word.length > 4 && userAnswerWords.includes(word)).length

    // Calculate a mock rating based on keyword matches and answer length
    const lengthScore = Math.min(userAnswer.length / 100, 1) * 5 // Up to 5 points for length
    const keywordScore = (keywordMatches / Math.max(5, correctAnswerWords.length * 0.3)) * 5 // Up to 5 points for keywords
    const rating = Math.min(Math.round(((lengthScore + keywordScore) / 2) * 10) / 10, 10)

    // Generate feedback based on rating
    let feedback
    if (rating < 4) {
      feedback =
        "Your answer needs significant improvement. Try to include more specific details and address the key points in the question. Review the correct answer for guidance."
    } else if (rating < 7) {
      feedback =
        "Your answer covers some important points, but could be more comprehensive. Consider structuring your response better and including more specific examples."
    } else {
      feedback =
        "Great answer! You covered most of the key points effectively. For even better results, you might consider adding a bit more detail about specific experiences or outcomes."
    }

    return { rating: rating.toFixed(1) + "/10", feedback }
  }

  return (
    <div className="flex items-center justify-center flex-col">
      <div className="flex flex-col mt-20 justify-center items-center bg-black rounded-lg p-5">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            height: 300,
            width: 400,
            zIndex: 10,
          }}
          className="rounded-lg"
        />
      </div>
      <Button disabled={loading} variant="outline" className="my-10" onClick={startStopRecording}>
        {isRecording ? (
          <h2 className="text-red-600 animate-pulse flex gap-2 items-center">
            <StopCircle />
            Stop Recording
          </h2>
        ) : (
          <h2 className="text-primary flex gap-2 items-center">
            <Mic /> Record Answer
          </h2>
        )}
      </Button>

      {userAnswer && (
        <div className="w-full p-4 border rounded-lg mb-6">
          <h3 className="font-medium mb-2">Your current answer:</h3>
          <p className="text-gray-700">{userAnswer}</p>
        </div>
      )}
    </div>
  )
}

export default RecordAnswerSection

