---
sidebar_position: 5
---

# Class Diagrams

## Backend

classDiagram
    direction RL

    class WebSocketServer {
        +List~GameSession~ activeSessions
        +handleNewConnection()
        +routeMessage(message)
    }

    class GameSession {
        +string sessionId
        +Map~string, Player~ players
        +addPlayer(player)
        +removePlayer(playerId)
        +handlePlayerAction(action)
        +broadcastState()
    }

    class GameState {
        +object scores
        +object playerPositions
        +object fruitPositions
    }

    class Player {
        +string playerId
        +WebSocket webSocketConnection
    }

    class FirebaseDB {
        <<Service>>
        +saveGameState(gameState)
        +loadGameState(sessionId)
    }

    class AuthValidator {
        <<Service>>
        +validateToken(token)
    }

    WebSocketServer "1" *-- "0..*" GameSession : manages
    GameSession "1" *-- "1..*" Player : contains
    GameSession "1" *-- "1" GameState : has
    WebSocketServer ..> AuthValidator : uses
    GameSession ..> FirebaseDB : uses

### Relationships
This diagram illustrates the architecture of our backend services.

The primary entry point is the WebSocketServer, which is responsible for managing all active game rooms. For each game, it creates and holds a GameSession instance.

Each GameSession then contains the list of connected Player objects and is composed of a GameState object, which tracks live data like scores and positions. To ensure security, the WebSocketServer uses an AuthValidator service to verify players when they first connect. During gameplay, the GameSession uses the FirebaseDB service to save and load the game's state, ensuring data is persisted.

## Frontend

