import React from "react";
import {
  Github,
  Linkedin,
  Code2,
  ArrowRight,
  LayoutDashboard,
  BookOpenCheck,
  BrainCog,
  BriefcaseBusiness,
  Trophy,
  Users,
  GithubIcon,
  LinkedinIcon,
} from "lucide-react";
import "./ModernHomePage.css";
import Header from "./Header";
import Footer from "./Footer";
import { useNavigate, Link } from "react-router-dom";
import WhatsAppJoinButton from "../ui/WhatsAppJoinButton";

const ModernHomePage = () => {
  const navigate = useNavigate();
  const handleRedirect = () => {
    navigate("/auth");
  };

  return (
    <div className="page-container ">
      <div className="gradient-blob"></div>
      <div className="gradient-blob2"></div>

      <Header />

      <main>
        <section className="hero">
          <div className="hero-content">
            <h1 className="animated-gradient">
              Showcase Your
              <div className="rotating-text">
                <span className="dev-icons">
                  <Linkedin className="linkedin" size={24} />
                  <Code2 className="leetcode" size={24} />
                  <Github className="github" size={24} />
                </span>
              </div>
            </h1>
            <p className="hero-subtitle glass-effect-dashbord">
              DevHub is the ultimate platform to showcase your developer
              achievements from GitHub, LinkedIn, and LeetCode in one unified
              profile. Get personalized AI-driven career guidance and discover
              top internship opportunities tailored to your skill set.
            </p>

            <div className="cta-group">
              <button
                className="primary-cta glass-effect-dashbord bg-gradient-to-r from-red-600 to-red-400 hover:from-red-700 hover:to-red-400"
                onClick={handleRedirect}
              >
                Get Started <ArrowRight size={16} />
              </button>
              <div className="stats glass-effect-dashbord">
                <div className="stat">
                  <Trophy size={20} />
                  <div>
                    <h4>10K+</h4>
                    <p>Developers</p>
                  </div>
                </div>
                <div className="stat">
                  <Users size={20} />
                  <div>
                    <h4>500+</h4>
                    <p>Recruiters</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="hero-visual glass-effect-dashbord">
            <div className="code-preview">
              <div className="code-header">
                <span className="dot dot1"></span>
                <span className="dot dot2"></span>
                <span className="dot dot3"></span>
              </div>
              <pre>
                <code>
                  {`class Developer {
  skills = ['React', 'Node.js']
  leetcode = 200
  github = 500
                  
  getJobReadiness() {
    return "95%"
  }
}`}
                </code>
              </pre>
            </div>
          </div>
        </section>

        <WhatsAppJoinButton />

        <section className="about-devhub glass-effect-dashbord mx-4 my-12 p-8 rounded-xl">
          <h2 className="text-3xl font-bold mb-6 text-center">About DevHub</h2>
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1 text-gray-700 leading-relaxed">
              <p className="mb-4">
                DevHub was created with a single mission: to empower developers
                to tell their story beyond just a traditional resume. In today's
                competitive landscape, your contributions on platforms like
                GitHub, your professional networking on LinkedIn, and your
                problem-solving prowess on LeetCode are what truly define your
                capabilities.
              </p>
              <p className="mb-4">
                Our platform aggregates these disparate data points into a
                beautiful, shareable dashboard that gives recruiters a holistic
                view of your skills. But we don't stop there. Using advanced AI
                analysis, we provide you with actionable insights into your job
                readiness and suggest tailored learning paths to help you bridge
                any skill gaps.
              </p>
              <p>
                Whether you're looking for your first internship or aiming for a
                senior role at a top tech company, DevHub provides the tools,
                the community, and the insights you need to succeed in your
                career journey. Join thousands of developers who are already
                using DevHub to elevate their professional presence.
              </p>
            </div>
            <div className="flex-1 flex justify-center">
              <img
                src="/robot.png"
                alt="DevHub AI Career Assistant"
                className="max-w-sm rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </section>

        <section id="features" className="features">
          <h2 className="">Explore Platform Features</h2>
          <div className="features-grid">
            {[
              {
                icon: <LayoutDashboard size={24} />,
                title: "Unified Dashboard",
                description:
                  "Showcase your work and track your developer progress across GitHub, LinkedIn, and LeetCode in one shareable link.",
                path: "/",
              },
              {
                icon: <BookOpenCheck size={24} />,
                title: "Distraction-Free Learning",
                description:
                  "Elevate your skills with curated courses and resources directly on DevHub, designed for focused career growth.",
                path: "/learn",
              },
              {
                icon: <BrainCog size={24} />,
                title: "AI Interview Practice",
                description:
                  "Prepare for technical interviews with AI-generated mock sessions, personalized feedback, and performance tracking.",
                path: "/interview",
              },
              {
                icon: <BriefcaseBusiness size={24} />,
                title: "Internship Matching",
                description:
                  "Connect with top-tier internship opportunities that match your verified skills and receive instant email alerts.",
                path: "/internships",
              },
            ].map((feature, index) => (
              <Link
                key={index}
                to={feature.path}
                className="feature-card glass-effect-dashbord cursor-pointer transition-transform hover:scale-[1.02] no-underline"
              >
                <div className="feature-icon mb-2">{feature.icon}</div>
                <h3 className="font-bold text-gray-700 text-lg">
                  {feature.title}
                </h3>
                <p className="text-xs font-semibold text-gray-600">
                  {feature.description}
                </p>
                <div className="feature-progress mt-3">
                  <div
                    className="progress-bar bg-blue-500 h-1 rounded"
                    style={{ width: `${(index + 1) * 25}%` }}
                  ></div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section id="analytics" className="analytics glass-effect-dashbord">
          <h2>Your Developer Analytics</h2>
          <div className="analytics-grid">
            <div className="analytics-card">
              <div className="analytics-header">
                <h3 className="font-bold text-gray-500">
                  Selection Percentage
                </h3>
                <div className="score">95%</div>
              </div>
              <div className="progress-ringss">
                <div className="rings">
                  <svg viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="var(--github)"
                      strokeWidth="2"
                      strokeDasharray="100, 100"
                    />
                  </svg>
                  <GithubIcon className="HomeIcon " />
                  <span>GitHub</span>
                </div>

                <div className="rings">
                  <svg viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="var(--leetcode)"
                      strokeWidth="2"
                      strokeDasharray="85, 100"
                    />
                  </svg>
                  <Code2 className="HomeIcon text-green-600" />
                  <span>LeetCode</span>
                </div>

                <div className="rings">
                  <svg viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="var(--linkedin)"
                      strokeWidth="2"
                      strokeDasharray="90, 100"
                    />
                  </svg>
                  <LinkedinIcon className="HomeIcon text-blue-500" />
                  <span>LinkedIn</span>
                </div>
              </div>
            </div>
            <div className="recommendations">
              <h3>Next Steps</h3>
              <ul className="todo-list">
                <li className="completed">
                  <span className="checkbox">✓</span>
                  Complete GitHub Profile
                </li>

                <li className="completed">
                  <span className="checkbox">✓</span>
                  Solve DSA problems with road map in 90 days
                </li>
                <li className="completed">
                  <span className="checkbox">✓</span>
                  Update LinkedIn for Job
                </li>
                <li className="completed">
                  <span className="checkbox">✓</span>
                  Collaborate with friends & track progress
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ModernHomePage;
