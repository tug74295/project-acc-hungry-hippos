import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import Presenter from './Presenter';
import { vi, describe, it, expect, beforeEach } from 'vitest';

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

vi.mock('../../contexts/WebSocketContext', () => ({
  useWebSocket: () => ({
    isConnected: true,
    sendMessage: vi.fn(),
    connectedUsers: [
      { userId: 'user1', role: 'Hippo Player' },
      { userId: 'user2', role: 'AAC User' },
    ],
  }),
}));

describe('Presenter Component', () => {
  beforeEach(() => {
    mockedNavigate.mockReset();
  });

  it('displays the room code clearly on the host device', () => {
    render(<Presenter />);
    const codeText = screen.getByText(/Game Code: ABCDE/i);
    expect(codeText).toBeInTheDocument();
  });

  it('navigates back to landing page when cancel button is clicked', () => {
    render(<Presenter />);
    const cancelButton = screen.getByRole('button', { name: /Cancel New Game/i });
    fireEvent.click(cancelButton);
    expect(mockedNavigate).toHaveBeenCalledWith('/');
  });
});
