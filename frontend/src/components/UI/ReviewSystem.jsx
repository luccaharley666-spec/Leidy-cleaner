import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { StarIcon, ChatBubbleLeftIcon, UserIcon, PhotoIcon } from '@heroicons/react/24/solid';
import { useNotifications } from './NotificationSystem';

export function ReviewSystem() {
  const [reviews, setReviews] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const { addNotification } = useNotifications();

  useEffect(() => {
    // Carregar avaliações (em produção viria da API)
    const mockReviews = [
      {
        id: 1,
        serviceId: 'limpeza-residencial',
        customerName: 'Maria Silva',
        customerAvatar: null,
        rating: 5,
        comment: 'Excelente serviço! A equipe foi muito profissional e deixou minha casa impecável. Super recomendo!',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        verified: true,
        photos: [],
        response: null },
      {
        id: 2,
        serviceId: 'limpeza-comercial',
        customerName: 'João Santos',
        customerAvatar: null,
        rating: 4,
        comment: 'Muito bom atendimento. Chegaram no horário e o resultado ficou ótimo. Só demorou um pouco mais que o esperado.',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        verified: true,
        photos: [],
        response: {
          text: 'Obrigado pelo feedback, João! Pedimos desculpas pelo pequeno atraso e ficamos felizes que tenha gostado do resultado.',
          date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) } },
      {
        id: 3,
        serviceId: 'limpeza-residencial',
        customerName: 'Ana Costa',
        customerAvatar: null,
        rating: 5,
        comment: 'Serviço impecável! Contratei para uma limpeza profunda e o resultado superou minhas expectativas.',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        verified: true,
        photos: [],
        response: null },
    ];

    setReviews(mockReviews);
  }, []);

  const submitReview = (reviewData) => {
    const newReview = {
      id: Date.now(),
      ...reviewData,
      date: new Date(),
      verified: false, // Será verificado após o serviço
    };

    setReviews(prev => [newReview, ...prev]);

    addNotification({
      title: '⭐ Avaliação Enviada!',
      message: 'Obrigado por avaliar nosso serviço!',
      icon: '📝',
      tag: 'review' });

    setShowReviewModal(false);
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      distribution[review.rating]++;
    });
    return distribution;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">⭐ Avaliações e Feedbacks</h3>
        <button
          onClick={() => setShowReviewModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <ChatBubbleLeftIcon className="w-4 h-4" />
          Avaliar Serviço
        </button>
      </div>

      <RatingOverview
        averageRating={getAverageRating()}
        totalReviews={reviews.length}
        distribution={getRatingDistribution()}
      />

      <ReviewFilters />

      <ReviewList reviews={reviews} />

      {showReviewModal && (
        <ReviewModal
          onClose={() => setShowReviewModal(false)}
          onSubmit={submitReview}
        />
      )}
    </div>
  );
}

