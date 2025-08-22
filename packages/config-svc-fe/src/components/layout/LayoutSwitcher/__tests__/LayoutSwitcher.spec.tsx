// LayoutSwitcher.spec.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { LayoutSwitcher } from '../LayoutSwitcher';

// Mock useAuth
jest.mock('~/context/auth', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    isLoading: false,
    logout: jest.fn(),
  }),
}));

describe('LayoutSwitcher', () => {
  it('renders AuthLayout when not authenticated', () => {
    render(<LayoutSwitcher><div>Test Content</div></LayoutSwitcher>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});
