import { getSessionId } from '../../utils/session';
import styles from './RoleSelect.module.css';
import ButtonClick from '../../components/ButtonClick/ButtonClick';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

function RoleSelect() {
  const sessionId = getSessionId();
  const navigate = useNavigate();
  

  const createCode = () => {    
    // TODO: implement actual validation logic
  };

  return (
    <div className={styles.containerImg}>
      <button 
        className={styles.backButton} 
        onClick={() => navigate('/')} 
        aria-label="Go back"
      >
        <FaArrowLeft size={24} />
      </button>
      <h2 className={styles.sessionText2}> You are the host. </h2>      
      <h2 className={styles.sessionText2}> Game Code: {sessionId} </h2>      
      <ButtonClick text="Start Game" onClick={createCode} />

    </div>
    
  );
}

export default RoleSelect;