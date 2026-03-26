function StudentCard({ name, rollNo, marks }) {
  const total = marks.reduce((sum, m) => sum + m, 0);
  const percentage = (total / (marks.length * 100)) * 100;

  return (
    <div className="card">
      <h2>Name: {name}</h2>
      <p>Roll No: {rollNo}</p>
      <p>Marks: {marks.join(", ")}</p>
      <p>Total: {total}</p>
      <p><b>Percentage:</b> {percentage.toFixed(2)}%</p>
    </div>
  );
}

export default StudentCard;
