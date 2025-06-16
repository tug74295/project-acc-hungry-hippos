import { useState } from 'react';
import styles from './RoleSelect.module.css';
import { useNavigate, useParams } from 'react-router-dom';
import ButtonClick from '../../components/ButtonClick/ButtonClick';

/**
 * RoleSelect - React component for selecting a player's role in the game.
 *
 * <p>Purpose:
 * - Allows the user to choose between two roles: "Hippo Player" or "AAC User".
 * - Prevents navigation to the next game screen until a role is selected.
 * - Highlights the selection dropdown in red if the user attempts to proceed without selecting a role.
 * - Navigates to the game page with the session ID from the URL when valid input is provided.
 *
 * <p>Data Fields:
 * - role: string
 *   - The selected role by the user.
 *   - Empty by default until the user makes a choice.
 *
 * - error: boolean
 *   - True when no role is selected and the user attempts to proceed.
 *   - Used to trigger UI feedback like red border styling.
 *
 * - sessionId: string | undefined
 *   - Retrieved from the route parameters using `useParams()`.
 *   - Represents the unique session identifier needed for routing to the game page.
 *
 * <p>Methods:
 * - handleStart(): void
 *   - Purpose: Validates the role selection and navigates to the game page using the session ID.
 *   - Pre-condition: A role must be selected and sessionId must be defined.
 *   - Post-condition: Navigates to `/gamepage/{sessionId}` if role is valid.
 *   - Parameters: None
 *   - Return value: void
 *   - Exceptions: None explicitly thrown, but `sessionId` may be undefined.
 *     Recovery: Navigation is blocked until valid data is provided.
 *
 * - handleRoleChange(e: React.ChangeEvent<HTMLSelectElement>): void
 *   - Purpose: Updates role state when the user changes their selection.
 *   - Pre-condition: User selects a value from the dropdown.
 *   - Post-condition: Updates internal `role` state; clears error if one was previously set.
 *   - Parameters:
 *     - e: React.ChangeEvent<HTMLSelectElement> — the DOM event triggered by changing the selection.
 *   - Return value: void
 *   - Exceptions: None
 *
 * <p>UI Behavior:
 * - If `role` is not selected, the dropdown will receive a red border and an alert will be shown.
 * - ButtonClick component triggers `handleStart` on click.
 */
function RoleSelect() {
  const navigate = useNavigate();
  const [role, setRole] = useState<string>(''); 
  const [error, setError] = useState<boolean>(false);
  const { sessionId } = useParams();

  /**
   * Handles navigation to the game page if a role is selected.
   * Otherwise, sets error state to display UI validation feedback.
   */
  const handleStart = () => {
    if (!role) {
        setError(true);
        return;
    }
    setError(false);
    console.log('Selected role:', role);
    navigate(`/gamepage/${sessionId}`);
    // TODO: Add logic to persist role selection to backend or shared state
  };

  /**
   * Updates the role state as the user selects an option from the dropdown.
   * Clears error if previously triggered.
   *
   * @param e - The change event triggered by selecting a dropdown option.
   */
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