function RatingOverview({ averageRating, totalReviews, distribution }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Rating geral */}
        <div className="text-center">
          <div className="text-4xl font-bold text-gray-900 mb-2">{averageRating}</div>
          <div className="flex items-center justify-center mb-2">
            {[1, 2, 3, 4, 5].map(star => (
              <StarIcon
                key={star}
                className={`w-5 h-5 ${
                  star <= Math.floor(averageRating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <div className="text-sm text-gray-600">
            {totalReviews} avaliações
          </div>
        </div>

        {/* Distribuição de estrelas */}
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map(rating => (
            <div key={rating} className="flex items-center gap-2">
              <span className="text-sm w-3">{rating}</span>
              <StarIcon className="w-3 h-3 text-yellow-400 fill-current" />
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full"
                  style={{
                    width: `${totalReviews > 0 ? (distribution[rating] / totalReviews) * 100 : 0}%`
                  }}
                />
              </div>
              <span className="text-sm text-gray-600 w-8">{distribution[rating]}</span>
            </div>
          ))}
        </div>

        {/* Estatísticas rápidas */}
        <div className="space-y-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {totalReviews > 0 ? Math.round((distribution[5] + distribution[4]) / totalReviews * 100) : 0}%
            </div>
            <div className="text-sm text-gray-600">Satisfação</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {totalReviews > 0 ? Math.round(totalReviews / 30) : 0}
            </div>
            <div className="text-sm text-gray-600">Por mês</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewFilters() {
  const [filter, setFilter] = useState('all');

  return (
    <div className="flex gap-2">
      {[
        { value: 'all', label: 'Todas' },
        { value: '5', label: '5 estrelas' },
        { value: '4', label: '4 estrelas' },
        { value: '3', label: '3 estrelas' },
        { value: 'recent', label: 'Mais recentes' },
      ].map(option => (
        <button
          key={option.value}
          onClick={() => setFilter(option.value)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === option.value
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function ReviewList({ reviews }) {
  return (
    <div className="space-y-4">
      {reviews.map(review => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
}

function ReviewCard({ review }) {
  const [showResponse, setShowResponse] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
          {review.customerAvatar ? (
            <img src={review.customerAvatar} alt={review.customerName} className="w-full h-full rounded-full object-cover" />
          ) : (
            <UserIcon className="w-6 h-6" />
          )}
        </div>

        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-gray-900">{review.customerName}</h4>
                {review.verified && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    ✓ Verificado
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map(star => (
                    <StarIcon
                      key={star}
                      className={`w-4 h-4 ${
                        star <= review.rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(review.date).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          </div>

          {/* Comment */}
          <p className="text-gray-700 mb-4 leading-relaxed">{review.comment}</p>

          {/* Photos */}
          {review.photos && review.photos.length > 0 && (
            <div className="flex gap-2 mb-4">
              {review.photos.map((photo, index) => (
                <img
                  key={index}
                  src={photo}
                  alt={`Foto ${index + 1}`}
                  className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                />
              ))}
            </div>
          )}

          {/* Response */}
          {review.response && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowResponse(!showResponse)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                {showResponse ? 'Ocultar resposta' : 'Ver resposta da empresa'}
              </button>

              {showResponse && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 p-3 bg-blue-50 rounded-lg"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">L</span>
                    </div>
                    <div>
                      <span className="font-medium text-blue-900">Leidy Cleaner</span>
                      <span className="text-xs text-blue-600 ml-2">
                        {new Date(review.response.date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                  <p className="text-blue-800 text-sm">{review.response.text}</p>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ReviewModal({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    serviceId: '',
    rating: 5,
    comment: '',
    photos: [],
    anonymous: false });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    // Em produção, faria upload para servidor
    const photoUrls = files.map(file => URL.createObjectURL(file));
    setFormData(prev => ({ ...prev, photos: [...prev.photos, ...photoUrls] }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Avaliar Serviço</h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Qual sua avaliação geral?
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                    className="focus:outline-none"
                  >
                    <StarIcon
                      className={`w-8 h-8 ${
                        star <= formData.rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Service Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de serviço
              </label>
              <select
                value={formData.serviceId}
                onChange={(e) => setFormData(prev => ({ ...prev, serviceId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Selecione o serviço</option>
                <option value="limpeza-residencial">Limpeza Residencial</option>
                <option value="limpeza-comercial">Limpeza Comercial</option>
                <option value="passadoria">Passadoria</option>
                <option value="jardinagem">Jardinagem</option>
              </select>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seu comentário
              </label>
              <textarea
                value={formData.comment}
                onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="Conte-nos sobre sua experiência..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                required
              />
            </div>

            {/* Photos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fotos (opcional)
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <PhotoIcon className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-700">Adicionar fotos</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
                {formData.photos.length > 0 && (
                  <span className="text-sm text-gray-600">
                    {formData.photos.length} foto(s) selecionada(s)
                  </span>
                )}
              </div>
            </div>

            {/* Anonymous */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="anonymous"
                checked={formData.anonymous}
                onChange={(e) => setFormData(prev => ({ ...prev, anonymous: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="anonymous" className="ml-2 text-sm text-gray-700">
                Enviar anonimamente
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Enviar Avaliação
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}