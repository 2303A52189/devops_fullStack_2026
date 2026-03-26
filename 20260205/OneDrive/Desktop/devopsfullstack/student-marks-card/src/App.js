import React from "react";
import StudentCard from "./StudentCard";

function App() {
  //  Student details stored in parent
  const student = {
    name: "Rahul Sharma",
    rollNo: "21CS045",
    marks: 86
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Student Marks Card</h1>

      {/*  Passing data as props */}
      <StudentCard
        name={student.name}
        rollNo={student.rollNo}
        marks={student.marks}
      />
    </div>
  );
}

export default App;