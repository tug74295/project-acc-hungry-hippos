export type GameMode = 'Easy' | 'Medium' | 'Hard';

export interface ModeSettings {
  fruitSpeed: number;  
  allowPenalty: boolean;
  allowEffect: boolean;
}

/**
 * Maps each `GameMode` to its corresponding game settings.
 * 
 * - `Easy`: fruitSpeed = 100, no penalty.
 * - `Medium`: fruitSpeed = 125, penalty applied.
 * - `Hard`: fruitSpeed = 150, penalty applied.
 * 
 * Can be used to dynamically configure game behavior based on user-selected mode.
 */
export const MODE_CONFIG: Record<GameMode, ModeSettings> = {
  Easy: {
    fruitSpeed: 100,
    allowPenalty: false,
    allowEffect: false,
  },
  Medium: {
    fruitSpeed: 125,
    allowPenalty: true,
    allowEffect: true,
  },
  Hard: {
    fruitSpeed: 150,
    allowPenalty: true,
    allowEffect: true,
  },
};
