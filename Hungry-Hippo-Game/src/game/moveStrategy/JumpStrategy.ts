import { MoveStrategy } from "./MoveStrategy";


export class JumpStrategy implements MoveStrategy {

    move(sprite: Phaser.GameObjects.Sprite) {
        sprite.y -= 20;
    }

    update(
        sprite: Phaser.Physics.Arcade.Sprite,
        cursors: Phaser.Types.Input.Keyboard.CursorKeys
    ): void {
        // Implement update logic here, or leave empty if not needed
    }
}