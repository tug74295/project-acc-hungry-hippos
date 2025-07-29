---
sidebar_position: 4
---

# Sequence Diagrams

## Use Case 1 - Start Game Session (Host)
*As a host, I want to initiate a new game session from my device, so that players can join.*
1. The host opens the game and chooses to start a new session.
2. A unique game code and QR code is created and shown on their screen.
3. The host shares this code (or QR code) with those who want to join.
4. As players join the game, their hippo avatars and roles appear on the host’s screen.
5. Once at least one AAC user and one hippo player have joined, the host can begin the game.inputs.
    
```mermaid
---
title: Sequence Diagram – Start Game Session (Host)
---

sequenceDiagram
    participant Host
    participant Server
    participant Players

    Host->>Server: Select "No code? Create new game!"
    activate Server
    Server->>Server: Generate game code + QR code
    Server-->>Host: Send code and QR for display
    deactivate Server

    Host->>Players: Share code/QR

    loop Each player joins
        Players->>Server: Join using code
        Server->>Server: Register player and assign role
        Server-->>Host: Show new avatar & role
    end

    Server-->>Host: One AAC user + one hippo joined
    Host->>Server: Begin game

```


## Use Case 2 – Join Game Session (Player or AAC User)
*As a player or AAC User, I want to join a game session using a code so that I can play the game.*

1. A player opens the game/ website on their device.
2. They enter the room code or use the audio provided by the host.
3. They tap “Join Game” or use audio.
4. Once the code is accepted, they are added to the game lobby.
5. The player waits until the host starts the game.


```mermaid
---
title: Sequence Diagram 2 – Join Game Session
---

sequenceDiagram
    participant AAC_User as AAC User
    participant Hippo_Player as Player
    participant Interface as AAC/Player Interface
    participant Vercel as Vercel Hosting
    participant Firebase as Firebase Realtime DB

    AAC_User->>Vercel: Open game URL
    Hippo_Player->>Vercel: Open game URL
    Vercel-->>AAC_User: Serve Interface
    Vercel-->>Hippo_Player: Serve Interface

    AAC_User->>Interface: Enter room code & tap "Join"
    Hippo_Player->>Interface: Enter room code & tap "Join"

    Interface->>Firebase: Validate room code
    Firebase-->>Interface: Room code valid / invalid

    Interface->>Firebase: Add AAC_User to lobby
    Interface->>Firebase: Add Hippo_Player to lobby

    Firebase-->>Interface: Return lobby data
    Interface-->>AAC_User: Display lobby
    Interface-->>Hippo_Player: Display lobby


```

## Use Case 3 – Start Game (Host)
*As a host, I want to start the game after players have joined so that everyone can begin playing.*

1. The Host Player sees a "Start Game" button on their game interface.
2. The Host Player taps "Start Game".
3. The Host Player's interface sends a command to Firebase to start the game.
4. Firebase updates the central game state to begin a 3-second countdown.
5. All connected player interfaces (Host, AAC User, and other players) receive the updated game state and switch to a gameplay screen, displaying the countdown.
6. When the countdown ends, the game officially starts, and gameplay begins on all connected screens.

```mermaid
---
title: Sequence Diagram 3 – Start Game
---

sequenceDiagram
    participant Host_Player  as Host Player
    participant AAC_User     as AAC User
    participant Other_Player as Other Player
    participant Interface    as Game Interface (Client Apps)
    participant Firebase     as Firebase Realtime DB

    %% ─── Host starts the game ─────────────────────────────
    Host_Player ->> Interface: Sees “Start Game” button
    Host_Player ->> Interface: Taps “Start Game”

    %% ─── Command sent to backend ──────────────────────────
    Interface   ->> Firebase  : start_game command
    Firebase    ->> Firebase : Set state to countdown (3 s)

    %% ─── Countdown broadcast to all clients ───────────────
    Firebase  -->> Interface : Broadcast state – countdown
    Interface  ->> Host_Player  : Show 3-second countdown
    Interface  ->> AAC_User     : Show 3-second countdown
    Interface  ->> Other_Player : Show 3-second countdown

    %% ─── Countdown ends ───────────────────────────────────
    Firebase    ->> Firebase : Countdown ends
    Firebase    ->> Firebase : Set state to playing
    Firebase  -->> Interface : Broadcast state – playing

    %% ─── Gameplay screen appears ──────────────────────────
    Interface  ->> Host_Player  : Display gameplay screen
    Interface  ->> AAC_User     : Display gameplay screen
    Interface  ->> Other_Player : Display gameplay screen

```

## Use Case 4 – Control Food Queue (AAC User)

*As an AAC user, I want to control the food in the queue so that I can challenge players.*

1. During the game, the AAC user sees a menu of foods they can pick from.
2. They tap the foods they want the other players to go after.
3. They can also choose a special effect, like Freeze or Grow
4. The foods they picked becomes the new target for all the hippos playing.
5. The chosen food appears on screen, and players try to catch it with their hippos.

