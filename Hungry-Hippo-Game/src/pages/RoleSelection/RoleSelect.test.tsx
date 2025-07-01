import { render, screen, fireEvent } from '@testing-library/react';
import RoleSelect from './RoleSelect';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, vi, beforeEach, test } from 'vitest';

const mockedNavigate = vi.fn();

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

vi.mock('../../contexts/WebSocketContext', () => ({
  useWebSocket: () => ({
    gameStarted: false,    // navigation won't trigger
    sendMessage: vi.fn(),
  }),
}));

describe('RoleSelect Component', () => {
  beforeEach(() => {
    mockedNavigate.mockReset();
    vi.restoreAllMocks();
  });

  test('can select Hippo Player role', () => {
    render(
      <MemoryRouter initialEntries={['/role-select/ABCDE']}>
        <Routes>
          <Route path="/role-select/:sessionId" element={<RoleSelect />} />
        </Routes>
      </MemoryRouter>
    );

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    fireEvent.change(select, { target: { value: 'Hippo Player' } });
    expect(select.value).toBe('Hippo Player');
  });

  test('can select AAC User role', () => {
    render(
      <MemoryRouter initialEntries={['/role-select/ABCDE']}>
        <Routes>
          <Route path="/role-select/:sessionId" element={<RoleSelect />} />
        </Routes>
      </MemoryRouter>
    );

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    fireEvent.change(select, { target: { value: 'AAC User' } });
    expect(select.value).toBe('AAC User');
  });


  test('shows error if Next clicked without selecting role', () => {
    render(
      <MemoryRouter initialEntries={['/role-select/ABCDE']}>
        <Routes>
          <Route path="/role-select/:sessionId" element={<RoleSelect />} />
        </Routes>
      </MemoryRouter>
    );

    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    const select = screen.getByRole('combobox');
    expect(select.className).toMatch(/errorBorder/);
  });

  test('clicking cancel navigates back to landing', () => {
    render(
      <MemoryRouter initialEntries={['/role-select/ABCDE']}>
        <Routes>
          <Route path="/role-select/:sessionId" element={<RoleSelect />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /Close/i }));
    expect(mockedNavigate).toHaveBeenCalledWith('/');
  });
});
