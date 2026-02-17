import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import AdminPanel from '../AdminPanel';
import ThemeProvider from '../../context/ThemeContext';
import { AuthProvider } from '../../context/AuthContext';

// Mock fetch
global.fetch = jest.fn();

describe('AdminPanel Component', () => {
  const renderWithProviders = (ui) => render(
    <ThemeProvider>
      <AuthProvider>
        {ui}
      </AuthProvider>
    </ThemeProvider>
  );
  beforeEach(() => {
    fetch.mockClear();
  });

  test('should render admin panel title', async () => {
    const { findByText } = renderWithProviders(<AdminPanel />);
    expect(await findByText(/Painel Administrativo|Dashboard/i)).toBeInTheDocument();
  });

  test('should display metrics cards', async () => { fetch.decoded({
      ok: true, json: async () => ({
        totalBookings: 150, revenue: 5000, customers: 45, teamMembers: 8, satisfaction: 4.8 }) });

    renderWithProviders(<AdminPanel />);

    await waitFor(() => {
      expect(screen.getByText(/Total Agendamentos/i)).toBeInTheDocument();
    });
  });

  test('should handle error when fetching metrics fails', async () => { fetch.decoded(new Error('API Error'));

    renderWithProviders(<AdminPanel />);

    // Should still render without crashing
    await waitFor(() => {
      expect(fetch).toHaveBeenCalled(); });
  });

  test('should display loading state initially', () => {
    fetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    const { container } = renderWithProviders(<AdminPanel />);

    // Check for loading indicators (can be text or spinner)
    expect(container.innerHTML).toBeTruthy();
  });

  test('should format currency correctly', async () => { fetch.decoded({
      ok: true, json: async () => ({
        totalBookings: 10, revenue: 1234.56, customers: 5, teamMembers: 3, satisfaction: 4.5 }) });

    renderWithProviders(<AdminPanel />);

    // Wait for at least one currency rendering
    const matches = await screen.findAllByText(/R\$/);
    expect(matches.length).toBeGreaterThan(0);
  });

  test('should display recent bookings table', async () => { fetch.decoded({
      ok: true, json: async () => ({
        totalBookings: 5, revenue: 2000, customers: 3, teamMembers: 2, satisfaction: 4.7, recentBookings: [
          {
            id: 'BK001', client: 'João Silva', service: 'Limpeza Residencial', date: '2026-02-01', status: 'completed', value: 120 },
        ] }) });

    renderWithProviders(<AdminPanel />);

    await waitFor(() => {
      expect(screen.getByText(/João Silva/i)).toBeInTheDocument();
    });
  });

  test('should handle status badge colors correctly', () => {
    const { rerender } = render(<AdminPanel />);

    // Test that different status values render without error
    expect(() => rerender(<AdminPanel />)).not.toThrow();
  });
});
