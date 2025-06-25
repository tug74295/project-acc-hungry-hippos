---
sidebar_position: 2
---
# Integration tests

We will be using Vitest and React Testing Library

## Use Case 1
Description:
A player initiates a new game session from a device, to allow others to join and begin the game.

Assertion:
* The host device sends a session creation request and receives a unique room code.
* The room code is displayed clearly on the host’s device.
* The session is registered and shown in the lobby state.
* The designated AAC device is properly identified and linked to the session.

## Use Case 2
Description:
A player or AAC user joins an existing game session using a provided session code.

Assertion:
* Valid session codes are accepted and verified.
* The joining device is added to the appropriate session lobby.
* Invalid or expired codes are rejected with proper feedback.
* Players and AAC users are listed in the lobby once joined.

## Use Case 3
Description:
The host player starts the game session once all players have joined.

Assertion:
* The host triggers the game start via the interface.
* Firebase updates the game state to begin a countdown.
* All connected clients receive a synced countdown and transition to gameplay view.
* The game begins simultaneously across all connected devices after countdown completes.

## Use Case 4
Description: AAC user chooses foods during gameplay to set the food drop queue  
Assertion: 
* Each tap adds the chosen food to the queue display.
* When the queue is full, a new tap bumps the queue's first index
* The food in the queue shows on every Hippo client