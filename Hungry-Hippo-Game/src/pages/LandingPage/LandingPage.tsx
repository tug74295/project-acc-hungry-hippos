import { useNavigate } from 'react-router-dom';
import styles from './LandingPage.module.css';
import ButtonClick from '../../components/ButtonClick/ButtonClick';
import { useRef, useState, useEffect } from 'react';

/**
 * LandingPage - User interface for joining or creating a game session.
 *
 * <p>This component allows the user to enter a 5-character session code to join a game,
 * or to create a new game session by generating and saving a new session ID.
 *
 * Data Fields:
 * - code: string[] - Stores user input for each character of the session code.
 * - inputsRef: useRef - References the individual input boxes for game code entry.
 * - isValidCode: boolean - Flag for visual feedback on input validation.
 *
 * Methods:
 * - handleStart(): Validates game code and navigates to GamePage if valid.
 * - handleCreateGame(): Generates and stores a new session ID, then navigates.
 * - handleChange(): Manages input changes and auto-focuses next field.
 * - handleKeyDown(): Enables backspace navigation between input boxes.
 * - handlePaste(): Allows pasting entire game code across inputs.
 *
 * Error Handling:
 * - If session validation or creation fails, the error is logged and a meaningful alert is shown.
 * - Focus returns to first input field to aid in user retry.
 *
 * @returns JSX.Element
 */
