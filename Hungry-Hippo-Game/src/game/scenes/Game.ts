/**
 * @file Game.ts
 * @description This file defines the main Game scene for the Phaser game,
 * handling game logic, player interactions, food spawning, and score management.
 * It integrates with a shared movement store and sends player movement updates.
 */



import { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { AAC_DATA } from '../../Foods';
import { Hippo } from '../Hippo';
import { Edge, EdgeSlideStrategy } from '../EdgeSlideStrategy';
import { movementStore } from './MovementStore';
/**
 * Represents the main Game scene in Phaser.
 * This scene manages game elements like players (Hippos), food items,
 * scoring, and interactions. It also handles input and communicates
 * player movements to other clients.
 */
export class Game extends Scene {
  private hippo: Hippo | null = null;
  private foods: Phaser.Physics.Arcade.Group;
  private foodKeys: string[] = [];
  private lanePositions = [256, 512, 768];
  private foodSpawnTimer: Phaser.Time.TimerEvent;
  private currentTargetFoodId: string | null = null;
  private playerScores: Record<string, number> = {};
  private scoreText: Phaser.GameObjects.Text;
  private players: Record<string, Hippo> = {};
  //private playerId: string;
  private edgeAssignments: Record<string, string> = {};
  private availableEdges = [ 'bottom','top','right', 'left' ];
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  /**
   * Function to send messages to other clients (e.g., via a WebSocket).
   * @private
   */
  private sendMessage!: (msg: any) => void;
  /**
   * The ID of the local player.
   * @private
   */
  private localPlayerId!: string;

  constructor() {
    super('Game');
  }

  init(data: { sendMessage: (msg: any) => void; localPlayerId: string }) {
    this.sendMessage = data.sendMessage;
    this.localPlayerId = data.localPlayerId;
  }

  preload() {
    this.load.image('background', '/assets/presenterBg.png');
    AAC_DATA.categories.forEach(category => {
      category.foods.forEach(food => {
        if (food.imagePath) {
            console.log(`[PRELOAD] Loading food: ${food.id} from ${food.imagePath}`);

          this.load.image(food.id, food.imagePath);
        }
      });
    });
    this.load.spritesheet('character', '/assets/spritesheet.png', {
      frameWidth: 350,
      frameHeight: 425
    });
  }

  private getEdgePosition(edge: string) {
    const w = this.scale.width;
    const h = this.scale.height;
    const marginX = w * 0.05;
    const marginY = h * 0.05;
    switch (edge) {
      case 'top': return { x: w / 2, y: marginY };
      case 'bottom': return { x: w / 2, y: h - marginY };
      case 'left': return { x: marginX, y: h / 2 };
      case 'right': return { x: w - marginX, y: h / 2 };
      default: return { x: w / 2, y: h / 2 };
    }
  }

  public addPlayer(playerId: string) {
    //if (!(playerId in this.playerScores)) this.playerScores[playerId] = 0;
    if (!(playerId in this.players)) {
      const edge = (this.availableEdges.shift() || 'bottom') as Edge;
      this.edgeAssignments[playerId] = edge;
      const { x, y } = this.getEdgePosition(edge);
      const slideDistance = edge === 'top' || edge === 'bottom' ? this.scale.width * 0.8 : this.scale.height * 0.8;
      const strategy = new EdgeSlideStrategy(edge, slideDistance);
      const playerSprite = new Hippo(this, x, y, 'character', strategy);
      playerSprite.displayWidth = 85;
      playerSprite.displayHeight = 100;
      playerSprite.setCollideWorldBounds(true);
      playerSprite.setImmovable(true);
      switch (edge) {
        case 'top': playerSprite.setAngle(180); break;
        case 'left': playerSprite.setAngle(90); break;
        case 'right': playerSprite.setAngle(-90); break;
        case 'bottom': playerSprite.setAngle(0); break;
      }
      this.physics.add.overlap(playerSprite, this.foods, (_hippo, fruit) => {
        if (fruit instanceof Phaser.Tilemaps.Tile) return;
        const fruitGO = fruit instanceof Phaser.GameObjects.GameObject ? fruit : null;
        if (fruitGO) this.handleFruitCollision(playerId, fruitGO);
      });
      this.players[playerId] = playerSprite;
      if (playerId === this.localPlayerId) {
        this.hippo = playerSprite;
      }
    }
  }

  create() {
    this.add.image(512, 384, 'background');
    this.foods = this.physics.add.group();
    this.cursors = this.input!.keyboard!.createCursorKeys();
    this.addPlayer(this.localPlayerId);
    EventBus.emit('current-scene-ready', this);

    movementStore.subscribe(({ userId, x, y }) => {
      const player = this.players[userId];
      if (player) {
        player.setPosition(x, y);
      }
    });


    EventBus.emit('current-scene-ready', this);
    
    this.playerScores["host"] = this.playerScores["host"] || 0; 


    this.scoreText = this.add.text(32, 32, '', {
      fontSize: '24px',
      color: '#000',
      fontFamily: 'Arial',
      align: 'left',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      padding: { x: 10, y: 10 }
    });
    this.updateScoreText();

   
      
  }

  update() {
    if (this.hippo && this.cursors) {
      this.hippo.update(this.cursors);
      this.sendMessage?.({
        type: 'PLAYER_MOVE',
        payload: {
          userId: this.localPlayerId,
          x: this.hippo.x,
          y: this.hippo.y
        }
      });

    }
  }

  private handleFruitCollision(playerId: string, fruit: Phaser.GameObjects.GameObject) {
    fruit.destroy();
    if ('texture' in fruit && fruit instanceof Phaser.GameObjects.Sprite) {
      const foodId = fruit.texture.key;
      const isCorrect = foodId === this.currentTargetFoodId;
      if (isCorrect) {
        this.playerScores[playerId] += 1;
      } else {
        this.playerScores[playerId] = Math.max(0, this.playerScores[playerId] - 1);
      }
      this.updateScoreText();
      EventBus.emit('scoreUpdate', { scores: { ...this.playerScores } });
      EventBus.emit('fruit-eaten', { foodId, x: fruit.x, y: fruit.y });
    }
  }

  private updateScoreText() {
    const lines = Object.entries(this.playerScores)
      .map(([player, score]) => `${player}: ${score}`)
      .join('\n');
    this.scoreText.setText(lines);
  }

  public setFoodKeys(keys: string[]) {
    this.foodKeys = keys;
  }

  public startSpawningFood() {

    if (!this.foodSpawnTimer) {
      this.foodSpawnTimer = this.time.addEvent({
        delay: 1500,
        callback: this.spawnFood,
        callbackScope: this,
        loop: true
      });
    }
  }

  spawnFood() {
    console.log("[Game Scene] spawnFood() triggered by timer.");

    if (this.foodKeys.length === 0) return;
    const randomLaneX = Phaser.Utils.Array.GetRandom(this.lanePositions);
    const randomKey = Phaser.Utils.Array.GetRandom(this.foodKeys);
    const food = this.foods.create(randomLaneX, 0, randomKey) as Phaser.Physics.Arcade.Image;
    console.log(`[SPAWN] ${randomKey} at lane X=${randomLaneX}`);

    food.setScale(0.25);
    food.setVelocityY(750);
    food.setBounce(0.2);
    food.setCollideWorldBounds(true);
  }

  public addFoodManually(foodKey: string, angle: number) {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;
    const food = this.foods.create(centerX, centerY, foodKey) as Phaser.Physics.Arcade.Image;
    food.setScale(0.15);
    const speed = 300;
    const velocityX = Math.cos(angle) * speed;
    const velocityY = Math.sin(angle) * speed;


    
    const degrees = Phaser.Math.RadToDeg(angle);
        
    let direction = '';
    if (degrees >= 45 && degrees < 135) direction = 'down';
    else if (degrees >= 135 && degrees < 225) direction = 'left';
    else if (degrees >= 225 && degrees < 315) direction = 'up';
    else direction = 'right';
    console.log(`[SPAWN] ${foodKey} launched ${direction} (${degrees.toFixed(0)}°)`); // Logs direction food is launched

    food.setVelocity(velocityX, velocityY);
    food.setBounce(1, 1);
    food.setCollideWorldBounds(true);
    food.setDamping(false);
    food.setDrag(0);
  }

  public setTargetFood(foodId: string) {
    this.currentTargetFoodId = foodId;
  }

  public removeFruitAt(foodId: string, x: number, y: number) {
    const radius = 20;
    this.foods.children.each((child: any) => {
      if (child.texture.key === foodId && Phaser.Math.Distance.Between(child.x, child.y, x, y) < radius) {
        child.destroy();
        return false;
      }
      return true;
    });
  }
}
