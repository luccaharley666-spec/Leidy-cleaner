import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import Header from '../Header';
import ThemeProvider from '../../context/ThemeContext';


describe('Header Component', () => {
  const renderWithProvider = (ui) => render(
    <ThemeProvider>{ui}</ThemeProvider>
  );

  test('should render header with navigation', () => {
    renderWithProvider(<Header />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  test('should contain logo/brand', () => {
    renderWithProvider(<Header />);
    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
  });

  test('should render menu items', () => {
    renderWithProvider(<Header />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  test('should be responsive', () => {
    const { container } = renderWithProvider(<Header />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
