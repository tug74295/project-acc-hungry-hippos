import { render, screen, fireEvent } from '@testing-library/react';
import RoleSelect from './RoleSelect';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, vi, beforeEach, test } from 'vitest';
import '@testing-library/jest-dom';

const mockedNavigate = vi.fn();

// Mock React Router hooks to simulate routing and session/user data
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
    useParams: () => ({ sessionId: 'ABCDE' }),
    useLocation: () => ({
      state: { userId: 'testUser' },
      pathname: '/role-select/ABCDE',
    }),
  };
});

describe('RoleSelect Component', () => {
  beforeEach(() => {
    mockedNavigate.mockReset();
    vi.restoreAllMocks();
  });

  // Tests behavior when Hippo Player role is selected
  describe('when user selects Hippo Player', () => {
    test('navigates to gamepage with selected role and userId', () => {
      render(
        <MemoryRouter initialEntries={['/role-select/ABCDE']}>
          <Routes>
            <Route path="/role-select/:sessionId" element={<RoleSelect />} />
          </Routes>
        </MemoryRouter>
      );

      // Simulate selecting "Hippo Player"
      fireEvent.change(screen.getByRole('combobox'), {
        target: { value: 'Hippo Player' },
      });

      // Simulate clicking "Next"
      fireEvent.click(screen.getByText('Next'));

      // Expect navigation to gamepage with correct route and state
      expect(mockedNavigate).toHaveBeenCalledWith('/gamepage/ABCDE/testUser', {
        state: { userId: 'testUser', role: 'Hippo Player' },
      });
    });
  });

  // Tests behavior when AAC User role is selected
  describe('when user selects AAC User', () => {
    test('navigates to gamepage with selected role and userId', () => {
      render(
        <MemoryRouter initialEntries={['/role-select/ABCDE']}>
          <Routes>
            <Route path="/role-select/:sessionId" element={<RoleSelect />} />
          </Routes>
        </MemoryRouter>
      );

      // Simulate selecting "AAC User"
      fireEvent.change(screen.getByRole('combobox'), {
        target: { value: 'AAC User' },
      });

      // Simulate clicking "Next"
      fireEvent.click(screen.getByText('Next'));

      // Expect navigation to gamepage with correct route and state
      expect(mockedNavigate).toHaveBeenCalledWith('/gamepage/ABCDE/testUser', {
        state: { userId: 'testUser', role: 'AAC User' },
      });
    });
  });

  // Tests the cancel behavior
  describe('when cancel button is clicked', () => {
    test('navigates back to landing page', () => {
      render(
        <MemoryRouter initialEntries={['/role-select/ABCDE']}>
          <Routes>
            <Route path="/role-select/:sessionId" element={<RoleSelect />} />
          </Routes>
        </MemoryRouter>
      );

      // Simulate clicking the close button
      fireEvent.click(screen.getByRole('button', { name: /Close/i }));

      // Expect navigation to landing page
      expect(mockedNavigate).toHaveBeenCalledWith('/');
    });
  });
});
