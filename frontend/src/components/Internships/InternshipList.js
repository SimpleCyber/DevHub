"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../utils/firebaseStorage";
import {
  Eye,
  Share2,
  Bookmark,
  Calendar,
  Briefcase,
  Clock,
  ZapIcon,
  FilterIcon,
  MapPin,
  Building,
  ExternalLink,
  X,
} from "lucide-react";
import Markdown from "react-markdown";
import InternshipDetail from "./InternshipDetail";
import { useNavigate } from "react-router-dom";

const InternshipList = () => {
  const navigate = useNavigate();

  const [internships, setInternships] = useState([]);
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    jobType: "",
    employmentType: "",
    skills: "",
  });

  useEffect(() => {
    const fetchInternships = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "internships"));
        const internshipData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timeAgo: getTimeAgo(doc.data().postDate),
        }));

        // Sort internships by post date (most recent first)
        setInternships(
          internshipData.sort(
            (a, b) => new Date(b.postDate) - new Date(a.postDate)
          )
        );
        setLoading(false);
      } catch (error) {
        console.error("Error fetching internships:", error);
        setLoading(false);
      }
    };

    fetchInternships();
  }, []);

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
    // This would filter the internships based on the selected filters
    console.log("Applying filters:", filters);
  };

  const resetFilters = () => {
    setFilters({
      jobType: "",
      employmentType: "",
      skills: "",
    });
  };

  const viewInternshipDetails = async (internshipId) => {
    try {
      setLoading(true);
      const docRef = doc(db, "internships", internshipId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setSelectedInternship({
          id: docSnap.id,
          ...docSnap.data(),
        });
      } else {
        console.log("No such document!");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching internship:", error);
      setLoading(false);
    }
  };

  const closeDetails = () => {
    setSelectedInternship(null);
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

    return (
      <div className="space-y-6">
        {internships.map((internship) => (
          <div
            key={internship.id}
            className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition"
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
                      {internship.companyName.charAt(0)}
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

                {/* Skills */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {internship.skills &&
                    internship.skills.slice(0, 4).map((skill, index) => (
                      <span
                        key={index}
                        className="bg-blue-50 text-blue-600 text-xs px-3 py-1 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  {internship.skills && internship.skills.length > 4 && (
                    <span className="text-gray-500 text-xs px-2 py-1">
                      +{internship.skills.length - 4} more
                    </span>
                  )}
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

                  {/* <button className="text-gray-500 hover:text-blue-500 transition p-2">
                      <Share2 className="w-5 h-5" />
                    </button> */}

                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 ml-64">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            {selectedInternship
              ? "Internship Details"
              : `${internships.length} internships found`}
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="w-full lg:w-full">{renderInternshipList()}</div>

          {!selectedInternship && (
            <div className="w-full lg:w-1/4 bg-white rounded-lg shadow-sm border border-gray-100 p-6 h-fit">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
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
                      <option value="">Internship</option>
                      <option value="full-time">Full Time</option>
                      <option value="part-time">Part Time</option>
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
                      <option value="full-time">Full Time</option>
                      <option value="part-time">Part Time</option>
                      <option value="contract">Contract</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">Skills</label>
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
