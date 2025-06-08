---
sidebar_position: 5
---

# Use-case descriptions

## Use Case 1 - Start Game Session (Player or AAC User)
*As an player or an AAC user, I want to start a game session from my device so that others can join and I can host the game.*

1. The player or AAC user opens the game interface/ website on their device.
2. They select the "Create Game" button or using audio.
3. A unique room code is generated and displayed. They are now the host.
4. The host communicates or shows the code to nearby players.
5. The interface shows a waiting screen of players who players join.

## Use Case 2 – Join Game Session (Player or AAC User)
*As a player or AAC User, I want to join a game session using a code so that I can play the game.*

1. A player opens the game/ website on their device.
2. They enter the room code or using audio provided by the host.
3. They tap “Join Game” or using audio.
3. Once the code is accepted, they are added to the game lobby.
4. The player waits until the host starts the game.

## Use Case 3 – Start Game (Host)
*As an host, I want to start the game after players have joined so that everyone can begin playing.*

1. The host (AAC user or player) sees a "Begin Game” button on their screen and lobby of all joined players.
2. They select "Begin Game” by clicking the button or with audio.
3. All connected devices (iPad/ tablet/ laptop) switch to the gameplay screen.
4. A 3-second countdown begins before the game starts.

## Use Case 4 – Control Fruit Queue (AAC User)
*As an AAC user, I want to control the next three fruits in the queue so that I can challenge players.*

1. During gameplay, the AAC interface shows options for fruits to appear. There is also a queue able to hold 3 fruits.
2. The AAC user selects a fruit from a set of fruit buttons or with audio.
3. The selected fruit is displayed to the next available index of the queue. 
4. AAC user repeats steps 2 - 3 until queue is full. If queue is full and AAC player selects a fruit, it will replace fruit in the queue's first index. 
4. The fruit in the queue's first index is visible on screen to all players.

## Use Case 5 – Eat Correct Fruit (Player)
*As a player, I want to eat the correct fruit displays so that I can earn points.*

1. Fruits spawns randomly on screen.
2. The player watches the queue to know which fruit is “correct.”
3. The player moves hippo avatar to hover over fruit image to eat.
4. If correct, a point is awarded.
5. If incorrect, no point is awarded.

## Use Case 6 – Game Timer and End State (Host)
*As a player or AAC user, I want the game to end automatically after 1 minute so we know when the round is over.*

1. The host (AAC user or player) sees a timer selection screen. 
2. There is a 60-second dafault timer. Host can use buttons or audio to change time.
3. Host starts game. See User Case 3.
4. When the timer reaches 0, the game ends.
5. A score screen is shown to all players.
6. The host sees a “Play Again” or “End Game” option.

## Use Case 7 – Play Again (AAC User or Player)
*As an AAC user or player, I want to play another game session after a round ends.*

1. After the game ends, if the host taps or uses audio to “Play Again”, go to Use Case 3. 
2. If host taps or uses audio to “End Game”, all users are redirected to game homescreen.
