import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { auth } from "../../firebase";
import { getFirestore, doc, getDoc, setDoc, collection, query, where, getDocs, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";

import "./profile.css";
import useFetchPlatformData from "../../api2/data";
import { RefreshCw, Search, UserPlus } from "lucide-react";

const DataCollector = () => {
  const location = useLocation();
  const { email: locationEmail } = location.state || {};
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("DETAILS"); // "DETAILS", "PROJECTS", "RESUME", "SKILLS", "CONNECTIONS"

  const [skillsInput, setSkillsInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [connectionsList, setConnectionsList] = useState([]);
  const [loadingConnections, setLoadingConnections] = useState(false);

  const [formData, setFormData] = useState({
    email: locationEmail || "",
    name: "",
    phone: "",
    github: "",
    linkedin: "",
    leetcode: "",
    resume: "",
    documents: [],
    profileImage: "https://shorturl.at/yHqIn",
    projects: [{ name: "", url: "", date: "" }],
    skills: [],
  });

  const { timestamps, forceRefresh } = useFetchPlatformData(
    auth.currentUser?.uid,
  );
  const [refreshingPlatform, setRefreshingPlatform] = useState(null);

  useEffect(() => {
    loadProfileData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  const loadProfileData = async () => {
    if (!auth.currentUser) return;

    const db = getFirestore();
    const docRef = doc(db, "profiles", auth.currentUser.uid);

    try {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();

        // Extract platform-specific usernames from the new structure
        const platforms = ["github", "linkedin", "leetcode"];
        const extractedUsernames = {};

        platforms.forEach((platform) => {
          // Check if username exists in the new data structure
          if (data[platform]?.username) {
            extractedUsernames[platform] = data[platform].username;
          } else if (typeof data[platform] === "string") {
            // Support for legacy format - direct string
            extractedUsernames[platform] = data[platform];
          }
        });

        // Ensure skills and documents are arrays
        const skills = Array.isArray(data.skills) ? data.skills : [];
        const documents = Array.isArray(data.documents) ? data.documents : [];

        // Merge the extracted usernames with the form data
        const updatedData = {
          ...data,
          skills,
          documents,
          github: extractedUsernames.github || data.github || "",
          linkedin: extractedUsernames.linkedin || data.linkedin || "",
          leetcode: extractedUsernames.leetcode || data.leetcode || "",
        };

        setFormData((prev) => ({ ...prev, ...updatedData }));


        
        // If we are currently on the CONNECTIONS tab, we should also fetch connection details
        if (activeTab === "CONNECTIONS") {
          fetchConnectionDetails(data.connections || []);
        }
      }
    } catch (error) {
      console.error("Error loading profile data:", error);
      setMessage("Error loading profile data");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) {
      setMessage("Please sign in to save your profile");
      return;
    }

    setLoading(true);
    const db = getFirestore();
    try {
      const platforms = ["github", "linkedin", "leetcode"];
      const platformObjects = {};

      // Merge skills from the skills array and any pending input
      const pendingSkills = skillsInput
        .split(",")
        .map((skill) => skill.trim())
        .filter((skill) => skill !== "" && !formData.skills.includes(skill));
      const finalSkills = [...formData.skills, ...pendingSkills];

      // Fetch current data to compare and preserve cache if username hasn't changed
      const docRef = doc(db, "profiles", auth.currentUser.uid);
      const docSnap = await getDoc(docRef);
      const currentData = docSnap.exists() ? docSnap.data() : {};

      platforms.forEach((platform) => {
        if (formData[platform]) {
          const newUsername = formData[platform];
          // Retrieve old data for this platform
          const currentPlatformObj = currentData[platform];
          // Handle legacy string format or missing data
          const oldUsername =
            currentPlatformObj?.username ||
            (typeof currentPlatformObj === "string" ? currentPlatformObj : "");

          if (newUsername !== oldUsername) {
            // Username changed: Update username, set new timestamp, clear data
            platformObjects[platform] = {
              username: newUsername,
              timestamp: Date.now(),
              data: null,
            };
          } else {
            // Username same: Preserve existing object (including data and timestamp)
            // If it was a legacy string, we must upgrade it now
            if (typeof currentPlatformObj === "string") {
              platformObjects[platform] = {
                username: newUsername,
                timestamp: Date.now(),
                data: null,
              };
            } else {
              platformObjects[platform] = currentPlatformObj;
            }
          }
        }
      });

      // Keep existing timestamps if username hasn't changed
      // This logic is partially handled by the fact that we're reading currentData
      // but let's make sure we don't accidentally overwrite timestamps with Date.now()
      // when we don't intend to. The previous logic I wrote handles this correctly:
      // if (newUsername !== oldUsername) { timestamp = Date.now() } else { keep existing }

      // Create a data object with the processed skills array and platform usernames

      // Create a data object with the processed skills array and platform usernames
      const dataToSave = {
        ...formData,
        skills: finalSkills,
        ...platformObjects, // Add platform objects to the data
      };

      console.log("Saving profile with skills:", dataToSave.skills);
      console.log("Saving platform usernames:", platformObjects);

      await setDoc(doc(db, "profiles", auth.currentUser.uid), dataToSave);

      // Update formData with the new skills array
      setFormData((prev) => ({
        ...prev,
        skills: finalSkills,
      }));

      setMessage("Profile saved successfully!");
      setIsEditing(false);
    } catch (error) {
      setMessage("Error saving profile");
      console.error("Save error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "skills") {
      // Just update the skills input string
      setSkillsInput(value);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

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

  const handleProjectChange = (index, e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updatedProjects = [...prev.projects];
      updatedProjects[index] = {
        ...updatedProjects[index],
        [name]: value,
      };
      return { ...prev, projects: updatedProjects };
    });
  };

  const addNewProject = () => {
    if (formData.projects.length < 10) {
      setFormData((prev) => ({
        ...prev,
        projects: [...prev.projects, { name: "", url: "", date: "" }],
      }));
    } else {
      setMessage("You can only add up to 10 projects");
    }
  };

  const deleteProject = (index) => {
    setFormData((prev) => {
      const updatedProjects = prev.projects.filter((_, i) => i !== index);
      return { ...prev, projects: updatedProjects };
    });
  };



  const handleDocumentChange = (index, e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updatedDocs = [...prev.documents];
      updatedDocs[index] = {
        ...updatedDocs[index],
        [name]: value,
      };
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
      setMessage("Document uploaded successfully!");
    };
    reader.onerror = () => setMessage("Error uploading document");
    reader.readAsDataURL(file);
  };

  const addNewDocument = () => {
    if (formData.documents.length < 10) {
      setFormData((prev) => ({
        ...prev,
        documents: [...prev.documents, { name: "", fileData: "", fileName: "", showPreview: false }],
      }));
    } else {
      setMessage("You can only add up to 10 documents");
    }
  };

  const deleteDocument = (index) => {
    setFormData((prev) => {
      const updatedDocs = prev.documents.filter((_, i) => i !== index);
      return { ...prev, documents: updatedDocs };
    });
  };

  const toggleDocumentPreview = (index) => {
    setFormData((prev) => {
      const updatedDocs = [...prev.documents];
      updatedDocs[index] = {
        ...updatedDocs[index],
        showPreview: !updatedDocs[index].showPreview,
      };
      return { ...prev, documents: updatedDocs };
    });
  };

  const handleRefreshClick = async (platform, e) => {
    e.preventDefault(); // Prevent form submission
    if (!formData[platform]) return;

    setRefreshingPlatform(platform);
    try {
      await forceRefresh(platform);
      setMessage(`${platform} data refreshed!`);
    } catch (error) {
      console.error("Refresh failed:", error);
      setMessage(`Failed to refresh ${platform}`);
    } finally {
      setRefreshingPlatform(null);
    }
  };

  const renderPlatformStatus = (platform) => {
    const timestamp = timestamps[platform];
    if (!timestamp) return null;

    const lastUpdated = new Date(timestamp).toLocaleString();

    // Calculate stale time (assuming 24h for github/leetcode, 30 days for linkedin)
    // This logic duplicates data.js slightly but needed for UI display
    // Ideally import from data.js if exported
    const now = Date.now();
    const diff = now - timestamp;
    const isStale =
      diff >
      (platform === "linkedin"
        ? 30 * 24 * 60 * 60 * 1000
        : 24 * 60 * 60 * 1000);

    return (
      <div className="text-xs text-gray-500 mt-1 flex justify-between items-center">
        <span>Last updated: {lastUpdated}</span>
        <span className={isStale ? "text-red-500" : "text-green-500"}>
          {isStale ? "Data is Stale" : "Data is Fresh"}
        </span>
      </div>
    );
  };

  const handleSearchUsers = async (searchTerm) => {
    if (!searchTerm.trim() || !auth.currentUser) {
      setSearchResults([]);
      setMessage("");
      return;
    }

    setIsSearching(true);
    
    const db = getFirestore();
    const profilesRef = collection(db, "profiles");
    const term = searchTerm.trim();

    try {
      // Use prefix querying for email autocomplete
      // This will match any email that STARTS WITH the typed term
      const qEmail = query(
        profilesRef, 
        where("email", ">=", term),
        where("email", "<=", term + "\uf8ff")
      );

      const snapshot = await getDocs(qEmail);

      const results = [];
      snapshot.forEach(doc => {
        // Skip current logged in user
        if (doc.id !== auth.currentUser.uid) {
          results.push({ id: doc.id, ...doc.data() });
        }
      });

      setSearchResults(results);
      
      if (results.length === 0) {
        setMessage("No users found matching that Email ID");
      } else {
        setMessage("");
      }
    } catch (error) {
      console.error("Error searching users by email:", error);
      setMessage("Error performing search");
    } finally {
      setIsSearching(false);
    }
  };

  // Debounce the search input handler so it doesn't query on every single keystroke instantly
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleSearchUsers(searchQuery);
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleAddConnection = async (userId) => {
    if (!auth.currentUser) return;
    try {
      const db = getFirestore();
      
      // Add friend to current user's connections
      const currentUserRef = doc(db, "profiles", auth.currentUser.uid);
      await updateDoc(currentUserRef, {
        connections: arrayUnion(userId)
      });

      // Add current user to friend's connections
      const friendRef = doc(db, "profiles", userId);
      await updateDoc(friendRef, {
        connections: arrayUnion(auth.currentUser.uid)
      });

      setMessage("Connection added successfully!");
      
      // Refresh connection details locally
      const currentConnections = formData.connections || [];
      if (!currentConnections.includes(userId)) {
        const newConnections = [...currentConnections, userId];
        setFormData(prev => ({...prev, connections: newConnections}));
        fetchConnectionDetails(newConnections);
      }
      
    } catch (error) {
      console.error("Error adding connection:", error);
      setMessage("Failed to add connection");
    }
  };

  const handleRemoveConnection = async (userId) => {
    if (!auth.currentUser) return;
    try {
      const db = getFirestore();
      
      // Remove friend from current user's connections
      const currentUserRef = doc(db, "profiles", auth.currentUser.uid);
      await updateDoc(currentUserRef, {
        connections: arrayRemove(userId)
      });

      // Remove current user from friend's connections
      const friendRef = doc(db, "profiles", userId);
      await updateDoc(friendRef, {
        connections: arrayRemove(auth.currentUser.uid)
      });

      setMessage("Connection removed.");
      
      // Update local state without full reload
      const newConnections = (formData.connections || []).filter(id => id !== userId);
      setFormData(prev => ({...prev, connections: newConnections}));
      setConnectionsList(prev => prev.filter(user => user.id !== userId));

    } catch (error) {
      console.error("Error removing connection:", error);
      setMessage("Failed to remove connection");
    }
  };

  const fetchConnectionDetails = async (connectionIds) => {
    if (!connectionIds || connectionIds.length === 0) {
      setConnectionsList([]);
      return;
    }

    setLoadingConnections(true);
    const db = getFirestore();
    const loadedConnections = [];
    
    // Process in batches if necessary, but typically connections aren't huge
    try {
      for (const id of connectionIds) {
        const docRef = doc(db, "profiles", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          loadedConnections.push({ id, ...docSnap.data() });
        }
      }
      setConnectionsList(loadedConnections);
    } catch (error) {
      console.error("Error fetching connection details:", error);
    } finally {
      setLoadingConnections(false);
    }
  };

  // When active tab changes to connections, fetch the friend profiles
  useEffect(() => {
    if (activeTab === "CONNECTIONS") {
      fetchConnectionDetails(formData.connections || []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);


  return (
    <div>
      <div className="gradient-blob"></div>
      <div className="gradient-blob2"></div>

      <h1 className="text-2xl font-bold text-gray-600 mt-5 ml-[1rem]">
        Profile Information
      </h1>
      <div className="main-profile-page-container glass-effect">
        <div className="main-profile-toast-container">
          {message && (
            <div
              className={`main-profile-toast ${
                message.includes("success")
                  ? "main-profile-toast-success"
                  : "main-profile-toast-error"
              }`}
            >
              <div className="main-profile-toast-message">{message}</div>
              <button
                className="main-profile-toast-close"
                onClick={() => setMessage("")}
              >
                ×
              </button>
            </div>
          )}
        </div>

        <div className="main-profile-container">
          <div className="main-profile-header">
            <div className="main-profile-image-container">
              <img
                src={
                  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT24JcMoDyGbsqmmeqU3bwUaXCB98_pwm9IBQ&s"
                }
                alt="Profile"
                className="main-profile-img"
              />
            </div>
            <h1 className="main-profile-title">Welcome to DevHub !!!</h1>
            <button
              className={`main-profile-edit-button ${
                isEditing ? "main-profile-save-mode" : ""
              }`}
              onClick={() => setIsEditing(!isEditing)}
              type="button"
            >
              {isEditing ? "Cancel Editing" : "Edit Profile"}
            </button>
          </div>

          <div className="main-profile-nav-tabs mt-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
              <button
                onClick={() => setActiveTab("DETAILS")}
                className={`${
                  activeTab === "DETAILS"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                Initial Details
              </button>
              <button
                onClick={() => setActiveTab("PROJECTS")}
                className={`${
                  activeTab === "PROJECTS"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                Projects
              </button>
              <button
                onClick={() => setActiveTab("DOCUMENTS")}
                className={`${
                  activeTab === "DOCUMENTS"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                Documents
              </button>
              <button
                onClick={() => setActiveTab("SKILLS")}
                className={`${
                  activeTab === "SKILLS"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                Skills
              </button>
              <button
                onClick={() => setActiveTab("CONNECTIONS")}
                className={`${
                  activeTab === "CONNECTIONS"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                Connections
              </button>
            </nav>
          </div>

          <form onSubmit={handleSubmit} className="main-profile-form form-main mt-8">
            {activeTab === "DETAILS" && (
              <div className="main-profile-form-grid">
                <div className="main-profile-form-group">
                  <label htmlFor="email">Email ID</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled
                    className="main-profile-form-input"
                  />
                </div>

                <div className="main-profile-form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="main-profile-form-input"
                  />
                </div>

                <div className="main-profile-form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="main-profile-form-input"
                  />
                </div>

                <div className="main-profile-form-group">
                  <label htmlFor="linkedin">LinkedIn</label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      id="linkedin"
                      name="linkedin"
                      value={formData.linkedin}
                      placeholder="username"
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="main-profile-form-input flex-1"
                    />
                    <button
                      onClick={(e) => handleRefreshClick("linkedin", e)}
                      disabled={
                        !formData.linkedin || refreshingPlatform === "linkedin"
                      }
                      className="ml-2 p-2 text-gray-500 hover:text-blue-500 disabled:opacity-50"
                      title="Reload LinkedIn Data"
                      type="button"
                    >
                      <RefreshCw
                        className={`w-4 h-4 ${refreshingPlatform === "linkedin" ? "animate-spin" : ""}`}
                      />
                    </button>
                  </div>
                  {renderPlatformStatus("linkedin")}
                </div>

                <div className="main-profile-form-group">
                  <label htmlFor="github">GitHub</label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      id="github"
                      name="github"
                      placeholder="username"
                      value={formData.github}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="main-profile-form-input flex-1"
                    />
                    <button
                      onClick={(e) => handleRefreshClick("github", e)}
                      disabled={
                        !formData.github || refreshingPlatform === "github"
                      }
                      className="ml-2 p-2 text-gray-500 hover:text-blue-500 disabled:opacity-50"
                      title="Reload GitHub Data"
                      type="button"
                    >
                      <RefreshCw
                        className={`w-4 h-4 ${refreshingPlatform === "github" ? "animate-spin" : ""}`}
                      />
                    </button>
                  </div>
                  {renderPlatformStatus("github")}
                </div>

                <div className="main-profile-form-group">
                  <label htmlFor="leetcode">LeetCode</label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      id="leetcode"
                      name="leetcode"
                      placeholder="username"
                      value={formData.leetcode}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="main-profile-form-input flex-1"
                    />
                    <button
                      onClick={(e) => handleRefreshClick("leetcode", e)}
                      disabled={
                        !formData.leetcode || refreshingPlatform === "leetcode"
                      }
                      className="ml-2 p-2 text-gray-500 hover:text-blue-500 disabled:opacity-50"
                      title="Reload LeetCode Data"
                      type="button"
                    >
                      <RefreshCw
                        className={`w-4 h-4 ${refreshingPlatform === "leetcode" ? "animate-spin" : ""}`}
                      />
                    </button>
                  </div>
                  {renderPlatformStatus("leetcode")}
                </div>
              </div>
            )}

            {activeTab === "PROJECTS" && (
              <div className="main-profile-projects-tab">
                <h2 className="text-xl font-bold text-gray-700 mb-4">Projects</h2>
                <div className="main-profile-projects-section flex flex-col gap-6">
                  {formData.projects.map((project, index) => (
                    <div key={index} className="main-profile-projects-form bg-gray-50 p-6 rounded-lg border border-gray-100 relative">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="main-profile-form-group mb-0">
                          <label>Project Name</label>
                          <input
                            type="text"
                            name="name"
                            value={project.name}
                            onChange={(e) => handleProjectChange(index, e)}
                            disabled={!isEditing}
                            className="main-profile-form-input bg-white"
                          />
                        </div>
                        <div className="main-profile-form-group mb-0">
                          <label>Project URL</label>
                          <input
                            type="text"
                            name="url"
                            value={project.url}
                            placeholder="https://example.com"
                            onChange={(e) => handleProjectChange(index, e)}
                            disabled={!isEditing}
                            className="main-profile-form-input bg-white"
                          />
                        </div>
                        <div className="main-profile-form-group mb-0 md:col-span-2">
                          <label>Project Date</label>
                          <input
                            type="date"
                            name="date"
                            value={project.date}
                            onChange={(e) => handleProjectChange(index, e)}
                            disabled={!isEditing}
                            className="main-profile-form-input bg-white w-full md:w-1/2"
                          />
                        </div>
                      </div>
                      
                      {isEditing && (
                        <button
                          type="button"
                          className="absolute top-4 right-4 text-red-500 hover:text-red-700 transition"
                          onClick={() => deleteProject(index)}
                          title="Delete Project"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {isEditing && formData.projects.length < 10 && (
                  <button
                    type="button"
                    className="mt-6 px-4 py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-md hover:border-gray-400 hover:text-gray-800 transition w-full"
                    onClick={addNewProject}
                  >
                    + Add Another Project
                  </button>
                )}
              </div>
            )}

            {activeTab === "DOCUMENTS" && (
              <div className="main-profile-documents-tab">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-700">Documents</h2>
                  {isEditing && formData.documents.length < 10 && (
                    <button
                      type="button"
                      className="px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition shadow-sm text-sm font-medium"
                      onClick={addNewDocument}
                    >
                      + Add Document
                    </button>
                  )}
                </div>
                
                <div className="main-profile-documents-section flex flex-col gap-6">
                  {formData.documents.map((doc, index) => (
                    <div key={index} className="main-profile-documents-form bg-gray-50 p-6 rounded-lg border border-gray-100 relative">
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Document Name (e.g. 10th Marks, Semester 1)</label>
                        <input
                          type="text"
                          name="name"
                          value={doc.name || ""}
                          placeholder="Document Name"
                          onChange={(e) => handleDocumentChange(index, e)}
                          disabled={!isEditing}
                          className="main-profile-form-input bg-white w-full"
                        />
                      </div>
                      
                      {isEditing && (
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Upload PDF/Document</label>
                          <input
                            type="file"
                            onChange={(e) => handleDocumentUpload(index, e)}
                            accept=".pdf,.doc,.docx"
                            className="main-profile-file-input max-w-full"
                          />
                        </div>
                      )}

                      {doc.fileData ? (
                        <div className="flex flex-col gap-4 mt-2">
                          <div className="flex items-center justify-between bg-green-50 border border-green-200 px-4 py-3 rounded-md">
                            <span className="text-green-800 font-medium flex items-center pr-4">
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 flex-shrink-0"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                              <span className="truncate">{doc.fileName || doc.name || `Document ${index + 1}`}</span>
                            </span>
                            <div className="flex space-x-2 flex-shrink-0">
                              <button
                                type="button"
                                onClick={() => toggleDocumentPreview(index)}
                                className="px-4 py-1.5 bg-gray-200 text-gray-700 text-sm font-medium rounded hover:bg-gray-300 transition inline-block whitespace-nowrap"
                              >
                                {doc.showPreview ? "Hide Preview" : "View Live"}
                              </button>
                              <a
                                href={`data:application/pdf;base64,${doc.fileData}`}
                                download={doc.fileName || `${doc.name || `document_${index+1}`}.pdf`}
                                className="px-4 py-1.5 bg-blue-100 text-blue-700 text-sm font-medium rounded hover:bg-blue-200 transition inline-block whitespace-nowrap"
                              >
                                Download
                              </a>
                            </div>
                          </div>
                          
                          {doc.showPreview && (
                            <div className="border border-gray-300 rounded-lg overflow-hidden bg-white shadow-inner h-[600px] mt-2">
                              <object 
                                data={`data:application/pdf;base64,${doc.fileData}`} 
                                type="application/pdf" 
                                width="100%" 
                                height="100%"
                                className="w-full h-full"
                              >
                                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                  <p>Your browser does not support PDF rendering.</p>
                                  <a href={`data:application/pdf;base64,${doc.fileData}`} download={doc.fileName || `${doc.name}.pdf`} className="text-blue-500 hover:underline mt-2">
                                    Download the PDF to view it
                                  </a>
                                </div>
                              </object>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-gray-500 italic mt-2 text-sm">No file uploaded for this document yet.</div>
                      )}
                      
                      {isEditing && (
                        <button
                          type="button"
                          className="absolute top-4 right-4 text-red-500 hover:text-red-700 transition"
                          onClick={() => deleteDocument(index)}
                          title="Delete Document"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        </button>
                      )}
                    </div>
                  ))}
                  {formData.documents.length === 0 && !isEditing && (
                    <div className="text-gray-500 italic py-4">No documents uploaded yet.</div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "SKILLS" && (
              <div className="main-profile-skills-tab">
                <div className="main-profile-form-group mb-8">
                  {isEditing && (
                    <>
                      <label htmlFor="skills">Add Skills (Press Enter or Comma)</label>
                      <input
                        type="text"
                        id="skills"
                        name="skills"
                        value={skillsInput}
                        onChange={handleInputChange}
                        onKeyDown={handleSkillKeyDown}
                        placeholder="e.g. React, Node.js, MongoDB"
                        className="main-profile-form-input mb-4"
                      />
                    </>
                  )}
                  <div className="skills-chips-container mt-2 flex flex-wrap gap-2">
                    {Array.isArray(formData.skills) && formData.skills.map((skill, index) => (
                      <div key={index} className="skill-chip bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center border border-blue-200 shadow-sm">
                        {skill}
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="ml-2 w-4 h-4 rounded-full inline-flex items-center justify-center text-blue-600 hover:bg-blue-200 hover:text-blue-900 transition-colors focus:outline-none"
                            aria-label={`Remove ${skill}`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "CONNECTIONS" && (
              <div className="main-profile-connections-tab py-8">
                <div className="flex flex-col md:flex-row gap-8">
                  
                  {/* Left Main Content: Connections List */}
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-700 mb-6">Your Connections</h2>
                    
                    {loadingConnections ? (
                      <div className="flex justify-center items-center py-12">
                        <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
                      </div>
                    ) : (
                      <>
                        {connectionsList.length === 0 ? (
                          <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-12 text-center flex flex-col items-center justify-center h-full min-h-[300px]">
                            <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mb-4 mx-auto text-blue-500">
                              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-700 mb-2">Search and Connect</h3>
                            <p className="text-gray-500 max-w-sm">You haven't added any connections yet. Use the search panel on the right to find friends and colleagues by their Email ID.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {connectionsList.map((user) => (
                              <div key={user.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
                                <div className="flex items-center min-w-0 pr-4">
                                  <img className="h-12 w-12 rounded-full border border-gray-100 object-cover" src={user.profileImage || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT24JcMoDyGbsqmmeqU3bwUaXCB98_pwm9IBQ&s"} alt={user.name} />
                                  <div className="ml-4 truncate">
                                    <p className="text-sm font-medium text-gray-900 truncate">{user.name || "Unknown User"}</p>
                                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveConnection(user.id)}
                                  className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
                                  title="Remove Connection"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Right Sidebar: Search Panel */}
                  <div className="md:w-80 flex-shrink-0">
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 sticky top-6">
                      <h3 className="text-lg font-bold text-gray-700 mb-2">Find People</h3>
                      <p className="text-sm text-gray-500 mb-6">Search for developers using their Email IDs.</p>
                      
                      <div className="flex gap-2 relative mb-6">
                        <div className="relative flex-1">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            {isSearching ? (
                              <RefreshCw className="h-4 w-4 text-gray-400 animate-spin" />
                            ) : (
                              <Search className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                          <input
                            type="text"
                            className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors"
                            placeholder="Type Email ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Search Results side panel */}
                      {searchResults.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Results</h4>
                          <ul className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto pr-1">
                            {searchResults.map((user) => {
                              const isAlreadyConnected = formData.connections?.includes(user.id);
                              return (
                              <li key={user.id} className="py-3 flex flex-col gap-2">
                                <div className="flex items-center">
                                  <img className="h-8 w-8 rounded-full border border-gray-100" src={user.profileImage || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT24JcMoDyGbsqmmeqU3bwUaXCB98_pwm9IBQ&s"} alt="" />
                                  <div className="ml-3 truncate">
                                    <p className="text-sm font-medium text-gray-900 truncate">{user.name || "Unknown User"}</p>
                                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                  </div>
                                </div>
                                {isAlreadyConnected ? (
                                  <span className="inline-flex w-full items-center justify-center px-2 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-500 bg-gray-50 cursor-not-allowed">
                                    Already Connected
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleAddConnection(user.id)}
                                    className="inline-flex w-full items-center justify-center px-2 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                  >
                                    <UserPlus className="h-3 w-3 mr-1.5" />
                                    Add Connection
                                  </button>
                                )}
                              </li>
                            )})}
                          </ul>
                        </div>
                      )}
                      {searchQuery.trim().length > 0 && searchResults.length === 0 && !isSearching && (
                         <div className="text-center text-sm text-gray-500 py-4">No users found.</div>
                      )}
                    </div>
                  </div>
                  
                </div>
              </div>
            )}

            {isEditing && (
              <div className="main-profile-form-actions mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  className="main-profile-cancel-button"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="main-profile-save-button"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Profile"}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default DataCollector;
