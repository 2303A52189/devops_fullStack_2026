import StudentCard from "./components/StudentCard";
import "./App.css";

function App() {
  const students = [
    {
      name: "Rahul",
      rollNo: 101,
      marks: [85, 78, 90]
    },
    {
      name: "Anita",
      rollNo: 102,
      marks: [92, 88, 95]
    },
    {
      name: "Kiran",
      rollNo: 103,
      marks: [65, 70, 72]
    },
    {
      name: "Sneha",
      rollNo: 104,
      marks: [76, 82, 80]
    }
  ];

  return (
    <div className="app">
      <h1 className="title">Student Marks Card</h1>

      <div className="card-container">
        {students.map((student, index) => (
          <StudentCard
            key={index}
            name={student.name}
            rollNo={student.rollNo}
            marks={student.marks}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
