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
 * Automatically generates a new unique session ID
 *
 * <p>Purpose:
 * - Generates a unique session ID not currently in use.
 * - Initializes an empty array for the new session to store users who join later.
 * - Persists session data to a JSON file.
 *
 * <p>Data Fields:
 * - sessionFilePath: string
 *   - Path to the JSON file where all session data is stored.
 * - sessionsData: object
 *   - Object representing all sessions, each with a session ID as key and an array of users as value.
 *
 * <p>Methods:
 * - generateUniqueSessionId(): string
 *   - Generates a random 5-character string using uppercase letters and numbers.
 *   - Retries until it produces a string not already in use.
 *
 * <p>Pre-conditions:
 * - sessionFilePath must point to a writable JSON file.
 * - File, if it exists, must contain valid JSON or be safely reset.
 *
 * <p>Post-conditions:
 * - A new session ID is added to the sessions object.
 * - The updated object is written back to the JSON file.
 * - The newly generated session ID is returned to the client.
 *
 * <p>Exceptions:
 * - Malformed JSON in the file will be caught and replaced with a clean structure.
 * - I/O errors (e.g., permission issues) will be logged and responded to with HTTP 500.
 *
 * <p>Responses:
 * - 200 OK: Returns `{ sessionId: string }` for a successfully created session.
 * - 500 Internal Server Error: If file read/write fails.
 */
