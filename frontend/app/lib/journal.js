const db =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : process.env.DB_URL;

const sampleSummary = [true, false, true, false, true, true, true];

export async function getWeeklyJournalSummary() {
  return null;
}

export async function createEntry({ content }) {
  const res = await fetch(`${db}/thoughts`, {
    method: 'POST',
    body: JSON.stringify(content),
  });

  const response = await res.json();

  return response;
}

export async function getEntry({ entryID }) {
  const res = await fetch(`${db}/thoughts/${entryID}`, { method: 'GET' });
  const entry = await res.json();
  return entry;
}

export async function getAllJournalEntries() {
  const res = await fetch(`${db}/history`, { method: 'GET' });

  const entries = res.json();

  return entries;
}
