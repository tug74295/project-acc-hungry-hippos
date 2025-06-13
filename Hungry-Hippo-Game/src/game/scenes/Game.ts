import { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { CATEGORIZED_AAC_ITEMS } from '../../Foods';

export class Game extends Scene
{
    private hippo: Phaser.Physics.Arcade.Sprite;
    private foods: Phaser.Physics.Arcade.Group;
    private foodKeys: string[] = [];
    private lanePositions = [256, 512, 768]; // tweak as needed

    private foodSpawnTimer: Phaser.Time.TimerEvent; // store timer reference

    constructor ()
    {
        super('Game');
    }

    preload ()
    {
        this.load.image('background', 'assets/squareTiles.png');

        // Dynamically load food images from AAC data
        Object.values(CATEGORIZED_AAC_ITEMS).flat().forEach(food => {
            if (food.imagePath) {
                console.log(`[PRELOAD] Loading food: ${food.id} from ${food.imagePath}`);
                this.load.image(food.id, food.imagePath); // now uses full path
            }
        })

        this.load.spritesheet('character', 'assets/spritesheet.png',{
            frameWidth: 350,
            frameHeight: 425,
        });

    }

    create ()
    {
        
        this.add.image(512, 384, 'background');

        // this.anims.create({
        //     key: 'walking',
        //     frames: [
        //         { key: 'character', frame: 0 },
        //         { key: 'character', frame: 1 },
        //         { key: 'character', frame: 1 },
        //         { key: 'character', frame: 0 }
        //     ],
        //     frameRate: 4,
        //     repeat: -1
        // });
       
        this.anims.create({
            key: 'walking',
            frames: this.anims.generateFrameNumbers('character', { start: 0, end: 4 }),
            frameRate: 4,
            repeat: -1
        });

        
        this.hippo = this.physics.add.sprite(350, 425, 'character', 0);
        this.hippo.play('walking');

        
        EventBus.emit('current-scene-ready', this);
        // Initialize physics for food group
        this.foods = this.physics.add.group();

        // Detects when a food overlaps with the hippo and trigger eating logic
        this.physics.add.overlap(this.hippo, this.foods, this.handleFoodCollision, undefined, this);

    }

    public setFoodKeys(keys: string[]) {
        this.foodKeys = keys;
    }

    // Starts the timer to spawn food
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
        if (this.foodKeys.length === 0) return;

        // Random lane position
        const randomLaneX = Phaser.Utils.Array.GetRandom(this.lanePositions);

        // Random food type
        const randomKey = Phaser.Utils.Array.GetRandom(this.foodKeys);

        // Food spawned from top
        const food = this.foods.create(randomLaneX, 0, randomKey) as Phaser.Physics.Arcade.Image;
        console.log(`[SPAWN] ${randomKey} at lane X=${randomLaneX}`);

        food.setScale(0.25); // Food 25% of original size

        // Gravity
        food.setVelocityY(750); // Will move 750 pixels/sec down
        food.setBounce(0.2); // Slight bounce at bottom but used to trigger falling
        food.setCollideWorldBounds(true);
    }

    public addFoodManually(foodKey: string) {
        const x = Phaser.Math.Between(64, this.scale.width - 64);
        const food = this.foods.create(x, 0, foodKey) as Phaser.Physics.Arcade.Image;
        console.log(`[SPAWN-MANUAL] ${foodKey} at X=${x}`);

        food.setScale(0.25);
        food.setVelocityY(600);
        food.setBounce(0.2);
        food.setCollideWorldBounds(true);
    }

    /**
     * Called when the hippo collides with a food
     * Destroys the food and logs the event
     */
    private handleFoodCollision(hippoObj: Phaser.GameObjects.GameObject, foodObj: Phaser.GameObjects.GameObject) {
        const food = foodObj as Phaser.Physics.Arcade.Image;
        console.log(`[EAT] ${food.texture.key} eaten by hippo`);
        food.destroy();
    }
    

    update() {
        this.foods.getChildren().forEach((food) => {
            const sprite = food as Phaser.Physics.Arcade.Image;
            if (sprite.body && sprite.body.blocked.down) {
                sprite.destroy(); // Immediately remove food after touching bottom
                console.log(`[EAT] ${sprite.texture.key} removed after hitting ground`);
            }
        });
    }
}
