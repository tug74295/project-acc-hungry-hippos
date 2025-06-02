import { Scene } from 'phaser';
import { EventBus } from '../EventBus';

export class Game extends Scene
{
    private fruits: Phaser.Physics.Arcade.Group;
    private fruitKeys = ['apple', 'banana', 'cherry', 'grape'];
    private lanePositions = [256, 512, 768]; // tweak as needed

    private fruitSpawnTimer: Phaser.Time.TimerEvent; // store timer reference

    constructor ()
    {
        super('Game');
    }

    preload ()
    {
        this.load.setPath('assets');

        // Background
        this.load.image('background', 'squareTiles.png');

        // Fruit images
        this.load.image('apple', 'apple.png');
        this.load.image('banana', 'banana.png');
        this.load.image('cherry', 'cherry.png');
        this.load.image('grape', 'grape.png');
    }

    create ()
    {
        
        this.add.image(512, 384, 'background');

        // this.add.image(512, 350, 'logo').setDepth(100);
        // this.add.text(512, 490, 'Make something fun!\nand share it with us:\nsupport@phaser.io', {
        //     fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
        //     stroke: '#000000', strokeThickness: 8,
        //     align: 'center'
        // }).setOrigin(0.5).setDepth(100);

        // Initialize physics for "fruit" group
        this.fruits = this.physics.add.group();
        
        EventBus.emit('current-scene-ready', this);
    
    }

    // Starts the timer to spawn fruits
    public startSpawningFruit() {
        if (!this.fruitSpawnTimer) {
            this.fruitSpawnTimer = this.time.addEvent({
                delay: 1500,
                callback: this.spawnFruit,
                callbackScope: this,
                loop: true
            });
        }
    }

    spawnFruit() {
        // Random lane position
        const randomLaneX = Phaser.Utils.Array.GetRandom(this.lanePositions);

        // Random fruit type
        const randomKey = Phaser.Utils.Array.GetRandom(this.fruitKeys);

        // Fruit spawned from top
        const fruit = this.fruits.create(randomLaneX, 0, randomKey) as Phaser.Physics.Arcade.Image;
        fruit.setScale(0.25); // Fruit 25% of original size

        // Gravity
        fruit.setVelocityY(750); // Will move 750 pixels/sec down
        fruit.setBounce(0.2); // Slight bounce at bottom but used to trigger falling
        fruit.setCollideWorldBounds(true);
    }

    update() {
        this.fruits.getChildren().forEach((fruit) => {
            const sprite = fruit as Phaser.Physics.Arcade.Image;
            if (sprite.body.blocked.down) {
                sprite.destroy(); // Immediately remove fruits after touching bottom
            }
        });
    }
}
