// A strategy gets the sprite each frame and decides its velocity / position.
import Phaser from 'phaser';

export interface MoveStrategy {
  update(
    sprite: Phaser.Physics.Arcade.Sprite,
    cursors: Phaser.Types.Input.Keyboard.CursorKeys
  ): void;
}
