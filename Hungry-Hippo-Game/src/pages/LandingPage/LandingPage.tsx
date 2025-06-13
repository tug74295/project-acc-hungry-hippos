import { useNavigate } from 'react-router-dom';
import styles from './LandingPage.module.css';
import ButtonClick from '../../components/ButtonClick/ButtonClick';
import { useRef, useState } from 'react';
import { generateSessionId } from '../../utils/session';

// handles navigation to GamePage
function LandingPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState(['', '', '', '', '']);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const [isValidCode, setIsValidCode] = useState(true);

  // Handles starting the game by validating the session code
  const handleStart = async () => {
    const gameCode = code.join('');

    if (gameCode.length !== 5) {
      setIsValidCode(false);
      setCode(['', '', '', '', '']); // Clear input
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/validate-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameCode }),
      });

      const data = await response.json();

      if (data.valid) {
        setIsValidCode(true);
        console.log('Valid game code:', gameCode);
        navigate('/GamePage');
      } else {
        setIsValidCode(false);
        setCode(['', '', '', '', '']); // Clear input on invalid code
        console.log('Invalid game code:', gameCode);
        inputsRef.current[0]?.focus(); // Focus first input on invalid
      }
    } catch (error) {
      setIsValidCode(false);
      setCode(['', '', '', '', '']);
      console.error('Error validating game code:', error);
      inputsRef.current[0]?.focus();
    }
  };

  // Handles creating a new game (generates and stores session ID)
  const handleCreateGame = async () => {
    const newSessionId = generateSessionId();

    try {
      const response = await fetch('http://localhost:4000/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: newSessionId }),
      });

      if (!response.ok) {
        throw new Error('Failed to save session ID on server');
      }

      console.log('Session ID saved on backend');
      navigate('/GamePage');
    } catch (error) {
      console.error(error);
      alert('Error saving session ID. Please try again.');
    }
  };

  // Handles input 
  const handleChange = (value: string, index: number) => {
    const newCode = [...code];
    newCode[index] = value.toUpperCase().slice(0, 1);
    setCode(newCode);

    if (value && index < 4) {
      inputsRef.current[index + 1]?.focus();//move to next box
    }
  };

  // Handles backspace to move to previous input box
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  // Handles allow pasting to input boxes
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