```mermaid
---
title: Sequence Diagram 4 – Control Food Queue
---

sequenceDiagram
    participant AAC_User as AAC User
    participant AAC_Interface as AAC Interface (React)
    participant WebSocket_Client as WebSocket Context
    participant Game_Server as WebSocket Server
    participant Phaser_Scene as Phaser Game Scene
    participant Hippo_Player as Hippo Player (Phaser)

    AAC_User->>AAC_Interface: Select food and (optionally) effect
    AAC_Interface->>WebSocket_Client: sendMessage({ type: 'AAC_FOOD_SELECTED', payload })
    WebSocket_Client->>Game_Server: WebSocket → AAC_FOOD_SELECTED

    Game_Server->>Game_Server: Update currentTargetFoodId and effect
    Game_Server->>Game_Server: Unshift food into food queue

    Game_Server-->>All: Broadcast AAC_TARGET_FOOD (targetFoodId, foodData, effect)

    AAC_Interface-->>AAC_User: Show "You selected: [Food]"
    Hippo_Player-->>Phaser_Scene: Display new target food in sidebar

```

## Use Case 5 – Eats Food (Player)

*As a player, I want to move my hippo on my side and eat the correct food so that I can earn points.*

1. Food spawn out from the center of the screen toward each hippo player.
2. The screen shows which food the AAC user has selected as the target.
3. The player moves their hippo along their edge of the screen to try to catch that food.
4. If they catch the correct food, they earn a point — and may receive a bonus effect like growing bigger.
5. If they catch the wrong food, they may lose a point or trigger a penalty like being frozen.
6. The game continues until the timer runs out.

```mermaid
---
title: Sequence Diagram 5 – Eats Food
---

sequenceDiagram
    participant Hippo_Player as Hippo Player (Phaser)
    participant Phaser_Scene as Game Scene
    participant Game_Server as WebSocket Server
    participant WebSocket_Client as WebSocket Context
    participant AAC_User as AAC User

    Hippo_Player->>Phaser_Scene: Move hippo toward food
    Phaser_Scene->>Phaser_Scene: Detect collision with food

    alt Collision with correct food
        Phaser_Scene->>Phaser_Scene: Apply effect (e.g. freeze, grow)
        Phaser_Scene->>Game_Server: sendMessage(FRUIT_EATEN_BY_PLAYER)
        Phaser_Scene->>Game_Server: sendMessage(FRUIT_EATEN with instanceId)
    else Collision with incorrect food
        Phaser_Scene->>Game_Server: sendMessage(FRUIT_EATEN_BY_PLAYER)
    end

    Game_Server->>Game_Server: Update scores
    Game_Server-->>All Clients: Broadcast SCORE_UPDATE_BROADCAST
    Game_Server-->>All Clients: Broadcast REMOVE_FOOD
    Game_Server-->>Phaser_Scene: Emit scoreUpdate, removeFruit

    Phaser_Scene-->>Hippo_Player: Update score, remove eaten food

```

## Use Case 6 – Game Timer and End State (Host)
*As a player or AAC user, I want the game to end automatically after 1 minute so we know when the round is over.*

1. The host sees a timer selection screen.
2. There is a 60-second default timer. The host can use buttons or audio to change the time.
3. The host starts the game. See User Case 3.
4. When the timer reaches 0, the game ends.
5. A score screen is shown to all players.
6. The host sees a “Play Again” or “End Game” option.

```mermaid
---
title: Sequence Diagram 6 - Game Timer and End State (Host)
---
sequenceDiagram
participant Host as Host Player
participant Game_UI as Game UI
participant Timer as Game Timer
participant All_Players as All Players
participant Firebase as Firebase Realtime DB

Host->>Game_UI: Open timer selection screen
Game_UI-->>Host: Show default timer (60 seconds)
Host->>Game_UI: Adjust timer (optional via button/audio)
Host->>Game_UI: Start game
Game_UI->>Timer: Start countdown

Timer-->>Game_UI: Timer ticks down
Timer-->>Game_UI: Timer reaches 0
Game_UI->>All_Players: Show score screen
Game_UI->>Host: Show “Play Again” or “End Game” options

```


## Use Case 7 – Play Again (AAC User or Player)
*As an AAC user or player, I want to play another game session after a round ends.*

1. After the game ends, if the host taps or uses audio to “Play Again”, go to Use Case 3.
2. If the host taps or uses audio to “End Game”, all users are redirected to the game homescreen.

```mermaid
---
title: Sequence Diagram – Play Again Option
---

sequenceDiagram
participant Host as Host Player
participant Game_UI as Game UI
participant All_Players as All Players
participant Firebase as Firebase Realtime DB

alt Host chooses "Play Again"
    Host->>Game_UI: Tap/voice "Play Again"
    Game_UI->>Firebase: Reset game state
    Game_UI->>All_Players: Go to Use Case 3 (Start New Game)
else Host chooses "End Game"
    Host->>Game_UI: Tap/voice "End Game"
    Game_UI->>All_Players: Redirect to game home screen
end
```