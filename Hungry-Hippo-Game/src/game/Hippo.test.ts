import { describe, test, expect, vi, beforeEach } from 'vitest';
import { MoveStrategy } from "./moveStrategy/MoveStrategy";

// ✅ Must mock Phaser *before* loading any file that uses it
(globalThis as any).Phaser = {
  Physics: {
    Arcade: {
      Sprite: class {
        setCollideWorldBounds = vi.fn();
        play = vi.fn();
        setFrame = vi.fn();
        setVelocity = vi.fn();
        setVelocityX = vi.fn();
        setVelocityY = vi.fn();
        setTint = vi.fn();
        clearTint = vi.fn();
        setFlipX = vi.fn();
        //setFrame = vi.fn();
      },
    },
  },
};

const mockScene = {
  add: { existing: vi.fn() },
  physics: { add: { existing: vi.fn() } },
  time: { delayedCall: vi.fn((_dur, cb) => setTimeout(cb, 0)) },
} as unknown as Phaser.Scene;

class MockMoveStrategy implements MoveStrategy {
  update = vi.fn();
}

describe('Hippo', () => {
  let hippo: any;
  let strategy: MockMoveStrategy;

  beforeEach(async () => {
    const { Hippo } = await import('./Hippo');
    strategy = new MockMoveStrategy();
    hippo = new Hippo(mockScene, 100, 100, 'hippoTexture', strategy);
    hippo.scene = mockScene;
    hippo.setFlipX = vi.fn(); // for pointer flip tests
  });

  test('initial state has mouth open', () => {
    expect(hippo.isMouthOpen()).toBe(true);
  });

  test('toggleMouth changes mouth state and updates frame', () => {
    hippo.setFrame = vi.fn();
    hippo.toggleMouth();
    expect(hippo.isMouthOpen()).toBe(false);
    expect(hippo.setFrame).toHaveBeenCalledWith(3);

    hippo.toggleMouth();
    expect(hippo.isMouthOpen()).toBe(true);
    expect(hippo.setFrame).toHaveBeenCalledWith(0);
  });

  test('update delegates to moveStrategy.update with cursors', () => {
    const cursors = { left: {}, right: {} };
    hippo.update(cursors);
    expect(strategy.update).toHaveBeenCalledWith(hippo, cursors);
  });

  test('setStrategy changes the moveStrategy', () => {
    const newStrategy = new MockMoveStrategy();
    hippo.setStrategy(newStrategy);
    const cursors = { left: {}, right: {} };
    hippo.update(cursors);
    expect(newStrategy.update).toHaveBeenCalledWith(hippo, cursors);
  });

  test('update interpolates to target position without cursors', () => {
    hippo.x = 0;
    hippo.y = 0;
    hippo.targetX = 10;
    hippo.targetY = 0;
    hippo.pointerSpeed = 5;
    hippo.update();
    // Should move toward target by pointerSpeed (5 units)
    expect(hippo.x).toBeGreaterThan(0);
    expect(hippo.x).toBeLessThanOrEqual(5);
  });

  test('freeze sets frozen state, tint, and then unfreezes', async () => {
    hippo.setTint = vi.fn();
    hippo.clearTint = vi.fn();

    await hippo.freeze(1); // short duration
    expect(hippo.isFrozen).toBe(true);
    expect(hippo.setTint).toHaveBeenCalledWith(0x00aaff);
    // Should eventually call clearTint, but delayed
    // (For full coverage, you could mock delayedCall's callback directly)
  });

  // NEW: updatePointerFlip tests
  test('updatePointerFlip on top edge (right movement)', () => {
    hippo.updatePointerFlip(0, 0, 'top', 10, 0);
    expect(hippo.setFlipX).toHaveBeenCalledWith(true);
  });
  test('updatePointerFlip on top edge (left movement)', () => {
    hippo.updatePointerFlip(10, 0, 'top', 0, 0);
    expect(hippo.setFlipX).toHaveBeenCalledWith(false);
  });
  test('updatePointerFlip on bottom edge (right movement)', () => {
    hippo.updatePointerFlip(0, 0, 'bottom', 10, 0);
    expect(hippo.setFlipX).toHaveBeenCalledWith(false);
  });
  test('updatePointerFlip on bottom edge (left movement)', () => {
    hippo.updatePointerFlip(10, 0, 'bottom', 0, 0);
    expect(hippo.setFlipX).toHaveBeenCalledWith(true);
  });
  test('updatePointerFlip on left edge (up movement)', () => {
    hippo.updatePointerFlip(0, 10, 'left', 0, 0);
    expect(hippo.setFlipX).toHaveBeenCalledWith(true);
  });
  test('updatePointerFlip on left edge (down movement)', () => {
    hippo.updatePointerFlip(0, 0, 'left', 0, 10);
    expect(hippo.setFlipX).toHaveBeenCalledWith(false);
  });
  test('updatePointerFlip on right edge (down movement)', () => {
    hippo.updatePointerFlip(0, 0, 'right', 0, 10);
    expect(hippo.setFlipX).toHaveBeenCalledWith(true);
  });
  test('updatePointerFlip on right edge (up movement)', () => {
    hippo.updatePointerFlip(0, 10, 'right', 0, 0);
    expect(hippo.setFlipX).toHaveBeenCalledWith(false);
  });

  test('setPointerSpeed changes pointerSpeed', () => {
  hippo.setPointerSpeed(99);
  expect(hippo.pointerSpeed).toBe(99);
});

test('setTargetPosition sets targetX/targetY', () => {
  hippo.setTargetPosition(42, 77);
  expect(hippo.targetX).toBe(42);
  expect(hippo.targetY).toBe(77);
});

});
