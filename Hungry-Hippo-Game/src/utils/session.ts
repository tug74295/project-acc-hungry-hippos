// Generates a random 5-character session ID
export function generateSessionId(length = 5): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = '';
  for (let i = 0; i < length; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

// Saves session ID to sessionStorage
export function saveSessionId(sessionId: string): void {
  sessionStorage.setItem('sessionId', sessionId);
}

// Get session ID from sessionStorage
export function getSessionId(): string | null {
  return sessionStorage.getItem('sessionId');

}
