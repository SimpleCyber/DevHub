import React, { useState, useEffect } from "react";
import { Code, CheckCircle, Hourglass, Sparkles, ChevronDown, ChevronRight, BookOpen } from "lucide-react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { getFallbackCourses } from "../../data/courseData";

const getStatusColor = (status) => {
  switch (status) {
    case "Completed":
      return "bg-green-100 text-green-700";
    case "Started":
      return "bg-blue-100 text-blue-700";
    case "Pending":
    default:
      return "bg-orange-50 text-orange-600";
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case "Completed":
      return <CheckCircle className="w-3 h-3 mr-1" />;
    case "Started":
      return <Hourglass className="w-3 h-3 mr-1" />;
    case "Pending":
    default:
      return <Hourglass className="w-3 h-3 mr-1" />;
  }
};

const getCircleColor = (index) => {
  const colors = [
    "bg-purple-500",
    "bg-blue-500",
    "bg-emerald-500",
    "bg-orange-500",
    "bg-indigo-500",
    "bg-pink-500",
    "bg-rose-500"
  ];
  return colors[index % colors.length];
};

const CareerTimeline = ({ roadmapName, steps = [], progress = 0, onToggleSubtask }) => {
  const [expandedSteps, setExpandedSteps] = useState(new Set());
  const [suggestedCourses, setSuggestedCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  useEffect(() => {
    if (!roadmapName || steps.length === 0) return;

    const fetchCourses = async () => {
      setLoadingCourses(true);
      try {
        const topicId = roadmapName.toLowerCase().replace(/[^a-z0-9]/g, "_");
        const docRef = doc(db, "suggested_courses", topicId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.courses && data.courses.length > 0) {
            setSuggestedCourses(data.courses);
          } else {
            setSuggestedCourses(getFallbackCourses(roadmapName));
          }
        } else {
          // Fetch from API
          const response = await fetch(`https://paid-udemy-course-for-free.p.rapidapi.com/search?s=${encodeURIComponent(roadmapName)}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "x-rapidapi-host": "paid-udemy-course-for-free.p.rapidapi.com",
              "x-rapidapi-key": process.env.REACT_APP_RAPIDAPI_KEY || "63e87f7f8bmsh602fffeb8cef799p15e30ejsn889cc10bbe2b"
            }
          });
          const data = await response.json();
          let courses = Array.isArray(data) ? data.slice(0, 3) : []; 
          if(data && data.results && Array.isArray(data.results)) { courses = data.results.slice(0,3); }
          
          if (courses.length === 0) {
            courses = getFallbackCourses(roadmapName);
          }
          
          if (courses.length > 0) {
            await setDoc(docRef, { courses, topic: roadmapName, fetchedAt: new Date().toISOString() });
          }
          setSuggestedCourses(courses);
        }
      } catch (err) {
        console.error("Error fetching recommended courses:", err);
        // If API fails, show at least some recommendations
        setSuggestedCourses(getFallbackCourses(roadmapName));
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCourses();
  }, [roadmapName, steps.length]);

  const toggleStep = (index) => {
    setExpandedSteps(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  if (!roadmapName || steps.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-white rounded-3xl shadow-sm border border-gray-100 min-h-[600px] m-4">
        <Sparkles className="w-16 h-16 text-blue-200 mb-4" />
        <h3 className="text-xl font-bold text-slate-700">No Roadmap Selected</h3>
        <p className="text-slate-500 mt-2 max-w-sm">Generate AI suggestions on the left, then select one to see your step-by-step career roadmap here.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 m-4 w-full h-full overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex items-start gap-4 p-4 bg-[#f8fafc] rounded-2xl mb-8">
        <div className="w-12 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-white shrink-0 shadow-md">
          <Code className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Roadmap: {roadmapName}</h2>
          <p className="text-sm text-slate-500">Step-by-step path to become a {roadmapName}</p>
        </div>
      </div>

     
      {/* Timeline */}
      <div className="relative px-4">
        {/* Vertical Line */}
        <div className="absolute left-[39px] top-6 bottom-6 w-0.5 bg-slate-200"></div>

        {steps.map((step, index) => (
          <div key={index} className="flex relative items-start gap-6 mb-8 group">
            {/* Number Circle */}
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shrink-0 shadow-sm relative z-10 ${getCircleColor(index)}`}>
              {index + 1}
            </div>

            {/* Content Box */}
            <div className="flex-1 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm transition-shadow hover:shadow-md">
              <div 
                className={`flex justify-between items-start ${step.subtasks?.length > 0 ? "cursor-pointer" : ""}`} 
                onClick={() => { if(step.subtasks?.length > 0) toggleStep(index); }}
              >
                <div className="pr-4">
                  <h3 className="text-base font-bold text-slate-800 mb-1">{step.title}</h3>
                  <p className="text-sm text-slate-500">{step.description}</p>
                </div>
                {/* Status Badge + Chevron */}
                <div className="flex items-center gap-2">
                  {step.subtasks && step.subtasks.length > 0 && (
                    <div className="text-slate-400 hover:text-slate-600 transition-colors">
                      {expandedSteps.has(index) ? <ChevronDown className="w-5 h-5"/> : <ChevronRight className="w-5 h-5"/>}
                    </div>
                  )}
                </div>
              </div>

              {/* Subtasks */}
              {step.subtasks && step.subtasks.length > 0 && expandedSteps.has(index) && (
                <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-3">
                  {step.subtasks.map((sub, sIdx) => (
                    <label key={sIdx} className="flex items-start gap-3 cursor-pointer group/label">
                      <span className={`text-sm select-none transition-colors ${sub.completed ? 'text-slate-400 line-through' : 'text-slate-700 group-hover/label:text-slate-900'}`}>
                        {sub.title}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Suggested Courses Step */}
        {(loadingCourses || (suggestedCourses && suggestedCourses.length > 0)) && (
          <div className="flex relative items-start gap-6 mb-8 group mt-8">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shrink-0 shadow-sm relative z-10 ${getCircleColor(steps.length)}`}>
              <BookOpen className="w-5 h-5" />
            </div>

            <div className="flex-1 bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-5 shadow-sm transition-shadow hover:shadow-md">
              <div className="pr-4 mb-5">
                <h3 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-500" />
                  Recommended Courses
                </h3>
                <p className="text-sm text-slate-600">Accelerate your journey with these curated Udemy courses matching your topic.</p>
              </div>

              {loadingCourses ? (
                <div className="text-sm text-indigo-600 flex items-center gap-3 bg-white/50 p-4 rounded-xl border border-indigo-50">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                  Finding the best courses for your career path...
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {suggestedCourses.map(course => (
                    <a key={course.id} href={course.coupon || course.url} target="_blank" rel="noopener noreferrer" className="group/course block bg-white border border-slate-100 rounded-xl overflow-hidden hover:border-indigo-300 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                      <div className="relative">
                        <img src={course.pic || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&q=80"} alt={course.title} className="w-full h-36 object-cover" />
                        <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm uppercase tracking-wide">
                          Paid for Free
                        </div>
                      </div>
                      <div className="p-4">
                        <h4 className="font-bold text-slate-800 text-sm line-clamp-2 mb-2 group-hover/course:text-indigo-600 transition-colors" title={course.title}>{course.title}</h4>
                        <div className="flex justify-between items-center text-xs text-slate-500 mb-3">
                          <span className="bg-slate-100 px-2 py-1 rounded truncate max-w-[100px]">{course.category || course.platform || "Development"}</span>
                          <span className="flex items-center gap-1 font-medium bg-amber-50 text-amber-600 px-2 py-1 rounded">⭐ {course.rating || "4.5"}</span>
                        </div>
                        <div className="flex items-center justify-between mt-auto">
                          <span className="text-xs line-through text-slate-400">{course.org_price || "$19.99"}</span>
                          {(course.duration > 0 || typeof course.duration === 'string') && (
                            <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded">{course.duration} hrs</span>
                          )}
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CareerTimeline;
