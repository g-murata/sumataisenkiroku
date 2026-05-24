import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('./supabaseClient', () => ({
  supabase: {
    auth: { getUser: () => Promise.resolve({ data: { user: null } }) },
    from: () => ({ insert: () => Promise.resolve({ error: null }) }),
  },
}));

test('renders app with login button', async () => {
  render(<App />);
  const loginButton = await screen.findByText(/Googleでログイン/i);
  expect(loginButton).toBeInTheDocument();
});
