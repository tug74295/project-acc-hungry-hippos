import { MoveStrategy } from "./moveStrategy/MoveStrategy";

export type Edge = 'top' | 'bottom' | 'left' | 'right';

export class EdgeSlideStrategy implements MoveStrategy {
  constructor(
    private edge: Edge,
    private speed = 300,
    private margin?: number
  ) {}

  update(
    sprite: Phaser.Physics.Arcade.Sprite,
    cursors?: Phaser.Types.Input.Keyboard.CursorKeys
  ) {
    if (!cursors) return;

    const halfW = sprite.displayWidth  / 2;
    const halfH = sprite.displayHeight / 2;
    const pad   = this.margin ?? Math.max(halfW, halfH, 16);

    const W = sprite.scene.scale.width;
    const H = sprite.scene.scale.height;

    switch (this.edge) {
      case 'top':
        this.lockY(sprite, pad);
        this.moveX(sprite, cursors);
        break;
      case 'bottom':
        this.lockY(sprite, H - pad);
        this.moveX(sprite, cursors);
        break;
      case 'left':
        this.lockX(sprite, pad);
        this.moveY(sprite, cursors);
        break;
      case 'right':
        this.lockX(sprite, W - pad);
        this.moveY(sprite, cursors);
        break;
    }
  }

  private lockY(sprite: Phaser.Physics.Arcade.Sprite, y: number) {
    sprite.y = y;
    sprite.setVelocityY(0);
  }

  private lockX(sprite: Phaser.Physics.Arcade.Sprite, x: number) {
    sprite.x = x;
    sprite.setVelocityX(0);
  }

  // Top & bottom edge: flipX so “left” looks left, “right” looks right
  private moveX(sprite: Phaser.Physics.Arcade.Sprite, cursors: Phaser.Types.Input.Keyboard.CursorKeys) {
  if (cursors.left.isDown) {
    sprite.setVelocityX(-this.speed);
    if (this.edge === 'top') {
      sprite.setFlipX(true); // left on top edge: flip
    } else {
      sprite.setFlipX(false); // left on bottom: no flip
    }
  } else if (cursors.right.isDown) {
    sprite.setVelocityX(this.speed);
    if (this.edge === 'top') {
      sprite.setFlipX(false); // right on top edge: no flip
    } else {
      sprite.setFlipX(true); // right on bottom: flip
    }
  } else {
    sprite.setVelocityX(0);
  }
}


private moveY(sprite: Phaser.Physics.Arcade.Sprite, cursors: Phaser.Types.Input.Keyboard.CursorKeys) {
  if (cursors.up.isDown) {
    sprite.setVelocityY(-this.speed);
    sprite.setFlipX(this.edge === 'right'); // up: right=true, left=false
  }
  else if (cursors.down.isDown) {
    sprite.setVelocityY(this.speed);
    sprite.setFlipX(this.edge === 'left'); // down: left=true, right=false
  }
  else {
    sprite.setVelocityY(0);
  }
}
}