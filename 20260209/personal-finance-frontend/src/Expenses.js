import React, { useEffect, useState } from "react";
import axios from "axios";

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios.get("http://localhost:5000/api/expenses")
      .then((res) => setExpenses(res.data))
      .catch((err) => console.error(err));
  }, []);

  const addExpense = (e) => {
    e.preventDefault();

    if (!name || !amount) {
      setMessage("All fields are required");
      return;
    }

    axios.post("http://localhost:5000/api/expenses", {
      name,
      amount
    }).then((res) => {
      setExpenses([...expenses, res.data]);
      setName("");
      setAmount("");
      setMessage("Expense added successfully");
    });
  };

  return (
    <div className="expenses">
      <h2>Expenses</h2>

      {message && <p className="message">{message}</p>}

      <form className="expense-form" onSubmit={addExpense}>
        <input
          type="text"
          placeholder="Expense Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <button type="submit">Add Expense</button>
      </form>

      <ul className="expense-list">
        {expenses.map((exp) => (
          <li key={exp.id}>
            <span>{exp.name}</span>
            <span className="amount">₹{exp.amount}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Expenses;