app.post('/create-session', (req, res) => {
  let sessionsData = { sessions: {} };

  try {
    if (fs.existsSync(sessionFilePath)) {
      const fileContent = fs.readFileSync(sessionFilePath, 'utf-8');
      sessionsData = JSON.parse(fileContent);

      if (typeof sessionsData.sessions !== 'object' || Array.isArray(sessionsData.sessions)) {
        sessionsData.sessions = {};
      }
    }

    const sessionId = generateUniqueSessionId(Object.keys(sessionsData.sessions));
    sessionsData.sessions[sessionId] = [];
    fs.writeFileSync(sessionFilePath, JSON.stringify(sessionsData, null, 2), 'utf-8');

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
 * <p>Purpose:
 * - Confirms if the user-entered game code corresponds to an existing session.
 * - Used before allowing a user to join a game to prevent invalid sessions.
 *
 * <p>Data Fields:
 * - gameCode: string
 *   - The 5-character session code sent in the request body to validate.
 * - sessionFilePath: string
 *   - Path to the JSON file that stores active session data.
 * - data.sessions: object
 *   - A key-value map of session IDs and their associated player arrays.
 *
 * <p>Methods:
 * - JSON.parse(fs.readFileSync(sessionFilePath)): Reads and parses session file to access session keys.
 * - Object.hasOwn(data.sessions, gameCode): Determines if the session code exists.
 *
 * <p>Pre-conditions:
 * - `gameCode` must be a non-empty string.
 * - The session file (if it exists) must be parseable JSON.
 *
 * <p>Post-conditions:
 * - Responds with `valid: true` if the session exists.
 * - Responds with `valid: false` if it does not, or if an error occurred.
 *
 * <p>Exceptions:
 * - If session file is unreadable or malformed, returns 500 and logs the error.
 * - If `gameCode` is missing or not a string, returns 400 with a descriptive message.
 *
 * <p>Responses:
 * - 200 OK: `{ valid: true }` if the session exists, `{ valid: false }` if not.
 * - 400 Bad Request: If input is missing or improperly formatted.
 * - 500 Internal Server Error: If session file cannot be read or parsed.
 */
app.post('/validate-session', (req, res) => {
  const { gameCode } = req.body;

  if (!gameCode || typeof gameCode !== 'string') {
    return res.status(400).json({ valid: false, error: 'Invalid game code format' });
  }

  let data = { sessions: {} };

  try {
    if (fs.existsSync(sessionFilePath)) {
      data = JSON.parse(fs.readFileSync(sessionFilePath, 'utf-8'));
    }
  } catch (e) {
    console.error('Error reading session file:', e);
    return res.status(500).json({ valid: false });
  }

  const isValid = Object.hasOwn(data.sessions, gameCode);
  res.status(200).json({ valid: isValid });
});


/**
 * POST /join-session
 *
 * Adds a user to an existing game session, storing their user ID and selected role.
 *
 * <p>Purpose:
 * - Allows a user to join a previously created session.
 * - Stores the user's `userId` and `role` in the session’s data.
 *
 * <p>Data Fields:
 * - gameCode: string
 *   - The session code identifying the game room.
 * - userId: string
 *   - Unique username or identifier for the joining user.
 * - role: string
 *   - Role selected by the user (e.g., "AAC User", "Hippo Player").
 * - sessionFilePath: string
 *   - Path to the JSON file containing all session data.
 * - data.sessions[gameCode]: array
 *   - Array of user objects (`{ userId, role }`) for the session.
 *
 * <p>Methods:
 * - JSON.parse(fs.readFileSync(...)): Loads and parses session data.
 * - session.some(): Checks for duplicate users in the session.
 * - session.push(): Adds the user if they aren't already present.
 * - fs.writeFileSync(): Persists changes to the JSON file.
 *
 * <p>Pre-conditions:
 * - All fields `gameCode`, `userId`, and `role` must be non-empty.
 * - The session identified by `gameCode` must already exist.
 *
 * <p>Post-conditions:
 * - User is added to the session if not already present.
 * - Session data is updated on disk.
 *
 * <p>Exceptions:
 * - Returns 400 if any required fields are missing.
 * - Returns 404 if the session ID does not exist.
 * - Returns 500 if the session file cannot be read or written.
 *
 * <p>Responses:
 * - 200 OK: `{ joined: true }` if user successfully added or already present.
 * - 400 Bad Request: If `gameCode`, `userId`, or `role` is missing.
 * - 404 Not Found: If the session ID doesn't exist.
 * - 500 Internal Server Error: For read/write issues or unexpected errors.
 */
app.post('/join-session', (req, res) => {
  const { gameCode, userId, role } = req.body;

  if (!gameCode || !userId || !role) {
    return res.status(400).json({ error: 'Missing gameCode, userId, or role' });
  }

  let data = { sessions: {} };

  try {
    if (fs.existsSync(sessionFilePath)) {
      data = JSON.parse(fs.readFileSync(sessionFilePath, 'utf-8'));
    }

    if (!data.sessions[gameCode]) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const session = data.sessions[gameCode];

    // Avoid duplicate userId
    const userExists = session.some(user => user.userId === userId);
    if (!userExists) {
      session.push({ userId, role });
      fs.writeFileSync(sessionFilePath, JSON.stringify(data, null, 2), 'utf-8');
    }

    res.status(200).json({ joined: true });
  } catch (error) {
    console.error('Join session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /update-role
 *
 * Updates the role of a specific user within an existing game session.
 *
 * <p>Purpose:
 * - Allows the client to change or assign a role for a specific user in a session.
 * - Typically used after role selection on the frontend.
 *
 * <p>Data Fields:
 * - sessionId: string
 *   - The unique 5-character session ID where the user is registered.
 * - userId: string
 *   - The unique username or ID for the user whose role is to be updated.
 * - role: string
 *   - The new role to assign to the user (e.g., "AAC User", "Hippo Player").
 * - sessionFilePath: string
 *   - Path to the session log file (`.json`) that stores all sessions and user data.
 *
 * <p>Methods:
 * - JSON.parse(fs.readFileSync(...)): Loads the session data from the JSON file.
 * - Array.prototype.find(): Locates the user within the session by userId.
 * - fs.writeFileSync(): Saves the updated session data back to disk.
 *
 * <p>Pre-conditions:
 * - `sessionId`, `userId`, and `role` must be present in the request body.
 * - The session identified by `sessionId` must already exist.
 * - The user must already be part of the session.
 *
 * <p>Post-conditions:
 * - The role of the specified user is updated.
 * - The changes are persisted to the session log file.
 *
 * <p>Exceptions:
 * - Returns 400 if any required fields (`sessionId`, `userId`, or `role`) are missing.
 * - Returns 404 if the session or user does not exist.
 * - Returns 500 for file system read/write errors or other internal server issues.
 *
 * <p>Responses:
 * - 200 OK: `{ updated: true }` if the role was successfully updated.
 * - 400 Bad Request: If the request is missing necessary fields.
 * - 404 Not Found: If the session or user is not found.
 * - 500 Internal Server Error: For unexpected processing errors.
 */
app.post('/update-role', (req, res) => {
  const { sessionId, userId, role } = req.body;

  if (!sessionId || !userId || !role) {
    return res.status(400).json({ error: 'Missing sessionId, userId, or role' });
  }

  try {
    let data = { sessions: {} };
    if (fs.existsSync(sessionFilePath)) {
      data = JSON.parse(fs.readFileSync(sessionFilePath, 'utf-8'));
    }

    const session = data.sessions[sessionId];

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const user = session.find(u => u.userId === userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found in session' });
    }

    user.role = role; 
    fs.writeFileSync(sessionFilePath, JSON.stringify(data, null, 2), 'utf-8');
    res.status(200).json({ updated: true });
  } catch (err) {
    console.error('Update role error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
