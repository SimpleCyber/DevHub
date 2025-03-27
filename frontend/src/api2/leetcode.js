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
import "./leetcode.css";

const CustomTooltip = ({ active, payload, coordinate }) => {
  if (!active || !payload?.length) return null;

  const submission = payload[0].payload.submission;
  if (!submission) return null;

  const xPos = coordinate?.x || 0;
  const yPos = coordinate?.y || 0;
  const above = yPos > 100;

  return (
    <div
      className="custom-tooltip"
      style={{
        position: "absolute",
        left: `${xPos}px`,
        top: above ? `${yPos - 120}px` : `${yPos + 20}px`,
        transform: "translateX(-50%)",
      }}
    >
      <div className="tooltip-title">
        <Code size={14} />
        <span>{submission.title || 'Untitled'}</span>
      </div>
      <div className="tooltip-meta">
        <span className="language">{submission.lang || 'Unknown'}</span>
        <span className={`status ${(submission.statusDisplay || '').toLowerCase()}`}>
          {submission.statusDisplay || 'Unknown'}
        </span>
        <span className="time">
          {submission.timestamp 
            ? new Date(submission.timestamp * 1000).toLocaleDateString()
            : 'Date unknown'}
        </span>
      </div>
    </div>
  );
};

const LeetCodeStats = ({ profile }) => {
  // Move all useMemo hooks before any conditional returns
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

  // Early return after all hooks
  if (!profile) {
    return <div className="leetcode-card error">No LeetCode data available</div>;
  }

  return (
    <>
      <h2 className="full-name">Leetcode</h2>
      <div className="leetcode-card">
        <div className="card-left">
          <div className="profile-circle">
            <img
              className="profile-circle"
              src={avatarUrl}
              alt="avatar"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://placeholder.com/user';
              }}
            />
          </div>
          <div className="leet-profile-info">
            <div className="info-item">
              <User size={14} />
              <span className="value">@{matchedUser.username || 'Unknown'}</span>
            </div>
            <div className="info-item">
              <MapPin size={14} />
              <span className="value">
                {userProfile.countryName || 'Location unknown'}
              </span>
            </div>
            <div className="info-item">
              <Trophy size={14} />
              <span className="value">{userProfile.ranking || 'N/A'}</span>
            </div>
            <div className="info-item">
              <Star size={14} />
              <span className="value">
                {userProfile.reputation || 0}
              </span>
            </div>
          </div>

          <div className="badges-section">
            <h3>Badges</h3>
            <div className="badges-container">
              {badges.length > 0 ? (
                badges.slice(0, 4).map((badge, index) => (
                  <div key={index} className="badge-item">
                    <img
                      src={badge.icon?.startsWith('http') 
                        ? badge.icon 
                        : `https://leetcode.com${badge.icon || ''}`}
                      alt={badge.displayName || 'Badge'}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                ))
              ) : (
                <div className="no-badges">No badges earned yet</div>
              )}
            </div>
          </div>
        </div>

        <div className="card-right">
          <div className="problem-stats">
            <h3>Problem solved</h3>
            <div className="difficulty-boxes">
              <div className="diff-box easy">
                <div className="count">{getDifficultyCounts.easy}</div>
                <div className="label">Easy</div>
              </div>
              <div className="diff-box medium">
                <div className="count">{getDifficultyCounts.medium}</div>
                <div className="label">Medium</div>
              </div>
              <div className="diff-box hard">
                <div className="count">{getDifficultyCounts.hard}</div>
                <div className="label">Hard</div>
              </div>
            </div>
          </div>

          <div className="submission-graph">
            <h3>Recent Submissions</h3>
            {processSubmissionData.length > 0 ? (
              <ResponsiveContainer className="graph" width="110%" height={150}>
                <LineChart
                  className="graph2"
                  data={processSubmissionData}
                >
                  <CartesianGrid strokeDasharray="6 6" stroke="#eee" />
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
            ) : (
              <div className="no-submissions">No recent submissions</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default LeetCodeStats;