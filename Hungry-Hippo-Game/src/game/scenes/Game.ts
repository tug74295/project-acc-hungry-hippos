/**
 * @file Game.ts
 * @description Main Phaser Scene for Hippo Game: Manages gameplay, player logic, scoring, food spawning, and sync via WebSocket.
 */

import { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { AAC_DATA, AacVerb } from '../../Foods';
import { Hippo } from '../Hippo';
import { Edge, EdgeSlideStrategy } from '../EdgeSlideStrategy';
import { movementStore } from './MovementStore';
import { ModeSettings } from '../../config/gameModes';

export class Game extends Scene {
  private sessionId!: string;
  private hippo: Hippo | null = null;
  private foods!: Phaser.Physics.Arcade.Group;
  private foodSpawnTimer?: Phaser.Time.TimerEvent;
  private currentTargetFoodId: string | null = null;
  private currentTargetFoodEffect: AacVerb | null = null;
  private playerScores: Record<string, number> = {};
  private players: Record<string, Hippo> = {};
  private edgeAssignments: Record<string, string> = {};
  private availableEdges = [ 'bottom','top','right', 'left' ];
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private sendMessage!: (msg: any) => void;
  private localPlayerId!: string;
  /**
   * Variable to track time left
   */
  private timerText!: Phaser.GameObjects.Text;


  private role: string = 'Hippo Player';
  private lastSentX: number | null = null;
  private lastSentY: number | null = null;
  private lastMoveSentAt: number = 0;
  private modeSettings: ModeSettings = { fruitSpeed: 100, allowPenalty: true }; // fallback
  //private pendingHippoPlayers: string[] = [];

  constructor() {
    super('Game');
  }

  /**
   * Defensive: Phaser calls init() without arguments, so allow empty/no-op.
   * Real game data is passed by your React wrapper later!
   */
  init(data: { 
  sendMessage: (msg: any) => void; 
  localPlayerId: string; 
  sessionId: string;
  role: string;
  connectedUsers?: { userId: string; role: string }[]; 
  modeSettings?: ModeSettings;
}) {
  this.sendMessage = data.sendMessage;
  this.localPlayerId = data.localPlayerId;
  this.sessionId = data.sessionId;
  // ... your resets

  if (data.modeSettings) {
    this.modeSettings = data.modeSettings;
  }
  if (data.connectedUsers) {
    data.connectedUsers
    .filter(u => u.role === 'Hippo Player')
    .forEach(u => this.addPlayer(u.userId));
  }
  this.role = data.role;
}


  preload() {
    console.log('[Game] Preload called');
    this.load.image('background', '/assets/presenterBg.png');
    this.load.image('glowCircle', '/assets/effects/glowCircle.png');
    this.load.image('sparkle', '/assets/effects/sparkle.png');

    AAC_DATA.categories.forEach(category => {
      category.foods.forEach(food => {
        if (food.imagePath) {
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
    if (!(playerId in this.playerScores)) this.playerScores[playerId] = 0;
    if (!(playerId in this.players)) {
      const edge = (this.availableEdges.shift() || 'bottom') as Edge;
      this.edgeAssignments[playerId] = edge;
      const { x, y } = this.getEdgePosition(edge);
      const slideDistance = (edge === 'top' || edge === 'bottom') ? this.scale.width * 0.8 : this.scale.height * 0.8;
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
      if (this.foods) {
        this.physics.add.overlap(playerSprite, this.foods, (_hippo, fruit) => {
          if (fruit instanceof Phaser.Tilemaps.Tile) return;
          const fruitGO = fruit instanceof Phaser.GameObjects.GameObject ? fruit : null;
          if (fruitGO) this.handleFruitCollision(playerId, fruitGO);
        });
      }
      playerSprite.setTargetPosition(x, y);
      this.players[playerId] = playerSprite;
      if (playerId === this.localPlayerId && this.role !== 'Spectator') {
        this.hippo = playerSprite;
      }
    }
  }

  create() {
    const bg = this.add.image(512, 512, 'background');
    bg.setOrigin(0.5, 0.5);
    bg.setDisplaySize(this.scale.width, this.scale.height);

    if (this.role === 'Spectator'){this.physics.pause();}

    
    this.foods = this.physics.add.group();
    this.cursors = this.input!.keyboard!.createCursorKeys();

    movementStore.subscribe(({ userId, x, y }) => {
      const player = this.players[userId];
      if (player && userId !== this.localPlayerId) {
        player.setTargetPosition(x, y);
      }
    });

    EventBus.emit('current-scene-ready', this);
   
    EventBus.on('external-message', (data: any) => {
      if(data.type == 'gameOver')
      {
        this.handleGameOver();
      }
    });

    EventBus.on('start-game', () => {
      console.log('[Game.ts] start-game event received, requesting timer start.')
      this.requestStartTimer();
    });

    EventBus.on('TIMER_UPDATE', (secondsLeft: number) => {
      console.log(`[Game.ts] TIMER_UPDATE received: ${secondsLeft} seconds left`);
      this.updateTimerUI(secondsLeft);
    });

    EventBus.emit('edges-ready', this.edgeAssignments); 
  }

  update() {
    if (this.hippo && this.cursors && this.role !== 'Spectator') {
      this.hippo.update(this.cursors);
      const newX = this.hippo.x;
      const newY = this.hippo.y;
      if (this.lastSentX !== newX || this.lastSentY !== newY) {
        const now = Date.now();
        if (!this.lastMoveSentAt || now - this.lastMoveSentAt > 30) {
          this.lastSentX = newX;
          this.lastSentY = newY;
          this.lastMoveSentAt = now;
          try {
            this.sendMessage?.({
              type: 'PLAYER_MOVE',
              payload: {
                sessionId: this.sessionId,
                userId: this.localPlayerId,
                x: newX,
                y: newY
              }
            });
          } catch (e) {
            console.error('[Game.update] Failed to send player movement:', e);
          }
        }
      }
    }
    for (const [id, hippo] of Object.entries(this.players)) {
      if (id !== this.localPlayerId) {
        hippo.update();
      }
    }
  }

  private handleFruitCollision(playerId: string, fruit: Phaser.GameObjects.GameObject) {
    if (!fruit.active || fruit.getData('eatenBy')) return;
    if (this.role === 'Spectator') return;

    fruit.setData('eatenBy', playerId);

    if (this.players[playerId] === this.hippo) {
      if ('disableBody' in fruit) {
        (fruit as Phaser.Physics.Arcade.Image).disableBody(true, true);
      }

      if ('texture' in fruit && fruit instanceof Phaser.GameObjects.Sprite) {
        const sprite = fruit as Phaser.GameObjects.Sprite;
        const foodId = sprite.texture.key;
        const isCorrect = foodId === this.currentTargetFoodId;

        try {
          this.sendMessage({
            type: 'FRUIT_EATEN_BY_PLAYER',
            payload: {
              sessionId: this.sessionId,
              userId: playerId,
              isCorrect,
              allowPenalty: this.modeSettings.allowPenalty
            },
          });
        } catch (e) {
          console.error('[Game.handleFruitCollision] Error sending score update:', e);
        }
        EventBus.emit('fruit-eaten', { foodId, x: fruit.x, y: fruit.y });
      }
    }
  }

  public applyModeSettings(settings: ModeSettings) {
    console.log('[Game] Applying mode settings:', settings);
    this.modeSettings = settings;
  }


  public addFoodManually(foodId: string, angle: number) {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;
    let speed = this.modeSettings.fruitSpeed;

    const food = this.foods.create(centerX, centerY, foodId) as Phaser.Physics.Arcade.Image;
    food.setScale(0.15);
    food.setBounce(0);
    food.setCollideWorldBounds(false);
    food.setDamping(false);
    food.setDrag(0);

    if (
      foodId === this.currentTargetFoodId &&
      this.currentTargetFoodEffect &&
      typeof this.currentTargetFoodEffect.color === 'string'
    ) {
      const tintColor = parseInt(this.currentTargetFoodEffect.color.replace('#', '0x'));
      food.setTint(tintColor);
      const effect = this.currentTargetFoodEffect;

      // Handle each effect type
      switch (effect.id) {
        case 'freeze':
          speed *= 0.6;
          break;
        case 'burn':
          speed *= 1.4;
          break;
        case 'grow':
          food.setScale(0.40);
          // Pulse animation
          this.tweens.add({
            targets: food,
            scale: { from: 0.15, to: 0.2 },
            yoyo: true,
            repeat: -1,
            duration: 400
          });
          break;
      }
    }

    const velocityX = Math.cos(angle) * speed;
    const velocityY = Math.sin(angle) * speed;
    food.setVelocity(velocityX, velocityY);
  }


  public setTargetFood(foodId: string, effect: AacVerb | null = null) {
    this.currentTargetFoodId = foodId;
    this.currentTargetFoodEffect = effect;
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

  /**
   * 
   * @param secondsLeft the number of seconds left in this session
   * If a text for the timer exists, updates the text to the number of seconds left.
   */
  private updateTimerUI(secondsLeft: number)
  {
    if(!this.timerText)
    {
      return;
    }
    if(this.timerText)
    {
      this.timerText.setText(`Time: ${secondsLeft}`);
    }
  }

  /**
   * This method handles the game when the timer hits 0.
   */
  private handleGameOver()
  {
    this.add.rectangle(512, 384, 1024, 768, 0x000000, 0.7).setDepth(10);
    this.add.text(512, 384, 'Game Over', {
      fontSize: '64px',
      color: '#ffffff'
    }).setOrigin(0.5).setDepth(11);

    this.physics.pause();

    if(this.foodSpawnTimer)
    {
      this.foodSpawnTimer.remove(false);
    }
  }

  /**
   * This method requests system for a start timer.
   */
  public requestStartTimer()
  {
    if(this.sendMessage)
    {
      this.sendMessage({ type: 'START_TIMER', payload: { sessionId: this.sessionId} });
    }
  }

  public getEdgeAssignments(): Record<string, string> {
    return this.edgeAssignments;

  }
}
