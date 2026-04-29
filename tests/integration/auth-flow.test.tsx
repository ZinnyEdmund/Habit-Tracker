import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { STORAGE_KEYS } from '@/data/storage';

const { replaceMock } = vi.hoisted(() => ({
  replaceMock: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: replaceMock,
  }),
}));

describe('auth flow', () => {
  beforeEach(() => {
    replaceMock.mockReset();
  });

  it('submits the signup form and creates a session', async () => {
    const user = userEvent.setup();

    render(<SignupForm />);

    await user.type(screen.getByTestId('auth-signup-email'), 'person@example.com');
    await user.type(screen.getByTestId('auth-signup-password'), 'secret123');
    await user.click(screen.getByTestId('auth-signup-submit'));

    const storedUsers = JSON.parse(localStorage.getItem(STORAGE_KEYS.users) ?? '[]');
    const storedSession = JSON.parse(localStorage.getItem(STORAGE_KEYS.session) ?? 'null');

    expect(storedUsers).toHaveLength(1);
    expect(storedUsers[0]).toMatchObject({
      email: 'person@example.com',
      password: 'secret123',
    });
    expect(storedSession).toEqual({
      userId: storedUsers[0].id,
      email: 'person@example.com',
    });
    expect(replaceMock).toHaveBeenCalledWith('/dashboard');
  });

  it('shows an error for duplicate signup email', async () => {
    const user = userEvent.setup();

    localStorage.setItem(
      STORAGE_KEYS.users,
      JSON.stringify([
        {
          id: 'user-1',
          email: 'person@example.com',
          password: 'secret123',
          createdAt: '2026-04-27T00:00:00.000Z',
        },
      ]),
    );

    render(<SignupForm />);

    await user.type(screen.getByTestId('auth-signup-email'), 'person@example.com');
    await user.type(screen.getByTestId('auth-signup-password'), 'secret123');
    await user.click(screen.getByTestId('auth-signup-submit'));

    expect(await screen.findByText('User already exists')).toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it('submits the login form and stores the active session', async () => {
    const user = userEvent.setup();

    localStorage.setItem(
      STORAGE_KEYS.users,
      JSON.stringify([
        {
          id: 'user-1',
          email: 'person@example.com',
          password: 'secret123',
          createdAt: '2026-04-27T00:00:00.000Z',
        },
      ]),
    );

    render(<LoginForm />);

    await user.type(screen.getByTestId('auth-login-email'), 'person@example.com');
    await user.type(screen.getByTestId('auth-login-password'), 'secret123');
    await user.click(screen.getByTestId('auth-login-submit'));

    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.session) ?? 'null')).toEqual({
      userId: 'user-1',
      email: 'person@example.com',
    });
    expect(replaceMock).toHaveBeenCalledWith('/dashboard');
  });

  it('shows an error for invalid login credentials', async () => {
    const user = userEvent.setup();

    localStorage.setItem(
      STORAGE_KEYS.users,
      JSON.stringify([
        {
          id: 'user-1',
          email: 'person@example.com',
          password: 'secret123',
          createdAt: '2026-04-27T00:00:00.000Z',
        },
      ]),
    );

    render(<LoginForm />);

    await user.type(screen.getByTestId('auth-login-email'), 'person@example.com');
    await user.type(screen.getByTestId('auth-login-password'), 'wrong-pass');
    await user.click(screen.getByTestId('auth-login-submit'));

    expect(await screen.findByText('Invalid email or password')).toBeInTheDocument();
    expect(localStorage.getItem(STORAGE_KEYS.session)).toBeNull();
    expect(replaceMock).not.toHaveBeenCalled();
  });
});
