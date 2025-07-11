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

## Use Case 5  
Description:  
A Hippo player slides their hippo along the edge of the arena and attempts to eat the correct fruit launched by the AAC user.

Assertion: 
* Fruits are launched from the center and bounce outward.  
* Hippos are restricted to their assigned edge (top, bottom, left, or right).  
* Players can slide their hippo along their edge using input controls.  
* When a hippo collides with the correct fruit (from the visible AAC queue), the player earns 1 point.  
* If the hippo eats a wrong fruit, no points are awarded (or a penalty may occur).  
* Real-time score updates are reflected on all player and AAC user screens.

## Use Case 6  
Description:  
The game session ends automatically when the timer reaches zero, and a final score screen is displayed.

Assertion: 
* A default timer is set when the game begins.  
* The timer begins once the host taps “Start Game.”  
* The game state transitions to “ended” when time runs out.   
* A final score screen is displayed to all participants 
* Options for “Play Again” and “End Game” are shown to the host.

## Use Case 7  
Description:  
Players or the AAC user opt to either replay the game or exit to the home screen.

Assertion:
* Choosing “Play Again” resets the game:  
  - Scores are cleared.  
  - Fruit queue is emptied.  
  - Players return to the role selection or session lobby.  
* Choosing “End Game” navigates all clients to the home/landing screen.  
* The backend session data is cleaned up or marked as inactive.