const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

const sessionFilePath = path.resolve(__dirname, './src/data/sessionID.json');

// GET /sessions reads and returns the list of session IDs from the JSON file.
// If the file doesn't exist, returns an empty array.
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

// POST /sessions
// Adds a new session ID to the JSON file
app.post('/sessions', (req, res) => {
  const { sessionId } = req.body;

  // Validate sessionId: must be string of length 5
  if (!sessionId || typeof sessionId !== 'string' || sessionId.length !== 5) {
    res.status(400).send({ message: 'You are not valid for this website.' });
    return;
  }

  let data = { sessions: [] };

  if (fs.existsSync(sessionFilePath)) {
    try {
      data = JSON.parse(fs.readFileSync(sessionFilePath, 'utf-8'));
    } catch (e) {
      console.error('Error reading session file:', e);
    }
  }

  // Add new session ID if it doesn't already exist
  if (!data.sessions.includes(sessionId)) {
    data.sessions.push(sessionId);
  }

  try {
    // Write updated sessions back to the file
    fs.writeFileSync(sessionFilePath, JSON.stringify(data, null, 2), 'utf-8');
    res.status(200).send({ message: 'Session ID saved' });
  } catch (e) {
    console.error('Error writing session file:', e);
    res.status(500).send({ message: 'Failed to save session ID' });
  }
});

// POST /create-session
// Generates session ID, saves it, and returns updated sessions list
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

    // Respond with the new session ID and updated list
    res.status(200).json({ sessionId, sessions: sessionsData.sessions });
  } catch (error) {
    console.error('Error saving session ID:', error);
    res.status(500).json({ error: 'Failed to save session ID' });
  }
});

// POST /validate-session
// If the game code is valid, returns 
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
