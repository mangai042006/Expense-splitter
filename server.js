const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let groups = {};
let history = [];

// Create group + members
app.post('/members', (req, res) => {
  const { groupName, members } = req.body;
  if (!groupName || !Array.isArray(members) || members.length === 0) {
    return res.status(400).json({ error: 'Group name and members required!' });
  }
  groups[groupName] = { members, expenses: [] };
  res.json({ message: `Group '${groupName}' created!` });
});

// Add an expense
app.post('/add-expense', (req, res) => {
  const { groupName, paidBy, amount, description } = req.body;
  const group = groups[groupName];
  if (!group) return res.status(404).json({ error: 'Group not found!' });

  const entry = {
    groupName,
    paidBy,
    amount,
    description,
    date: new Date(),
    members: group.members
  };

  group.expenses.push(entry);
  history.push(entry);
  res.json({ message: 'Expense added!' });
});

// Split summary
app.get('/split-expenses/:groupName', (req, res) => {
  const group = groups[req.params.groupName];
  if (!group) return res.status(404).json({ error: 'Group not found!' });

  const total = group.expenses.reduce((sum, e) => sum + e.amount, 0);
  const perPerson = total / group.members.length;
  const balances = {};

  group.members.forEach(m => {
    const paid = group.expenses
      .filter(e => e.paidBy === m)
      .reduce((sum, e) => sum + e.amount, 0);
    balances[m] = (paid - perPerson).toFixed(2);
  });

  res.json({ total, perPerson, balances });
});

// Full history
app.get('/history', (req, res) => {
  res.json(history);
});

app.listen(3000, () => {
  console.log('✅ Server running at http://localhost:3000');
});
