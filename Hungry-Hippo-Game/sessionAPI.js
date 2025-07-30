const fs = require('fs');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');
const { Pool } = require('pg');

// Constants for game modes and their configurations
const MODE_CONFIG = {
  Easy: {
    fruitSpeed: 100,
    allowPenalty: false,
    allowEffect: false,
  },
  Medium: {
    fruitSpeed: 125,
    allowPenalty: true,
    allowEffect: true,
  },
  Hard: {
    fruitSpeed: 150,
    allowPenalty: true,
    allowEffect: true,
  },
};

const server = http.createServer();
const wss = new WebSocket.Server({ noServer: true });

const sessions = {};
const sessionFilePath = path.resolve(__dirname, './src/data/sessionID.json');
const scoresBySession = {};
const fruitQueues = {};      
const fruitIntervals = {}; 
const TARGET_FOOD_WEIGHT = 12; // Weight for the target food in the queue

const sessionGameModes = {};
let foodInstanceCounter = 0
const activeFoods = {};
const lastSpawnAt = {};

// Reject connections from unauthorized origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  'http://localhost:3004',
  'http://localhost:3005',
  'https://www.draexico.com'
];

server.on('upgrade', (request, socket, head) => {
  const origin = request.headers.origin;
  if (!allowedOrigins.includes(origin)) {
    console.log(`[WSS] Connection from unauthorized origin ${origin} rejected.`);
    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
    socket.destroy();
    return;
  }
  wss.handleUpgrade(request, socket, head, (ws) => {
    console.log(`[WSS] Connection from ${origin} accepted.`);
    wss.emit('connection', ws, request);
  });
});

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

// Function to get a weighted random food item from the list
// This function will give more weight to the target food, making it more likely to be selected
function getWeightedRandomFood(allFoods, targetId) {
  const weightedList = [];
  for (const food of allFoods) {
    const weight = food.id === targetId ? TARGET_FOOD_WEIGHT : 1;
    for (let i = 0; i < weight; i++) {
      weightedList.push(food);
    }
  }
  return weightedList[Math.floor(Math.random() * weightedList.length)];
}

