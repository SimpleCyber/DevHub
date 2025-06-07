"use client";

import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../utils/firebaseStorage";
import { Eye, Calendar, Briefcase, ZapIcon, FilterIcon, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import WhatsAppJoinButton from "../ui/WhatsAppJoinButton";

const InternshipList = () => {
  // ==================== STATE MANAGEMENT ====================
  const navigate = useNavigate();
  
  // User data state
  const [userSkills, setUserSkills] = useState([]);
  
  // Internship data state
  const [internships, setInternships] = useState([]);
  const [filteredInternships, setFilteredInternships] = useState([]);
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Filter state
  const [filters, setFilters] = useState({
    jobType: "",
    employmentType: "",
    skills: "",
    userSkills: "",
  });
  
  // Mobile UI state
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // ==================== DATA LOADING FUNCTIONS ====================
  
  /**
   * Load user profile data and skills from Firestore
   */
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

  /**
   * Fetch all internships from Firestore and process them
   */
  const fetchInternships = async () => {
    try {
      const internshipSnapshot = await getDocs(collection(db, "internships"));

      // Process basic internship data
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

      // Calculate skill matches if user is logged in
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

        // Re-sort by match score and recency
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

  // ==================== UTILITY FUNCTIONS ====================
  
  /**
   * Calculate time ago from post date
   */
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

  // ==================== FILTER FUNCTIONS ====================
  
  /**
   * Handle filter input changes
   */
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Apply all active filters to internship list
   */
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
        .filter(skill => skill);

      if (skillsArray.length > 0) {
        results = results.filter(internship => {
          const internshipSkills = internship.skills?.map(s => s.toLowerCase()) || [];
          return skillsArray.some(skill => internshipSkills.includes(skill));
        });
      }
    }

    // Filter by user profile skills
    if (filters.userSkills) {
      results = results.filter(internship => {
        const internshipSkills = internship.skills?.map(s => s.toLowerCase()) || [];
        return internshipSkills.includes(filters.userSkills.toLowerCase());
      });
    }

    setFilteredInternships(results);
    
    // Close mobile filter on apply
    setIsMobileFilterOpen(false);
  };

  /**
   * Reset all filters to default state
   */
  const resetFilters = () => {
    setFilters({
      jobType: "",
      employmentType: "",
      skills: "",
      userSkills: "",
    });
    setFilteredInternships(internships);
    setIsMobileFilterOpen(false);
  };

  // ==================== EFFECT HOOKS ====================
  
  useEffect(() => {
    loadProfileData();
  }, []);

  useEffect(() => {
    fetchInternships();
  }, [userSkills]);

  // ==================== RENDER FUNCTIONS ====================
  
  /**
   * Render individual internship card
   */
/**
 * Render individual internship card with mobile-first responsive design
 */
const renderInternshipCard = (internship) => (
  <div
    key={internship.id}
    className={`bg-white rounded-lg shadow-sm border ${
      internship.skillsMatchCount > 0
        ? `border-l-4 border-l-green-500 border-gray-100`
        : `border-gray-100`
    } p-4 md:p-6 hover:shadow-md transition-shadow duration-200`}
  >
    {/* MOBILE LAYOUT (< md screens) */}
    <div className="block md:hidden">
      {/* Mobile Header */}
      <div className="flex items-start space-x-3 mb-3">
        {/* Company Logo */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden">
            {internship.imageUrl ? (
              <img
                src={internship.imageUrl || "/placeholder.svg"}
                alt={`${internship.companyName} logo`}
                className="w-8 h-8 object-contain"
              />
            ) : (
              <div className="w-8 h-8 bg-blue-100 flex items-center justify-center rounded-lg text-blue-500 font-bold text-sm">
                {internship.companyName?.charAt(0) || "?"}
              </div>
            )}
          </div>
        </div>

        {/* Job Title & Company */}
        <div className="flex-grow min-w-0">
          <h2 className="text-lg font-bold text-gray-800 mb-1 truncate">
            {internship.jobRole || "Full Stack Intern"}
          </h2>
          <p className="text-sm font-medium text-gray-700 mb-1 truncate">{internship.companyName}</p>
          <p className="text-xs text-gray-500 truncate">{internship.location}</p>
        </div>

        {/* Salary */}
        <div className="flex-shrink-0 text-right">
          <div className="text-green-600 font-bold text-sm">
            {internship.salaryRange}
          </div>
          <div className="text-gray-400 text-xs">
            {internship.timeAgo}
          </div>
        </div>
      </div>

      {/* Mobile Skills (Limited) */}
      <div className="mb-3">
        <div className="flex gap-1.5 overflow-x-auto" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          {internship.skills &&
            internship.skills.slice(0, 3).map((skill, index) => (
              <span
                key={index}
                className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded-full border border-blue-100 whitespace-nowrap flex-shrink-0"
              >
                {skill}
              </span>
            ))}
          {internship.skills && internship.skills.length > 3 && (
            <span className="text-blue-500 text-xs px-2 py-1 rounded-full border border-blue-100 whitespace-nowrap flex-shrink-0">
              +{internship.skills.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Mobile Match Score */}
      {internship.skillsMatchCount > 0 && (
        <div className="mb-3">
          <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-md flex items-center w-fit">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 mr-1"></span>
            {Math.round(
              (internship.skillsMatchCount / internship.skills.length) * 100
            )}% match
          </span>
        </div>
      )}

      {/* Mobile Action Buttons */}
      <div className="flex gap-2">
        <a
          href={internship.applyLink || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors duration-200 text-sm font-medium"
        >
          <ZapIcon className="w-3.5 h-3.5" />
          Apply
        </a>

        <button
          onClick={() => navigate(`/internship/${internship.id}`)}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors duration-200 text-sm font-medium"
        >
          <Eye className="w-3.5 h-3.5" />
          Details
        </button>
      </div>
    </div>

    {/* DESKTOP LAYOUT (>= md screens) - Original Structure */}
    <div className="hidden md:block">
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
  </div>
);

  /**
   * Render the main internship list
   */
  const renderInternshipList = () => {
    if (loading && !selectedInternship) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (filteredInternships.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 text-center">
          <p className="text-gray-600 mb-4">No internships match your filters.</p>
          <button 
            onClick={resetFilters}
            className="text-blue-500 hover:text-blue-700 underline"
          >
            Reset filters
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-4 sm:space-y-6">
        {filteredInternships.map(renderInternshipCard)}
      </div>
    );
  };

  /**
   * Render filter sidebar/modal
   */
  const renderFilterSection = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 sm:p-6 h-fit">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-600">
            Filter Jobs
          </h2>
          {/* Close button for mobile */}
          <button
            onClick={() => setIsMobileFilterOpen(false)}
            className="lg:hidden p-1 hover:bg-gray-100 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Job Type Filter */}
          <div>
            <label className="block text-gray-700 mb-2 text-sm font-medium">Job Type</label>
            <select
              name="jobType"
              value={filters.jobType}
              onChange={handleFilterChange}
              className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              <option value="Internship">Internship</option>
              <option value="Fresher">Fresher</option>
              <option value="Contract">Contract</option>
            </select>
          </div>

          {/* Employment Type Filter */}
          <div>
            <label className="block text-gray-700 mb-2 text-sm font-medium">
              Employment Type
            </label>
            <select
              name="employmentType"
              value={filters.employmentType}
              onChange={handleFilterChange}
              className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              <option value="Remote">Remote</option>
              <option value="Full Time">Full Time</option>
              <option value="Part Time">Part Time</option>
            </select>
          </div>

          {/* Skills Filter */}
          <div>
            <label className="block text-gray-700 mb-2 text-sm font-medium">
              Required Skills
            </label>
            <input
              type="text"
              name="skills"
              value={filters.skills}
              onChange={handleFilterChange}
              placeholder="e.g. Python, React"
              className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Separate multiple skills with commas
            </p>
          </div>

          {/* User Skills Filter */}
          {userSkills.length > 0 && (
            <div>
              <label className="block text-gray-700 mb-2 text-sm font-medium">
                Filter by Your Skills
              </label>
              <select
                name="userSkills"
                value={filters.userSkills}
                onChange={handleFilterChange}
                className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

        {/* Filter Action Buttons */}
        <div className="mt-6 space-y-3">
          <button
            onClick={applyFilters}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center gap-2 text-sm font-medium"
          >
            <FilterIcon className="w-4 h-4" />
            Apply Filters
          </button>

          <button
            onClick={resetFilters}
            className="w-full text-blue-500 hover:text-blue-700 py-2 px-4 transition-colors duration-200 text-center text-sm font-medium"
          >
            Reset filters
          </button>
        </div>
      </div>
    </div>
  );

  // ==================== MAIN RENDER ====================
  
  return (
    <div className="min-h-screen bg-blue-50 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
            {selectedInternship
              ? "Internship Details"
              : `${filteredInternships.length} internships found`}
          </h1>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Mobile Filter Toggle Button */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden bg-white border border-gray-300 px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium hover:bg-gray-50 transition-colors duration-200"
            >
              <FilterIcon className="w-4 h-4" />
              Filters
            </button>
            
            <WhatsAppJoinButton />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="w-full lg:w-3/4">
            {renderInternshipList()}
          </div>

          {/* Desktop Filter Sidebar */}
          {!selectedInternship && (
            <div className="hidden lg:block w-full lg:w-1/4">
              {renderFilterSection()}
            </div>
          )}
        </div>

        {/* Mobile Filter Modal */}
        {isMobileFilterOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
            <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white overflow-y-auto">
              <div className="p-4">
                {renderFilterSection()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InternshipList;