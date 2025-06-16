import { useState } from 'react';
import styles from './RoleSelect.module.css';
import { useNavigate, useParams } from 'react-router-dom';
import ButtonClick from '../../components/ButtonClick/ButtonClick';

function RoleSelect() {
  const navigate = useNavigate();
  const [role, setRole] = useState<string>(''); 
  const [error, setError] = useState<boolean>(false);
  const { sessionId } = useParams();

  const handleStart = () => {
    if (!role) {
        setError(true);
        return;
    }
    setError(false);
    console.log('Selected role:', role);
    navigate(`/gamepage/${sessionId}`);
    //TODO: add logic to handle role selection to JSON
  };

    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setRole(e.target.value);
        if (error) setError(false);
    };

  return (
    <div className={styles.containerImg}>
      <div className={styles.roleContainer}>
        <button
          className={styles.closeButton}
          onClick={() => navigate('/')}
          aria-label="Close"
        >
          ✖
        </button>

        <h2 className={styles.sessionText2}>Username: _____</h2>

        <div className={styles.roleSelectGroup}>
            <select
            id="role-select"
            value={role}
            onChange={handleRoleChange}
            className={`${styles.roleDropdown} ${error ? styles.errorBorder : ''}`}
            >

            <option value="" disabled>
              Select role
            </option>
            <option value="Hippo Player">Hippo Player</option>
            <option value="AAC User">AAC User</option>
          </select>
        </div>

        <ButtonClick text="Next" onClick={handleStart} />
      </div>
    </div>
  );
}

export default RoleSelect;
