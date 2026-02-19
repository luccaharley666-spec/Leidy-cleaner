import React from 'react';
import { Review } from '../services/api';

export default function ReviewList({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return <p>Nenhuma avaliação ainda.</p>;
  }

  return (
    <div className="space-y-4">
      {reviews.map((r) => (
        <div key={r.id} className="border p-3 rounded">
          <div className="flex items-center mb-1">
            <span className="font-semibold mr-2">{r.rating} ⭐</span>
            <span className="text-xs text-gray-500">
              {new Date(r.createdAt).toLocaleDateString()}
            </span>
          </div>
          {r.comment && <p className="text-gray-700">"{r.comment}"</p>}
          {r.images && r.images.length > 0 && (
            <div className="mt-2 flex space-x-2 overflow-auto">
              {r.images.map((url) => (
                <img key={url} src={url} alt="review" className="h-16 w-16 object-cover rounded" />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
