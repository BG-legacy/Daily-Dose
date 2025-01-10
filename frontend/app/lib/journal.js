const sampleSummary = [true, false, true, false, true, true, true]

export async function getWeeklyJournalSummary() {
  return sampleSummary
}

export async function getEntry() {
  return sampleEntries[0]
}

const sampleEntries = [
  {
    "id": "test-user-1736444441012#2025-01-09T17:40:52.038Z",
    "content": "Feeling a bit anxious about tomorrow's presentation...",
    "date": "2025-01-09T17:40:52.038Z"
  },
  {
    "id": "test-user-1736444441012#2025-01-09T17:40:48.784Z",
    "content": "Had a great breakthrough at work today! Everything...",
    "date": "2025-01-09T17:40:48.784Z"
  },
  {
    "id": "test-user-1736444441012#2025-01-09T17:40:43.756Z",
    "content": "Today was challenging but productive. I managed to...",
    "date": "2025-01-09T17:40:43.756Z"
  }
]


export async function getAllJournalEntries() {
  return sampleEntries
}
