import { useNavigate } from 'react-router-dom';
import styles from './LandingPage.module.css';
import ButtonClick from '../../components/ButtonClick/ButtonClick';
import { useRef, useState, useEffect } from 'react';

/**
 * LandingPage - User interface for joining or creating a game session using WebSockets.
 *
 * This component establishes a persistent WebSocket connection on mount and handles all
 * session-related communication (create, validate) through WebSocket messages,
 * listening for server responses to navigate the user.
 */
function LandingPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState(['', '', '', '', '']);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const [isValidCode, setIsValidCode] = useState(true);
  
  // This ref will hold the persistent WebSocket connection object.
  const ws = useRef<WebSocket | null>(null);

  // This useEffect hook runs once when the component mounts to establish the connection.
  useEffect(() => {
    // Determine the correct WebSocket URL based on the environment.
    const isProduction = import.meta.env.PROD;
    const WS_URL = isProduction
      ? `wss://${import.meta.env.VITE_WEBSOCKET_URL}`
      : 'ws://localhost:4000';
    
    console.log(`[WS] Connecting to ${WS_URL}...`);
    ws.current = new WebSocket(WS_URL);

    ws.current.onopen = () => {
      console.log('[WS] Connection established.');
    };

    // --- Listen for messages from the server ---
    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('[WS] Message from server:', data);

        // Handle the server's response after a session is created.
        if (data.type === 'SESSION_CREATED') {
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

    ws.current.onclose = () => {
      console.log('[WS] Connection closed.');
    };
    
    ws.current.onerror = (error) => {
      console.error('[WS] WebSocket Error:', error);
    };

    // Cleanup function: close the connection when the component unmounts.
    return () => {
      ws.current?.close();
    };
  }, [navigate]); // navigate is a stable dependency

  // --- Send messages to the server ---

  /**
   * Sends a 'CREATE_SESSION' message to the server via WebSocket.
   */
  const handleCreateGame = () => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: 'CREATE_SESSION' }));
    }
  };

  /**
   * Sends a 'VALIDATE_SESSION' message to the server with the entered game code.
   */
  const handleStart = () => {
    const gameCode = code.join('');
    if (gameCode.length !== 5) {
      setIsValidCode(false);
      return;
    }
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: 'VALIDATE_SESSION', payload: { gameCode } }));
    }
  };

  // --- Input handlers (no changes needed) ---
  const handleChange = (value: string, index: number) => {
    const newCode = [...code];
    newCode[index] = value.toUpperCase().slice(0, 1);
    setCode(newCode);
    if (value && index < 4) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };
  
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('Text').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!pasted) return;
    const chars = pasted.slice(0, 5).split('');
    const newCode = [...code];
    chars.forEach((char, i) => { newCode[i] = char; });
    setCode(newCode);
    const nextIndex = chars.length < 5 ? chars.length : 4;
    inputsRef.current[nextIndex]?.focus();
    e.preventDefault();
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
