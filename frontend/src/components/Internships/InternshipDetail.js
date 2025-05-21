import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../utils/firebaseStorage";
import { useParams, useNavigate } from "react-router-dom";
import {
  Briefcase,
  Calendar,
  MapPin,
  Building,
  ExternalLink,
  Bookmark,
  Share2,
  Clock,
  X,
} from "lucide-react";

import { toast } from "sonner"; // Make sure to import toast from sonner
const InternshipDetail = () => {
  const [internship, setInternship] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();

  const handleShareJob = () => {
    try {
      const currentUrl = window.location.href;

      // Log to verify function is called
      console.log("Share job function triggered");

      // Check clipboard support
      if (!navigator.clipboard) {
        console.error("Clipboard API not supported");
        toast.error("Clipboard not supported");
        return;
      }

      // Attempt to copy
      navigator.clipboard
        .writeText(currentUrl)
        .then(() => {
          // Multiple logging for debugging
          console.log("URL copy attempt successful");
          console.log("Attempting to show toast");

          // Try different toast methods
          toast.success("Internship URL copied successfully!");
          // Alternatively, try:
          // toast("URL Copied", { type: "success" });
        })
        .catch((err) => {
          console.error("Clipboard copy failed:", err);
          toast.error("Failed to copy URL");
        });
    } catch (error) {
      console.error("Unexpected error in handleShareJob:", error);
      toast.error("An unexpected error occurred");
    }
  };

  useEffect(() => {
    const fetchInternshipDetails = async () => {
      if (!id) {
        navigate("/internships");
        return;
      }

      try {
        setLoading(true);
        const docRef = doc(db, "internships", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setInternship({
            id: docSnap.id,
            ...docSnap.data(),
          });
        } else {
          console.log("No such document!");
          navigate("/internships");
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching internship:", error);
        setLoading(false);
        navigate("/internships");
      }
    };

    fetchInternshipDetails();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!internship) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-full mx-auto">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-blue-900 text-white p-6 relative">
            <button
              onClick={() => navigate("/internships")}
              className="absolute top-4 right-4 text-white hover:bg-blue-800 p-2 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Company Logo */}
              <div className="bg-white p-4 rounded-lg shadow-md">
                {internship.imageUrl ? (
                  <img
                    src={internship.imageUrl || "/placeholder.svg"}
                    alt={`${internship.companyName} logo`}
                    className="w-16 h-16 object-contain"
                  />
                ) : (
                  <div className="w-16 h-16 bg-blue-100 flex items-center justify-center rounded-md text-blue-500 font-bold text-2xl">
                    {internship.companyName.charAt(0)}
                  </div>
                )}
              </div>

              {/* Company and Job Info */}
              <div className="flex-grow">
                <h1 className="text-3xl font-bold mb-2">
                  {internship.jobRole || "Full Stack Intern"}
                </h1>

                <div className="flex items-center mb-4">
                  <span className="text-xl font-medium">
                    {internship.companyName}
                  </span>
                  <span className="mx-2">•</span>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{internship.location}</span>
                  </div>
                </div>

                <div className="text-sm text-blue-200">
                  Published by
                  <span className="font-medium ml-1">Admin</span>
                  <span className="mx-1">•</span>
                  Updated {new Date(internship.postDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Main Content */}
              <div className="w-full lg:w-2/3">
                {/* Job Details Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center">
                    <div className="bg-green-100 p-2 rounded-md text-green-600 mr-3">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <div className="text-sm text-gray-500">Salary Range</div>
                      <div className="font-medium">
                        {internship.salaryRange}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center">
                    <div className="bg-blue-100 p-2 rounded-md text-blue-600 mr-3">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <div className="text-sm text-gray-500">Experience</div>
                      <div className="font-medium">{internship.experience}</div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center">
                    <div className="bg-yellow-100 p-2 rounded-md text-yellow-600 mr-3">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <div className="text-sm text-gray-500">Batch Years</div>
                      <div className="font-medium">{internship.batchYears}</div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center">
                    <div className="bg-purple-100 p-2 rounded-md text-purple-600 mr-3">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <div className="text-sm text-gray-500">Job Type</div>
                      <div className="font-medium">
                        {internship.jobType || "Internship"}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center">
                    <div className="bg-indigo-100 p-2 rounded-md text-indigo-600 mr-3">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <div className="text-sm text-gray-500">
                        Employment Type
                      </div>
                      <div className="font-medium">
                        {internship.employmentType}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Job Overview */}

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8">
                  <div className="prose prose-lg text-gray-700 leading-relaxed">
                    <div className="prose-headings:text-gray-900 prose-headings:font-semibold prose-ul:list-disc prose-ul:pl-5">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: internship.description,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Skills Required */}
                {internship.skills && internship.skills.length > 0 && (
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                      Skills Required
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {internship.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="w-full lg:w-1/3 space-y-6">
                {/* Action Buttons */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-4">
                  <a
                    href={internship.applyLink || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-500 hover:bg-blue-600 text-white w-full py-3 rounded-md transition flex items-center justify-center gap-2 font-medium"
                  >
                    <ExternalLink className="w-5 h-5" />
                    Apply Now
                  </a>

                  <button className="bg-purple-500 hover:bg-purple-600 text-white w-full py-3 rounded-md transition flex items-center justify-center gap-2 font-medium">
                    <Bookmark className="w-5 h-5" />
                    Save Job
                  </button>

                  <button
                    onClick={handleShareJob}
                    className="bg-gray-800 hover:bg-gray-900 text-white w-full py-3 rounded-md transition flex items-center justify-center gap-2 font-medium"
                  >
                    <Share2 className="w-5 h-5" />
                    Share Job
                  </button>
                </div>

                {/* Job Details */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    Job Details
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-start">
                      <Building className="w-5 h-5 text-gray-500 mr-3 mt-1" />
                      <div>
                        <div className="text-sm text-gray-500">Company</div>
                        <div className="font-medium">
                          {internship.companyName}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <MapPin className="w-5 h-5 text-gray-500 mr-3 mt-1" />
                      <div>
                        <div className="text-sm text-gray-500">Location</div>
                        <div className="font-medium">{internship.location}</div>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Briefcase className="w-5 h-5 text-gray-500 mr-3 mt-1" />
                      <div>
                        <div className="text-sm text-gray-500">Experience</div>
                        <div className="font-medium">
                          {internship.experience}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Calendar className="w-5 h-5 text-gray-500 mr-3 mt-1" />
                      <div>
                        <div className="text-sm text-gray-500">Posted On</div>
                        <div className="font-medium">
                          {new Date(internship.postDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternshipDetail;
