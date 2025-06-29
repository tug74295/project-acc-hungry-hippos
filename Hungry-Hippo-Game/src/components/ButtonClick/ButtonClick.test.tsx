import { render, screen, fireEvent } from '@testing-library/react';
import ButtonClick from './ButtonClick';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';


describe('ButtonClick component', () => {
  it('renders the button with given text', () => {
    render(<ButtonClick text="Click me" onClick={() => {}} />);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  it('calls onClick callback when clicked', () => {
    const handleClick = vi.fn();
    render(<ButtonClick text="Submit" onClick={handleClick} />);
    const button = screen.getByRole('button', { name: /submit/i });

    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

});
