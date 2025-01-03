/**
 * @typedef {Object} Quote
 * @property {string} userID
 * @property {string} quoteID
 * @property {string} quote
 * @property {string} creationDate
 */

const sampleQuote = {
  userID: 'jan!',
  quoteID: "1",
  quote: 'Be the change you want to see.',
  creationDate: 'Mon Dec 30 2024 21:05:42 GMT-0800 (Pacific Standard Time'
}


/**
 * Retrieve a quote by userID or quoteID
 * @param {string} [userID]
 * @param {string} [quoteID]
 * @param {string} creationDate
 * @returns {Quote}
 */
export default async function getQuote({ userID, quoteID, creationDate }) {
  if (!userID && !quoteID) {
    throw new Error('Missing user/quote id.')
  }

  var quote = null

  if (quoteID) {
    // get quote based on id
    quote = sampleQuote
  }

  if (userID && creationDate) {
    // get quote based on user and date, ex. get todays quote or get yesterdays quote
    quote = sampleQuote
  }
  return quote
}

