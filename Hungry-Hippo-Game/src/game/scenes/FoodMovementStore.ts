// FoodMovementStore.ts
export type FoodMovementPayload = {
  fruitId: string;
  x: number;
  y: number;
};

export type FoodMoveListener = (move: FoodMovementPayload) => void;

class FoodMovementStore {
  private listeners: FoodMoveListener[] = [];

  subscribe(listener: FoodMoveListener) {
    this.listeners.push(listener);
  }

  unsubscribe(listener: FoodMoveListener) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  notifyMove(payload: FoodMovementPayload) {
    this.listeners.forEach(listener => listener(payload));
  }
}

export const foodMovementStore = new FoodMovementStore();
