---
sidebar_position: 2
description: Backend API
---

# Backend API

## Table of Contents

- [Overview](#overview)
- [Utility Functions](#utility-functions)
  - [generateSessionId](#generatesessionid)
  - [generateUniqueSessionId](#generateuniquesessionid)
- [WebSocket Communication](#websocket-communication)
  - [Client-to-Server Messages](#client-to-server-messages)
  - [Server-to-Client Broadcasts](#server-to-client-broadcasts)
- [Server Info](#server-info)

---

## Overview

The backend is an **authoritative, real-time game server** built with **Node.js** and the `ws` WebSocket library. It manages the entire lifecycle of a game session.

Instead of traditional REST endpoints, the server communicates with clients **exclusively through WebSocket messages**. It maintains the game state for each session — including player positions, scores, and the state of all active food items — and runs a central `setInterval` game loop to handle physics and spawning.

- **Production**: Uses **PostgreSQL (via Railway)** to persist session/player data.
- **Local Development**: Uses a JSON file for session storage.

---

## Utility Functions

### `generateSessionId(length = 5)`

Generates a random alphanumeric session ID consisting of uppercase letters and digits.

- **Parameters**:  
  `length` — `number`, defaults to `5`  
- **Returns**:  
  `string` — A randomly generated session ID

---

### `generateUniqueSessionId(existingSessions, length = 5)`

Generates a unique session ID that does not exist in the provided list.

- **Parameters**:
  - `existingSessions` — `string[]`
  - `length` — `number`, defaults to `5`
- **Returns**:  
  `string` — A new unique session ID

---

### `broadcast(sessionId, data)`

Broadcasts a message to all WebSocket clients connected to a given session.

- **Parameters**:
  - `sessionId` — `string`
  - `data` — `object`
- **Effect**:  
  Sends a JSON message to all connected clients in the session.

---

### `getWeightedRandomFood(allFoods, targetId)`

Returns a randomly selected food object with higher probability for the target food.

- **Parameters**:
  - `allFoods` — `object[]` — List of all possible food items
  - `targetId` — `string` — ID of the food to favor
- **Returns**:  
  `object` — A food item selected with weighted probability

---


## WebSocket Communication

The server operates by receiving messages from clients and broadcasting **state updates** to all clients in a given session.

---

### Client-to-Server Messages

| Message Type            | Payload                                | Description |
|-------------------------|----------------------------------------|-------------|
| `CREATE_SESSION`        | `{}`                                   | Requests the server to generate a new unique session ID. |
| `VALIDATE_SESSION`      | `{ gameCode: string }`                 | Asks the server if a given session code is valid. |
| `PLAYER_JOIN`           | `{ sessionId, userId, role, color }`   | Informs the server that a new player has joined a session. |
| `PLAYER_MOVE`           | `{ sessionId, userId, x, y }`          | Sends the local player's position to the server. |
| `AAC_FOOD_SELECTED`     | `{ sessionId, food, effect }`          | AAC user selects a target food with optional effect. |
| `FRUIT_EATEN_BY_PLAYER` | `{ sessionId, userId, isCorrect, effect }` | Player collided with a fruit. |
| `PLAYER_EFFECT_APPLIED` | `{ sessionId, targetUserId, effect }`  | A visual effect was applied to a player. |
| `SET_EDGE`              | `{ sessionId, userId, edge }`          | Assigns a player to a screen edge. |
| `START_GAME`            | `{ sessionId, mode }`                  | Host starts the game for all players. |

---

### Server-to-Client Broadcasts

| Message Type               | Payload                                  | Description |
|----------------------------|------------------------------------------|-------------|
| `SESSION_CREATED`          | `{ sessionId: string }`                  | Responds to `CREATE_SESSION` with new session ID. |
| `USERS_LIST_UPDATE`        | `{ users: [...] }`                       | Broadcasts updated list of all players in session. |
| `FOOD_STATE_UPDATE`        | `{ foods: [...] }`                       | Core game sync message — full state of active food. |
| `AAC_TARGET_FOOD`          | `{ targetFoodId, targetFoodData, effect }` | Sets the correct food to target. |
| `PLAYER_EFFECT_BROADCAST` | `{ targetUserId, effect }`              | Apply visual effect (e.g. freeze, grow) to player. |
| `SCORE_UPDATE_BROADCAST`  | `{ scores: {...} }`                     | Sends updated scores to all players. |
| `GAME_OVER`                | `{}`                                    | Notifies all clients that the game has ended. |

---

## Server Info

- **Port**: `4000` (local dev)
- **Protocol**: `ws://` (WebSocket)
- **Session Storage**:
  - Local: `./src/data/sessionID.json`
  - Production: **PostgreSQL on Railway**
