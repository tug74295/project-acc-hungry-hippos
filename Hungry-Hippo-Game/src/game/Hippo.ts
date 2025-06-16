import { MoveStrategy } from "./moveStrategy/MoveStrategy";

export class Hippo extends Phaser.Physics.Arcade.Sprite {
    private moveStrategy: MoveStrategy;
    private mouthOpen = true;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string,
        moveStrategy: MoveStrategy
    ) {
        super(scene, x, y, texture, 0);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCollideWorldBounds(true);
        this.play('walking');
        this.moveStrategy = moveStrategy;
    }

    public update(cursors: Phaser.Types.Input.Keyboard.CursorKeys) {
        this.moveStrategy.update(this, cursors);
    }

    public setStrategy(strategy: MoveStrategy): void {
        this.moveStrategy = strategy;
    }

    public toggleMouth() {
        this.mouthOpen = !this.mouthOpen;
        const frameIndex = this.mouthOpen ? 0 : 3;
        this.setFrame(frameIndex);
    }

    public isMouthOpen() {
        return this.mouthOpen;
    }
}
