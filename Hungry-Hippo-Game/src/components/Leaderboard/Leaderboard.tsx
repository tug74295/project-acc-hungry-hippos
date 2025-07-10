import React from 'react';

interface LeaderboardProps {
  scores: Record<string, number>;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ scores }) => {
  const sortedEntries = Object.entries(scores).sort((a, b) => b[1] - a[1]);

  return (
    <div className="leaderboard">
      <h3>Leaderboard</h3>
      <ul>
        {sortedEntries.map(([playerId, score]) => (
          <li key={playerId}>
            <strong>{playerId}</strong>: {score}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Leaderboard;
