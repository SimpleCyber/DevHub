// RecordAnswerSection.jsx
import { useState, useEffect, useRef } from "react";
import { Button } from "../ui/button";
import { Mic, StopCircle, Play, Pause, RefreshCw } from "lucide-react";
import { toast } from "../ui/sonner";
import { userAnswerStorage } from "../utils/firebaseStorage";
import { useUser } from "../context/UserContext";

function RecordAnswerSection({ questions, currentIndex, interviewData, onAnswerSaved }) {
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [processingTranscript, setProcessingTranscript] = useState(false);
  const { user } = useUser();
  
  // Keep track of answers for each question
  const [questionAnswers, setQuestionAnswers] = useState(() => {
    // Initialize with empty answers for each question
    return questions.map(() => ({
      audioUrl: "",
      transcript: "",
      saved: false
    }));
  });
  
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Update questionAnswers when questions change (e.g., new interview loaded)
  useEffect(() => {
    setQuestionAnswers(questions.map(() => ({
      audioUrl: "",
      transcript: "",
      saved: false
    })));
  }, [questions]);

  // Initialize media devices
  useEffect(() => {
    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        
        mediaStreamRef.current = stream;
      } catch (err) {
        console.error("Media access error:", err);
        toast.error("Unable to access camera or microphone. Please check permissions.");
      }
    };

    initMedia();

    // Cleanup function
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Shorthand for current question's answer data
  const currentAnswer = questionAnswers[currentIndex];

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = () => {
    if (!mediaStreamRef.current) {
      toast.error("Media stream not available");
      return;
    }

    try {
      // Reset audio chunks for new recording
      audioChunksRef.current = [];
      
      // Create new recorder
      mediaRecorderRef.current = new MediaRecorder(mediaStreamRef.current);
      
      // Store audio data
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      // Handle recording stop
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        
        // Update the current question's answer with the new audio URL
        updateCurrentAnswer({
          audioUrl: url
        });
        
        // Start speech recognition on the recorded audio
        transcribeAudio(audioBlob);
      };
      
      // Start recording
      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      // Start speech recognition in parallel if supported
      const recognition = startSpeechRecognition();
      
      // Store recognition instance for cleanup
      return () => {
        if (recognition) {
          recognition.stop();
        }
      };
    } catch (error) {
      console.error("Recording error:", error);
      toast.error("Failed to start recording");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const startSpeechRecognition = () => {
    // Only use this method if browser supports it
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      return null;
    }
    
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      let finalTranscript = '';
      
      recognition.onresult = (event) => {
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }
        
        // Update the current question's transcript
        updateCurrentAnswer({
          transcript: finalTranscript + interimTranscript
        });
      };
      
      recognition.onend = () => {
        if (isRecording) {
          // If still recording, restart recognition (handles timeout)
          recognition.start();
        }
      };
      
      recognition.start();
      
      // Return instance to stop later
      return recognition;
    } catch (error) {
      console.error("Speech recognition error:", error);
      return null;
    }
  };

  const transcribeAudio = async (audioBlob) => {
    // If we already have a transcript from real-time recognition, use that
    if (currentAnswer.transcript && currentAnswer.transcript.trim().length > 0) {
      return;
    }
    
    setProcessingTranscript(true);
    
    try {
      // In a real implementation, you would send the audio to a speech-to-text service
      // For this example, we'll simulate it with a timeout
      setTimeout(() => {
        const simulatedTranscript = "This is a simulated transcript of the answer. In a real implementation, you would send the audio to a speech-to-text service like Google Speech-to-Text, Azure Speech Services, or a similar service.";
        updateCurrentAnswer({
          transcript: simulatedTranscript
        });
        setProcessingTranscript(false);
      }, 2000);
      
      // Actual implementation would be something like:
      /*
      const formData = new FormData();
      formData.append('audio', audioBlob);
      
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Transcription failed');
      }
      
      const data = await response.json();
      updateCurrentAnswer({
        transcript: data.transcript
      });
      */
    } catch (error) {
      console.error("Transcription error:", error);
      toast.error("Failed to transcribe audio");
      setProcessingTranscript(false);
    }
  };

  // Helper to update the current question's answer data
  const updateCurrentAnswer = (newData) => {
    setQuestionAnswers(prev => {
      const updated = [...prev];
      updated[currentIndex] = {
        ...updated[currentIndex],
        ...newData
      };
      return updated;
    });
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const saveAnswer = async () => {
    if (!currentAnswer.transcript || !currentAnswer.transcript.trim()) {
      toast.error("Please record an answer before saving");
      return;
    }
    
    setLoading(true);
    
    try {
      // Create a simple feedback and rating
      const feedback = generateFeedback(
        questions[currentIndex].question, 
        currentAnswer.transcript, 
        questions[currentIndex].answer
      );
      
      // Save to storage
      await userAnswerStorage.create({
        mockIdRef: interviewData.mockId,
        question: questions[currentIndex].question,
        correctAns: questions[currentIndex].answer,
        userAns: currentAnswer.transcript,
        feedback: feedback.feedback,
        rating: feedback.rating,
        userEmail: user?.primaryEmailAddress?.emailAddress,
        audioUrl: currentAnswer.audioUrl,
        createdAt: new Date().toISOString()
      });
      
      // Mark this answer as saved
      updateCurrentAnswer({ saved: true });
      
      toast.success("Answer saved successfully!");
      
      // Notify parent component if callback provided
      if (onAnswerSaved) {
        onAnswerSaved(currentIndex);
      }
    } catch (error) {
      console.error("Error saving answer:", error);
      toast.error("Failed to save your answer");
    } finally {
      setLoading(false);
    }
  };

  const generateFeedback = (question, userAnswer, correctAnswer) => {
    // This is a simplified feedback generation algorithm
    // In a real app, you would use an AI service for better feedback
    
    const userWords = userAnswer.split(' ').length;
    const correctWords = correctAnswer.split(' ').length;
    
    // Check if answer is too short
    if (userWords < correctWords * 0.3) {
      return {
        rating: "3/10",
        feedback: "Your answer is too brief. Try to elaborate more and provide specific examples."
      };
    }
    
    // Check if answer is verbose
    if (userWords > correctWords * 2) {
      return {
        rating: "7/10",
        feedback: "Good content, but try to be more concise and focused on the key points."
      };
    }
    
    // Check for keyword matches
    const keywordsInCorrectAnswer = correctAnswer.toLowerCase().split(' ');
    const keywordsInUserAnswer = userAnswer.toLowerCase().split(' ');
    
    const matchCount = keywordsInCorrectAnswer.filter(word => 
      word.length > 4 && keywordsInUserAnswer.includes(word)
    ).length;
    
    const matchRatio = matchCount / (keywordsInCorrectAnswer.filter(word => word.length > 4).length);
    
    if (matchRatio > 0.7) {
      return {
        rating: "9/10",
        feedback: "Excellent answer! You covered most of the important points and demonstrated strong knowledge."
      };
    } else if (matchRatio > 0.5) {
      return {
        rating: "7/10",
        feedback: "Good answer with some key points covered. Consider mentioning more specific examples."
      };
    } else if (matchRatio > 0.3) {
      return {
        rating: "5/10",
        feedback: "Your answer contains some relevant information but misses several important points."
      };
    } else {
      return {
        rating: "4/10",
        feedback: "Your answer doesn't address many of the key points expected. Review the suggested answer."
      };
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="bg-black rounded-lg p-5 my-4 w-full max-w-md">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className="w-full h-64 rounded-lg object-cover" 
        />
      </div>

      <div className="flex gap-4 my-4">
        <Button 
          disabled={loading || currentAnswer.saved} 
          onClick={toggleRecording} 
          className={`px-6 ${isRecording ? 'bg-red-600 hover:bg-red-700' : ''}`}
        >
          {isRecording ? (
            <span className="flex gap-2 items-center">
              <StopCircle size={18} /> Stop Recording
            </span>
          ) : (
            <span className="flex gap-2 items-center">
              <Mic size={18} /> {currentAnswer.audioUrl ? "Record Again" : "Record Answer"}
            </span>
          )}
        </Button>
        
        {currentAnswer.audioUrl && (
          <Button 
            variant="outline" 
            onClick={togglePlayback}
            className="px-4"
            disabled={isRecording}
          >
            {isPlaying ? (
              <span className="flex gap-2 items-center">
                <Pause size={16} /> Pause
              </span>
            ) : (
              <span className="flex gap-2 items-center">
                <Play size={16} /> Play
              </span>
            )}
          </Button>
        )}
      </div>

      {/* Display status badge */}
      {currentAnswer.saved && (
        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
          Answer saved ✓
        </div>
      )}

      {currentAnswer.audioUrl && (
        <div className="w-full p-4 border rounded-lg mb-4 bg-white">
          <audio 
            ref={audioRef} 
            src={currentAnswer.audioUrl} 
            onEnded={() => setIsPlaying(false)} 
            className="w-full mb-3" 
            controls 
          />
          
          {processingTranscript && (
            <div className="flex items-center justify-center p-4 text-gray-500">
              <RefreshCw size={16} className="animate-spin mr-2" /> 
              Transcribing your answer...
            </div>
          )}
          
          {currentAnswer.transcript && (
            <div className="mt-4">
              <h3 className="font-medium text-gray-700 mb-2">Your Answer:</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">{currentAnswer.transcript}</p>
              </div>
              
              {!currentAnswer.saved && (
                <div className="flex justify-end mt-4">
                  <Button 
                    onClick={saveAnswer} 
                    disabled={loading || isRecording}
                    className="px-6"
                  >
                    {loading ? 'Saving...' : 'Save Answer'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default RecordAnswerSection;