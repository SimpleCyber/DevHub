import React, { useMemo } from "react";
import { MapPin, Mail, Users, Book, GitCommit, User } from "lucide-react";

// Language colors as a constant
const LANGUAGE_COLORS = {
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Rust: "#dea584",
  TypeScript: "#2b7489",
  HTML: "#e34c26",
  CSS: "#563d7c",
};

const GitHubCard = ({ data }) => {
  // Process data with error handling using useMemo
  const processedData = useMemo(() => {
    if (!data) return null;

    const profile = data.profile || {};
    const top_repositories = data.top_repositories || [];
    const contributions = data.contributions || {};

    return {
      profile: {
        avatar: profile.avatar || "/github.png",
        full_name: profile.full_name || "Unknown User",
        email: profile.email || profile.username || "No email provided",
        username: profile.username || "unknown",
        location: profile.location || "Location not specified",
        followers: profile.followers || 0,
        following: profile.following || 0,
        public_repos: profile.public_repos || 0,
      },
      top_repositories: top_repositories
        .filter((repo) => repo && repo.name)
        .map((repo) => ({
          name: repo.name,
          html_url: repo.html_url || "#",
          language: repo.language || "Unknown",
          description: repo.description || "No description provided",
        })),
      contributions,
    };
  }, [data]);

  // Get language color with error handling
  const getLanguageColor = (language) => {
    if (!language) return "#8b949e";
    return LANGUAGE_COLORS[language] || "#8b949e";
  };

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 bg-white rounded-xl shadow-sm border border-gray-100 italic">
        <div className="mb-4 p-3 bg-gray-50 rounded-full">
          <img src="/github.png" alt="GitHub" className="w-8 h-8 opacity-40" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-1">
          No GitHub Data
        </h3>
        <p className="text-gray-500 text-sm max-w-xs text-center">
          Connect your GitHub account in profile settings to showcase your
          repositories and contributions.
        </p>
      </div>
    );
  }

  if (!processedData) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg">
        Unable to load GitHub data
      </div>
    );
  }

  const { profile, top_repositories } = processedData;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">GitHub</h2>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Profile Section */}
        <div className="w-full md:w-1/3 flex flex-col items-center md:items-start">
          <img
            src={profile.avatar}
            alt={profile.full_name}
            className="w-24 h-24 rounded-full object-cover mb-4"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/github.png";
            }}
          />

          <div className="w-full space-y-3">
            <div className="flex items-center text-gray-600">
              <Mail className="w-4 h-4 mr-2" />
              <span className="truncate" title={profile.email}>
                {profile.email}
              </span>
            </div>

            <div className="flex items-center text-gray-600">
              <MapPin className="w-4 h-4 mr-2" />
              <span>{profile.location}</span>
            </div>

            <div className="flex items-center text-gray-600">
              <Users className="w-4 h-4 mr-2" />
              <span>{profile.followers.toLocaleString()} followers</span>
            </div>

            <div className="flex items-center text-gray-600">
              <User className="w-4 h-4 mr-2" />
              <span>{profile.following.toLocaleString()} following</span>
            </div>

            <div className="flex items-center text-gray-600">
              <Book className="w-4 h-4 mr-2" />
              <span>{profile.public_repos.toLocaleString()} Public Repos</span>
            </div>
          </div>
        </div>

        {/* Repositories Section */}
        <div className="w-full md:w-2/3">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Top Repositories
          </h3>

          <div className="space-y-3">
            {top_repositories.length > 0 ? (
              top_repositories.map((repo, index) => (
                <div
                  key={`${repo.name}-${index}`}
                  className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center mb-2">
                    <Book className="w-4 h-4 text-gray-500 mr-2" />
                    <a
                      href={repo.html_url}
                      className="text-blue-600 font-medium hover:underline truncate"
                      target="_blank"
                      rel="noopener noreferrer"
                      title={repo.name}
                    >
                      {repo.name}
                    </a>
                  </div>

                  <div className="flex items-center text-xs text-gray-500">
                    {repo.language && (
                      <>
                        <span
                          className="w-2 h-2 rounded-full mr-1"
                          style={{
                            backgroundColor: getLanguageColor(repo.language),
                          }}
                        />
                        <span className="mr-3">{repo.language}</span>
                      </>
                    )}
                    <GitCommit className="w-3 h-3 mr-1" />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-500 text-center py-4">
                No repositories available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GitHubCard;
