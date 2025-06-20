const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const PORT = process.env.PORT || 4000;

// --- CORS Configuration ---
// This is still needed for the initial WebSocket handshake request from the browser.
const allowedOrigins = [
  'http://localhost:3000',
  'https://www.draexico.com',
  'https://project-acc-hungry-hippos-9wsu.vercel.app'
];
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};
app.use(cors(corsOptions));

// --- In-Memory Session Storage ---
// We no longer use a JSON file. All session data is stored in this object.
// This will reset every time the server restarts.
const sessions = {};
// Example structure:
// sessions = {
//   "ABCDE": {
//     players: [{ userId: "User123", role: "Host" }],
//     connections: new Set()
//   }
// }

// --- WebSocket Server Logic ---
wss.on('connection', (ws) => {
    console.log('[WSS] Client connected');

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log('[WSS] Received:', data);

            switch(data.type) {
                // --- Session Management ---
                case 'CREATE_SESSION': {
                    const sessionId = generateUniqueSessionId(Object.keys(sessions));
                    sessions[sessionId] = {
                        players: [],
                        connections: new Set(),
                    };
                    console.log(`[WSS] Session created: ${sessionId}`);
                    ws.send(JSON.stringify({ type: 'SESSION_CREATED', payload: { sessionId } }));
                    break;
                }

                case 'VALIDATE_SESSION': {
                    const { gameCode } = data.payload;
                    const isValid = !!sessions[gameCode];
                    ws.send(JSON.stringify({ type: 'SESSION_VALIDATED', payload: { isValid, gameCode } }));
                    break;
                }

                // --- Player & Game Logic ---
                case 'PLAYER_JOIN': {
                    const { sessionId, userId, role } = data.payload;
                    if (sessions[sessionId]) {
                        ws.sessionId = sessionId;
                        ws.userId = userId;

                        const session = sessions[sessionId];
                        session.connections.add(ws);
                        
                        // Add player if they don't already exist
                        if (!session.players.some(p => p.userId === userId)) {
                            session.players.push({ userId, role: role || 'null' });
                        }

                        console.log(`[WSS] User ${userId} joined session ${sessionId}. Players: ${session.players.length}, Connections: ${session.connections.size}`);
                        broadcast(sessionId, { type: 'PLAYER_LIST_UPDATED', payload: { players: session.players } });
                    }
                    break;
                }
                
                case 'UPDATE_ROLE': {
                    const { sessionId, userId, role } = data.payload;
                    if (sessions[sessionId]) {
                        const player = sessions[sessionId].players.find(p => p.userId === userId);
                        if (player) {
                            player.role = role;
                            broadcast(sessionId, { type: 'PLAYER_LIST_UPDATED', payload: { players: sessions[sessionId].players } });
                        }
                    }
                    break;
                }

                case 'FOOD_SELECTED': {
                    const { sessionId, food } = data.payload;
                    if (sessions[sessionId]) {
                        broadcast(sessionId, { type: 'FOOD_SELECTED_BROADCAST', payload: { food } });
                    }
                    break;
                }
            }
        } catch (error) {
            console.error('[WSS] Error processing message:', error);
        }
    });

    ws.on('close', () => {
        const { sessionId, userId } = ws;
        console.log(`[WSS] Client ${userId} disconnected from ${sessionId}`);
        if (sessionId && sessions[sessionId]) {
            const session = sessions[sessionId];
            session.connections.delete(ws);
            
            // Remove player from list
            sessions[sessionId].players = session.players.filter(p => p.userId !== userId);

            if (session.connections.size > 0) {
                 broadcast(sessionId, { type: 'PLAYER_LIST_UPDATED', payload: { players: session.players } });
            } else {
                // If no one is left, delete the session entirely
                console.log(`[WSS] Deleting empty session: ${sessionId}`);
                delete sessions[sessionId];
            }
        }
    });
});

// --- Helper Functions ---

function broadcast(sessionId, data) {
    if (sessions[sessionId]) {
        sessions[sessionId].connections.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(data));
            }
        });
    }
}

function generateSessionId(length = 5) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = '';
    for (let i = 0; i < length; i++) {
        id += chars[Math.floor(Math.random() * chars.length)];
    }
    return id;
}

function generateUniqueSessionId(existingSessions) {
    let newId;
    do {
        newId = generateSessionId();
    } while (existingSessions.includes(newId));
    return newId;
}

// NOTE: All app.get and app.post routes have been removed.

// --- Start the server ---
server.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});
