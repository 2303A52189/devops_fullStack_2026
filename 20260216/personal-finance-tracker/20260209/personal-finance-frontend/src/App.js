import React from "react";
import "./App.css";     // ✅ THIS LINE WAS MISSING
import Expenses from "./Expenses";

function App() {
  return (
    <div className="App">
      <h1>Personal Finance Tracker</h1>
      <Expenses />
    </div>
  );
}

export default App;
