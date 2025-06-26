const fs = require('fs');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');
const { Pool } = require('pg');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

const sessions = {};
const sessionFilePath = path.resolve(__dirname, './src/data/sessionID.json');

const IS_PROD = process.env.NODE_ENV === 'production';
let pool;
if (IS_PROD) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
}

// Runs once to set up the database and tables
const setupDatabase = async () => {
  if (!IS_PROD) return;
  const client = await pool.connect();
  try {
    // Check if the tables exist, if not create them
    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        session_id VARCHAR(5) PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    // Create a players table to store users in each session
    await client.query(`
      CREATE TABLE IF NOT EXISTS players (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        session_id VARCHAR(5) NOT NULL REFERENCES sessions(session_id) ON DELETE CASCADE,
        role VARCHAR(25),
        UNIQUE(session_id, user_id)
      );
    `);
    console.log('Database setup complete');
  } catch (err) {
    console.error('Error setting up database:', err);
  } finally {
    client.release();
  }
}

// Websocket Server
wss.on('connection', (ws) => {
  console.log('WSS Client connected');

  ws.on('message', message => {
    try {
      const data = JSON.parse(message);
      console.log('WSS Received:', data);

      // Validate session request
      if (data.type === 'VALIDATE_SESSION') {
        const { gameCode } = data.payload;
        let sessionsData = { sessions: {} };
        try {
          if (fs.existsSync(sessionFilePath)) {
            sessionsData = JSON.parse(fs.readFileSync(sessionFilePath, 'utf-8'));
          }
        } catch (e) {
          console.error('Error reading session file:', e);
        }
        const isValid = Object.hasOwn(sessionsData.sessions, gameCode);

        ws.send(JSON.stringify({
          type: 'SESSION_VALIDATED',
          payload: { isValid, gameCode }
        }));
      }

      // Handle session creation request
      if (data.type === 'CREATE_SESSION') {
        let sessionsData = { sessions: {} };
        try {
          if (fs.existsSync(sessionFilePath)) {
            sessionsData = JSON.parse(fs.readFileSync(sessionFilePath, 'utf-8'));
          }
        } catch (e) {
          console.error('Error reading session file:', e);
        }

        const sessionId = generateUniqueSessionId(Object.keys(sessionsData.sessions));
        sessionsData.sessions[sessionId] = [];
        fs.writeFileSync(sessionFilePath, JSON.stringify(sessionsData, null, 2), 'utf-8');

        ws.send(JSON.stringify({
          type: 'SESSION_CREATED',
          payload: { sessionId }
        }));
      }

      // When a player selects a role, update their role in the session
      if (data.type === 'UPDATE_ROLE') {
        const { sessionId, userId, role } = data.payload;
        try {
          let sessionsData = { sessions: {} };
          if (fs.existsSync(sessionFilePath)) {
            sessionsData = JSON.parse(fs.readFileSync(sessionFilePath, 'utf-8'));
          }

          const session = sessionsData.sessions[sessionId];
          if (session) {
            const user = session.find(u => u.userId === userId);
            if (user) {
              user.role = role;
              fs.writeFileSync(sessionFilePath, JSON.stringify(sessionsData, null, 2), 'utf-8');

              broadcast(sessionId, {
                type: 'ROLE_UPDATED_BROADCAST',
                payload: { userId, role }
              });
            }
          }
        } catch (err) {
          console.error('Error updating role:', err);
        }
      }
        
      // When a player joins, store their WebSocket connection in the correct session room
      if (data.type === 'PLAYER_JOIN') {
        const { sessionId, userId } = data.payload;
        ws.sessionId = sessionId;
        ws.userId = userId;

        if (!sessions[sessionId]) {
          sessions[sessionId] = new Set(); 
        }
        sessions[sessionId].add(ws);
        console.log(`WSS User ${userId} joined session ${sessionId}. Total clients in session: ${sessions[sessionId].size}`);

        // Broadcast to all clients in that session that a new player has joined
        broadcast(sessionId, { type: 'PLAYER_JOINED_BROADCAST', payload: { userId } });
      }

      // When an AAC user selects a food, broadcast it to the session
      if (data.type === 'AAC_FOOD_SELECTED') {
        const { sessionId, food } = data.payload;
        if (sessions[sessionId]) {
          console.log(`WSS Food selected in session ${sessionId}:`, food);
          broadcast(sessionId, {
            type: 'FOOD_SELECTED_BROADCAST',
            payload: { food }
          });
        }
      }

    } catch (error) {
        console.error('WSS Error processing message:', error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

/**
 * Helper function to broadcast a message to all clients in a specific session
 * @param {string} sessionId The ID of the session room
 * @param {object} data The data to send
 */
function broadcast(sessionId, data) {
    if (sessions[sessionId]) {
        sessions[sessionId].forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(data));
            }
        });
    }
}

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

const PORT = process.env.PORT || 4000;
// Start the Express server
server.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});