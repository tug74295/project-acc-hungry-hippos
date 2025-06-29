import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Presenter from './Presenter';
import { vi, describe, it, expect } from 'vitest';

const mockedNavigate = vi.fn();

// Mock react-router-dom to control useNavigate and useParams
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
    useParams: () => ({ sessionId: 'ABCDE' }), // mock sessionId param here
  };
});

describe('Presenter Component', () => {
  beforeEach(() => {
    mockedNavigate.mockReset();
  });

  it('displays the room code clearly on the host device', () => {
    render(<Presenter />);
    const codeText = screen.getByText(/Game Code: ABCDE/i);
    expect(codeText).toBeDefined();
  });

  it('navigates back to landing page when cancel button is clicked', () => {
    render(<Presenter />);
    const cancelButton = screen.getByRole('button', { name: /Cancel New Game/i });
    fireEvent.click(cancelButton);
    expect(mockedNavigate).toHaveBeenCalledWith('/');
  });
});
