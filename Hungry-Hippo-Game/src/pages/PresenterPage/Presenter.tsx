import styles from './Presenter.module.css';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';


// TODO: Add logic to clear sessionID if press back button
function Presenter() {
  const navigate = useNavigate();
  const { sessionId } = useParams();

  return (
    <div className={styles.containerImg}>
      <button 
        className={styles.backButton} 
        onClick={() => navigate('/')} 
        aria-label="Go back"
      >
        <span className={styles.backContent}>
          <FaArrowLeft size={24} />
          <span className={styles.backText}>Cancel New Game</span>
        </span>
      </button>
      <h2 className={styles.sessionText2}> Game Code: {sessionId} </h2>      
      <h3 className={styles.sessionText2}>Share this with other players!</h3>
      <h3 className={styles.sessionText2}>Waiting for game to start...</h3>

    </div>
    
  );
}

export default Presenter;