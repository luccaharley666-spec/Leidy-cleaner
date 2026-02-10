/* React default import removed (automatic JSX runtime) */
import { useState } from 'react';

/**
 * Notification System - Toast Notifications
 */
export const [REDACTED_TOKEN] = ({ notifications = [], removeNotification }) => {
  const getColorClasses = (type) => {
    const colors = {
      success: 'bg-green-500 text-white',
      error: 'bg-red-500 text-white',
      warning: 'bg-yellow-500 text-white',
      info: 'bg-blue-500 text-white',
    };
    return colors[type] || colors.info;
  };

  const getIcon = (type) => {
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ',
    };
    return icons[type] || icons.info;
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`${getColorClasses(notification.type)} px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in [REDACTED_TOKEN]`}
        >
          <span className="text-lg font-bold">{getIcon(notification.type)}</span>
          <p className="flex-1 text-sm md:text-base">{notification.message}</p>
          <button
            onClick={() => removeNotification(notification.id)}
            className="text-lg hover:opacity-80 transition"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};

/**
 * Modal Component
 */
export const Modal = ({ isOpen, title, children, onClose, actions = [] }) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose}></div>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
            <button
              onClick={onClose}
              className="text-2xl text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="p-6">{children}</div>

          {/* Actions */}
          {actions.length > 0 && (
            <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              {actions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={action.onClick}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
                    action.variant === 'danger'
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : action.variant === 'secondary'
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300'
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

/**
 * Tooltip Component
 */
export const Tooltip = ({ text, children, position = 'top' }) => {
  const positions = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2',
  };

  return (
    <div className="relative inline-block group">
      {children}
      <div
        className={`absolute ${positions[position]} left-1/2 -translate-x-1/2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap`}
      >
        {text}
      </div>
    </div>
  );
};

/**
 * Dropdown Menu
 */
export const Dropdown = ({ trigger, children, align = 'left' }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
      >
        {trigger}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0" onClick={() => setIsOpen(false)} />
          <div
            className={`absolute top-full ${
              align === 'left' ? 'left-0' : 'right-0'
            } mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 min-w-48`}
          >
            {children}
          </div>
        </>
      )}
    </div>
  );
};

/**
 * Spinner Loading Component
 */
export const Spinner = ({ size = 'md', color = 'purple' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const colors = {
    purple: 'text-purple-600',
    blue: 'text-blue-600',
    green: 'text-green-600',
  };

  return (
    <div className={`${sizes[size]} ${colors[color]} animate-spin`}>
      <svg
        className="w-full h-full"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="10" stroke="currentColor" opacity="0.1" />
        <path
          d="M22 12a10 10 0 11-20 0 10 10 0 0120 0z"
          stroke="currentColor"
          strokeDasharray="60"
          strokeDashoffset="30"
        />
      </svg>
    </div>
  );
};

/**
 * Loading Skeleton
 */
export const Skeleton = ({ width = 'w-full', height = 'h-6', count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className={`${width} ${height} bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded animate-pulse mb-4`} />
      ))}
    </>
  );
};

/**
 * Collapsible Section
 */
export const Collapsible = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="card">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between font-semibold text-gray-900 dark:text-white hover:text-purple-600 transition"
      >
        {title}
        <span className={`text-2xl transition ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {isOpen && <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">{children}</div>}
    </div>
  );
};

/**
 * Progress Bar
 */
export const ProgressBar = ({ value, max = 100, color = 'purple', showLabel = true }) => {
  const percentage = (value / max) * 100;
  const colors = {
    purple: 'bg-purple-600',
    green: 'bg-green-600',
    orange: 'bg-orange-600',
    blue: 'bg-blue-600',
  };

  return (
    <div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
        <div
          className={`${colors[color]} h-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {value} de {max} ({percentage.toFixed(0)}%)
        </p>
      )}
    </div>
  );
};

/**
 * Rating Stars
 */
export const RatingStars = ({ rating, maxRating = 5, onRate = null, size = 'md' }) => {
  const [hoverRating, setHoverRating] = useState(null);

  const sizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  return (
    <div className="flex gap-1">
      {Array.from({ length: maxRating }).map((_, idx) => {
        const starRating = idx + 1;
        const isFilled = starRating <= (hoverRating || rating);

        return (
          <button
            key={idx}
            onClick={() => onRate && onRate(starRating)}
            onMouseEnter={() => onRate && setHoverRating(starRating)}
            onMouseLeave={() => onRate && setHoverRating(null)}
            className={`${sizes[size]} cursor-pointer transition`}
          >
            {isFilled ? '⭐' : '☆'}
          </button>
        );
      })}
    </div>
  );
};
