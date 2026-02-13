import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { auth } from "../../firebase";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

import "./profile.css";
import useFetchPlatformData from "../../api2/data";
import { RefreshCw } from "lucide-react";

const DataCollector = () => {
  const location = useLocation();
  const { email: locationEmail } = location.state || {};
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [skillsInput, setSkillsInput] = useState("");

  const [formData, setFormData] = useState({
    email: locationEmail || "",
    name: "",
    phone: "",
    github: "",
    linkedin: "",
    leetcode: "",
    resume: "",
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
  }, []);

  useEffect(() => {
    if (Array.isArray(formData.skills) && formData.skills.length > 0) {
      setSkillsInput(formData.skills.join(", "));
    }
  }, [formData.skills]);

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

        // Ensure skills is always an array
        const skills = Array.isArray(data.skills) ? data.skills : [];

        // Merge the extracted usernames with the form data
        const updatedData = {
          ...data,
          skills,
          github: extractedUsernames.github || data.github || "",
          linkedin: extractedUsernames.linkedin || data.linkedin || "",
          leetcode: extractedUsernames.leetcode || data.leetcode || "",
        };

        setFormData((prev) => ({ ...prev, ...updatedData }));

        // Set the skills input field with the joined skills
        if (skills.length > 0) {
          setSkillsInput(skills.join(", "));
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

      // Process skills from the skillsInput string before saving
      const skillsArray = skillsInput
        .split(",")
        .map((skill) => skill.trim())
        .filter((skill) => skill !== "");

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
        skills: skillsArray,
        ...platformObjects, // Add platform objects to the data
      };

      console.log("Saving profile with skills:", dataToSave.skills);
      console.log("Saving platform usernames:", platformObjects);

      await setDoc(doc(db, "profiles", auth.currentUser.uid), dataToSave);

      // Update formData with the new skills array
      setFormData((prev) => ({
        ...prev,
        skills: skillsArray,
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

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      const base64String = reader.result.split(",")[1];
      setFormData((prev) => ({
        ...prev,
        resume: base64String,
      }));
      setMessage("Resume uploaded successfully!");
    };

    reader.onerror = () => {
      setMessage("Error uploading the file");
    };

    reader.readAsDataURL(file);
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

          <form onSubmit={handleSubmit} className="main-profile-form form-main">
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
                    className="main-profile-form-input"
                  />
                </div>
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

              <div className="main-profile-form-group">
                <label htmlFor="skills">Skills (comma separated)</label>
                <input
                  type="text"
                  id="skills"
                  name="skills"
                  value={skillsInput}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="e.g. React, Node.js, MongoDB"
                  className="main-profile-form-input"
                />
                {Array.isArray(formData.skills) &&
                  formData.skills.length > 0 && (
                    <div className="skills-preview">
                      Current skills: {formData.skills.join(", ")}
                    </div>
                  )}
              </div>

              <div className="main-profile-resume-section">
                <label>Resume</label>
                {isEditing ? (
                  <div className="main-profile-resume-upload">
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      accept=".pdf,.doc,.docx"
                      className="main-profile-file-input"
                    />
                  </div>
                ) : (
                  <div className="main-profile-resume-display">
                    {formData.resume ? (
                      <a
                        href={`data:application/pdf;base64,${formData.resume}`}
                        download="resume.pdf"
                        className="main-profile-resume-link"
                      >
                        Download Resume
                      </a>
                    ) : (
                      <span className="main-profile-no-resume">
                        No resume uploaded
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            {/* Projects Section */}
            <h2>Projects</h2>
            <div className="main-profile-projects-section">
              {formData.projects.map((project, index) => (
                <div key={index} className="main-profile-projects-form">
                  <div className="main-profile-form-group">
                    <label>Project Name</label>
                    <input
                      type="text"
                      name="name"
                      value={project.name}
                      onChange={(e) => handleProjectChange(index, e)}
                      disabled={!isEditing}
                      className="main-profile-form-input"
                    />
                  </div>
                  <div className="main-profile-form-group">
                    <label>Project URL</label>
                    <input
                      type="text"
                      name="url"
                      value={project.url}
                      placeholder="https://example.com"
                      onChange={(e) => handleProjectChange(index, e)}
                      disabled={!isEditing}
                      className="main-profile-form-input"
                    />
                  </div>
                  <div className="main-profile-form-group">
                    <label>Project Date</label>
                    <input
                      type="date"
                      name="date"
                      value={project.date}
                      onChange={(e) => handleProjectChange(index, e)}
                      disabled={!isEditing}
                      className="main-profile-form-input"
                    />
                  </div>
                  {isEditing && (
                    <button
                      type="button"
                      className="main-profile-delete-project-button"
                      onClick={() => deleteProject(index)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))}
            </div>
            {isEditing && formData.projects.length < 10 && (
              <button
                type="button"
                className="main-profile-add-project-button"
                onClick={addNewProject}
              >
                Add Project
              </button>
            )}
            {isEditing && (
              <div className="main-profile-form-actions">
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
