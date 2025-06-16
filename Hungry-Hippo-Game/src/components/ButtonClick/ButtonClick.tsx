import styles from './ButtonClick.module.css';

/**
 * Props for the ButtonClick component.
 *
 * @property {string} text - The label text to display inside the button.
 * @property {() => void} onClick - Callback function to handle the button click event.
 */
interface ButtonClickProps {
  text: string; // Text to display inside the button
  onClick: () => void;
}

/**
 * A reusable styled button component that executes a callback function when clicked.
 *
 * @component
 * @param {ButtonClickProps} props - The props for the button.
 * @returns {JSX.Element} A styled button with a click handler.
 */
function ButtonClick({ text, onClick }: ButtonClickProps) {
  return (
    <button className={styles.button} onClick={onClick}>
      {text}
    </button>
  );
}

export default ButtonClick;
