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
import { useNavigate } from "react-router-dom";
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
              One platform to showcase all your developer achievements and get
              personalized career guidance.
            </p>
            
            <div className="cta-group">
              <button
                className="primary-cta glass-effect-dashbord"
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

        <section id="features" className="features">
          <h2 className="">Platform Features</h2>
<div className="features-grid">
  {[
    {
      icon: <LayoutDashboard size={24} />,
      title: "Dashboard",
      description:
        "Showcase your work, track GitHub, LinkedIn, and LeetCode all shareable in one place.",
      url: `https://devhub1.vercel.app/`,
    },
    {
      icon: <BookOpenCheck size={24} />,
      title: "Learn",
      description:
        "Distraction-free learning. Access curated courses directly on the platform.",
      url: "https://devhub1.vercel.app/learn",
    },
    {
      icon: <BrainCog size={24} />,
      title: "Interview Practice",
      description:
        "Generate mock interviews using AI, get feedback, and track your preparation progress.",
      url: "https://devhub1.vercel.app/interview",
    },
    {
      icon: <BriefcaseBusiness size={24} />,
      title: "Internships",
      description:
        "Get matched with top internships based on your skills and receive email alerts.",
      url: "https://devhub1.vercel.app/internships",
    },
  ].map((feature, index) => (
    <div
      key={index}
      className="feature-card glass-effect-dashbord cursor-pointer transition-transform hover:scale-[1.02]"
      onClick={() => window.location.href = feature.url}
    >
      <div className="feature-icon mb-2">{feature.icon}</div>
      <h3 className="font-bold text-gray-700 text-lg">{feature.title}</h3>
      <p className="text-xs font-semibold text-gray-600">{feature.description}</p>
      <div className="feature-progress mt-3">
        <div
          className="progress-bar bg-blue-500 h-1 rounded"
          style={{ width: `${(index + 1) * 25}%` }}
        ></div>
      </div>
    </div>
  ))}
</div>

        </section>

        

        <section id="analytics" className="analytics glass-effect-dashbord">
          <h2>Your Developer Analytics</h2>
          <div className="analytics-grid">
            <div className="analytics-card">
              <div className="analytics-header">
                <h3 className="font-bold text-gray-500">Selection Percentage</h3>
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
                  <Code2  className="HomeIcon text-green-600"/>
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
                  <LinkedinIcon className="HomeIcon text-blue-500"/>
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
