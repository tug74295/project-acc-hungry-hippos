import express from 'express';
import http from 'http';
import WebSocket, { WebSocketServer } from 'ws';

const app = express();
const server = http.createServer(app as any);
const wss = new WebSocketServer({ server });

// ── Simple shared state ──
let boxState: { x: number } = { x: 0 };

wss.on('connection', (ws: WebSocket) => {
  console.log('Client connected');

  // send initial state
  ws.send(JSON.stringify({ type: 'init', payload: boxState }));

  ws.on('message', (msg: string) => {
    try {
      const { type, payload }: { type: string; payload: { dx: number } } = JSON.parse(msg);
      if (type !== 'move') return;

      boxState.x += payload.dx;
      const updateMsg = JSON.stringify({ type: 'update', payload: boxState });

      // broadcast
      if (wss.clients) {
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(updateMsg);
          }
        });
      }
    } catch (e) {
      console.error('Bad message', e);
    }
  });

  ws.on('close', () => console.log('Client disconnected'));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server listening on ${PORT}`));