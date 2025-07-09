// MovementStore.ts
type MovementPayload = {
    userId: string;
    x: number;
    y: number;
  };
  
  type MoveListener = (move: MovementPayload) => void;
  
  class MovementStore {
    private listeners: MoveListener[] = [];
  
    subscribe(listener: MoveListener) {
      this.listeners.push(listener);
    }
  
    unsubscribe(listener: MoveListener) {
      this.listeners = this.listeners.filter(l => l !== listener);
    }
  
    notifyMove(payload: MovementPayload) {
      this.listeners.forEach(listener => listener(payload));
    }
  }
  
  export const movementStore = new MovementStore();
  