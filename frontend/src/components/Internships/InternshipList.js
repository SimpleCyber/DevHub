"use client";

import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../utils/firebaseStorage";
import { Eye, Calendar, Briefcase, ZapIcon, FilterIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";


import { auth } from "../../firebase";
import { getFirestore, doc, getDoc } from "firebase/firestore";



const InternshipList = () => {

  const [userSkills, setUserSkills] = useState([]); 

  const loadProfileData = async () => {
    if (!auth.currentUser) return;

    const db = getFirestore();
    const docRef = doc(db, "profiles", auth.currentUser.uid);

    try {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserSkills(Array.isArray(data.skills) ? data.skills : []); 
      }
    } catch (error) {
      console.error("Error loading profile data:", error);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, []);    


  const navigate = useNavigate();

  const [internships, setInternships] = useState([]);
  const [filteredInternships, setFilteredInternships] = useState([]); // New state for filtered results
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    jobType: "",
    employmentType: "",
    skills: "",
    userSkills: "",
  });

  // useEffect(() => {
  //   if (userSkills.length === 0) return; // Wait for userSkills to load
  
  //   const fetchInternshipsAndProfiles = async () => {
  //     try {
  //       const internshipSnapshot = await getDocs(collection(db, "internships"));
  
  //       const internshipData = internshipSnapshot.docs.map((doc) => {
  //         const data = doc.data();
  
  //         const matchedSkills = userSkills.filter(
  //           (skill) => data.skills && data.skills.includes(skill)
  //         );
  
  //         const postDate = new Date(data.postDate);
  //         const now = new Date();
  //         const daysSincePosting = Math.floor(
  //           (now - postDate) / (1000 * 60 * 60 * 24)
  //         );
  
  //         const matchScore =
  //           matchedSkills.length * 20 + Math.max(0, 100 - daysSincePosting * 2);
  
  //         return {
  //           id: doc.id,
  //           ...data,
  //           timeAgo: getTimeAgo(data.postDate),
  //           matchedSkills,
  //           matchScore,
  //           skillsMatchCount: matchedSkills.length,
  //         };
  //       });
  
  //       const sortedInternships = internshipData.sort((a, b) => {
  //         if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
  //         return new Date(b.postDate) - new Date(a.postDate);
  //       });
  
  //       setInternships(sortedInternships);
  //       setFilteredInternships(sortedInternships);
  //       setLoading(false);
  //     } catch (error) {
  //       console.error("Error fetching internships:", error);
  //       setLoading(false);
  //     }
  //   };
  
  //   fetchInternshipsAndProfiles();
  // }, [userSkills]); // 👈 runs only when userSkills is updated
  


  useEffect(() => {
    const fetchInternships = async () => {
      try {
        const internshipSnapshot = await getDocs(collection(db, "internships"));
  
        // Show internships immediately (no waiting for userSkills)
        const basicData = internshipSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            timeAgo: getTimeAgo(data.postDate),
            matchedSkills: [],
            matchScore: 0,
            skillsMatchCount: 0,
          };
        });
  
        // Sort by recency first
        const sorted = basicData.sort(
          (a, b) => new Date(b.postDate) - new Date(a.postDate)
        );
  
        setInternships(sorted);
        setFilteredInternships(sorted);
        setLoading(false);
  
        // If user is logged in, calculate matches in background
        if (auth.currentUser && userSkills.length > 0) {
          const enrichedData = sorted.map((item) => {
            const matchedSkills = userSkills.filter(
              (skill) => item.skills && item.skills.includes(skill)
            );
  
            const postDate = new Date(item.postDate);
            const now = new Date();
            const daysSincePosting = Math.floor(
              (now - postDate) / (1000 * 60 * 60 * 24)
            );
  
            const matchScore =
              matchedSkills.length * 20 + Math.max(0, 100 - daysSincePosting * 2);
  
            return {
              ...item,
              matchedSkills,
              matchScore,
              skillsMatchCount: matchedSkills.length,
            };
          });
  
          const reSorted = enrichedData.sort((a, b) => {
            if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
            return new Date(b.postDate) - new Date(a.postDate);
          });
  
          setInternships(reSorted);
          setFilteredInternships(reSorted);
        }
      } catch (error) {
        console.error("Error fetching internships:", error);
        setLoading(false);
      }
    };
  
    fetchInternships();
  }, [userSkills]);
  

  const getTimeAgo = (postDate) => {
    const now = new Date();
    const posted = new Date(postDate);
    const diffInHours = Math.floor((now - posted) / (1000 * 60 * 60));

    if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const applyFilters = () => {
    let results = [...internships];

    // Filter by job type
    if (filters.jobType) {
      results = results.filter(
        internship => internship.jobType === filters.jobType
      );
    }

    // Filter by employment type
    if (filters.employmentType) {
      results = results.filter(
        internship => internship.employmentType === filters.employmentType
      );
    }

    // Filter by required skills (comma-separated)
    if (filters.skills) {
      const skillsArray = filters.skills
        .split(',')
        .map(skill => skill.trim().toLowerCase())
        .filter(skill => skill); // Remove empty entries

      if (skillsArray.length > 0) {
        results = results.filter(internship => {
          const internshipSkills = internship.skills?.map(s => s.toLowerCase()) || [];
          return skillsArray.some(skill => internshipSkills.includes(skill));
        });
      }
    }

    // Filter by user profile skill
    if (filters.userSkills) {
      results = results.filter(internship => {
        const internshipSkills = internship.skills?.map(s => s.toLowerCase()) || [];
        return internshipSkills.includes(filters.userSkills.toLowerCase());
      });
    }

    setFilteredInternships(results);
  };

  const resetFilters = () => {
    setFilters({
      jobType: "",
      employmentType: "",
      skills: "",
      userSkills: "",
    });
    setFilteredInternships(internships); // Reset to all internships
  };

  // Render the list of internships
  const renderInternshipList = () => {
    if (loading && !selectedInternship) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (filteredInternships.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 text-center">
          <p className="text-gray-600">No internships match your filters.</p>
          <button 
            onClick={resetFilters}
            className="mt-4 text-blue-500 hover:text-blue-700 underline"
          >
            Reset filters
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-6 ">
        {filteredInternships.map((internship) => (
          <div
            key={internship.id}
            className={`bg-white rounded-lg shadow-sm border ${
              internship.skillsMatchCount > 0
                ? `border-l-4 border-l-green-500 border-gray-100`
                : `border-gray-100`
            } p-6 hover:shadow-md transition`}
          >
            <div className="flex flex-col md:flex-row gap-4">
              {/* Company Logo */}
              <div className="flex-shrink-0">
                <div className="w-16 h-16 flex items-center justify-center bg-gray-50 rounded-md overflow-hidden">
                  {internship.imageUrl ? (
                    <img
                      src={internship.imageUrl || "/placeholder.svg"}
                      alt={`${internship.companyName} logo`}
                      className="w-12 h-12 object-contain"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-blue-100 flex items-center justify-center rounded-md text-blue-500 font-bold">
                      {internship.companyName?.charAt(0) || "?"}
                    </div>
                  )}
                </div>
              </div>

              {/* Job Details */}
              <div className="flex-grow">
                <h2 className="text-xl font-bold text-gray-800 mb-1">
                  {internship.jobRole || "Full Stack Intern"}
                </h2>
                <div className="flex items-center text-gray-600 mb-3">
                  <span className="font-medium">{internship.companyName}</span>
                  <span className="mx-2">•</span>
                  <span>{internship.location}</span>
                </div>

                {/* Job Metadata */}
                <div className="flex flex-wrap gap-4 mb-4">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>{internship.batchYears}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Briefcase className="w-4 h-4 mr-1" />
                    <span>{internship.employmentType}</span>
                  </div>
                </div>

                {/* Required Skills */}
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                    Required Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {internship.skills &&
                      internship.skills.slice(0, 4).map((skill, index) => (
                        <span
                          key={index}
                          className="bg-blue-50 text-blue-600 text-xs px-4 py-1.5 rounded-full border border-blue-100 shadow-sm hover:bg-blue-100 transition-colors duration-200"
                        >
                          {skill}
                        </span>
                      ))}
                    {internship.skills && internship.skills.length > 4 && (
                      <span className="text-blue-500 text-xs px-3 py-1.5 rounded-full border border-blue-100 hover:bg-blue-50 transition-colors duration-200">
                        +{internship.skills.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Side - Salary and Actions */}
              <div className="flex flex-col items-end justify-between">
                <div className="text-right">
                  <div className="text-green-600 font-bold">
                    {internship.salaryRange}
                  </div>
                  <div className="text-gray-500 text-sm">
                    {internship.timeAgo}
                  </div>
                  {internship.skillsMatchCount > 0 && (
                    <div className="mt-2 flex items-center justify-end">
                      <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-md flex items-center">
                        <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span>
                        {Math.round(
                          (internship.skillsMatchCount /
                            internship.skills.length) *
                            100
                        )}
                        % chance for selection
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 mt-4 w-full md:w-auto">
                  <a
                    href={internship.applyLink || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center justify-center gap-2 transition"
                  >
                    <ZapIcon className="w-4 h-4" />
                    Apply Now
                  </a>

                  <button
                    onClick={() => navigate(`/internship/${internship.id}`)}
                    className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-md flex items-center justify-center gap-2 transition"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-blue-50 p-6 ml-64">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-gray-800">
              {selectedInternship
                ? "Internship Details"
                : `${filteredInternships.length} internships found`}
            </h1>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="w-full lg:w-full">{renderInternshipList()}</div>

          {!selectedInternship && (
            <div className="w-full lg:w-1/4 bg-white rounded-lg shadow-sm border border-gray-100 p-6 h-fit">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-600 mb-4">
                  Filter Jobs
                </h2>

                <div className="space-y-4">
                <div>
                    <label className="block text-gray-700 mb-2">Job Type</label>
                    <select
                      name="jobType"
                      value={filters.jobType}
                      onChange={handleFilterChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Tpes</option>
                      <option value="Internship">Internship</option>
                      <option value="Job">Job</option>
                      <option value="Contract">Contract</option>
                    </select>
                  </div>


                  <div>
                    <label className="block text-gray-700 mb-2">
                      Employment Type
                    </label>
                    <select
                      name="employmentType"
                      value={filters.employmentType}
                      onChange={handleFilterChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Types</option>
                      <option value="Remote">Remote</option>
                      <option value="Full Time">Full Time</option>
                      <option value="Part Time">Part Time</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">
                      Required Skills
                    </label>
                    <input
                      type="text"
                      name="skills"
                      value={filters.skills}
                      onChange={handleFilterChange}
                      placeholder="e.g. Python, React"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Separate multiple skills with commas
                    </p>
                  </div>

                  {userSkills.length > 0 && (
                    <div>
                      <label className="block text-gray-700 mb-2">
                        Filter by Your Skills
                      </label>
                      <select
                        name="userSkills"
                        value={filters.userSkills}
                        onChange={handleFilterChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">All Skills</option>
                        {userSkills.map((skill, index) => (
                          <option key={index} value={skill}>
                            {skill}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="mt-6 space-y-3">
                  <button
                    onClick={applyFilters}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition flex items-center justify-center gap-2"
                  >
                    <FilterIcon className="w-4 h-4" />
                    Apply Filters
                  </button>

                  <button
                    onClick={resetFilters}
                    className="w-full text-blue-500 hover:text-blue-700 py-2 px-4 transition text-center"
                  >
                    Reset filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InternshipList;