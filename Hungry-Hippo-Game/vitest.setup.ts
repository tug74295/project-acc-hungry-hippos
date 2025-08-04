import { vi } from 'vitest';
import { EventEmitter } from 'events';

vi.mock('phaser', () => ({
  Events: { EventEmitter },
}));

window.HTMLMediaElement.prototype.play = () => Promise.resolve();
window.HTMLMediaElement.prototype.pause = () => {};