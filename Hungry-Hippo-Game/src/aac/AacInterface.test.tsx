/**
 * @vitest-environment jsdom
 */

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---- MOCKS ----

// 1. Mock the Foods module (AAC_DATA and verbs)
vi.mock('../Foods', () => ({
  AAC_DATA: {
    categories: [
      {
        categoryName: 'Fruits',
        categoryIcon: '/fake/fruits.png',
        foods: [
          { id: 'apple', name: 'Apple', imagePath: '/fake/apple.png', audioPath: '/fake/apple.mp3' },   // <-- Added name
          { id: 'banana', name: 'Banana', imagePath: '/fake/banana.png', audioPath: '/fake/banana.mp3' }, // <-- Added name
        ],
      },
    ],
  },
  AAC_VERBS: [],
}));

// 2. Mock WebSocket context and spy on sendMessage
const mockSendMessage = vi.fn();
vi.mock('../contexts/WebSocketContext', () => ({
  useWebSocket: () => ({
    sendMessage: mockSendMessage,
  }),
}));

// 3. Mock storage (optional, only if your code calls it on mount)
vi.mock('../components/Storage/Storage', () => ({
  updatePlayerInSessionStorage: vi.fn(),
}));

// 4. Mock Audio globally to prevent errors
const mockAudio = vi.fn(() => ({
  play: vi.fn(),
  onended: vi.fn(),
  onerror: vi.fn(),
}));
vi.stubGlobal('Audio', mockAudio);

// ---- ACTUAL TESTS ----

import AacInterface from './AacInterface'; // Import after mocks

describe('AacInterface Component', () => {
  beforeEach(() => {
    mockSendMessage.mockClear();
  });

  it('calls sendMessage with the correct payload when food is clicked', async () => {
    render(
      <AacInterface sessionId="test-session" userId="user1" role="AAC User" />
    );

    const user = userEvent.setup();
    // Click to open category
    const categoryButton = screen.getByRole('button', { name: /fruits/i });
    await user.click(categoryButton);

    // Click food
    const appleButton = await screen.findByRole('button', { name: /apple/i });
    await user.click(appleButton);

    // Assert the right WebSocket message was sent
    expect(mockSendMessage).toHaveBeenCalledWith({
      type: "AAC_FOOD_SELECTED",
      payload: {
        sessionId: "test-session",
        userId: "user1",
        role: "AAC User",
        food: {
          id: "apple",
          name: "Apple",
          imagePath: "/fake/apple.png",
          audioPath: "/fake/apple.mp3",
        },
        effect: null,
      },
    });
  });

  it('shows the selected food in the UI when clicked', async () => {
    render(
      <AacInterface sessionId="test-session" userId="user1" role="AAC User" />
    );
    const user = userEvent.setup();
    const categoryButton = screen.getByRole('button', { name: /fruits/i });
    await user.click(categoryButton);

    const appleButton = await screen.findByRole('button', { name: /apple/i });
    await user.click(appleButton);

    // UI should update with selection
    expect(screen.getByText(/you selected: Apple/i)).toBeInTheDocument();

    // If there are multiple images with alt="Apple", use getAllByAltText:
    expect(screen.getAllByAltText('Apple').length).toBeGreaterThan(0);

    // OR if you want to check exactly one is selected (optional, only if your component guarantees this)
    // expect(screen.getByAltText('Apple')).toBeInTheDocument();
  });
});
