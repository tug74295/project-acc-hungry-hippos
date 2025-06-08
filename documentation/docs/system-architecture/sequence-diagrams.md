---
sidebar_position: 3
---

# Sequence Diagrams

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