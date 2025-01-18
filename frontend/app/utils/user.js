const db =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : process.env.DB_URL;

/** 
 * @typedef user
 * @type {object}
 * @property {string} userID
 * @property {string} name
 * @property {string} email

/**
 * Create a new user
 * @param {user} user
 */

// TODO: this should send all the info to the backend to be in the database
// firebase stuff will be called here
export async function newUser({ userID, name, email }) {
  const fetch = await fetch(db, {
    method: 'POST',
    body: JSON.stringify({ userID, name, email }),
  });
  const res = await fetch.json();

  return res;
}

/**
 * Login user
 * @param {string} userID
 * @returns {object} user
 */
export async function loginUser(userID) {
  const res = await fetch(`${db}/login`, {
    method: 'POST',
    body: JSON.stringify({ userID: userID }),
  });
  const user = res.json();

  return user;
}
const db =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : process.env.DB_URL;

/** 
 * @typedef user
 * @type {object}
 * @property {string} userID
 * @property {string} name
 * @property {string} email

/**
 * Create a new user
 * @param {user} user
 */
export async function newUser({ userID, name, email }) {
  const fetch = await fetch(db, {
    method: 'POST',
    body: JSON.stringify({ userID, name, email }),
  });
  const res = await fetch.json();

  return res;
}

/**
 * Login user
 * @param {string} userID
 * @returns {object} user
 */
export async function loginUser(userID) {
  const res = await fetch(`${db}/login`, {
    method: 'POST',
    body: JSON.stringify({ userID: userID }),
  });
  const user = res.json();

  return user;
}
