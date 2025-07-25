import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './Victory.module.css';
// import ButtonClick from '../../components/ButtonClick/ButtonClick';
// import Leaderboard from '../../components/Leaderboard/Leaderboard';

const Victory: React.FC = () => {
    /**
     * Access the current location object.
     */
  const location = useLocation();
    /**
     * Extracts scores from the location state
     * empty object if DNE.
     */
  const scores: Record<string, number> = location.state?.scores ?? {};
    /**
     * useNavigate hook from react-router-dom to navigate.
     */
  const navigate = useNavigate();

  const colors: Record<string, string> = location.state?.colors ?? {};


  /**
   * Handles the cancel button click event.
   * Navigates back to the home page.
   */
  const handleCancel = () => {
    navigate('/');
  };

    // Sort players by score (highest first)
  const sortedPlayers = Object.entries(scores).sort((a, b) => b[1] - a[1]);

  return (
    <div className={styles.containerImg}>
      <div className={styles.roleContainer}>
        <button
          className={styles.closeButton}
          onClick={handleCancel}
          aria-label="Close"
        >
          ✖
        </button>
        {/* Banner behind the title */}
        <div className={styles.bannerWrapper}>
          <img src="/assets/banner.png" alt="Banner" className={styles.bannerImage} />
          <h1 className={styles.title}>Game Over!</h1>
        </div>

        {/* Leaderboard */}
        <div className={styles.leaderboardWrapper}>
          {sortedPlayers.map(([playerId, score], index) => (
            <div
                key={playerId}
                className={styles.playerCard}
                style={{ animationDelay: `${index * 0.5}s` }}
            >
            <img
                src={`/assets/stars/star-${index + 1}.png`}
                alt={`Rank ${index + 1}`}
                className={styles.rankIcon}
            />

            <div className={styles.verticalDivider} />

                <div className={styles.playerInfo}>
                    <div className={styles.hippoLabel}>
                        <img
                        src={`/assets/hippos/${colors[playerId]}Hippo.png`}
                        alt={`${colors[playerId]} Hippo`}
                        className={styles.hippoImage}
                        />
                        <p className={styles.playerName}>
                        {colors[playerId] && colors[playerId][0].toUpperCase() + colors[playerId].slice(1)}
                        </p>
                    </div>
                <p className={styles.playerScore}>{score} pts</p>
                </div>

            </div>

          ))}
        </div>

      </div>
    </div>
  );
};

export default Victory;

