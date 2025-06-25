---
sidebar_position: 5
---

# Class Diagrams

**Note this project still being completed so parts of front and backend documentation are not completely finished**

## Backend

```mermaid
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
```

### Relationships
This diagram illustrates the architecture of our backend services.

The primary entry point is the WebSocketServer, which is responsible for managing all active game rooms. For each game, it creates and holds a GameSession instance.

Each GameSession then contains the list of connected Player objects and is composed of a GameState object, which tracks live data like scores and positions. To ensure security, the WebSocketServer uses an AuthValidator service to verify players when they first connect. During gameplay, the GameSession uses the FirebaseDB service to save and load the game's state, ensuring data is persisted.

## Frontend

```mermaid
classDiagram
direction RL

class App {
  +LandingPage
  +GamePage
}

class LandingPage {
  -code: string[]
  -inputsRef: HTMLInputElement[]
  -handleStart()
  -handleCreateGame()
  -handleChange()
}

class GamePage {
  -phaserRef: IRefPhaserGame
  -fruitStack: Fruit[]
  -handleSelectedFruit()
}

class AacInterface {
  -selectedFruit: Fruit
  +onFruitSelected(fruit)
}

class PhaserGame {
  +scene: GameScene
}

class ButtonClick {
  +text: string
  +onClick()
}

class Fruit {
  +id: string
  +name: string
  +imagePath: string
}


class GameScene {
  -fruits: Group
  -fruitKeys: string[]
  -lanePositions: number[]
  -fruitSpawnTimer: TimerEvent
  +startSpawningFruit()
  +addFruitManually(fruitKey: string)
  +spawnFruit()
  +update()
}

App --> LandingPage
App --> GamePage

LandingPage --> ButtonClick
GamePage --> AacInterface
GamePage --> PhaserGame
AacInterface --> Fruit
GamePage --> Fruit

PhaserGame --> GameScene : manages
```

### Relationships

This diagram illustrates the architecture of our frontend.

The frontend of the game is built with React and Phaser, structured into key pages and components. The App component handles routing between the LandingPage and GamePage. On the LandingPage, users can join or create a game. The GamePage displays both the AAC interface—where users select fruits—and the game area powered by Phaser. The selected fruit is sent to the PhaserGame, which triggers falling fruit animations. Game logic, including asset loading and physics, is managed in the GameScene class. This setup cleanly separates UI and game logic, supporting accessibility and smooth interaction.
