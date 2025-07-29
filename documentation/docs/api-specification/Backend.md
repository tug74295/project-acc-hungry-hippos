---
sidebar_position: 2
description: Backend API
---

# Backend API

## Table of Contents

- [Overview](#overview)
- [Session and Player Lifecycle](#session-and-player-lifecycle)
- [Utility Functions](#utility-functions)
  - [`generateSessionId`](#generatesessionid)
  - [`generateUniqueSessionId`](#generateuniquesessionid)
  - [`getWeightedRandomFood`](#getweightedrandomfood)
  - [`broadcast`](#broadcast)
- [WebSocket Communication](#websocket-communication)
  - [Client-to-Server Messages](#client-to-server-messages)
  - [Server-to-Client Broadcasts](#server-to-client-broadcasts)
- [Server Info](#server-info)

---

## Overview

The backend is a **real-time multiplayer game server** implemented in **Node.js** using the `ws` WebSocket library. It manages active game sessions, tracks scores and players, and arranges all real-time gameplay logic including spawning food, and effects.

The server does **not** use REST endpoints. All communication is performed using WebSocket messages.


- **Production**: Uses **PostgreSQL (via Railway)** to persist session/player data.
- **Local Development**: Uses a JSON file for session storage.

## Session and Player Lifecycle

### `CREATE_SESSION`
- **Purpose**: Generates a new unique `sessionId`.
- **Pre-conditions**: None.
- **Post-conditions**:
  - Local: New entry added to `sessionID.json`.
  - Prod: New row inserted in `sessions` table.
- **Returns**: `{ sessionId: string }`

### `PLAYER_JOIN`
- **Purpose**: Joins a user to a session and stores role/color.
- **Pre-conditions**: `sessionId` must exist.
- **Post-conditions**:
  - Socket added to session’s connection set.
  - Broadcasts updated user list.
  - Updates database if in production.
- **Returns**: Broadcasts `PLAYER_JOINED_BROADCAST` and `USERS_LIST_UPDATE`.

---

## Utility Functions

### `generateSessionId(length = 5)`

Generates a random alphanumeric session ID consisting of uppercase letters and digits.

- **Parameters**:
  - `length` (`number`) - Optional. Defaults to `5`.
- **Returns**:
  - `string` - Random session ID.
- **Pre-conditions**: None.
- **Post-conditions**: None.

---

### `generateUniqueSessionId(existingSessions, length = 5)`

Ensures the session ID is not already in use.

- **Parameters**:
  - `existingSessions` (`string[]`)
  - `length` (`number`) - Optional. Defaults to `5`.
- **Returns**:
  - `string` - Unique session ID.
- **Pre-conditions**: `existingSessions` must be an array of valid IDs.
- **Post-conditions**: New ID guaranteed not in existingSessions.

---

### `getWeightedRandomFood(allFoods, targetId)`

Selects a food item randomly, with extra weight given to a "target" food ID.

- **Parameters**:
  - `allFoods` (`object[]`) - Full list of food items.
  - `targetId` (`string`) - ID of the target food to favor.
- **Returns**:
  - `object` - Randomly selected food object.
- **Pre-conditions**: `allFoods` must include targetId.
- **Post-conditions**: Returns a new weighted choice each call.

---

### `broadcast(sessionId, data)`

Sends a message to all clients in a session.

- **Parameters**:
  - `sessionId` (`string`)
  - `data` (`object`) - Will be serialized with `JSON.stringify`.
- **Pre-conditions**: `sessions[sessionId]` must exist.
- **Post-conditions**: All clients with `readyState === OPEN` will receive the message.

---

## WebSocket Communication

The server operates by receiving messages from clients and broadcasting **state updates** to all clients in a given session.

---

### Client-to-Server Messages

| Message Type              | Payload                                 | Description |
|---------------------------|------------------------------------------|-------------|
| `CREATE_SESSION`          | `{}`                                     | Requests a new unique session ID. |
| `VALIDATE_SESSION`        | `{ sessionId: string }`                  | Validates session ID. |
| `PLAYER_JOIN`             | `{ sessionId, userId, role, color }`     | Adds user to session and syncs presence. |
| `PLAYER_MOVE`             | `{ sessionId, userId, x, y }`            | Sends current player position. |
| `AAC_FOOD_SELECTED`       | `{ sessionId, food, effect }`            | Target food selection by AAC user. |
| `START_GAME`              | `{ sessionId, mode }`                    | Initializes game loop, spawns food. |
| `START_TIMER`             | `{ sessionId }`                          | Starts countdown (180s). |
| `SET_EDGE`                | `{ sessionId, userId, edge }`            | Assigns spawn angle per player. |
| `FRUIT_EATEN`             | `{ sessionId, instanceId }`              | Tells server to remove food from list. |
| `FRUIT_EATEN_BY_PLAYER`   | `{ sessionId, userId, isCorrect, effect }` | Updates score and clears effect. |
| `PLAYER_EFFECT_APPLIED`   | `{ sessionId, targetUserId, effect }`    | Triggers visual effect (burn, freeze). |
| `SELECT_COLOR`            | `{ sessionId, userId, color }`           | Assigns a color to a user. |

---

### Client-to-Server Messages

| Message Type              | Payload                                 | Description |
|---------------------------|------------------------------------------|-------------|
| `CREATE_SESSION`          | `{}`                                     | Requests a new unique session ID. |
| `VALIDATE_SESSION`        | `{ sessionId: string }`                  | Validates session ID. |
| `PLAYER_JOIN`             | `{ sessionId, userId, role, color }`     | Adds user to session and syncs presence. |
| `PLAYER_MOVE`             | `{ sessionId, userId, x, y }`            | Sends current player position. |
| `AAC_FOOD_SELECTED`       | `{ sessionId, food, effect }`            | Target food selection by AAC user. |
| `START_GAME`              | `{ sessionId, mode }`                    | Initializes game loop, spawns food. |
| `START_TIMER`             | `{ sessionId }`                          | Starts countdown (180s). |
| `SET_EDGE`                | `{ sessionId, userId, edge }`            | Assigns spawn angle per player. |
| `FRUIT_EATEN`             | `{ sessionId, instanceId }`              | Tells server to remove food from list. |
| `FRUIT_EATEN_BY_PLAYER`   | `{ sessionId, userId, isCorrect, effect }` | Updates score and clears effect. |
| `PLAYER_EFFECT_APPLIED`   | `{ sessionId, targetUserId, effect }`    | Triggers visual effect (burn, freeze). |
| `SELECT_COLOR`            | `{ sessionId, userId, color }`           | Assigns a color to a user. |

## Data Structures

### `sessions: { [sessionId: string]: Set<WebSocket> }`
Tracks all sockets connected to each active session.

### `scoresBySession: { [sessionId: string]: { [userId: string]: number } }`
Stores player scores per session.

### `activeFoods: { [sessionId: string]: FoodInstance[] }`
Holds current active food objects on screen.

### `fruitQueues: { [sessionId: string]: Food[] }`
FIFO queue of upcoming food to spawn.

### `fruitIntervals: { [sessionId: string]: Interval }`
Per-session loop interval that controls spawning and physics.

---
---

## Server Info

- **Port**: `4000` (local development)
- **Protocol**: `ws://` (WebSocket)
- **Session Storage**:
  - Local: `./src/data/sessionID.json`
  - Production: **PostgreSQL on Railway**
- **Frontend Deployment (Production)**:  
  Hosted on Vercel - communicates with this WebSocket backend via `wss://` in deployed mode.
