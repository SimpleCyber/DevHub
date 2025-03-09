// Local storage utility functions to replace database operations

// Mock Interview storage
export const mockInterviewStorage = {
    // Create a new mock interview
    create: (interview) => {
      const interviews = JSON.parse(localStorage.getItem("mockInterviews") || "[]")
      interviews.push(interview)
      localStorage.setItem("mockInterviews", JSON.stringify(interviews))
      return interview
    },
  
    // Get all mock interviews
    getAll: () => {
      return JSON.parse(localStorage.getItem("mockInterviews") || "[]")
    },
  
    // Get a mock interview by ID
    getById: (mockId) => {
      const interviews = JSON.parse(localStorage.getItem("mockInterviews") || "[]")
      return interviews.find((interview) => interview.mockId === mockId) || null
    },
  }
  
  // User Answer storage
  export const userAnswerStorage = {
    // Create a new user answer
    create: (answer) => {
      const answers = JSON.parse(localStorage.getItem("userAnswers") || "[]")
      answer.id = answers.length > 0 ? Math.max(...answers.map((a) => a.id)) + 1 : 1
      answers.push(answer)
      localStorage.setItem("userAnswers", JSON.stringify(answers))
      return answer
    },
  
    // Get all user answers for a specific mock interview
    getByMockId: (mockId) => {
      const answers = JSON.parse(localStorage.getItem("userAnswers") || "[]")
      return answers.filter((answer) => answer.mockIdRef === mockId)
    },
  }
  
  