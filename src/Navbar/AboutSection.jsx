import React from 'react';
import './AboutSection.css'; // Import CSS
import ankit1 from "../assets/images/ankit1.jpg"
import karan from "../assets/images/karan.jpg"
import mohit from "../assets/images/mohit.jpg"
import logo from "../assets/images/logo.jpg"
import vijay from "../assets/images/vijay.jpg"
import shanu from "../assets/images/shanu.jpg"
import SlideBar from './SlideBar';

const AboutSection = () => {
  const teamMembers = [
    {
      id: 1,
      name: "Mohit gautam",

      image: mohit // Optional: Replace with actual image path
    },
    {
      id: 2,
      name: "Vijay mandal",

      image: vijay    },
    {
      id: 3,
      name: "Shanu Raj",

      image: shanu // Optional: Replace with actual image path
    },
    {
      id: 4,
      name: "Karan",

      image: karan // Optional: Replace with actual image path
    },
    {
      id: 5,
      name: "Ankit",

      image: ankit1 // Optional: Replace with actual image path
    },
    // Add more team members as needed
  ];

  return (
    <section className="about-section">
        <SlideBar />
        <div className="team-header">
      <img
        src={logo}
        alt="Tech Thinkers Logo"
        className="team-logo"
      />
      <h1>Tech Thinkers</h1>
    </div>
      <h2>Team Members</h2>
      <div className="team-members">
        {teamMembers.map((member) => (
          <div key={member.id} className="member-card">
            {console.log("member.image")}
            <img
              src={member.image}
              alt={member.name}
              className="member-image"
            />
            <h3>{member.name}</h3>
            <p className="role">{member.role}</p>
            <p className="bio">{member.bio}</p>
          </div>
        ))}

<div className="team-summary">
  <h2>About Tech Thinkers</h2>
  <p>
  We're a student team passionate about building collaborative tools for education. Our project *PeerPro* redefines remote coding by combining real-time editing, screen sharing, and group management in one platform – making teamwork seamless for students.  </p>
  <h3>Why PeerPro?</h3>
  <ul>
    <li>🚀 Live collaborative coding...</li>
    <li>🚀 Live collaborative coding (like Google Docs for devs)</li>
    <li>🎤 Integrated screen sharing + voice chat  </li>
    <li>🚀 Live collaborative coding...</li>
    <li>💻 100% web-based – no installations needed </li>
    {/* Add other bullet points */}
  </ul>
</div>
      </div>
    </section>
  );
};

export default AboutSection;