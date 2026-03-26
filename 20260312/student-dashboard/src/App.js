import React from "react";

function App() {
  const subjects = [
    { name: "Mathematics", progress: "82%", status: "On Track" },
    { name: "Computer Science", progress: "91%", status: "Excellent" },
    { name: "Physics", progress: "74%", status: "Improving" },
    { name: "English", progress: "88%", status: "Strong" }
  ];

  return (
    <div>
      <h1>Student Dashboard</h1>
      <h3>Course Progress</h3>

      {subjects.map((sub, index) => (
        <div key={index}>
          <h4>{sub.name}</h4>
          <p>Progress: {sub.progress}</p>
          <p>Status: {sub.status}</p>
        </div>
      ))}
    </div>
  );
}

export default App;