function LandingPage() {
  const navigate = useNavigate();
  /** Stores each character of the session code entered by the user */
  const [code, setCode] = useState(['', '', '', '', '']);
  /** References to input elements for direct DOM control (focus, etc.) */
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  /** Boolean flag to indicate if entered code is valid or not */
  const [isValidCode, setIsValidCode] = useState(true);

  const WSS_URL = import.meta.env.PROD
    ? 'wss://project-acc-hungry-hippos-production.up.railway.app'
    : 'ws://localhost:4000'; 
  // This ref will hold the persistent WebSocket connection object.
  const ws = useRef<WebSocket | null>(null);

    // This useEffect hook runs once when the component mounts to establish the connection.
  useEffect(() => {
    console.log('Connecting to WebSocket server:', WSS_URL);
    const socket = new WebSocket(WSS_URL);
    ws.current = socket;
    socket.onopen = () => console.log('WebSocket connection established.');

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('[WS] Message from server:', data);

        // Handle the server's response after a session is created.
        if (data.type === 'SESSION_CREATED') {
          console.log('[WS] Session created successfully:', data.payload);
          const { sessionId } = data.payload;
          navigate(`/Presenter/${sessionId}`);
        }

        // Handle the server's response after a session code is validated.
        if (data.type === 'SESSION_VALIDATED') {
          const { isValid, gameCode } = data.payload;
          if (isValid) {
             const username = `User${Math.floor(Math.random() * 1000)}`;
             // Navigate to role select, passing the username in the route state.
             navigate(`/roleselect/${gameCode}`, { state: { userId: username } });
          } else {
             setIsValidCode(false);
             setCode(['', '', '', '', '']);
             inputsRef.current[0]?.focus();
          }
        }
      } catch (error) {
        console.error("Error processing message from server", error);
      }
    };

    socket.onerror = err => console.error('WebSocket error:', err);
    socket.onclose = () => console.log('WebSocket connection closed.');

    return () => {
      ws.current?.close();
    };
  }, []);

  /**
   * handleStart
   *
   * Attempts to join an existing game session using the 5-character code entered by the user.
   *
   * <p>Purpose:
   * - Validates the provided session code with the backend.
   * - If valid, generates a new username, joins the session, and navigates to the RoleSelect screen.
   *
   * Pre-condition:
   * - The code must be 5 characters long.
   *
   * Post-condition:
   * - If valid, navigates to GamePage.
   * - If invalid or failed, resets input and shows error feedback.
   *
   * <p>Data Fields:
   * - code: string[] - The user-entered characters forming the game code.
   * - userId: string - The randomly generated username for the player.
   * - role: string - Default role assigned until updated by RoleSelect.
   *
   * <p>Error Handling:
   * - Logs errors to the console for both validation and join failures.
   * - If the game code is invalid, resets the input boxes and refocuses the first input.
   * - Shows red border styling if `isValidCode` is false.
   *
   * @async
   * @function handleStart
   * @throws Displays console error logs for fetch/response failures.
   * @returns {Promise<void>}
   */
  const handleStart = () => { // No async, no fetch
    const gameCode = code.join('');

    if (gameCode.length !== 5) {
      setIsValidCode(false);
      return;
    }

    if (ws.current?.readyState === WebSocket.OPEN) {
      // This is the ONLY thing that should happen here
      ws.current.send(JSON.stringify({ type: 'VALIDATE_SESSION', payload: { gameCode } }));
    } else {
      alert('Connection to the server is not ready. Please try again.');
    }
  };

  /**
   * Handles creating a new game session by calling the backend API to generate a unique session ID.
   * 
   * Sends a POST request to the '/create-session' endpoint, which responds with a new unique session ID.
   * If successful, logs the new session ID, optionally stores it (e.g., in local storage or state),
   * and navigates the user to the game page.
   * 
   * If there is an error during the request or response, it logs the error and alerts the user.
   * 
   * Usage:
   * Call this function when the user initiates creating a new game session.
   * 
   * @async
   * @function handleCreateGame
   * @throws Will alert the user if the session creation fails.
   */
  const handleCreateGame = async () => {
    try {
      const response = await fetch('http://localhost:4000/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      const data = await response.json();
      const newSessionId = data.sessionId;

      console.log('New session ID:', newSessionId);
      navigate(`/Presenter/${newSessionId}`);
    } catch (error) {
      console.error(error);
      alert('Error creating new game session. Please try again.');
    }
  };



  /**
   * Handles user input in the game code fields and advances focus.
   *
   * @param value {string} - The new character entered by the user
   * @param index {number} - The index of the current input field
   */
  const handleChange = (value: string, index: number) => {
    const newCode = [...code];
    newCode[index] = value.toUpperCase().slice(0, 1);
    setCode(newCode);

    if (value && index < 4) {
      inputsRef.current[index + 1]?.focus();//move to next box
    }
  };

  /**
   * Handles backspace key to move focus to the previous input box.
   *
   * @param e {React.KeyboardEvent<HTMLInputElement>} - Keyboard event
   * @param index {number} - Current input index
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  /**
   * Allows pasting a 5-character game code across the input boxes.
   *
   * @param e {React.ClipboardEvent<HTMLInputElement>} - Clipboard paste event
   */
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('Text').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!pasted) return;

    const chars = pasted.slice(0, 5).split('');
    const newCode = [...code];

    chars.forEach((char, i) => {
      newCode[i] = char;
    });

    setCode(newCode);

    // Focus next empty input or last
    const nextIndex = chars.length < 5 ? chars.length : 4;
    inputsRef.current[nextIndex]?.focus();

    e.preventDefault(); // Prevent default paste behavior
  };


  return (
    <div className={styles.container}>
      <img
        src="/assets/hippoLogo.png"
        alt="Hungry Hippos Logo"
        className={styles.logo}
      />

      <h3 className={styles.enterText}>Enter game code: </h3>

      {/* Input for 5 character game code */}
      <div className={styles.codeInputGroup}>
        {code.map((char, i) => (
          <input
            onPaste={i === 0 ? handlePaste : undefined}
            key={i}
            ref={(el) => void (inputsRef.current[i] = el)}
            type="text"
            value={char}
            onChange={(e) => handleChange(e.target.value, i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            maxLength={1}
            className={`${styles.codeInputBox} ${!isValidCode ? styles.errorInputBox : ''}`}

          />
        ))}
      </div>

      <p
        className={styles.createGameText}
        onClick={handleCreateGame}
        role="button"
      >
        No code? Create new game!
      </p>
      <ButtonClick text="Join Game" onClick={handleStart} />
    </div>
  );
}

export default LandingPage;