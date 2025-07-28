---
sidebar_position: 5
---

# Class Diagrams

## Backend

```mermaid
classDiagram
    direction RL

    class WebSocketServer {
        +httpServer: http.Server
        +wss: WebSocket.Server
        +sessions: Map~string, Session~
        +setupDatabase()
        +broadcast(sessionId, data)
        +onConnection(ws)
        +handleUpgrade(request, socket, head)
        +listen(port)
    }

    class Session {
        +sessionId: string
        +clients: Set~Client~
        +scores: Map~string, number~
        +fruitQueue: Food[]
        +activeFoods: FoodInstance[]
        +gameMode: string
        +currentTargetFoodId: string
        +currentTargetEffect: string
        +fruitInterval: Interval
        +startGame(mode)
        +enqueueFood(food)
        +handlePlayerAction(action)
        +broadcastState()
    }

    class Client {
        +userId: string
        +role: string
        +color: string
        +edge: string
        +ws: WebSocket
        +send(data)
    }

    class Food {
        +id: string
        +name: string
    }

    class FoodInstance {
        +instanceId: string
        +foodId: string
        +x: number
        +y: number
        +vx: number
        +vy: number
        +effect: string
    }

    class DatabaseService {
        <<PostgreSQL>>
        +pool: Pool
        +setupTables()
        +saveSession(sessionId)
        +addPlayer(sessionId, userId, role)
        +removePlayer(sessionId, userId)
        +sessionExists(sessionId)
    }

    WebSocketServer "1" *-- "*" Session : manages
    Session "1" *-- "*" Client : tracks
    Session "1" o-- "*" FoodInstance : spawns
    FoodInstance "1" -- "1" Food : is an instance of
    WebSocketServer ..> DatabaseService : persists
```

**Figure 1.** This diagram illustrates the architecture of our current backend service.

### Relationships

The primary entry point is the WebSocketServer, which is responsible for managing all active game rooms. For each game, it creates and holds a Session instance.

Each Session encapsulates the entire state and logic for a single game. It contains the set of connected Client objects and tracks all activeFoods, the fruitQueue, and player scores. The startGame and handlePlayerAction methods contain the core game logic, and a central game loop broadcasts the state to all players. A FoodInstance represents a specific food item currently on screen, with its own position and velocity. Each FoodInstance is an instance of a static Food object, which simply holds the food's name and ID.

For production, the WebSocketServer uses the DatabaseService to save and load session and player data, ensuring data is persisted.

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
