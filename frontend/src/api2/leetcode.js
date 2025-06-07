import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Code, MapPin, Trophy, Star, User } from "lucide-react";

const CustomTooltip = ({ active, payload, coordinate }) => {
  if (!active || !payload?.length) return null;

  const submission = payload[0].payload.submission;
  if (!submission) return null;

  const xPos = coordinate?.x || 0;
  const yPos = coordinate?.y || 0;
  const above = yPos > 100;

  return (
    <div
      className="bg-white border border-gray-200 rounded-md shadow-lg p-3 min-w-[200px]"
      style={{
        position: "absolute",
        left: `${xPos}px`,
        top: above ? `${yPos - 120}px` : `${yPos + 20}px`,
        transform: "translateX(-50%)",
      }}
    >
      <div className="flex items-center gap-2 font-medium text-gray-800 border-b border-gray-100 pb-2 mb-2">
        <Code size={14} />
        <span>{submission.title || 'Untitled'}</span>
      </div>
      <div className="flex flex-col gap-1 text-xs">
        <span className="text-gray-600">{submission.lang || 'Unknown'}</span>
        <span className={`inline-block px-2 py-1 rounded-md font-medium ${
          (submission.statusDisplay || '').toLowerCase() === 'accepted' 
            ? 'bg-green-50 text-green-600' 
            : (submission.statusDisplay || '').toLowerCase().includes('wrong') 
              ? 'bg-red-50 text-red-600'
              : 'bg-yellow-50 text-yellow-600'
        }`}>
          {submission.statusDisplay || 'Unknown'}
        </span>
        <span className="text-gray-500">
          {submission.timestamp 
            ? new Date(submission.timestamp * 1000).toLocaleDateString()
            : 'Date unknown'}
        </span>
      </div>
    </div>
  );
};

const LeetCodeStats = ({ profile }) => {
  const matchedUser = profile?.matchedUser || {};
  const userProfile = matchedUser.profile || {};
  const submitStats = matchedUser.submitStats || {};
  const recentSubmissions = profile?.recentSubmissionList || [];
  const badges = matchedUser.badges || [];

  const processSubmissionData = useMemo(() => {
    if (!recentSubmissions.length) return [];
    return recentSubmissions
      .filter(submission => submission != null)
      .map((submission, index) => ({
        name: index,
        value: recentSubmissions.length - index,
        submission: submission,
      }))
      .reverse();
  }, [recentSubmissions]);

  const getDifficultyCounts = useMemo(() => {
    const stats = submitStats.acSubmissionNum || [];
    return {
      easy: stats.find((s) => s?.difficulty === "Easy")?.count || 0,
      medium: stats.find((s) => s?.difficulty === "Medium")?.count || 0,
      hard: stats.find((s) => s?.difficulty === "Hard")?.count || 0,
    };
  }, [submitStats]);

  const avatarUrl = useMemo(() => {
    const defaultAvatar = 'https://placeholder.com/user';
    return userProfile.userAvatar || defaultAvatar;
  }, [userProfile]);

  if (!profile) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 text-center text-gray-500">
        No LeetCode data available
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">LeetCode</h2>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Column - Profile Info */}
        <div className="w-full md:w-1/3 flex flex-col gap-4">
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-gray-100 overflow-hidden mb-4">
              <img
                src={avatarUrl}
                alt="avatar"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://placeholder.com/user';
                }}
              />
            </div>
            
            <div className="w-full space-y-3">
              <div className="flex items-center text-gray-600">
                <User className="w-4 h-4 mr-2" />
                <span className="font-medium">@{matchedUser.username || 'Unknown'}</span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <MapPin className="w-4 h-4 mr-2" />
                <span>{userProfile.countryName || 'Location unknown'}</span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <Trophy className="w-4 h-4 mr-2" />
                <span>Rank: {userProfile.ranking || 'N/A'}</span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <Star className="w-4 h-4 mr-2" />
                <span>Reputation: {userProfile.reputation || 0}</span>
              </div>
            </div>
          </div>

          {/* Badges Section */}
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Badges</h3>
            <div className="flex flex-wrap gap-3">
              {badges.length > 0 ? (
                badges.slice(0, 5).map((badge, index) => (
                  <div key={index} className="w-10 h-10">
                    <img
                      src={badge.icon?.startsWith('http') 
                        ? badge.icon 
                        : `https://leetcode.com${badge.icon || ''}`}
                      alt={badge.displayName || 'Badge'}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-sm">No badges earned yet</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Stats and Graph */}
        <div className="w-full md:w-2/3 flex flex-col gap-6">
          {/* Problem Stats */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Problems Solved</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-green-50 rounded-lg p-3 text-center text-green-600">
                <div className="text-xl font-bold">{getDifficultyCounts.easy}</div>
                <div className="text-sm">Easy</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-3 text-center text-yellow-600">
                <div className="text-xl font-bold">{getDifficultyCounts.medium}</div>
                <div className="text-sm">Medium</div>
              </div>
              <div className="bg-red-50 rounded-lg p-3 text-center text-red-600">
                <div className="text-xl font-bold">{getDifficultyCounts.hard}</div>
                <div className="text-sm">Hard</div>
              </div>
            </div>
          </div>

          {/* Submission Graph */}
          <div className="bg-gray-50 rounded-lg p-4 flex-grow">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Recent Submissions</h3>
            {processSubmissionData.length > 0 ? (
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={processSubmissionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#333"
                      strokeWidth={2}
                      dot={{
                        r: 4,
                        fill: "#fff",
                        stroke: "#333",
                        strokeWidth: 2,
                      }}
                      activeDot={{
                        r: 6,
                        fill: "#333",
                        stroke: "#fff",
                        strokeWidth: 2,
                      }}
                    />
                    <XAxis
                      dataKey="name"
                      stroke="#999"
                      tick={{ fontSize: 12 }}
                      tickLine={{ stroke: "#999" }}
                      axisLine={{ stroke: "#999" }}
                    />
                    <YAxis
                      stroke="#999"
                      tick={{ fontSize: 12 }}
                      tickLine={{ stroke: "#999" }}
                      axisLine={{ stroke: "#999" }}
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={false}
                      position={{ x: 0, y: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-gray-500 text-center py-8">No recent submissions</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeetCodeStats;