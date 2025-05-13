const baseURL = 'http://localhost:3000'; // Set your backend URL here

// Function to load groups and history from localStorage
const loadDataFromLocalStorage = () => {
  const groups = JSON.parse(localStorage.getItem('groups')) || {};
  const history = JSON.parse(localStorage.getItem('history')) || [];
  return { groups, history };
};

// Function to save groups and history to localStorage
const saveDataToLocalStorage = (groups, history) => {
  localStorage.setItem('groups', JSON.stringify(groups));
  localStorage.setItem('history', JSON.stringify(history));
};

// Create Group
document.getElementById('saveMembers').onclick = async () => {
  const groupName = prompt('Enter Group Name:');
  if (!groupName) return;
  const members = document.getElementById('membersInput').value
    .split(',').map(m => m.trim()).filter(m => m);

  if (members.length === 0) {
    alert('Please enter at least one member.');
    return;
  }

  let { groups, history } = loadDataFromLocalStorage();

  if (groups[groupName]) {
    alert(`Group '${groupName}' already exists.`);
    return;
  }

  groups[groupName] = {
    members,
    expenses: []
  };

  saveDataToLocalStorage(groups, history);
  alert(`Group '${groupName}' created successfully!`);
};

// Add Expense
document.getElementById('addExpense').onclick = async () => {
  const groupName = prompt('Enter Group Name for Expense:');
  if (!groupName) return;

  const paidBy = document.getElementById('paidBy').value.trim();
  const amount = parseFloat(document.getElementById('amount').value);
  const description = document.getElementById('description').value.trim();

  if (!paidBy || isNaN(amount) || !description) {
    alert('Fill all expense fields.');
    return;
  }

  let { groups, history } = loadDataFromLocalStorage();

  const group = groups[groupName];
  if (!group) {
    alert('Group not found!');
    return;
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

  saveDataToLocalStorage(groups, history);
  alert('Expense added successfully!');
};

// Show Split Summary
document.getElementById('showSplit').onclick = async () => {
  const groupName = prompt('Enter Group Name to Show Split:');
  if (!groupName) return;

  let { groups } = loadDataFromLocalStorage();
  const group = groups[groupName];

  if (!group) {
    alert('Group not found!');
    return;
  }

  const total = group.expenses.reduce((sum, e) => sum + e.amount, 0);
  const perPerson = total / group.members.length;

  const balances = {};

  group.members.forEach(member => {
    balances[member] = 0;
  });

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

  for (const member in balances) {
    balances[member] = balances[member].toFixed(2);
  }

  const summaryHTML = `
    <div class="summary-card">
      <h3>${groupName} — Split Summary</h3>
      <p><strong>Total:</strong> ₹${total.toFixed(2)}</p>
      <p><strong>Per Person:</strong> ₹${perPerson.toFixed(2)}</p>
      <ul>
        ${Object.entries(balances).map(([name, bal]) => `<li>${name}: ₹${bal}</li>`).join('')}
      </ul>
    </div>
  `;

  document.getElementById('result').innerHTML = summaryHTML;
};

// View History
document.getElementById('showHistory').onclick = async () => {
  const groupName = prompt('Enter Group Name to View History:');
  if (!groupName) return;

  let { history } = loadDataFromLocalStorage();
  const entries = history.filter(e => e.groupName === groupName);

  if (entries.length === 0) {
    document.getElementById('result').innerHTML = `<div class="history-card"><p>No history for '${groupName}'.</p></div>`;
    return;
  }

  document.getElementById('result').innerHTML = entries
    .map(e => {
      const share = (e.amount / e.members.length).toFixed(2);
      return `
        <div class="history-card">
          <h3>${groupName} — ${new Date(e.date).toLocaleString()}</h3>
          <p><strong>Paid by:</strong> ${e.paidBy} ₹${e.amount} (${e.description})</p>
          <ul>
            ${e.members
              .filter(m => m !== e.paidBy)
              .map(m => `<li>${m} owes ${e.paidBy} ₹${share}</li>`)
              .join('')}
          </ul>
        </div>`;
    })
    .join('');
};
