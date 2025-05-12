const baseURL = '';

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
  const res = await fetch(`${baseURL}/members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ groupName, members })
  });
  const data = await res.json();
  alert(data.message);
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
  const res = await fetch(`${baseURL}/add-expense`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ groupName, paidBy, amount, description })
  });
  const data = await res.json();
  alert(data.message);
};

// Show Split Summary
document.getElementById('showSplit').onclick = async () => {
  const groupName = prompt('Enter Group Name to Show Summary:');
  if (!groupName) return;
  const res = await fetch(`${baseURL}/split-expenses/${encodeURIComponent(groupName)}`);
  if (!res.ok) {
    alert('Error: ' + (await res.text()));
    return;
  }
  const data = await res.json();
  document.getElementById('result').innerHTML = `
    <div class="summary-card">
      <h3>${groupName} Summary</h3>
      <p><strong>Total:</strong> ₹${data.total}</p>
      <p><strong>Per Person:</strong> ₹${data.perPerson}</p>
      <ul>
        ${Object.entries(data.balances)
          .map(([member, bal]) => `<li>${member}: ₹${bal}</li>`)
          .join('')}
      </ul>
    </div>`;
};

// View History
document.getElementById('showHistory').onclick = async () => {
  const groupName = prompt('Enter Group Name to View History:');
  if (!groupName) return;
  const res = await fetch(`${baseURL}/history`);
  if (!res.ok) {
    alert('Error: ' + (await res.text()));
    return;
  }
  const all = await res.json();
  const entries = all.filter(e => e.groupName === groupName);
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