// Websocket Server
wss.on('connection', (ws) => {
  console.log('WSS Client connected');

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      // console.log('WSS Received:', data);

      // Validate session request
      if (data.type === 'VALIDATE_SESSION') {
        const { gameCode } = data.payload;
        let isValid = false;
        let sessionsData = { sessions: {} };
        if (!IS_PROD) {
          // If local development, read from the session file
          try {
            if (fs.existsSync(sessionFilePath)) {
              sessionsData = JSON.parse(fs.readFileSync(sessionFilePath, 'utf-8'));
            }
          } catch (e) {
            console.error('Error reading session file:', e);
          }
          isValid = Object.hasOwn(sessionsData.sessions, gameCode);
        } else {
          // If in production, check the database
          try {
            const result = await pool.query('SELECT EXISTS (SELECT 1 FROM sessions WHERE session_id = $1)', [gameCode]);
            isValid = result.rows[0].exists;
          } catch (err) {
            console.error('Error validating session:', err);
          }
        }

        ws.send(JSON.stringify({
          type: 'SESSION_VALIDATED',
          payload: { isValid, gameCode }
        }));
      }

      // Handle session creation request
      if (data.type === 'CREATE_SESSION') {
        // If local development, skip database operations
        let sessionId;
        if (!IS_PROD) {
          let sessionsData = { sessions: {} };
          try {
            if (fs.existsSync(sessionFilePath)) {
              sessionsData = JSON.parse(fs.readFileSync(sessionFilePath, 'utf-8'));
            }
          } catch (e) {
            console.error('Error reading session file:', e);
          }
          sessionId = generateUniqueSessionId(Object.keys(sessionsData.sessions));
          sessionsData.sessions[sessionId] = [];
          fs.writeFileSync(sessionFilePath, JSON.stringify(sessionsData, null, 2), 'utf-8');
        } else {
          // If in production, insert into the database
          while (true) {
            sessionId = generateSessionId();
            try {
              await pool.query('INSERT INTO sessions (session_id) VALUES ($1)', [sessionId]);
              break;
            } catch (err) {
              console.error('Error creating session:', err);
            }
          }
        } 
        ws.send(JSON.stringify({
          type: 'SESSION_CREATED',
          payload: { sessionId }
        }));
      }

      if (data.type === 'PLAYER_MOVE') {
      const { sessionId, userId, x, y } = data.payload;
      broadcast(sessionId, {
          type: 'PLAYER_MOVE_BROADCAST',
          payload: { 
            userId, 
            x, 
            y 
          }
         });
        }
        
      // When a player joins, store their WebSocket connection in the correct session room
      if (data.type === 'PLAYER_JOIN') {
        const { sessionId, userId, role, color } = data.payload;
        ws.sessionId = sessionId;
        ws.userId = userId;
        ws.role = role;
        ws.color = color;

        if (!sessions[sessionId]) {
          sessions[sessionId] = new Set();
        }
        const clientInfo = { ws, userId, role, color };
        sessions[sessionId].add(clientInfo);
        console.log(`WSS User ${userId} joined session ${sessionId}. Total clients in session: ${sessions[sessionId].size}`);

        if (!scoresBySession[sessionId]) scoresBySession[sessionId] = {};
        if (role === 'Hippo Player' && !scoresBySession[sessionId][userId]) {
          scoresBySession[sessionId][userId] = 0;
        }

        if (IS_PROD) {
          // If in production, insert the player into the database
          try {
            await pool.query(`
              INSERT INTO players (session_id, user_id, role) VALUES ($1, $2, $3)
              ON CONFLICT (session_id, user_id) DO UPDATE SET role = EXCLUDED.role`, [sessionId, userId, role]);
          } catch (err) {
            console.error('Error adding player to database:', err);
          }
        }
        // Broadcast to all clients in that session that a new player has joined
        broadcast(sessionId, { 
          type: 'PLAYER_JOINED_BROADCAST', 
          payload: { 
            userId, role, color
          } 
        });
        // Collect all users in the session
        const usersInSession = Array.from(sessions[sessionId])
          .map(client => ({
            userId: client.userId,
            role: client.role,
            color: client.color
          }));

        // Send full user list
        broadcast(sessionId, {
          type: 'USERS_LIST_UPDATE',
          payload: {
            users: usersInSession
          }
        });
        console.log(`[WSS] Broadcasting USERS_LIST_UPDATE to ${sessionId}:`, usersInSession);

        // Broadcast initial leaderboard with everyone at score 0
        broadcast(sessionId, {
          type: 'SCORE_UPDATE_BROADCAST',
          payload: { scores: scoresBySession[sessionId] }
        });

      }

      // Handle player rejoining with stored details
      if (data.type === 'REJOIN_SESSION') {
        const { sessionId, userId, role, color } = data.payload;
        ws.sessionId = sessionId;
        ws.userId = userId;
        ws.role = role;
        ws.color = color;

        if (sessions[sessionId]) {
          let reconnected = null;
          for (const client of sessions[sessionId]) {
            if (client.userId === userId) {
              reconnected = client;
              break;
            }
          }

          if (reconnected) {
            console.log(`[WSS] Player ${userId} is rejoining session ${sessionId}.`);
            reconnected.ws = ws;
            delete reconnected.disconnectedAt;
            reconnected.role = role;
            reconnected.color = color;

            ws.send(JSON.stringify({
              type: 'FULL_STATE_SYNC',
              payload: {
                users: Array.from(sessions[sessionId]).map(c => ({ userId: c.userId, role: c.role, color: c.color })),
                scores: scoresBySession[sessionId],
                currentTargetFood: sessions[sessionId].currentTargetFoodId,
                activeFoods: activeFoods[sessionId]
              }
            }));

            broadcast(sessionId, {
              type: 'USERS_LIST_UPDATE',
              payload: {
                users: Array.from(sessions[sessionId]).map(c => ({ userId: c.userId, role: c.role, color: c.color }))
              }
            });
          }
        }
      }

      // When the presenter clicks "Start Game", broadcast to all clients in the session
      // to signal that the game has begun. Clients will navigate to the game screen.
      if (data.type === 'START_GAME') {
        const { sessionId, mode } = data.payload;
        console.log(`[WSS] Start game received for session ${sessionId} with mode ${mode}`);

        // Store mode and reset per-session state
        sessionGameModes[sessionId] = mode;
        activeFoods[sessionId] = [];

        // Seed queue with objects
        if (!fruitQueues[sessionId]) {
          const allFoods = require('./src/data/food.json').categories.flatMap(c => c.foods);
          fruitQueues[sessionId] = [];
          for (let i = 0; i < 10; i++) {
            const food = allFoods[Math.floor(Math.random() * allFoods.length)];
            fruitQueues[sessionId].push(food);
          }
        }

        // Target tracking
        sessions[sessionId].initialTargetSent = false;
        sessions[sessionId].currentTargetFoodId = null;
        const SCREEN_WIDTH = 1024;
        const SCREEN_HEIGHT = 1024;

        // spawn mark (first spawn after 2s)
        lastSpawnAt[sessionId] = Date.now();

        // 50ms game loop; spawns happen every 2000ms
        fruitIntervals[sessionId] = setInterval(() => {
          if (!sessions[sessionId]) {
            clearInterval(fruitIntervals[sessionId]);
            delete fruitIntervals[sessionId];
            return;
          }
          const allFoods = require('./src/data/food.json').categories.flatMap(c => c.foods);
          const gameMode = sessionGameModes[sessionId] || 'Easy';
          const speed = MODE_CONFIG[gameMode].fruitSpeed;

          // spawn every 2s
          const now = Date.now();
          if (now - lastSpawnAt[sessionId] >= 2000) {
            lastSpawnAt[sessionId] = now;

            if (fruitQueues[sessionId] && fruitQueues[sessionId].length > 0) {
              const dequeued = fruitQueues[sessionId].shift();
              const nextFoodId = typeof dequeued === 'string' ? dequeued : dequeued.id;
              const targetFood = allFoods.find(f => f.id === nextFoodId);
              if (nextFoodId && targetFood) {
                if (!sessions[sessionId].initialTargetSent) {
                  sessions[sessionId].currentTargetFoodId = nextFoodId;
                  sessions[sessionId].initialTargetSent = true;
                  broadcast(sessionId, {
                    type: 'AAC_TARGET_FOOD',
                    payload: { targetFoodId: nextFoodId, targetFoodData: targetFood, effect: null },
                  });
                }

                const weightedFood = getWeightedRandomFood(allFoods, sessions[sessionId].currentTargetFoodId);
                fruitQueues[sessionId].push(weightedFood); // keep objects

                foodInstanceCounter++;
                const instanceId = `food-${foodInstanceCounter}`;
                const hippoClients = [...sessions[sessionId]].filter(c => c.role === 'Hippo Player');

                hippoClients.forEach(client => {
                  // Assign a random angle based on the edge they selected
                  // Each hippo will spawn from their selected edge
                  const edge = client.edge || 'bottom';
                  const angleRange = getAngleRangeForEdge(edge);
                  const angle = Math.random() * (angleRange.max - angleRange.min) + angleRange.min;

                  const vx = (Math.cos(angle) * speed) / SCREEN_WIDTH;
                  const vy = (Math.sin(angle) * speed) / SCREEN_HEIGHT;

                  activeFoods[sessionId].push({
                    instanceId: `${instanceId}-${client.userId}`,
                    foodId: nextFoodId,
                    x: 0.5,
                    y: 0.5,
                    vx,
                    vy,
                    effect: (nextFoodId === sessions[sessionId].currentTargetFoodId) ? sessions[sessionId].currentTargetEffect : null,
                  });
                });

                // Broadcast the new food state to all clients in the session
                broadcast(sessionId, {
                  type: 'FOOD_STATE_UPDATE',
                  payload: { foods: activeFoods[sessionId] }
                });

                console.log('[WSS] Spawned', nextFoodId, 'queueLen=', fruitQueues[sessionId].length);
              } else {
                console.warn('[WSS] Unknown food in queue, skipping spawn:', dequeued);
              }
            }
          }

          // physics tick @ 50ms
          const timeStep = 0.05;
          activeFoods[sessionId].forEach(food => {
            food.x += food.vx * timeStep;
            food.y += food.vy * timeStep;
          });

          // broadcast motion
          broadcast(sessionId, {
            type: 'FOOD_STATE_UPDATE',
            payload: { foods: activeFoods[sessionId] }
          });

          // cull off-screen
          const BOUNDARY_BUFFER = 300;
          activeFoods[sessionId] = activeFoods[sessionId].filter(food =>
            food.x > -BOUNDARY_BUFFER &&
            food.x < 1024 + BOUNDARY_BUFFER &&
            food.y > -BOUNDARY_BUFFER &&
            food.y < 768 + BOUNDARY_BUFFER
          );
        }, 50);

        broadcast(sessionId, {
          type: 'START_GAME_BROADCAST',
          payload: { sessionId, mode },
        });
      }











      if (data.type === 'START_TIMER') {
        const { sessionId } = data.payload;
        console.log(`[WSS] Starting timer for session ${sessionId}`);

        let secondsLeft = 180;
        console.log('[WSS] SECONDSLEFT INIT:', secondsLeft); 
        const interval = setInterval(() => {
          if(secondsLeft <= 0) {
            console.log(`[WSS] Timer ended for session ${sessionId}`);
            broadcast(sessionId, { type: 'TIMER_UPDATE', secondsLeft: 0 });
            broadcast(sessionId, { type: 'GAME_OVER' });

            clearInterval(fruitIntervals[sessionId]);
            delete fruitIntervals[sessionId];
            delete fruitQueues[sessionId];

            clearInterval(interval);
          }
          else
          {
            broadcast(sessionId, { type: 'TIMER_UPDATE', secondsLeft });
            secondsLeft--;
          }
        }, 1000);
      }

      if (data.type === 'SET_EDGE') {
        const { sessionId, userId, edge } = data.payload;
        for (const client of sessions[sessionId]) {
          if (client.userId === userId) {
            client.edge = edge;
            console.log(`[WSS] Stored edge "${edge}" for user ${userId}`);
            break;
          }
        }

        const assignedEdges = [...sessions[sessionId]].map(c => `${c.userId}: ${c.edge}`);
        console.log(`[WSS DEBUG] Current edge map for session ${sessionId}:`, assignedEdges);
      }

      // When an AAC user selects a food, broadcast it to the session
      if (data.type === 'AAC_FOOD_SELECTED') {
        const { sessionId, food, effect } = data.payload;
        console.log(`WSS Food selected in session ${sessionId}:`, food, effect);

        const gameMode = sessionGameModes[sessionId] || 'Easy';
        const finalEffect = MODE_CONFIG[gameMode].allowEffect ? effect : null;

        if (fruitQueues[sessionId]) {
          // Pushes AAC-selected food to the front of the queue
          // Keep queue entries as full objects, not ids
          const head = fruitQueues[sessionId][0];
          const headId = head && (head.id || head); // tolerate any stray ids
          if (headId !== food.id) {
            fruitQueues[sessionId].unshift(food);
          }
        }

        // Updates the session's current weighted target
        sessions[sessionId].currentTargetFoodId = food.id;
        sessions[sessionId].currentTargetEffect = finalEffect;

        // Broadcasts the selected food as the official target
        broadcast(sessionId, {
          type: 'AAC_TARGET_FOOD',
          payload: { 
            targetFoodId: food.id, 
            targetFoodData: food,
            effect: finalEffect
          }
        });
      }

      // When a player eats a target food with an effect, broadcast it to the session
      if (data.type === 'PLAYER_EFFECT_APPLIED') {
        const { sessionId, targetUserId, effect } = data.payload;
        broadcast(sessionId, {
          type: 'PLAYER_EFFECT_BROADCAST',
          payload: { targetUserId, effect }
        });
      }

      // Defines angle ranges in radians
      function getAngleRangeForEdge(edge) {
        switch (edge) {
          case 'top': return { min: -Math.PI * 3/4, max: -Math.PI / 4 };     // Up: -135° to -45°
          case 'bottom': return { min: Math.PI / 4, max: Math.PI * 3/4 };    // Down: +45° to +135°
          case 'left': return { min: Math.PI * 7/8, max: Math.PI * 9/8 };    // Left: 157.5° to 202.5°
          case 'right': return { min: -Math.PI / 4, max: Math.PI / 4 };      // Right: -45° to +45°
          default: return { min: 0, max: 2 * Math.PI };
        }
      }

      // Notify all players in the session to remove the fruit
      if (data.type === 'FRUIT_EATEN') {
        const { sessionId, instanceId } = data.payload;
        if (activeFoods[sessionId]) {
          activeFoods[sessionId] = activeFoods[sessionId].filter(f => f.instanceId !== instanceId);
        }
        broadcast(sessionId, {
          type: 'REMOVE_FOOD',
          payload: { instanceId }
        });
      }

      // Broadcast updated scores
      if (data.type === 'FRUIT_EATEN_BY_PLAYER') {
        const { sessionId, userId, isCorrect, allowPenalty, effect } = data.payload;

        if (!scoresBySession[sessionId]) scoresBySession[sessionId] = {};
        const prev = scoresBySession[sessionId][userId] || 0;

        if (isCorrect) {
          sessions[sessionId].currentTargetEffect = null;
          if (effect === 'burn') {
            scoresBySession[sessionId][userId] = Math.max(0, prev - 2);
            console.log(`[WSS] Player ${userId} burned, score reduced by 2 from ${prev} to ${scoresBySession[sessionId][userId]}`);
          } else if (effect === 'grow') {
            scoresBySession[sessionId][userId] = prev + 2;
            console.log(`[WSS] Player ${userId} grew, score increased by 2 from ${prev} to ${scoresBySession[sessionId][userId]}`);
          } else {
            scoresBySession[sessionId][userId] = prev + 1;
          }
        } else if (allowPenalty) {
          scoresBySession[sessionId][userId] = Math.max(0, prev - 1);
        }

        broadcast(sessionId, {
          type: 'SCORE_UPDATE_BROADCAST',
          payload: { scores: scoresBySession[sessionId] }
        });
      }

      // When a player selects a color, broadcast it to the session
      if (data.type === 'SELECT_COLOR') {
        const { sessionId, userId, color } = data.payload;
        if (sessions[sessionId]) {
          // Find the client who sent the message and assign them the color
          for (const client of sessions[sessionId]) {
            if (client.userId === userId) {
              client.color = color;
              break;
            }
          }

          // Collect all taken colors in the session
          const takenColors = Array.from(sessions[sessionId])
            .map(client => client.color)
            .filter(c => c);

          broadcast(sessionId, {
            type: 'COLOR_UPDATE',
            payload: { takenColors }
          });
        }
      }

    } catch (error) {
        console.error('WSS Error processing message:', error);
    }
  });

  ws.on('close', async () => {
    const { sessionId, userId } = ws;
    if (!sessionId || !userId) {
      console.log('WSS Client disconnected without session or user ID');
      return;
    }
    console.log(`WSS Client ${userId} disconnected from session ${sessionId}`);

    if (sessions[sessionId]) {
      for (const client of sessions[sessionId]) {
        if (client.userId === userId) {
          client.ws = null;
          client.disconnectedAt = Date.now();
          console.log(`[WSS] Marked player ${userId} as disconnected.`);
          break;
        }
      }
    }

    // Remove the client from the database
    if (IS_PROD) {
      try {
        await pool.query('DELETE FROM players WHERE session_id = $1 AND user_id = $2', [sessionId, userId]);
      } catch (err) {
        console.error('Error removing player from database:', err);
      }
    }
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
            if (client.ws && client.ws.readyState === WebSocket.OPEN) {
                client.ws.send(JSON.stringify(data));
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
setupDatabase().then(() => {
  server.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
  });
});

// Periodically remove players who have been disconnected for over a minute
setInterval(() => {
  const now = Date.now();
  for (const sessionId in sessions) {
    const session = sessions[sessionId];
    const toRemove = [];
    for (const client of session) {
      if (client.disconnectedAt && (now - client.disconnectedAt > 60000)) {
        toRemove.push(client);
      }
    }
    toRemove.forEach(client => {
      session.delete(client);
      console.log(`[WSS] Cleaned up disconnected player ${client.userId} from session ${sessionId}.`);
    });
    if (session.size === 0) {
      delete sessions[sessionId];
    }
  }
}, 60000);