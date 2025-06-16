const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

const sessionFilePath = path.resolve(__dirname, './src/data/sessionID.json');

/**
 * Generates a random alphanumeric session ID consisting of uppercase letters and digits.
 *
 * @param {number} length - The desired length of the session ID. Defaults to 5.
 * @returns {string} A randomly generated session ID.
 */
function generateSessionId(length = 5) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = '';
  for (let i = 0; i < length; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

/**
 * Generates a unique session ID that does not exist in the given array of existing session IDs.
 *
 * @param {string[]} existingSessions - An array of session IDs that are already taken.
 * @param {number} length - The desired length of the new session ID. Defaults to 5.
 * @returns {string} A new unique session ID not present in the existingSessions array.
 *
 */
function generateUniqueSessionId(existingSessions, length = 5) {
  let newId;
  do {
    newId = generateSessionId(length);
  } while (existingSessions.includes(newId));
  return newId;
}

/**
 * GET /sessions
 * 
 * Reads and returns the list of session IDs from the session file.
 * If the file does not exist or is unreadable, returns an empty array or a 500 error.
 *
 * Response:
 * - 200: JSON object `{ sessions: string[] }`
 * - 500: JSON error message if reading/parsing fails
 */
app.get('/sessions', (req, res) => {
  if (fs.existsSync(sessionFilePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(sessionFilePath, 'utf-8'));
      res.json(data);
    } catch (e) {
      console.error('Error reading session file:', e);
      res.status(500).send({ message: 'Failed to read session data' }); // error if reading/parsing fails
    }
  } else {
    res.json({ sessions: [] });
  }
});

/**
 * POST /create-session
 * 
 * Automatically generates a new unique session ID, saves it, and returns it with the updated list.
 *
 * Response:
 * - 200: { sessionId: string, sessions: string[] }
 * - 500: { error: 'Failed to save session ID' }
 */
app.post('/create-session', (req, res) => {
  let sessionsData = { sessions: [] };

  try {
    if (fs.existsSync(sessionFilePath)) {
      const fileContent = fs.readFileSync(sessionFilePath, 'utf-8');
      sessionsData = JSON.parse(fileContent);

      if (!Array.isArray(sessionsData.sessions)) {
        sessionsData.sessions = [];
      }
    }

    // Generate a unique session ID that does not exist in sessionsData.sessions
    const sessionId = generateUniqueSessionId(sessionsData.sessions);

    // Add new session ID and write back to file
    sessionsData.sessions.push(sessionId);
    fs.writeFileSync(sessionFilePath, JSON.stringify(sessionsData, null, 2), 'utf-8');

    // Respond with only the new session ID
    res.status(200).json({ sessionId });
  } catch (error) {
    console.error('Error saving session ID:', error);
    res.status(500).json({ error: 'Failed to save session ID' });
  }
});

/**
 * POST /validate-session
 * 
 * Validates whether the given game code exists in the session file.
 *
 * Request Body:
 * - gameCode: string
 *
 * Response:
 * - 200: { valid: boolean }
 * - 400: { valid: false, error: string } for invalid input
 * - 500: { valid: false } for internal read errors
 */
app.post('/validate-session', (req, res) => {
  const { gameCode } = req.body;

  if (!gameCode || typeof gameCode !== 'string') {
    return res.status(400).json({ valid: false, error: 'Invalid game code format' });
  }

  let data = { sessions: [] };
  if (fs.existsSync(sessionFilePath)) {
    try {
      data = JSON.parse(fs.readFileSync(sessionFilePath, 'utf-8'));
    } catch (e) {
      console.error('Error reading session file:', e);
      return res.status(500).json({ valid: false });
    }
  }

  const isValid = data.sessions.includes(gameCode);
  res.status(200).json({ valid: isValid });
});


// Start the Express server
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
