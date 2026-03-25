import React, { useEffect, useState } from "react";
import {
  Github,
  Code2,
  Linkedin,
  Link2,
  ArrowUpRight,
  GitFork,
  Users,
  Loader,
  Share2,
} from "lucide-react";
import "./dashboard.css";
import { useParams } from "react-router-dom";
import useFetchPlatformData from "../../api2/data";
import GitHubCard from "../../api2/github";
import LeetCodeStats from "../../api2/leetcode";
import LinkedInProfile from "../../api2/linkedin";
import { MajorProject } from "../../api2/maijorproject";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const MetricCard = ({
  icon: Icon,
  logo,
  title,
  value,
  subValue,
  color,
  details,
  loading,
  link,
}) => (
  <div className="card">
    {loading ? (
      <div className="loading-state flex flex-col items-center justify-center py-4">
        {logo ? (
          <>
            <img
              src={logo}
              alt={title}
              className="w-10 h-10 opacity-20 animate-pulse mb-2"
            />
            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium animate-pulse">
              {!link ? "Data not available" : "Fetching data..."}
            </span>
          </>
        ) : (
          <Loader className="animate-spin" />
        )}
      </div>
    ) : (
      <>
        <div className="card-header">
          <h3 className="card-title">{title}</h3>
          <div
            className={`icon-bg ${color} cursor-pointer flex items-center justify-center p-2`}
            onClick={() => {
              if (link) {
                let url;
                switch (title) {
                  case "GitHub":
                    url = `https://github.com/${link}`;
                    break;
                  case "Leetcode":
                    url = `https://leetcode.com/${link}`;
                    break;
                  case "LinkedIn":
                    url = `https://www.linkedin.com/in/${link}`;
                    break;
                  default:
                    return;
                }
                window.open(url, "_blank");
              }
            }}
          >
            {logo ? (
              <img
                src={logo}
                alt={title}
                className="w-5 h-5 object-contain brightness-0 invert"
              />
            ) : (
              <Icon />
            )}
          </div>
        </div>
        <div className="straight">
          <div className="card-value">{value}</div>
          <div className="card-subvalue">{subValue}</div>
        </div>
        {details && (
          <div className="card-details">
            {details.map((detail, index) => (
              <span key={index}>
                <detail.icon />
                {detail.value} {detail.label}
              </span>
            ))}
          </div>
        )}
      </>
    )}
  </div>
);

export default function UserData() {
  const { uid } = useParams();

  const { linkedinData, githubData, leetcodeData } = useFetchPlatformData(uid);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);

  const shareProfileUrl = `https://devhub1.vercel.app/dashboard/${uid}`;

  const handleShareProfile = () => {
    navigator.clipboard
      .writeText(shareProfileUrl)
      .then(() => {
        setShowCopiedMessage(true);
        setTimeout(() => setShowCopiedMessage(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (!uid) return; // uid comes from URL

      const storageKey = `dashboard_user_data_${uid}`;
      const cachedData = localStorage.getItem(storageKey);

      if (cachedData) {
        try {
          const parsedData = JSON.parse(cachedData);
          setUserData(parsedData);
          setLoading(false);
        } catch (e) {
          console.error("Error parsing cached data", e);
        }
      }

      try {
        const db = getFirestore();
        const docRef = doc(db, "profiles", uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData(data);
          localStorage.setItem(storageKey, JSON.stringify(data));
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [uid]);

  const getMetrics = () => {
    return [
      {
        icon: Github,
        logo: "/github.png",
        title: "GitHub",
        value: githubData?.profile?.public_repos || "0",
        subValue: "Public Repository",
        color: "orange",
        details: [
          {
            icon: GitFork,
            value: githubData?.profile?.followers || "0",
            label: "Followers",
          },
          {
            icon: ArrowUpRight,
            value: githubData?.profile?.following || "0",
            label: "Following",
          },
        ],
        loading: !githubData,
        link: githubData?.profile?.username,
      },
      {
        icon: Code2,
        logo: "/leetcode.png",
        title: "Leetcode",
        value:
          leetcodeData?.matchedUser?.submitStats?.acSubmissionNum?.[0]?.count ||
          "0",
        subValue: "Problems Solved",
        color: "yellow",
        details: [
          {
            icon: ArrowUpRight,
            value: leetcodeData?.matchedUser?.profile?.ranking || "N/A",
            label: "Ranking",
          },
          {
            icon: ArrowUpRight,
            value: leetcodeData?.matchedUser?.profile?.reputation || "0",
            label: "Reputation",
          },
        ],
        loading: !leetcodeData,
        link: leetcodeData?.matchedUser?.username,
      },
      {
        icon: Linkedin,
        logo: "/linkedin.png",
        title: "LinkedIn",
        value: linkedinData?.Skills?.length || "0",
        subValue: "Skills",
        color: "blue",
        details: [
          {
            icon: Users,
            value: linkedinData?.Position?.length || "0",
            label: "Positions",
          },
          {
            icon: Users,
            value: linkedinData?.Education?.length || "0",
            label: "Education",
          },
        ],
        loading: !linkedinData,
        link: linkedinData?.Username,
      },
      {
        icon: Link2,
        title: "Projects",
        value: userData?.projects?.length || "0",
        subValue: "Total Projects",
        color: "green",
        loading: loading,
      },
    ];
  };

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const components = [
    <GitHubCard data={githubData} />,
    <LeetCodeStats profile={leetcodeData} />,
    <LinkedInProfile demoData={linkedinData} />,
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % components.length);
        setIsVisible(true);
      }, 500);
    }, 5000);

    return () => clearInterval(interval);
  }, [components.length]);

  return (
    <div className="dashboard-container bg-[#e9effe]">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold mb-7">
            Hello! {userData?.name || "User"}
          </h1>
          <p className="subtitle">Welcome back! Check your progress here</p>
        </div>
        <div className="relative">
          <button
            onClick={handleShareProfile}
            className="p-2 rounded-full bg-blue-500 text-white  hover:bg-blue-700 "
            title="Share Profile"
          >
            <Share2 size={20} />
          </button>
          {showCopiedMessage && (
            <div className="absolute right-0 mt-2 px-3 py-1  bg-gray-800 text-white text-sm rounded shadow-lg w-max">
              URL copied!
            </div>
          )}
        </div>
      </div>

      <div className="metrics-grid">
        {getMetrics().map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      <div className="projects-grid">
        <div className={`card ${isVisible ? "fade-in" : "fade-out"}`}>
          {components[currentIndex]}
        </div>

        <div className="card">
          <MajorProject userId={uid} projects={userData?.projects} />
        </div>
      </div>
    </div>
  );
}
