import { MoveStrategy } from "./moveStrategy/MoveStrategy";

export type Edge = 'top' | 'bottom' | 'left' | 'right';

export class EdgeSlideStrategy implements MoveStrategy {

   constructor (private edge: Edge, private speed = 300){}


    update (
        sprite: Phaser.Physics.Arcade.Sprite,
        cursors: Phaser.Types.Input.Keyboard.CursorKeys
    )
    {

        // allow movement only along the edge 


        switch (this.edge){
            case 'top':
            case 'bottom':
                sprite.y = this.edge === 'top' ? 64 : sprite.scene.scale.height - 64;
                sprite.setVelocityY(0);

                if (cursors.left?.isDown) sprite.setVelocityX(-this.speed);
                else if (cursors.right?.isDown) sprite.setVelocityX(this.speed);
                else sprite.setVelocityX(0);
                break;


                case 'left':
                case 'right':
                    sprite.x = this.edge === 'left' ? 64 : sprite.scene.scale.width -64;
                    sprite.setVelocityX(0);

                    if (cursors.up?.isDown) sprite.setVelocityY(-this.speed);

                    else if (cursors.down?.isDown) sprite.setVelocityY(this.speed);
                    else sprite.setVelocityY(0);
                    break;
        }
    }

    
}
