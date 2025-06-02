import { Scene } from 'phaser';
import { EventBus } from '../EventBus';

export class Game extends Scene
{
    constructor ()
    {
        super('Game');
    }

    preload ()
    {
        this.load.setPath('assets');
        
        this.load.image('grape', 'grape.png');
        this.load.image('apple','apple.png');
        this.load.image('cherry','cherry.png');
        this.load.image('banana', 'banana.png');

        this.load.image('background', 'squareTiles.png');
        this.load.image('logo', 'logo.png');

        this.load.spritesheet('character', 'spritesheet.png',{
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

        
        const hippo = this.add.sprite(350, 425, 'character', 0);
        hippo.play('walking');

        
        EventBus.emit('current-scene-ready', this);

    }
}
