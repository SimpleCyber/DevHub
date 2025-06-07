import React from "react";
import {
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  User,
  Calendar,
  Link as LinkIcon,
  Workflow,
  Folders,
  Book,
} from "lucide-react";

const LinkedInProfile = ({ demoData }) => {
  if (!demoData) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="border-4 border-gray-200 border-t-blue-500 rounded-full w-10 h-10 animate-spin"></div>
      </div>
    );
  }

  const formatDate = (year, month) => {
    if (!year || !month) return "Present";
    const date = new Date(year, month - 1);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">LinkedIn</h2>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Column - Profile Info */}
        <div className="w-full md:w-1/3">
          <div className="flex flex-col items-center md:items-start">
            <img
              src={demoData.ProfilePicture}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover mb-4"
            />
            
            <div className="w-full space-y-3">
              <div className="flex items-center text-gray-600">
                <User className="w-4 h-4 mr-2" />
                <span className="font-medium">{demoData.Username}</span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <MapPin className="w-4 h-4 mr-2" />
                <span>{demoData.Location}</span>
              </div>
            </div>
          </div>

          {/* Skills Section */}
        {demoData.Skills && demoData.Skills.length > 0 && (
          <div className="mt-6">
            <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
              <Award className="w-5 h-5 mr-2" />
              Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {demoData.Skills.slice(1, 5).map((skill, index) => (
                <div
                  key={index}
                  className={`px-3 py-1 rounded-full text-sm ${
                    skill.PassedSkillAssessment
                      ? "bg-green-50 text-green-600"
                      : "bg-blue-50 text-blue-600"
                  }`}
                >
                  {skill.Name}
                </div>
              ))}
            </div>
          </div>
        )}

        </div>

        {/* Right Column - Experience and Education */}
        <div className="w-full md:w-2/3 space-y-6">
          {/* Experience Section */}
          {demoData.Position && demoData.Position.length > 0 && (
            <div>
              <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
                <Briefcase className="w-5 h-5 mr-2" />
                Experience
              </h3>
              <div className="space-y-4">
                {demoData.Position.map((position, index) => (
                  <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                    <img
                      src={position.CompanyLogo}
                      alt={position.CompanyName}
                      className="w-12 h-12 rounded-md object-contain"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{position.CompanyName}</h4>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <Workflow className="w-4 h-4 mr-2" />
                        <span>{position.employmentType}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>
                          {formatDate(position.StartYear, position.StartMonth)} -{" "}
                          {formatDate(position.EndYear, position.EndMonth)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education Section */}
          {demoData.Education && demoData.Education.length > 0 && (
            <div>
              <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
                <GraduationCap className="w-5 h-5 mr-2" />
                Education
              </h3>
              <div className="space-y-4">
                {demoData.Education.map((edu, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{edu.SchoolName}</h4>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <Book className="w-4 h-4 mr-2" />
                          <span>{edu.FieldOfStudy}</span>
                        </div>
                        {edu.Grade && (
                          <div className="flex items-center text-sm text-gray-600 mt-1">
                            <Folders className="w-4 h-4 mr-2" />
                            <span>Grade: {edu.Grade}</span>
                          </div>
                        )}
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>
                            {formatDate(edu.StartYear, edu.StartMonth)} -{" "}
                            {formatDate(edu.EndYear, edu.EndMonth)}
                          </span>
                        </div>
                      </div>
                      {edu.URL && (
                        <a
                          href={edu.URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <LinkIcon className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LinkedInProfile;