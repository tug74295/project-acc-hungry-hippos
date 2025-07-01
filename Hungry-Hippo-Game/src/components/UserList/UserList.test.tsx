import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import UserList from './UserList';

describe('UserList component', () => {
  it('renders a message when no users are connected', () => {
    render(<UserList users={[]} />);
    expect(screen.getByText(/no users connected yet/i)).toBeInTheDocument();
  });

  it('renders a list of users with their roles', () => {
    const users = [
      { userId: '123', role: 'Hippo' },
      { userId: '456', role: 'AAC' },
    ];

    render(<UserList users={users} />);

    expect(screen.getByText(/123/i)).toBeInTheDocument();
    expect(screen.getByText(/Hippo/i)).toBeInTheDocument();
    expect(screen.getByText(/456/i)).toBeInTheDocument();
    expect(screen.getByText(/AAC/i)).toBeInTheDocument();
  });

  it('renders nothing if users undefined or null', () => {
    // @ts-expect-error testing null input
    render(<UserList users={null} />);
    expect(screen.getByText(/No users connected yet/i)).toBeInTheDocument();
  });
});
