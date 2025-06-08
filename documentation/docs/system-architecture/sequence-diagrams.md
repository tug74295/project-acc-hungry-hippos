---
sidebar_position: 3
---

# Sequence Diagrams

## Use Case 2 – Join Game Session (Player or AAC User)
*As a player or AAC User, I want to join a game session using a code so that I can play the game.*

1. A player opens the game/ website on their device.
2. They enter the room code or using audio provided by the host.
3. They tap “Join Game” or using audio.
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

    %% Step 1: Users open the game via Vercel
    AAC_User->>Vercel: Open game URL
    Hippo_Player->>Vercel: Open game URL
    Vercel-->>AAC_User: Serve Interface
    Vercel-->>Hippo_Player: Serve Interface

    %% Step 2: Users interact with interface to join
    AAC_User->>Interface: Enter room code & tap "Join"
    Hippo_Player->>Interface: Enter room code & tap "Join"

    %% Step 3: Interface validates with backend
    Interface->>Firebase: Validate room code
    Firebase-->>Interface: Room code valid / invalid

    %% Step 4: Add user to session if valid
    Interface->>Firebase: Add AAC_User to lobby
    Interface->>Firebase: Add Hippo_Player to lobby

    %% Step 5: Show lobby state
    Firebase-->>Interface: Return lobby data
    Interface-->>AAC_User: Display lobby
    Interface-->>Hippo_Player: Display lobby


```

## Use Case 4 – Control Fruit Queue (AAC User)

*As an AAC user, I want to control the next three fruits in the queue so that I can challenge players.*

1. During gameplay, the AAC interface shows options for fruits to appear.
2. The AAC user selects the next fruit from a set of fruit buttons.
3. The selected fruit is queued to drop into the play area.
4. The next 1 fruit are visible on screen to all players.

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
3. The player moves their hippo toward fruits on the arena.
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