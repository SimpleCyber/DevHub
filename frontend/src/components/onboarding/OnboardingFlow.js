import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { auth } from "../../firebase";
import { useUser } from "../context/UserContext";
import { 
  User, BookOpen, Briefcase, ChevronRight, ChevronLeft, 
  Upload, CheckCircle, Github, Linkedin, ExternalLink 
} from "lucide-react";
import "./OnboardingFlow.css";

const OnboardingFlow = () => {
  const navigate = useNavigate();
  const { user, userProfile } = useUser();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: userProfile?.name || "",
    phone: userProfile?.phone || "",
    github: userProfile?.github || "",
    linkedin: userProfile?.linkedin || "",
    leetcode: userProfile?.leetcode || "",
    projects: userProfile?.projects || [{ name: "", url: "", date: "" }],
    skills: userProfile?.skills || [],
    documents: userProfile?.documents || [],
    careerGoals: userProfile?.careerGoals || "",
    coursesInterested: userProfile?.coursesInterested || "",
    languagesToLearn: userProfile?.languagesToLearn || "",
  });

  const [skillsInput, setSkillsInput] = useState("");

  // Step 1: Basic Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProjectChange = (index, e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updatedProjects = [...prev.projects];
      updatedProjects[index] = { ...updatedProjects[index], [name]: value };
      return { ...prev, projects: updatedProjects };
    });
  };

  const addProject = () => {
    setFormData((prev) => ({
      ...prev,
      projects: [...prev.projects, { name: "", url: "", date: "" }],
    }));
  };

  // Step 2: Skill Handlers
  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newSkill = skillsInput.trim();
      if (newSkill && !formData.skills.includes(newSkill)) {
        setFormData((prev) => ({
          ...prev,
          skills: [...prev.skills, newSkill]
        }));
      }
      setSkillsInput("");
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove)
    }));
  };

  // Step 2: Document Handlers
  const handleDocumentChange = (index, e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updatedDocs = [...prev.documents];
      updatedDocs[index] = { ...updatedDocs[index], [name]: value };
      return { ...prev, documents: updatedDocs };
    });
  };

  const handleDocumentUpload = (index, e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result.split(",")[1];
      setFormData((prev) => {
        const updatedDocs = [...prev.documents];
        updatedDocs[index] = {
          ...updatedDocs[index],
          fileData: base64String,
          fileName: file.name
        };
        return { ...prev, documents: updatedDocs };
      });
    };
    reader.readAsDataURL(file);
  };

  const addDocument = () => {
    setFormData((prev) => ({
      ...prev,
      documents: [...prev.documents, { name: "", fileData: "", fileName: "" }],
    }));
  };

  // Submit Handler
  const handleComplete = async () => {
    setLoading(true);
    setError("");

    try {
      const db = getFirestore();
      
      // Process pending skill text just in case they didn't hit enter
      const pendingSkills = skillsInput
        .split(",")
        .map((skill) => skill.trim())
        .filter((skill) => skill !== "" && !formData.skills.includes(skill));
      const finalSkills = [...formData.skills, ...pendingSkills];

      const dataToSave = {
        ...userProfile, // preserve existing fields
        ...formData,
        skills: finalSkills,
        onboardingCompleted: true,
      };

      await setDoc(doc(db, "profiles", auth.currentUser.uid), dataToSave, { merge: true });
      navigate("/career-path");
      
    } catch (err) {
      console.error("Error saving onboarding data: ", err);
      setError("Failed to save data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="onboarding-page min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background blobs for aesthetics */}
      <div className="ob-blob ob-blob-1"></div>
      <div className="ob-blob ob-blob-2"></div>
      <div className="ob-blob ob-blob-3"></div>

      <div className="ob-container glass-card w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-10">
        
        {/* Left Sidebar */}
        <div className="ob-sidebar hidden md:flex flex-col p-8 w-1/3 text-white justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome to DevHub</h1>
            <p className="text-sm opacity-80 mb-12">Let's set up your profile to get the most out of our community.</p>
            
            <div className="space-y-8">
              <div className={`step-indicator flex items-center space-x-4 ${currentStep >= 1 ? 'active' : 'inactive'}`}>
                <div className={`icon-box rounded-full p-2 ${currentStep >= 1 ? 'bg-white text-blue-600' : 'bg-white/20'}`}>
                  <User size={20} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider opacity-70">Step 1</p>
                  <p className="font-medium">Basic Profile</p>
                </div>
              </div>
              
              <div className={`step-indicator flex items-center space-x-4 ${currentStep >= 2 ? 'active' : 'inactive'}`}>
                <div className={`icon-box rounded-full p-2 ${currentStep >= 2 ? 'bg-white text-blue-600' : 'bg-white/20'}`}>
                  <Briefcase size={20} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider opacity-70">Step 2</p>
                  <p className="font-medium">Professional</p>
                </div>
              </div>

              <div className={`step-indicator flex items-center space-x-4 ${currentStep >= 3 ? 'active' : 'inactive'}`}>
                <div className={`icon-box rounded-full p-2 ${currentStep >= 3 ? 'bg-white text-blue-600' : 'bg-white/20'}`}>
                  <BookOpen size={20} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider opacity-70">Step 3</p>
                  <p className="font-medium">Student Info</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="opacity-60 text-sm">
            You can always change these later in your profile.
          </div>
        </div>

        {/* Right Content Area */}
        <div className="ob-content flex-1 p-8 md:p-12 bg-white/90 backdrop-blur flex flex-col h-[80vh] overflow-y-auto">
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-6 border border-red-200">
              {error}
            </div>
          )}

          {currentStep === 1 && (
            <div className="animate-fade-in flex-1 flex flex-col">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Basic Details</h2>
              
              <div className="space-y-5">
                <div className="form-group flex flex-col">
                  <label className="text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="ob-input" placeholder="John Doe" />
                </div>
                
                <div className="form-group flex flex-col">
                  <label className="text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="ob-input" placeholder="+1 234 567 890" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group flex flex-col">
                    <label className="text-sm font-semibold text-gray-700 mb-1 flex items-center"><Github size={14} className="mr-1"/> GitHub</label>
                    <input type="text" name="github" value={formData.github} onChange={handleInputChange} className="ob-input" placeholder="username" />
                  </div>
                  <div className="form-group flex flex-col">
                    <label className="text-sm font-semibold text-gray-700 mb-1 flex items-center"><Linkedin size={14} className="mr-1"/> LinkedIn</label>
                    <input type="text" name="linkedin" value={formData.linkedin} onChange={handleInputChange} className="ob-input" placeholder="username" />
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 border-b pb-2">Your Projects</h3>
                  {formData.projects.map((proj, idx) => (
                    <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-3 flex flex-col md:flex-row gap-3">
                      <input type="text" name="name" value={proj.name} onChange={(e) => handleProjectChange(idx, e)} className="ob-input flex-1" placeholder="Project Name" />
                      <input type="text" name="url" value={proj.url} onChange={(e) => handleProjectChange(idx, e)} className="ob-input flex-1" placeholder="Project Link" />
                    </div>
                  ))}
                  <button onClick={addProject} className="text-sm text-blue-600 font-semibold hover:text-blue-800 flex items-center">
                    + Add Another Project
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="animate-fade-in flex-1">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Professional Background</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">Your Skills</label>
                  <p className="text-xs text-gray-500 mb-2">Type a skill and press Enter or Comma.</p>
                  <input
                    type="text"
                    value={skillsInput}
                    onChange={(e) => setSkillsInput(e.target.value)}
                    onKeyDown={handleSkillKeyDown}
                    className="ob-input"
                    placeholder="e.g. React, Node.js, Python"
                  />
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.skills.map((skill, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center border border-blue-200">
                        {skill}
                        <button onClick={() => removeSkill(skill)} className="ml-2 w-4 h-4 inline-flex items-center justify-center text-blue-600 hover:bg-blue-200 rounded-full transition-colors">&times;</button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">Career Goals</label>
                  <p className="text-xs text-gray-500 mb-2">What path do you want to pursue? (e.g. Full-Stack Dev, AI Engineer)</p>
                  <textarea 
                    name="careerGoals" 
                    value={formData.careerGoals} 
                    onChange={handleInputChange} 
                    className="ob-input min-h-[80px] resize-y" 
                    placeholder="I want to become a..."
                  ></textarea>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-3 border-b pb-2">Academic/Professional Documents</h3>
                  <p className="text-xs text-gray-500 mb-3">Upload your resume, marksheets, or certificates.</p>
                  {formData.documents.map((doc, idx) => (
                    <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-3 space-y-3 relative">
                      <input type="text" name="name" value={doc.name} onChange={(e) => handleDocumentChange(idx, e)} className="ob-input w-full" placeholder="Document Title (e.g. Resume)" />
                      <div className="flex items-center">
                        <label className="flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-600 rounded cursor-pointer border border-blue-200 hover:bg-blue-100 transition text-sm font-medium">
                          <Upload size={16} className="mr-2" />
                          {doc.fileName || "Upload PDF Document"}
                          <input type="file" onChange={(e) => handleDocumentUpload(idx, e)} accept=".pdf" className="hidden" />
                        </label>
                        {doc.fileName && <span className="ml-3 text-xs text-green-600 font-semibold flex items-center"><CheckCircle size={14} className="mr-1"/> Uploaded</span>}
                      </div>
                    </div>
                  ))}
                  <button onClick={addDocument} className="text-sm text-blue-600 font-semibold hover:text-blue-800 flex items-center">
                    + Add Document
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="animate-fade-in flex-1">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Student Information</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">Courses Interested In</label>
                  <p className="text-xs text-gray-500 mb-2">List the academic or online courses you are looking forward to.</p>
                  <textarea 
                    name="coursesInterested" 
                    value={formData.coursesInterested} 
                    onChange={handleInputChange} 
                    className="ob-input min-h-[100px]" 
                    placeholder="e.g. Machine Learning, Advanced Web Dev..."
                  ></textarea>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">Languages / Frameworks to Learn</label>
                  <p className="text-xs text-gray-500 mb-2">What tech stack are you aiming to master next?</p>
                  <textarea 
                    name="languagesToLearn" 
                    value={formData.languagesToLearn} 
                    onChange={handleInputChange} 
                    className="ob-input min-h-[100px]" 
                    placeholder="e.g. Rust, Go, Next.js..."
                  ></textarea>
                </div>
              </div>
              
              <div className="mt-8 bg-blue-50 border border-blue-100 p-5 rounded-xl">
                <h3 className="font-bold text-blue-800 flex items-center mb-2"><CheckCircle size={18} className="mr-2"/> You're almost done!</h3>
                <p className="text-sm text-blue-600">Completing this setup will unlock personalized recommendations, better networking, and tailor-made coding challenges on your Dashboard.</p>
              </div>
            </div>
          )}

          {/* Navigation Footer */}
          <div className="mt-auto pt-6 flex justify-between items-center border-t border-gray-100">
            {currentStep > 1 ? (
              <button onClick={prevStep} className="px-5 py-2.5 rounded-lg font-medium text-gray-600 hover:bg-gray-100 transition flex items-center">
                <ChevronLeft size={18} className="mr-1" /> Back
              </button>
            ) : <div></div>}

            {currentStep < 3 ? (
              <button onClick={nextStep} className="px-6 py-2.5 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 transition shadow-lg shadow-blue-200 flex items-center">
                Continue <ChevronRight size={18} className="ml-1" />
              </button>
            ) : (
              <button onClick={handleComplete} disabled={loading} className="px-6 py-2.5 rounded-lg font-semibold bg-green-600 text-white hover:bg-green-700 transition shadow-lg shadow-green-200 flex items-center">
                {loading ? "Saving..." : "Complete Setup"} <CheckCircle size={18} className="ml-2" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;
