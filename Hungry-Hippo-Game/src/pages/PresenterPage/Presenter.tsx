import styles from './Presenter.module.css';
import { useNavigate, useParams } from 'react-router-dom';
import { useWebSocket } from '../../contexts/WebSocketContext';
import UserList from '../../components/UserList/UserList';
import { useEffect } from 'react';

/**
 * Presenter - React component that displays the session ID to the host after creating a new game.
 *
 * Purpose:
 * - Allows the host to view the game session code.
 * - Provides instructions to share the session code with other players.
 * - Includes a button to cancel the new game and return to the landing page.
 * - Shows a waiting lobby with connected users and their roles.
 *
 * TODO:
 * - Add logic to delete or clear the created session ID from the backend when "Cancel New Game" is pressed.
 * - Validate that `sessionId` is present before rendering.
 * - Implement WebSocket server and client logic to maintain and broadcast connected users.
 */
function Presenter() {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const { sendMessage, connectedUsers } = useWebSocket();
  const presenterId = 'presenter'; // or use random ID if needed

  // Join session as "Presenter" to receive updates
  useEffect(() => {
    if (sessionId) {
      sendMessage({
        type: 'PLAYER_JOIN',
        payload: {
          sessionId,
          userId: presenterId,
          role: 'Presenter'
        }
      });
    }
  }, [sessionId, sendMessage]);

  /**
   * Handler for clicking the close button.
   * Navigates the user back to the landing page.
   */
  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className={styles.containerImg}>
      {/* Optional banner image */}
      {/* <div className={styles.bannerWrapper}>
        <img
          src="/assets/banner.png"
          alt="Game Banner"
          className={styles.bannerImage}
        />
      </div> */}

      <div className={styles.roleContainer}>
        <button
          className={styles.closeButton}
          onClick={handleCancel}
          aria-label="Cancel New Game"
        >
          ✖
        </button>

        <h1 className={styles.sessionText2}>Game Code: {sessionId}</h1>
        <h3 className={styles.sessionText2}>
          At least one Hippo & AAC device 
          <br />
          must join to start the game.
        </h3>
        <h2 className={styles.sessionText2}>Players Joined:</h2>

        {/* UserList displays connected users with their roles */}
        <UserList users={connectedUsers.filter(u => u.role !== 'Presenter')} />
      </div>
    </div>
  );
}

export default Presenter;
