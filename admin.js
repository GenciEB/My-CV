const statusEl = document.getElementById('status');
const entriesEl = document.getElementById('entries');

const renderEntry = (entry) => {
  const article = document.createElement('article');
  article.className = 'entry';
  article.innerHTML = `
    <h3>
      <span>${entry.name}</span>
      <span>${new Date(entry.timestamp).toLocaleString()}</span>
    </h3>
    <div class="meta">
      <span>${entry.email}</span>
      <span>${entry.subject}</span>
    </div>
    <p>${entry.message.replace(/\n/g, '<br>')}</p>
  `;
  return article;
};

const loadEntries = async () => {
  statusEl.textContent = 'Refreshing…';
  try {
    const response = await fetch('/api/contact');
    if (!response.ok) {
      throw new Error('Unable to load submissions');
    }
    const data = await response.json();
    entriesEl.innerHTML = '';
    if (!data.length) {
      entriesEl.innerHTML = '<p>No submissions yet.</p>';
    } else {
      data.forEach((entry) => {
        entriesEl.appendChild(renderEntry(entry));
      });
    }
    statusEl.textContent = `Loaded ${data.length} submission${data.length !== 1 ? 's' : ''}.`;
  } catch (error) {
    statusEl.textContent = 'Failed to load submissions.';
    console.error(error);
  }
};

loadEntries();
