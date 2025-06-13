const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

const sessionFilePath = path.resolve(__dirname, './src/data/sessionID.json');

app.get('/sessions', (req, res) => {
  if (fs.existsSync(sessionFilePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(sessionFilePath, 'utf-8'));
      res.json(data);
    } catch (e) {
      console.error('Error reading session file:', e);
      res.status(500).send({ message: 'Failed to read session data' });
    }
  } else {
    res.json({ sessions: [] });
  }
});

app.post('/sessions', (req, res) => {
  const { sessionId } = req.body;

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

  if (!data.sessions.includes(sessionId)) {
    data.sessions.push(sessionId);
  }

  try {
    fs.writeFileSync(sessionFilePath, JSON.stringify(data, null, 2), 'utf-8');
    res.status(200).send({ message: 'Session ID saved' });
  } catch (e) {
    console.error('Error writing session file:', e);
    res.status(500).send({ message: 'Failed to save session ID' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
