interface PlayerData {
  userId: string;
  role: string;
  color?: string | null;
  edge?: string | null;
}

export const updatePlayerInSessionStorage = (sessionId: string, playerData: PlayerData) => {
  try {
    const stored = localStorage.getItem('playerSessions');
    const allSessions = stored ? JSON.parse(stored) : {};

    // Get players for the current session, or start a new list
    const playersInSession = allSessions[sessionId] || [];

    // Find if this user already exists
    const playerIndex = playersInSession.findIndex((p: PlayerData) => p.userId === playerData.userId);

    if (playerIndex > -1) {
      // Player exists, update their data
      playersInSession[playerIndex] = { ...playersInSession[playerIndex], ...playerData };
    } else {
      // New player, add them
      playersInSession.push(playerData);
    }

    const latestSessionOnly = {
      [sessionId]: playersInSession
    };

    localStorage.setItem('playerSessions', JSON.stringify(latestSessionOnly));

  } catch (err) {
    console.error('Failed to update player session in storage', err);
  }
};