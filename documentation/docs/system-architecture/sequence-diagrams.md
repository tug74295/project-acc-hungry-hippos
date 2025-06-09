---
sidebar_position: 4
---

# Sequence Diagrams

## Use Case 1 - Start Game Session (Host Player) 
*As a player, I want to initiate a new game session from my device, acting as the host, so that other players can join and I can control the game flow. *
1. The Host Player opens the Hippo Player App on their device and, after successful authentication via Firebase, navigates to the session creation screen.
2. The Host Player selects the "Create Session" or "Host Game" control within their Hippo Player App interface.
3. The Hippo Player App sends a request to the Game Conductor App (server) to create a new game session, identifying itself as the session host.
4. The Game Conductor App generates a unique Room Code for the session, registers the Host Player, initializes the game state to "Lobby," and updates its internal lobby management.
5. The Game Conductor App sends the generated Room Code back to the Host Player's Hippo Player App.
6. The Host Player's Hippo Player App displays the unique Room Code clearly on their screen.
7. The Host Player communicates or shows the Room Code to nearby players.
8. The Game Conductor App updates the Game Conductor Monitor to show the active lobby and connected players. The Host Player's Hippo Player App shows a "Waiting for Players" screen.
9. AAC Device Identification: Separately (either upon launch of their Hippo Player App or via a specific in-app selection by a facilitator), the Hippo Player App on the AAC user's device indicates to the Game Conductor App that it is the designated AAC device for the session. This allows the Game Conductor App to properly direct AAC-specific game state (like current viewport fruits for selection) and process AAC user inputs.

```mermaid

   sequenceDiagram
    participant Host_Player_App as Hippo Player App (Host Player Device)
    participant GC_App as Game Conductor App (Server)
    participant Firebase_Auth as Firebase Authentication
    participant GC_User as Game Conductor User (Facilitator)
    participant AAC_Player_App as Hippo Player App (AAC User Device)

    Host_Player_App->>Firebase_Auth: Authenticate (get PlayerID)
    Firebase_Auth-->>Host_Player_App: PlayerID
    Host_Player_App->>Host_Player_App: Host Player opens app & navigates to session creation screen
    Host_Player_App->>Host_Player_App: Host Player selects "Create Session" / "Host Game"

    Host_Player_App->>GC_App: Request to create new game session (as host)
    activate GC_App
    GC_App->>GC_App: Generates unique Room Code
    GC_App->>GC_App: Registers Host Player
    GC_App->>GC_App: Initializes GameState to "Lobby"
    GC_App->>GC_User: Updates Game Conductor Monitor (shows empty lobby)
    GC_App-->>Host_Player_App: Sends Room Code
    deactivate GC_App

    Host_Player_App->>Host_Player_App: Displays unique Room Code on screen
    Host_Player_App->>Host_Player_App: Host_Player_App shows "Waiting for Players" screen
    Host_Player_App->>Host_Player_App: Host Player communicates code to nearby players

    AAC_Player_App->>AAC_Player_App: AAC User (or facilitator) indicates this is AAC device
    AAC_Player_App->>GC_App: Sends "I am AAC device" signal
    activate GC_App
    GC_App->>GC_App: Registers AAC device's PlayerID internally
    deactivate GC_App

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
