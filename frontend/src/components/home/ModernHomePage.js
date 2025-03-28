import React from "react";
import {
  Github,
  Linkedin,
  Code2,
  FileText,
  ArrowRight,
  Trophy,
  Users,
} from "lucide-react";
import "./ModernHomePage.css";
import Header from "./Header";
import Footer from "./Footer";

const ModernHomePage = () => {
  return (
    <div className="page-container bg-[#e9effe]">
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
              <button className="primary-cta glass-effect-dashbord">
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

        <section id="features" className="features">
          <h2>Platform Features</h2>
          <div className="features-grid">
            {[
              {
                icon: <Github size={24} />,
                title: "GitHub Integration",
                description:
                  "Sync and showcase your repositories with real-time updates",
              },
              {
                icon: <Code2 size={24} />,
                title: "LeetCode Progress",
                description: "Track your problem-solving journey and rankings",
              },
              {
                icon: <Linkedin size={24} />,
                title: "LinkedIn Sync",
                description:
                  "Keep your professional profile automatically updated",
              },
              {
                icon: <FileText size={24} />,
                title: "Smart Resume",
                description:
                  "AI-powered resume generator based on your activity",
              },
            ].map((feature, index) => (
              <div key={index} className="feature-card glass-effect-dashbord">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <div className="feature-progress">
                  <div
                    className="progress-bar"
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
                <h3>Job Readiness Score</h3>
                <div className="score">95%</div>
              </div>
              <div className="progress-rings">
                <div className="ring">
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
                    <text x="18" y="20.35" className="percentage">
                      85%
                    </text>
                  </svg>
                  <span>GitHub</span>
                </div>

                <div className="ring">
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
                    <text x="18" y="20.35" className="percentage">
                      75%
                    </text>
                  </svg>
                  <span>LeetCode</span>
                </div>

                <div className="ring">
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
                    <text x="18" y="20.35" className="percentage">
                      75%
                    </text>
                  </svg>
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
