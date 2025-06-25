---
sidebar_position: 2
description: Backend API
---

# Backend API

## Table of Contents
- [Overview](#overview)
- [Utility Functions](#utility-functions)
  - [generateSessionId](#generate-session-id)
  - [generateUniqueSessionId](#generate-unique-session-id)
- [Endpoints](#endpoints)
  - [GET /sessions](#get-sessions)
  - [POST /sessions](#post-sessions)
  - [POST /create-session](#post-create-session)
  - [POST /validate-session](#post-validate-session)
- [Server Info](#server-info)

## Overview

This server manages session codes using Express, with endpoints to create, save, validate session IDs stored in a local JSON file. This is for testing for now. Will be transfered to Firebase.

## Utility Functions

### `generateSessionId(length = 5)` {#generate-session-id}
Generates a random alphanumeric session ID consisting of uppercase letters and digits.
- **Parameters:** `length` — number, defaults to `5`
- **Returns:** `string` — a randomly generated session ID

### `generateUniqueSessionId(existingSessions, length = 5)` {#generate-unique-session-id}
Generates a unique session ID that does not exist in the provided list.
- **Parameters:**
  - `existingSessions` — `string[]`
  - `length` — `number`, defaults to `5`
- **Returns:** `string` — a new unique session ID

## Endpoints

### `GET /sessions` {#get-sessions}
Returns the list of all existing session IDs from `sessionID.json`.

#### Response:
- `200 OK`: `{ sessions: string[] }`
- `500 Internal Server Error`: `{ message: 'Failed to read session data' }`

### `POST /sessions` {#post-sessions}
Adds a provided session ID to the JSON file if it is valid and not a duplicate.

#### Request Body:
```json
{
  "sessionId": "ABCDE"
}
```

#### Response:
- `200 OK`: `{ message: 'Session ID saved' }`
- `400 Bad Request`: `{ message: 'You are not valid for this website.' }`
- `500 Internal Server Error`: `{ message: 'Failed to save session ID' }`

### `POST /create-session` {#post-create-session}
Generates a new unique session ID, saves it to the JSON file, and returns it.

#### Response:
- `200 OK`: `{ sessionId: "ABCDE" }`
- `500 Internal Server Error`: `{ error: 'Failed to save session ID' }`

### `POST /validate-session` {#post-validate-session}
Checks if the provided game code exists in the session file.

#### Request Body:
```json
{
  "gameCode": "ABCDE"
}
```

#### Response:
- `200 OK`: `{ valid: true | false }`
- `400 Bad Request`: `{ valid: false, error: 'Invalid game code format' }`
- `500 Internal Server Error`: `{ valid: false }`

## Server Info
- **Port:** `4000`
- **CORS enabled**
- **Body parser enabled (JSON)**
- **Session file path:** `./src/data/sessionID.json`
