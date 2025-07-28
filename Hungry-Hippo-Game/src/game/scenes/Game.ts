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

interface FoodState {
  instanceId: string;
  foodId: string;
  x: number;
  y: number;
  effect: AacVerb | null;
}

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
  private usePointerControl = false;
  private isKeyboardActive = false;

  /**
   * Variable to track time left
   */
  private timerText!: Phaser.GameObjects.Text;


  private role: string = 'Hippo Player';
  private lastSentX: number | null = null;
  private lastSentY: number | null = null;
  private lastMoveSentAt: number = 0;
  private modeSettings: ModeSettings = { fruitSpeed: 100, allowPenalty: true, allowEffect: true }; // fallback
  //private pendingHippoPlayers: string[] = [];

  // Variable to track if user has interacted with the game
  private hasUserInteracted = false;
  // Variable to track if swipe hint is shown
  private swipeHint?: Phaser.GameObjects.Image;


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
    this.load.image('swipeHand', '/assets/swipeHand.png');

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


  private handlePointer(pointer: Phaser.Input.Pointer) {
  // Only allow local hippo and if not spectator
  if (!this.hippo || this.role === 'Spectator') return;
  this.usePointerControl = true;

  // Determine which edge this hippo is assigned to
  const edge = this.edgeAssignments[this.localPlayerId] as Edge;
  const prevX = this.hippo.targetX;
  const prevY = this.hippo.targetY;
  
  if (edge === 'top' || edge === 'bottom') {
    // Allow sliding left/right only; y stays fixed
    // Clamp to play area if needed
    const minX = this.hippo.displayWidth/2;
    const maxX = this.scale.width - this.hippo.displayWidth/2;
    const x = Phaser.Math.Clamp(pointer.x, minX, maxX);
    const y = this.hippo.y;
    this.hippo.updatePointerFlip(prevX, prevY, edge, x, y);
    this.hippo.setTargetPosition(x, y);
  } else if (edge === 'left' || edge === 'right') {
    // Allow sliding up/down only; x stays fixed
    const minY = this.hippo.displayHeight/2;
    const maxY = this.scale.height - this.hippo.displayHeight/2;
    const x = this.hippo.x;
    const y = Phaser.Math.Clamp(pointer.y, minY, maxY);
    this.hippo.updatePointerFlip(prevX, prevY, edge, x, y);

    this.hippo.setTargetPosition(x, y);
  }
}

  create() {
    const bg = this.add.image(512, 512, 'background');
    bg.setOrigin(0.5, 0.5);
    bg.setDisplaySize(this.scale.width, this.scale.height);

    if (this.role === 'Spectator'){this.physics.pause();}
        this.input.keyboard!.on('keydown', () => {
      this.isKeyboardActive = true;
      this.usePointerControl = false;
    });
    this.input.keyboard!.on('keyup', () => {
      this.isKeyboardActive = false;
    });


    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        if (!this.isKeyboardActive) this.usePointerControl = true;
        this.handlePointer(pointer);
      });
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
        if (pointer.isDown && !this.isKeyboardActive) {
          this.usePointerControl = true;
          this.handlePointer(pointer);
        }
      });

  
    
    this.foods = this.physics.add.group();
    this.cursors = this.input!.keyboard!.createCursorKeys();

    // Delay animation for swipe hand
    this.time.delayedCall(100, () => {
      // Play animation only for the hippo users, not on spectator
      if (this.role === 'Hippo Player') {
        this.swipeHint = this.add.image(this.scale.width / 2, this.scale.height * 0.7, 'swipeHand')
          .setOrigin(0.5)
          .setDepth(1000)
          .setScale(0.6);

        // Add swipe hint animation
        this.tweens.add({
          targets: this.swipeHint,
          x: {
            from: this.scale.width / 2 - 60,
            to: this.scale.width / 2 + 60
          },
          duration: 800,
          ease: 'Sine.easeInOut',
          yoyo: true,
          repeat: -1
        });
      }
    });

   movementStore.subscribe(({ userId, x, y }) => {
      const player = this.players[userId];
      if (player && userId !== this.localPlayerId) {
        const edge = this.edgeAssignments[userId] as Edge;
        const prevX = player.targetX;
        const prevY = player.targetY;
        player.updatePointerFlip(prevX, prevY, edge, x, y);
        player.setTargetPosition(x, y);
      }
    });


    EventBus.emit('current-scene-ready', this);

    EventBus.on('sync-food-state', (foodStates: FoodState[]) => {
      this.syncFoodState(foodStates);
    });

    EventBus.on('apply-player-effect', (data: { targetUserId: string, effect: AacVerb }) => {
      if (data.targetUserId !== this.localPlayerId) {
        this.applyEffectToPlayer(data.targetUserId, data.effect);
      }
    });
   
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
    // Check if user has interacted with the game on mobile
    this.input.once('pointerdown', () => {
      this.hasUserInteracted = true;
      this.swipeHint?.destroy();
    });

    // Check if user has interacted with the game on keyboard
    this.input.keyboard?.on('keydown', () => {
      if (!this.hasUserInteracted) {
        this.hasUserInteracted = true;
        this.swipeHint?.destroy();
      }
    });

    if (this.hippo && this.role !== 'Spectator') {
      if (this.usePointerControl) {
        this.hippo.update(); // <-- no cursors, triggers lerp to target
      } else if (this.cursors) {
        this.hippo.update(this.cursors); // keyboard
      }
      // ... rest unchanged
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

  private applyEffectToPlayer(targetUserId: string, effect: AacVerb) {
    const targetHippo = this.players[targetUserId];
    if (!targetHippo) return;
    switch(effect.id) {
      case 'freeze':
        targetHippo.freeze(2000);
        break;
      case 'burn':
        targetHippo.setTint(0xff0000);
        this.time.delayedCall(1000, () => {
          targetHippo.clearTint();
        });
        break;
      case 'grow':
        targetHippo.setTint(0x00FF00);
        targetHippo.setScale(0.4);
        this.time.delayedCall(5000, () => {
          targetHippo.clearTint();
          targetHippo.setScale(0.25);
        });
        break;
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
        if (isCorrect && this.currentTargetFoodEffect && this.modeSettings.allowEffect) {
          this.applyEffectToPlayer(playerId, this.currentTargetFoodEffect);
          this.sendMessage({
            type: 'PLAYER_EFFECT_APPLIED',
            payload: {
              sessionId: this.sessionId,
              targetUserId: playerId,
              effect: this.currentTargetFoodEffect
            }
          });
        }

        try {
          this.sendMessage({
            type: 'FRUIT_EATEN_BY_PLAYER',
            payload: {
              sessionId: this.sessionId,
              userId: playerId,
              isCorrect,
              allowPenalty: this.modeSettings.allowPenalty,
              effect: this.modeSettings.allowEffect ? this.currentTargetFoodEffect?.id : null
            },
          });
        } catch (e) {
          console.error('[Game.handleFruitCollision] Error sending score update:', e);
        }
        if (isCorrect) {
          this.currentTargetFoodEffect = null;
        }
        const instanceId = fruit.getData('instanceId');
        if (instanceId) {
            EventBus.emit('fruit-eaten', { instanceId });
        }
      }
    }
  }

  public applyModeSettings(settings: ModeSettings) {
    console.log('[Game] Applying mode settings:', settings);
    this.modeSettings = settings;
  }

  /**
   * Synchronizes the food state with the server.
   * @param serverFoods Array of food states from the server.
   */
  private syncFoodState(serverFoods: FoodState[]) {
    // Get existing food sprites and their IDs
    const existingFoodSprites = this.foods.getChildren() as Phaser.Physics.Arcade.Image[];
    const serverFoodIds = new Set(serverFoods.map(f => f.instanceId));

    // Update existing sprites and create new ones
    serverFoods.forEach(foodState => {
      let existingSprite = existingFoodSprites.find(sprite => sprite.getData('instanceId') === foodState.instanceId);

      // If it exists, update its position smoothly using interpolation
      if (existingSprite) {
        this.tweens.add({
          targets: existingSprite,
          x: foodState.x,
          y: foodState.y,
          duration: 50,
          ease: 'Linear'
        });
      } else {
        // If it doesn't exist, create it on the client side
        const newFood = this.foods.create(foodState.x, foodState.y, foodState.foodId) as Phaser.Physics.Arcade.Image;
        newFood.setData('instanceId', foodState.instanceId);
        newFood.setScale(0.15);
        newFood.body?.setCircle(newFood.width * 0.5);
        
        // If the food has an effect, apply the tint color
        if (foodState.effect && foodState.effect.color) {
          const tintColor = parseInt(foodState.effect.color.replace('#', '0x'));
          newFood.setTint(tintColor);
        }
      }
    });

    // Remove any client-side sprites that no longer exist on the server
    existingFoodSprites.forEach(sprite => {
      if (!serverFoodIds.has(sprite.getData('instanceId'))) {
        sprite.destroy();
      }
    });
  }


  public setTargetFood(foodId: string, effect: AacVerb | null = null) {
    this.currentTargetFoodId = foodId;
    this.currentTargetFoodEffect = effect;
  }

  /**
   * Removes a food item by its instance ID.
   * @param instanceId The unique identifier of the food item to remove.
   */
  public removeFoodByInstanceId(instanceId: string) {
    this.foods.children.each((child: any) => {
      if (child.getData('instanceId') === instanceId) {
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
