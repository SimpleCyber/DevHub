// maijorproject.js
import React, { useState, useEffect } from "react";
import { Calendar } from 'lucide-react';
import { auth } from "../firebase";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import "./maijorproject.css"

const MajorProjectItem = ({ name, date, link, isActive }) => {
  return (
    <div className={`project-card ${isActive ? "active" : ""}`}>
      <div className="project-header">
        <h2 className="project-title">
        Projects : <a href={link} target="_blank" rel="noopener noreferrer">
            {name}
          </a>
        </h2>
        <div className="project-date">
          <Calendar className="date-icon" />
          <span>{date}</span>
        </div>
      </div>
      <div className="project-content">
        <iframe
          src={link}
          title={name}
          className="project-iframe"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          loading="lazy"
        />
      </div>
    </div>
  );
};

export const MajorProject = ({ userId }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      // Determine which userId to use
      const uidToUse = userId || (auth.currentUser ? auth.currentUser.uid : null);
      
      if (!uidToUse) return;
  
      const db = getFirestore();
      const docRef = doc(db, "profiles", uidToUse);
  
      try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.projects && data.projects.length > 0) {
            setProjects(data.projects);
          }
        }
      } catch (err) {
        console.error("Failed to fetch projects data", err);
      }
    };
  
    fetchProjects();
  }, [userId]); // Add userId to dependency array
  
  const nextProject = () => {
    setCurrentIndex((prev) => (prev + 1) % projects.length);
  };

  const prevProject = () => {
    setCurrentIndex((prev) => (prev - 1 + projects.length) % projects.length);
  };

  if (projects.length === 0) {
    return <div>No projects found</div>;
  }

  return (
    <div className="major-projects-container">
      <div className="carousel-container">
        <button className="carousel-button prev" onClick={prevProject}>
          &#8592;
        </button>
        <div className="carousel-content">
          {projects.map((project, index) => (
            <MajorProjectItem
              key={index}
              name={project.name}
              date={project.date}
              link={project.url}
              isActive={index === currentIndex}
            />
          ))}
        </div>
        <button className="carousel-button next" onClick={nextProject}>
          &#8594;
        </button>
      </div>
      <div className="carousel-indicators">
        {projects.map((_, index) => (
          <button
            key={index}
            className={`indicator ${index === currentIndex ? "active" : ""}`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};