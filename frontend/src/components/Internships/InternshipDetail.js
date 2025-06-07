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
import { toast } from "sonner"; 

const InternshipDetail = () => {
  const [internship, setInternship] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();

  const handleShareJob = () => {
    try {
      const currentUrl = window.location.href;
      if (!navigator.clipboard) {
        toast.error("Clipboard not supported");
        return;
      }
      navigator.clipboard
        .writeText(currentUrl)
        .then(() => {
          toast.success("Internship URL copied successfully!");
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
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-full mx-auto">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-blue-900 text-white p-4 md:p-6 relative">
            <button
              onClick={() => navigate("/internships")}
              className="absolute top-3 right-3 md:top-4 md:right-4 text-white hover:bg-blue-800 p-1 md:p-2 rounded-full transition"
            >
              <X className="w-4 h-4 md:w-5 md:h-5" />
            </button>

            <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start">
              {/* Company Logo */}
              <div className="bg-white p-2 md:p-4 rounded-lg shadow-md">
                {internship.imageUrl ? (
                  <img
                    src={internship.imageUrl || "/placeholder.svg"}
                    alt={`${internship.companyName} logo`}
                    className="w-12 h-12 md:w-16 md:h-16 object-contain"
                  />
                ) : (
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-100 flex items-center justify-center rounded-md text-blue-500 font-bold text-xl md:text-2xl">
                    {internship.companyName.charAt(0)}
                  </div>
                )}
              </div>

              {/* Company and Job Info */}
              <div className="flex-grow">
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-1 md:mb-2">
                  {internship.jobRole || "Full Stack Intern"}
                </h1>

                <div className="flex flex-col md:flex-row md:items-center mb-2 md:mb-4 gap-1 md:gap-0">
                  <span className="text-base md:text-xl font-medium">
                    {internship.companyName}
                  </span>
                  <span className="hidden md:inline mx-2">•</span>
                  <div className="flex items-center text-sm md:text-base">
                    <MapPin className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                    <span>{internship.location}</span>
                  </div>
                </div>

                <div className="text-xs md:text-sm text-blue-200">
                  Published by
                  <span className="font-medium ml-1">Admin</span>
                  <span className="mx-1">•</span>
                  Updated {new Date(internship.postDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 md:p-6">
            <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
              {/* Main Content */}
              <div className="w-full lg:w-2/3">
                {/* Job Details Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
                  <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm border border-gray-100 flex items-center">
                    <div className="bg-green-100 p-1 md:p-2 rounded-md text-green-600 mr-2 md:mr-3">
                      <Briefcase className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <div className="flex flex-col">
                      <div className="text-xs md:text-sm text-gray-500">Salary Range</div>
                      <div className="text-sm md:text-base font-medium">
                        {internship.salaryRange}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm border border-gray-100 flex items-center">
                    <div className="bg-blue-100 p-1 md:p-2 rounded-md text-blue-600 mr-2 md:mr-3">
                      <Briefcase className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <div className="flex flex-col">
                      <div className="text-xs md:text-sm text-gray-500">Experience</div>
                      <div className="text-sm md:text-base font-medium">{internship.experience}</div>
                    </div>
                  </div>

                  <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm border border-gray-100 flex items-center">
                    <div className="bg-yellow-100 p-1 md:p-2 rounded-md text-yellow-600 mr-2 md:mr-3">
                      <Calendar className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <div className="flex flex-col">
                      <div className="text-xs md:text-sm text-gray-500">Batch Years</div>
                      <div className="text-sm md:text-base font-medium">{internship.batchYears}</div>
                    </div>
                  </div>

                  <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm border border-gray-100 flex items-center">
                    <div className="bg-purple-100 p-1 md:p-2 rounded-md text-purple-600 mr-2 md:mr-3">
                      <Clock className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <div className="flex flex-col">
                      <div className="text-xs md:text-sm text-gray-500">Job Type</div>
                      <div className="text-sm md:text-base font-medium">
                        {internship.jobType || "Internship"}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm border border-gray-100 flex items-center">
                    <div className="bg-indigo-100 p-1 md:p-2 rounded-md text-indigo-600 mr-2 md:mr-3">
                      <Briefcase className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <div className="flex flex-col">
                      <div className="text-xs md:text-sm text-gray-500">
                        Employment Type
                      </div>
                      <div className="text-sm md:text-base font-medium">
                        {internship.employmentType}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Job Overview */}
                <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-100 mb-6 md:mb-8">
                  <div className="prose prose-sm md:prose-lg text-gray-700 leading-relaxed">
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
                  <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-100">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-3 md:mb-4">
                      Skills Required
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {internship.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="bg-blue-50 text-blue-600 px-2 py-1 text-xs md:text-sm md:px-3 rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="w-full lg:w-1/3 space-y-4 md:space-y-6">
                {/* Action Buttons */}
                <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-100 space-y-3 md:space-y-4">
                  <a
                    href={internship.applyLink || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-500 hover:bg-blue-600 text-white w-full py-2 md:py-3 rounded-md transition flex items-center justify-center gap-2 text-sm md:text-base font-medium"
                  >
                    <ExternalLink className="w-4 h-4 md:w-5 md:h-5" />
                    Apply Now
                  </a>

                  <button className="bg-purple-500 hover:bg-purple-600 text-white w-full py-2 md:py-3 rounded-md transition flex items-center justify-center gap-2 text-sm md:text-base font-medium">
                    <Bookmark className="w-4 h-4 md:w-5 md:h-5" />
                    Save Job
                  </button>

                  <button
                    onClick={handleShareJob}
                    className="bg-gray-800 hover:bg-gray-900 text-white w-full py-2 md:py-3 rounded-md transition flex items-center justify-center gap-2 text-sm md:text-base font-medium"
                  >
                    <Share2 className="w-4 h-4 md:w-5 md:h-5" />
                    Share Job
                  </button>
                </div>

                {/* Job Details */}
                <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-100">
                  <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4">
                    Job Details
                  </h3>

                  <div className="space-y-3 md:space-y-4">
                    <div className="flex items-start">
                      <Building className="w-4 h-4 md:w-5 md:h-5 text-gray-500 mr-2 md:mr-3 mt-0.5 md:mt-1" />
                      <div>
                        <div className="text-xs md:text-sm text-gray-500">Company</div>
                        <div className="text-sm md:text-base font-medium">
                          {internship.companyName}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <MapPin className="w-4 h-4 md:w-5 md:h-5 text-gray-500 mr-2 md:mr-3 mt-0.5 md:mt-1" />
                      <div>
                        <div className="text-xs md:text-sm text-gray-500">Location</div>
                        <div className="text-sm md:text-base font-medium">{internship.location}</div>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Briefcase className="w-4 h-4 md:w-5 md:h-5 text-gray-500 mr-2 md:mr-3 mt-0.5 md:mt-1" />
                      <div>
                        <div className="text-xs md:text-sm text-gray-500">Experience</div>
                        <div className="text-sm md:text-base font-medium">
                          {internship.experience}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Calendar className="w-4 h-4 md:w-5 md:h-5 text-gray-500 mr-2 md:mr-3 mt-0.5 md:mt-1" />
                      <div>
                        <div className="text-xs md:text-sm text-gray-500">Posted On</div>
                        <div className="text-sm md:text-base font-medium">
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