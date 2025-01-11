const db =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : process.env.DB_URL;

/** @todo create helper functions to set mood
 */

/**
 * Set user's mood for today
 * @param {('happy' | 'sad' | 'upset')} mood - User inputted mood
 * @param {string} userId - User ID
 */
export async function setMood(mood) {
  const res = await fetch(`${db}/inputMood`, { method: 'POST', body: mood });

  const response = res.json();

  return response;
}

export async function getWeeklyMoodSummary() {
  const res = await fetch(`${db}/view-mood-chart`, { method: 'GET' });

  const weeklyMoodSummary = res.json();

  return weeklyMoodSummary;
}
