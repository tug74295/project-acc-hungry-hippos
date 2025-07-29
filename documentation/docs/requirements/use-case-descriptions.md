---
sidebar_position: 5
---

# Use-case descriptions
## Use Case 1 - Start Game Session (Host) 
*As a host, I want to initiate a new game session from my device, so that players can join.*

1. The host opens the game and chooses to start a new session.
2. A unique game code and QR code is created and shown on their screen.
3. The host shares this code (or QR code) with those who want to join.
4. As players join the game, their hippo avatars and roles appear on the host’s screen.
5. Once at least one AAC user and one hippo player have joined, the host can begin the game.

## Use Case 2 – Join Game Session (Hippo Player or AAC User)
*As a hippo player or AAC User, I want to join a game session using a code so that I can play the game.*

1. A player opens the game on their device.
2. They enter or scan the game code that was shared by the host.
3. They choose a role: Hippo Player or AAC User
4. Hippo Players also choose a hippo color.
5. Once joined, they wait until the host starts the game.

## Use Case 3 – Start Game (Host)
*As a host, I want to start the game after players have joined so that everyone can begin playing.*

1. After players have joined, the host sees a “Start Game” button appear.
2. The Host taps "Start Game".
3. The game starts right away for all players.
4. The Host can see in the Spectator Mode the game timer counting down, food beginning to spawn for the hippos, the leaderboard, and what the AAC user has selected as a target food for the hippos

## Use Case 4 – Control Food Queue (AAC User)
*As an AAC user, I want to control the food in the queue so that I can challenge players.*

1. During the game, the AAC user sees a menu of foods they can pick from.
2. They tap the foods they want the other players to go after.
3. They can also choose a special effect, like Freeze or Grow
4. The foods they picked becomes the new target for all the hippos playing.
5. The chosen food appears on screen, and players try to catch it with their hippos.

## Use Case 5 – Eats Food (Player)
*As a player, I want to move my hippo on my side and eat the correct food so that I can earn points.*

1. Food spawn out from the center of the screen toward each hippo player.
2. The screen shows which food the AAC user has selected as the target.
3. The player moves their hippo along their edge of the screen to try to catch that food.
4. If they catch the correct food, they earn a point — and may receive a bonus effect like growing bigger.
5. If they catch the wrong food, they may lose a point or trigger a penalty like being frozen.
6. The game continues until the timer runs out.


## Use Case 6 – Game Timer and End State (Host)
*As a player or AAC user, I want the game to end automatically after time runs out so we know when the round is over.*

1. When the host starts the game, a game timer begins for all players.
2. The timer counts down while the AAC user selects foods and hippo players try to catch them.
3. When the timer reaches zero, the game ends automatically.
4. A victory screen appears, showing each player’s final score in a leaderboard.
5. The host then chooses to either play again or end the game.

## Use Case 7 – Play Again (AAC User or Player)
*As an AAC user or player, I want to play another game session after a round ends.*

1. After the game ends, if the host taps or uses audio to “Play Again”, go to Use Case 3. 
2. If the host taps or uses audio to “End Game”, all users are redirected to the game homescreen.
