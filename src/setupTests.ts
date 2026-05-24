// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { vi } from 'vitest';

(globalThis as any).jest = vi;

// localStorage のポリフィル (jsdom環境で壊れたり存在しない場合の補填)
const store: Record<string, string> = {};
const mockLocalStorage = {
  getItem: vi.fn().mockImplementation((key: string) => store[key] || null),
  setItem: vi.fn().mockImplementation((key: string, value: string) => { store[key] = value ? value.toString() : ''; }),
  removeItem: vi.fn().mockImplementation((key: string) => { delete store[key]; }),
  clear: vi.fn().mockImplementation(() => { for (const key in store) delete store[key]; }),
  length: 0,
  key: vi.fn().mockImplementation((index: number) => Object.keys(store)[index] || null),
};

Object.defineProperty(window, 'localStorage', { value: mockLocalStorage, writable: true, configurable: true });
Object.defineProperty(globalThis, 'localStorage', { value: mockLocalStorage, writable: true, configurable: true });
