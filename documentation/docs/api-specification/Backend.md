---
sidebar_position: 2
description: Backend API
---

# Backend API

---

## Overview

The backend is a **real-time multiplayer game server** implemented in **Node.js** using the `ws` WebSocket library. It manages active game sessions, tracks scores and players, and arranges all real-time gameplay logic including spawning food, and effects.

The server does **not** use REST endpoints. All communication is performed using WebSocket messages.


- **Production**: Uses **PostgreSQL (via Railway)** to persist session/player data.
- **Local Development**: Uses a JSON file for session storage.

---

## Session and Player Lifecycle

### `CREATE_SESSION`
- **Purpose**: Generates a new unique `sessionId`.
- **Pre-conditions**: None.
- **Post-conditions**:
  - Local: New entry added to `sessionID.json`.
  - Prod: New row inserted in `sessions` table.
- **Returns**: `{ sessionId: string }`
- **Example**: `{ "ABCDE" }`

### `PLAYER_JOIN`
- **Purpose**: Joins a user to a session and stores role/color.
- **Pre-conditions**: `sessionId` must exist.
- **Post-conditions**:
  - Socket added to session’s connection set.
  - Broadcasts updated user list.
  - Updates database if in production.
- **Returns**: Broadcasts `PLAYER_JOINED_BROADCAST` and `USERS_LIST_UPDATE`.
- **Example**:  
  ```js
  {
    type: "PLAYER_JOIN",
    payload: {
      sessionId: "ABCDE",
      userId: "User123",
      role: "Hippo Player",
      color: "blue"
    }
  }

---

## WebSocket Communication

The server operates by receiving messages from clients and broadcasting **state updates** to all clients in a given session.

### Client-to-Server Messages

| Message Type            | Payload Shape                              | Example                                            | Description |
|-------------------------|--------------------------------------------|----------------------------------------------------|-------------|
| `CREATE_SESSION`        | `{}`                                       | `{}`                                               | Requests a new unique session ID. |
| `VALIDATE_SESSION`      | `{ sessionId: string }`                    | `{ "ABCDE" }`                                      | Validates session ID. |
| `PLAYER_JOIN`           | `{ sessionId, userId, role, color }`       | `{ "ABCDE", "User123", "Hippo Player", "blue" }`   | Adds user to session and syncs presence. |
| `PLAYER_MOVE`           | `{ sessionId, userId, x, y }`              | `{ "ABCDE", "User123", 100, 200 }`                 | Sends current player position. |
| `AAC_FOOD_SELECTED`     | `{ sessionId, food, effect }`              | `{ "ABCDE", { "apple" }, null }`                   | Target food selection by AAC user. |
| `START_GAME`            | `{ sessionId, mode }`                      | `{ "ABCDE", "Medium" }`                            | Initializes game loop, spawns food. |
| `START_TIMER`           | `{ sessionId }`                            | `{ "ABCDE" }`                                      | Starts countdown (180s). |
| `SET_EDGE`              | `{ sessionId, userId, edge }`              | `{ "ABCDE", "User123", "bottom" }`                 | Assigns spawn angle per player. |
| `FRUIT_EATEN`           | `{ sessionId, instanceId }`                | `{ "ABCDE", "food-12-User123" }`                   | Tells server to remove food from list. |
| `FRUIT_EATEN_BY_PLAYER` | `{ sessionId, userId, isCorrect, effect }` | `{ "ABCDE", "User123", true, "grow" }`             | Updates score and clears effect. |
| `PLAYER_EFFECT_APPLIED` | `{ sessionId, targetUserId, effect }`      | `{ "ABCDE", "User123", "freeze" }`                 | Triggers visual effect. |
| `SELECT_COLOR`          | `{ sessionId, userId, color }`             | `{ "ABCDE", "User123", "green" }`                  | Assigns a color to a user. |

---

### Server → Client Broadcasts

| Message Type               | Payload Shape                                | Example                                                               | Description |
|----------------------------|----------------------------------------------|-----------------------------------------------------------------------|-------------|
| `SESSION_CREATED`          | `{ sessionId: string }`                      | `{ "ABCDE" }`                                                         | A new session was created. |
| `SESSION_VALIDATED`        | `{ sessionId: string, isValid: boolean }`    | `{ "ABCDE", true }`                                                   | Result of a validation request. |
| `PLAYER_JOINED_BROADCAST`  | `{ userId, role, color }`                    | `{ "User123", "Hippo Player", "blue" }`                               | Sent when new player joins. |
| `USERS_LIST_UPDATE`        | `{ users: [{ userId, role, color }] }`       | `{ [{ "User123", "Hippo Player", "blue" }, { "User456", "AAC User" }] }` | Updated player list. |
| `FOOD_STATE_UPDATE`        | `{ foods: [...] }`                           | `{ [{ "food-12-User123", "apple", 100, 200 }] }`                      | Broadcasts food positions. |
| `AAC_TARGET_FOOD`          | `{ targetFoodId, targetFoodData, effect }`   | `{ "apple", { "apple" }, null }`                                      | Designates target food. |
| `SCORE_UPDATE_BROADCAST`   | `{ scores: { [userId]: number } }`           | `{ "User123": 3, "User456": 1 }`                                     | Live score updates. |
| `REMOVE_FOOD`              | `{ instanceId: string }`                     | `{ "food-12-User123" }`                                               | Removes food from client canvas. |
| `PLAYER_EFFECT_BROADCAST`  | `{ targetUserId, effect }`                   | `{ "User456", "freeze" }`                                            | Applies power-up or penalty effect. |
| `COLOR_UPDATE`             | `{ takenColors: string[] }`                  | `{ ["blue", "red"] }`                                                 | Sends all chosen player colors. |
| `TIMER_UPDATE`             | `{ secondsLeft: number }`                    | `{ 45 }`                                                              | Countdown timer for game end. |
| `GAME_OVER`                | `{}`                                         | `{}`                                                                  | Signals game end state. |

---

## Utility Functions

### `generateSessionId(length = 5)`

Generates a random alphanumeric session ID consisting of uppercase letters and digits.

- **Parameters**:
  - `length` (`number`) - Optional. Defaults to `5`.
- **Returns**:
  - `string` - Random session ID.
  - **Example**: `{ "ABCDE" }`
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
  - **Example**: `{ "ABCDE" }`
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
  - **Example**: `{ id: "apple", name: "Apple", imagePath: "/assets/fruits/apple.png" }`
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
- **Example**:  
  ```js
  broadcast("ABCDE", {
    type: "SCORE_UPDATE_BROADCAST",
    payload: { scores: { User123: 3, User456: 1 } }
  });


---

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

## Server Info

- **Port**: `4000` (local development)
- **Protocol**: `ws://` (WebSocket)
- **Session Storage**:
  - Local: `./src/data/sessionID.json`
  - Production: **PostgreSQL on Railway**
- **Frontend Deployment (Production)**:  
  Hosted on Vercel - communicates with this WebSocket backend via `wss://` in deployed mode.
