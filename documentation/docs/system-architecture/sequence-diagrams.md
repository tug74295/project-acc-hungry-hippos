---
sidebar_position: 4
---

# Sequence Diagrams

## Use Case 1 - Start Game Session (Host Player) 
*As a player, I want to initiate a new game session from my device, acting as the host, so that other players can join and I can control the game session. *
1. The Host Player opens their Host Interface and authenticates with the Auth Service (Firebase), navigating to the session creation screen.
2. The Host Player selects the "Create Session" or "Host Game" control on their Host Interface.
3. The Host Interface sends a request to the Game Server to create a new game session, identifying itself as the session host.
4. The Game Server generates a unique Room Code, registers the Host Player, initializes the game state to "Lobby," and updates its internal lobby management.
5. The Game Server sends the generated Room Code back to the Host Interface.
6. The Host Interface displays the unique Room Code.
7. The Host Player communicates or shows the Room Code to nearby players.
8. The Host Interface shows a "Waiting for Players" screen.
9. AAC Device Identification: Separately, the AAC Interface (Hippo_Player_App on AAC user's device) indicates to the Game Server that it is the designated AAC device for the session. This allows the Game Server to properly direct AAC-specific game state and process AAC user inputs.
    
```mermaid
---
title: Sequence Diagram 1 – Start Game Session (Host Player) - No Facilitator Monitor
---

sequenceDiagram
    participant Host_Interface as Host Player Interface
    participant Game_Server as Game Server
    participant Auth_Service as Auth Service (Firebase Auth)
    participant AAC_Interface as AAC Player Interface

    Host_Interface->>Auth_Service: Authenticate (PlayerID request)
    Auth_Service-->>Host_Interface: PlayerID received

    Host_Interface->>Host_Interface: Host opens app & navigates to host screen
    Host_Interface->>Host_Interface: Host selects "Create Session" / "Host Game"

    Host_Interface->>Game_Server: Request new game session (as host)
    activate Game_Server
    Game_Server->>Game_Server: Generate unique Room Code
    Game_Server->>Game_Server: Register Host Player : Init Lobby GameState
    Game_Server-->>Host_Interface: Send Room Code
    deactivate Game_Server

    Host_Interface->>Host_Interface: Display Room Code
    Host_Interface->>Host_Interface: Display "Waiting for Players" screen
    Host_Interface->>Host_Interface: Host communicates code to nearby players

    AAC_Interface->>AAC_Interface: AAC User (or facilitator) indicates this is an AAC device
    AAC_Interface->>Game_Server: Send "I am AAC device" signal
    activate Game_Server
    Game_Server->>Game_Server: Register AAC device's PlayerID internally
    deactivate Game_Server
   
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

## Use Case 4 – Control Fruit Queue (AAC User)

*As an AAC user, I want to control the next three fruits in the queue so that I can challenge players.*

1. During gameplay, the AAC interface shows options for fruits to appear.
2. The AAC user selects the next fruit from a set of fruit buttons.
3. The selected fruit is queued to drop into the play area.
4. The next 1 fruit is visible on screen to all players.

```mermaid
---
title: Sequence Diagram 4 – Control Fruit Queue
---

sequenceDiagram
participant AAC_User as AAC User
participant AAC_Interface as AAC Interface
participant Fruit_Queue as Fruit Queue
participant Firebase as Firebase Realtime DB
participant Hippo_Player as Hippo Player
participant Hippo_Arena as Hippo Arena

AAC_User->>AAC_Interface: View available fruit options
AAC_User->>AAC_Interface: Select fruit to queue
AAC_Interface->>Fruit_Queue: Send selected fruit
Fruit_Queue->>Firebase: Update fruit queue in database
Firebase-->>Fruit_Queue: Confirm update
Fruit_Queue-->>AAC_Interface: Display updated fruit queue
AAC_Interface-->>AAC_User: Show updated queue (visual feedback)

Firebase-->>Hippo_Arena: Push updated fruit queue
Hippo_Arena-->>Hippo_Player: Display target fruit

```

## Use Case 5 – Eats Fruit (Player)

*As a player, I want to move my hippo around the arena and eat the correct fruit so that I can earn points.*

1. Fruits spawn and are placed randomly across the arena in real time.
2. The player watches the displayed queue to know which fruit is “correct.”
3. The player moves their hippo toward the fruits on the arena.
4. If correct, a point is awarded.
5. If incorrect, no point is awarded (or a penalty is applied).

```mermaid
---
title: Sequence Diagram 5 – Eats Fruit
---

sequenceDiagram
participant Hippo_Player as Hippo Player
participant Hippo_Arena as Hippo Arena
participant Fruit_Queue as Fruit Queue
participant Firebase as Firebase Realtime DB

Fruit_Queue->>Hippo_Arena: Spawn fruits randomly
Firebase-->>Hippo_Player: Push current target fruit

Hippo_Player->>Hippo_Arena: Move hippo toward fruit
Hippo_Arena->>Hippo_Arena: Detect collision with fruit

alt Collision with correct fruit
    Hippo_Arena-->>Hippo_Player: Award point
    Hippo_Arena-->>Firebase: Update player score
else Collision with incorrect fruit
    Hippo_Arena-->>Hippo_Player: No point (or apply penalty)
end

Firebase-->>Hippo_Player: Sync updated score

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