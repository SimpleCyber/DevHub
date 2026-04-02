import React, { useState, useEffect } from "react";
import { Sidebar } from "../sidebar/sidebar";
import { careerStatsStorage, careerPathStorage } from "../utils/firebaseStorage";
import { auth } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getCareerSuggestions, generateTimelineRoadmap, chatWithGemini } from "../../services/gemini";
import CareerTimeline from "./CareerTimeline";
import CareerChat from "./CareerChat";
import "./CareerPath.css";
import { Loader2, Sparkles, ChevronDown, ChevronRight, X } from "lucide-react";

const EDUCATION_OPTIONS = [
  "B.Tech Computer Science",
  "BCA / MCA",
  "B.Sc IT",
  "Self Taught / Bootcamp",
  "High School",
  "Other"
];

const INTEREST_OPTIONS = [
  "Coding", "Problem Solving", "AI/ML", "Design", "Marketing", "Data", "Cloud", "Security"
];

const CareerPath = () => {
  const [userId, setUserId] = useState(null);
  const [education, setEducation] = useState(EDUCATION_OPTIONS[0]);
  const [interests, setInterests] = useState(["Coding", "Problem Solving"]);
  
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  
  const [roadmap, setRoadmap] = useState(null);
  const [progress, setProgress] = useState(0);
  
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [loadingRoadmap, setLoadingRoadmap] = useState(false);
  const [generationsCount, setGenerationsCount] = useState(0);
  const [maxLimitsReached, setMaxLimitsReached] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAllSuggestions, setShowAllSuggestions] = useState(false);
  
  const [chatOpen, setChatOpen] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "model",
      parts: [
        { text: "Hi! I'm your AI Career Guide. Feel free to ask me anything about your generated roadmap, or ask for general career advice!" }
      ]
    }
  ]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        try {
          const existingStats = await careerStatsStorage.getStats(user.uid);
          if (existingStats) {
            setGenerationsCount(existingStats.generationsCount || 0);
            if (existingStats.latestSuggestions) {
              setSuggestions(existingStats.latestSuggestions);
            }
            if (existingStats.chatHistory && existingStats.chatHistory.length > 0) {
              setMessages(existingStats.chatHistory);
            }
            if (existingStats.generationsCount >= 3) {
              setMaxLimitsReached(true);
            }
          }
        } catch(e) {
          console.error(e);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const toggleInterest = (interest) => {
    setInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleGetSuggestions = async () => {
    if (!userId || maxLimitsReached) return;
    
    setLoadingSuggestions(true);
    try {
      const results = await getCareerSuggestions(education, interests);
      setSuggestions(results);
      
      // Save suggestions to user stats so we can retrieve them on reload
      const stats = await careerStatsStorage.getStats(userId);
      await careerStatsStorage.updateStats(userId, {
        latestSuggestions: results
      });
      
      // Update limits
      await careerStatsStorage.incrementCount(userId);
      setGenerationsCount(prev => prev + 1);
      if (generationsCount + 1 >= 3) {
        setMaxLimitsReached(true);
      }
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleSelectSuggestion = async (suggestion) => {
    setSelectedSuggestion(suggestion.role);
    setLoadingRoadmap(true);
    try {
      // 1. Check if we already have this roadmap saved in the DB
      const savedPaths = await careerPathStorage.getByUserId(userId);
      const existing = savedPaths.find(p => p.role === suggestion.role || p.name === suggestion.role);
      
      if (existing && existing.steps) {
        setRoadmap({
          id: existing.id,
          name: existing.name || existing.role,
          steps: existing.steps
        });
        setMessages(existing.messages || [
          {
            role: "model",
            parts: [{ text: "Hi! I'm your AI Career Guide. Feel free to ask me anything about your generated roadmap, or ask for general career advice!" }]
          }
        ]);
        setLoadingRoadmap(false);
        return;
      }

      // 2. Generate if not found
      const stepsData = await generateTimelineRoadmap(suggestion.role);
      
      const mappedSteps = stepsData.map(s => ({
        ...s,
        status: "Pending",
        subtasks: Array.isArray(s.subtasks) ? s.subtasks.map(sub => ({ ...sub, completed: false })) : []
      }));
      
      const newRoadmapData = {
        name: suggestion.role,
        role: suggestion.role,
        steps: mappedSteps
      };
      
      // 3. Save to database
      const saved = await careerPathStorage.create(userId, newRoadmapData);
      
      setRoadmap({
        ...newRoadmapData,
        id: saved.id
      });
      setProgress(0);
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoadingRoadmap(false);
    }
  };

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    const userMessage = { role: "user", parts: [{ text }] };
    const newHistory = [...messages, userMessage];
    setMessages(newHistory);

    try {
      setChatLoading(true);
      const contextData = { education, interests, roadmapName: roadmap?.name || "" };
      
      const responseText = await chatWithGemini(contextData, text);
      const modelMessage = { role: "model", parts: [{ text: responseText }] };
      const updatedMessages = [...newHistory, modelMessage];
      setMessages(updatedMessages);

      if (userId) {
        await careerStatsStorage.updateStats(userId, { chatHistory: updatedMessages });
      }

      if (roadmap && roadmap.id) {
        await careerPathStorage.update(roadmap.id, { messages: updatedMessages });
      }
    } catch (err) {
      console.error(err);
      const errorMessage = { role: "model", parts: [{ text: "Sorry, I'm having trouble connecting right now." }] };
      setMessages([...newHistory, errorMessage]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleToggleSubtask = async (stepIndex, subtaskIndex) => {
    if (!roadmap) return;
    
    const updatedSteps = roadmap.steps.map((step, sIdx) => {
      if (sIdx === stepIndex) {
        let anyCompleted = false;
        let allCompleted = true;
        
        const updatedSubtasks = step.subtasks.map((sub, stIdx) => {
          const completed = stIdx === subtaskIndex ? !sub.completed : sub.completed;
          if (completed) anyCompleted = true;
          else allCompleted = false;
          return { ...sub, completed };
        });
        
        let status = "Pending";
        if (allCompleted && updatedSubtasks.length > 0) status = "Completed";
        else if (anyCompleted) status = "Started";
        
        return { ...step, subtasks: updatedSubtasks, status };
      }
      return step;
    });
    
    let totalSubtasks = 0;
    let completedSubtasks = 0;
    
    updatedSteps.forEach(step => {
      step.subtasks?.forEach(sub => {
        totalSubtasks++;
        if (sub.completed) completedSubtasks++;
      });
    });
    
    const newProgress = totalSubtasks === 0 ? 0 : Math.round((completedSubtasks / totalSubtasks) * 100);
    
    const updatedRoadmap = { ...roadmap, steps: updatedSteps };
    setRoadmap(updatedRoadmap);
    setProgress(newProgress);
    
    if (roadmap.id) {
      await careerPathStorage.update(roadmap.id, {
        steps: updatedSteps,
        progress: newProgress
      });
    }
  };

  // Recalculate progress on load if an existing roadmap is fetched
  useEffect(() => {
    if (roadmap && roadmap.steps) {
      let total = 0;
      let comp = 0;
      roadmap.steps.forEach(s => {
        s.subtasks?.forEach(sub => {
          total++;
          if (sub.completed) comp++;
        });
      });
      setProgress(total === 0 ? 0 : Math.round((comp / total) * 100));
    }
  }, [roadmap?.id]);

  if (loading) {
    return (
      <div className="flex bg-[#e9effe] min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#f1f5f9] min-h-screen font-sans flex text-slate-800">
      <Sidebar />
      <div className="flex-1 mt-14 sm:mt-0 p-4 gap-6 max-w-7xl mx-auto h-screen overflow-hidden flex flex-col md:flex-row transition-all duration-300">
        
        {/* Left Side: Recommendations */}
        <div className="w-full md:w-[450px] flex flex-col gap-6 h-full overflow-y-auto pb-8 custom-scrollbar">
          
          {/* Header Card */}
          {/* <div className="bg-gradient-to-br from-indigo-600 to-blue-600 rounded-3xl p-6 text-white shadow-md relative overflow-hidden flex-shrink-0">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <div className="flex items-center gap-3 mb-2 relative z-10">
              <div className="w-10 h-10 border border-white/30 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold">AI Career Recommendation</h2>
            </div>
            <p className="text-blue-100 text-sm pl-12 relative z-10">Answer a few questions and get best career suggestions</p>
          </div> */}

          {/* Form Card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex-shrink-0">
            <h3 className="font-bold text-lg mb-4 text-slate-800">Your Information</h3>
            
            <div className="mb-5">
              <label className="block text-sm text-slate-500 mb-2 font-medium">Education</label>
              <div className="relative">
                <select 
                  className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 py-2.5 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-sm"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                >
                  {EDUCATION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-sm text-slate-500 mb-2 font-medium">Your Interests (select)</label>
              <div className="flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map(int => {
                  const isActive = interests.includes(int);
                  return (
                    <button
                      key={int}
                      onClick={() => toggleInterest(int)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        isActive 
                        ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                        : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {int}
                      {isActive ? <X className="w-3 h-3" /> : <div className="w-3 h-3 border border-slate-400 rounded-full opacity-50" />}
                    </button>
                  )
                })}
              </div>
            </div>

            <button
              onClick={handleGetSuggestions}
              disabled={loadingSuggestions || maxLimitsReached || interests.length === 0}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loadingSuggestions ? <Loader2 className="w-5 h-5 animate-spin"/> : <Sparkles className="w-5 h-5" />}
              {maxLimitsReached ? "Limit Reached (3/3)" : "Get AI Suggestions"}
            </button>
            <div className="text-center mt-2 text-xs text-slate-400">
              {generationsCount}/3 free suggestions used
            </div>
          </div>

          {/* AI Results */}
          {suggestions.length > 0 && (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-8 flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">💡</span>
                  <h3 className="font-bold text-lg text-slate-800">AI Results</h3>
                </div>
                {suggestions.length > 1 && (
                  <button 
                    onClick={() => setShowAllSuggestions(!showAllSuggestions)}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                  >
                    {showAllSuggestions ? "Show less" : `View all (${suggestions.length})`}
                    <ChevronDown className={`w-4 h-4 transition-transform ${showAllSuggestions ? 'rotate-180' : ''}`} />
                  </button>
                )}
              </div>
              
              <div className="flex flex-col gap-3">
                {(showAllSuggestions ? suggestions : suggestions.slice(0, 1)).map((sug, idx) => {
                  const actualIdx = suggestions.findIndex(s => s.role === sug.role);
                  const isSelected = selectedSuggestion === sug.role;
                  const matchColor = actualIdx === 0 ? "bg-green-100 text-green-700 border-green-200" : 
                                     actualIdx === 1 ? "bg-emerald-50 text-emerald-600 border-emerald-100" : 
                                     "bg-orange-50 text-orange-600 border-orange-100";
                  const matchText = actualIdx === 0 ? "Best Match" : actualIdx === 1 ? "Great Match" : "Good Match";

                  return (
                    <div 
                      key={actualIdx}
                      onClick={() => handleSelectSuggestion(sug)}
                      className={`relative border rounded-2xl p-4 cursor-pointer transition-all hover:shadow-md ${
                        isSelected ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50/30' : 'border-slate-100 bg-[#fafafa]'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shadow-sm ${
                            actualIdx === 0 ? 'bg-blue-500' : actualIdx === 1 ? 'bg-teal-500' : 'bg-orange-500'
                          }`}>
                            {actualIdx + 1}
                          </div>
                          <h4 className="font-bold text-slate-800 text-lg">{sug.role}</h4>
                        </div>
                        <div className={`text-xs font-bold px-2 py-1 rounded-md border ${matchColor}`}>
                          {matchText} - {sug.match || (95 - actualIdx * 7)}%
                        </div>
                      </div>
                      <p className="text-sm text-slate-500 pl-11">{sug.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Roadmap Area */}
        <div className="flex-1 h-full overflow-hidden flex flex-col pb-8">
          {loadingRoadmap ? (
            <div className="h-full flex flex-col items-center justify-center p-8 bg-white rounded-3xl shadow-sm border border-slate-100 m-4">
               <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
               <h3 className="text-xl font-bold text-slate-700">Generating Personalized Roadmap...</h3>
               <p className="text-slate-500 mt-2">Curating the best steps for {selectedSuggestion}</p>
            </div>
          ) : (
            <CareerTimeline 
              roadmapName={roadmap?.name} 
              steps={roadmap?.steps || []} 
              progress={progress} 
              onToggleSubtask={handleToggleSubtask}
            />
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`career-chat-wrapper ${chatOpen ? "open" : ""}`}>
        <button
          className="chat-close-btn"
          onClick={() => setChatOpen(!chatOpen)}
          title={chatOpen ? "Close Chat" : "Open Chat"}
        >
          <ChevronRight className={`w-6 h-6 text-gray-500 hover:text-gray-800 transition-transform ${chatOpen ? "" : "rotate-180"}`} />
        </button>
        <CareerChat
          messages={messages}
          onSendMessage={handleSendMessage}
          loading={chatLoading}
        />
      </div>
      
      

    </div>
  );
};

export default CareerPath;
