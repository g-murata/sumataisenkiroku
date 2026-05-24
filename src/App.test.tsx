import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import App from './App';

vi.mock('./supabaseClient', () => ({
  supabase: {
    auth: { 
      getUser: () => Promise.resolve({ data: { user: null } }),
      getSession: () => Promise.resolve({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    },
    from: () => ({ 
      select: () => ({ order: () => Promise.resolve({ data: [], error: null }) }),
      insert: () => Promise.resolve({ error: null }),
      update: () => Promise.resolve({ error: null }),
      delete: () => Promise.resolve({ error: null })
    }),
    channel: () => ({
      on: () => ({
        subscribe: () => {}
      }),
      send: () => {}
    }),
    removeChannel: () => {}
  },
}));

test('renders app with login button', async () => {
  render(<App />);
  const loginButton = await screen.findByText(/ログイン/i);
  expect(loginButton).toBeInTheDocument();
});
