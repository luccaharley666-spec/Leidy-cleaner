import React from 'react';
import { motion } from 'framer-motion';

export function LoadingSpinner({ size = 'md', text = 'Carregando...', variant = 'default' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const variants = {
    default: (
      <div className={`${sizeClasses[size]} border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin`}></div>
    ),
    dots: (
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-blue-600 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5] }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2 }}
          />
        ))}
      </div>
    ),
    pulse: (
      <motion.div
        className={`${sizeClasses[size]} bg-blue-600 rounded-full`}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.5, 1, 0.5] }}
        transition={{
          duration: 1.5,
          repeat: Infinity }}
      />
    ) };

  return (
    <motion.div
      className="flex flex-col items-center justify-center gap-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {variants[variant]}
      {text && (
        <motion.p
          className="text-gray-600 text-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {text}
        </motion.p>
      )}
    </motion.div>
  );
}

export function LoadingOverlay({ isVisible = false, text = 'Processando...', blur = true }) {
  if (!isVisible) return null;

  return (
    <motion.div
      className={`fixed inset-0 ${blur ? 'backdrop-blur-sm' : ''} bg-black/30 flex items-center justify-center z-50`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-xl p-8 shadow-2xl border border-gray-100"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        <LoadingSpinner size="lg" text={text} variant="dots" />
      </motion.div>
    </motion.div>
  );
}

export function LoadingSkeleton({ count = 3, height = 'h-12', className = '' }) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className={`${height} bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg`}
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
            delay: i * 0.1 }}
          style={{
            backgroundSize: '200% 100%' }}
        />
      ))}
    </div>
  );
}

// Skeleton específico para cards de serviço
export function ServiceCardSkeleton() {
  return (
    <motion.div
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start gap-4">
        <LoadingSkeleton count={1} height="h-12 w-12" className="rounded-full" />
        <div className="flex-1 space-y-3">
          <LoadingSkeleton count={1} height="h-5 w-3/4" />
          <LoadingSkeleton count={2} height="h-4 w-full" />
          <div className="flex justify-between items-center pt-2">
            <LoadingSkeleton count={1} height="h-6 w-20" />
            <LoadingSkeleton count={1} height="h-8 w-24 rounded-full" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Skeleton para lista de agendamentos
export function BookingListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={i}
          className="bg-white rounded-lg p-4 shadow-sm border border-gray-100"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: i * 0.1 }}
        >
          <div className="flex justify-between items-start mb-3">
            <div className="space-y-2 flex-1">
              <LoadingSkeleton count={1} height="h-4 w-1/2" />
              <LoadingSkeleton count={1} height="h-3 w-1/3" />
            </div>
            <LoadingSkeleton count={1} height="h-6 w-16 rounded-full" />
          </div>
          <div className="flex justify-between items-center">
            <LoadingSkeleton count={1} height="h-4 w-24" />
            <LoadingSkeleton count={1} height="h-8 w-20 rounded" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Skeleton para dashboard
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <LoadingSkeleton count={1} height="h-8 w-48" />
        <LoadingSkeleton count={1} height="h-10 w-32 rounded" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <motion.div
            key={i}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <LoadingSkeleton count={1} height="h-4 w-20" />
                <LoadingSkeleton count={1} height="h-8 w-16" />
              </div>
              <LoadingSkeleton count={1} height="h-12 w-12 rounded-full" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <LoadingSkeleton count={1} height="h-6 w-40 mb-4" />
        <BookingListSkeleton />
      </div>
    </div>
  );
}
