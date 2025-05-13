const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let groups = {};
let history = [];

// Create a new group
app.post('/members', (req, res) => {
  const { groupName, members } = req.body;
  if (!groupName || !Array.isArray(members) || members.length === 0) {
    return res.status(400).json({ error: 'Group name and members are required.' });
  }
  groups[groupName] = {
    members,
    expenses: []
  };
  res.json({ message: `Group '${groupName}' created successfully!` });
});

// Add a new expense
app.post('/add-expense', (req, res) => {
  const { groupName, paidBy, amount, description } = req.body;
  const group = groups[groupName];
  if (!group) {
    return res.status(404).json({ error: 'Group not found!' });
  }

  const entry = {
    groupName,
    paidBy,
    amount: parseFloat(amount),
    description,
    date: new Date(),
    members: group.members
  };

  group.expenses.push(entry);
  history.push(entry);

  res.json({ message: 'Expense added successfully!' });
});

// Split summary for a group
app.get('/split-expenses/:groupName', (req, res) => {
  const groupName = req.params.groupName;
  const group = groups[groupName];
  if (!group) {
    return res.status(404).json({ error: 'Group not found!' });
  }

  const total = group.expenses.reduce((sum, e) => sum + e.amount, 0);
  const perPerson = total / group.members.length;

  const balances = {};

  // Initialize balances
  group.members.forEach(member => {
    balances[member] = 0;
  });

  // Calculate payments
  group.expenses.forEach(expense => {
    const split = expense.amount / group.members.length;
    group.members.forEach(member => {
      if (member === expense.paidBy) {
        balances[member] += expense.amount - split;
      } else {
        balances[member] -= split;
      }
    });
  });

  // Round balances to 2 decimal places
  for (const member in balances) {
    balances[member] = balances[member].toFixed(2);
  }

  res.json({ total, perPerson, balances });
});

// Get all expense history
app.get('/history', (req, res) => {
  res.json(history);
});

// Start server
app.listen(3000, () => {
  console.log('✅ Server running at http://localhost:3000');
});
