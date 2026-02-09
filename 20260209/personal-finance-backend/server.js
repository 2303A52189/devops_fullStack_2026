const express = require("express");
const cors = require("cors");

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

let expenses = [
  { id: 1, name: "Groceries", amount: 50 },
  { id: 2, name: "Gas", amount: 30 }
];

app.get("/api/expenses", (req, res) => {
  res.json(expenses);
});

app.post("/api/expenses", (req, res) => {
  const { name, amount } = req.body;

  const newExpense = {
    id: expenses.length + 1,
    name,
    amount
  };

  expenses.push(newExpense);
  res.status(201).json(newExpense);
});

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});
