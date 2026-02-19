import React from 'react';
import { render, screen } from '@testing-library/react';
import ReviewList from '../ReviewList';
import { Review } from '../../services/api';

describe('ReviewList', () => {
  it('shows message when empty', () => {
    render(<ReviewList reviews={[]} />);
    expect(screen.getByText(/Nenhuma avaliação/i)).toBeInTheDocument();
  });

  it('renders reviews', () => {
    const reviews: Review[] = [
      { id: 'r1', bookingId: 'b1', userId: 'u1', rating: 4, comment: 'Bom', isApproved: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'r2', bookingId: 'b2', userId: 'u2', rating: 5, comment: 'Ótimo', isApproved: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ];
    render(<ReviewList reviews={reviews} />);
    expect(screen.getByText(/4 ⭐/)).toBeInTheDocument();
    expect(screen.getByText(/5 ⭐/)).toBeInTheDocument();
  });

  it('shows images', () => {
    const reviews: Review[] = [
      { id: 'r3', bookingId: 'b3', userId: 'u3', rating: 5, images: ['http://a.jpg'], isApproved: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ];
    render(<ReviewList reviews={reviews} />);
    expect(screen.getByRole('img')).toBeInTheDocument();
  });
});
