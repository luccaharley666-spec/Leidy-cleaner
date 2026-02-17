import React, { useState, useEffect } from 'react';
import { useLazyImage, decodeToken } from '../utils/performance';
// Using native `loading="lazy"` as a safe fallback instead of external lazy image lib
import { LoadingSpinner } from './LoadingSpinner';

export function OptimizedImage({
  src,
  alt,
  className = '',
  placeholder = '',
  threshold = 100,
  effect = 'blur',
  wrapperClassName = '',
  onLoad = () => {},
  onError = () => {},
  ...props
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { ref, hasIntersected } = decodeToken({ threshold });

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad();
  };

  const handleError = () => {
    setHasError(true);
    onError();
  };

  // Generate responsive srcSet if not provided
  const generateSrcSet = (src) => {
    if (!src) return '';

    // For demo purposes, we'll use the same image at different sizes
    // In production, you'd have actual different sized images
    const sizes = [480, 768, 1024, 1280, 1920];
    return sizes.map(size => `${src}?w=${size} ${size}w`).join(', ');
  };

  return (
    <div ref={ref} className={`relative ${wrapperClassName}`}>
      {hasIntersected && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
          srcSet={generateSrcSet(src)}
          sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      )}

      {!isLoaded && !hasError && hasIntersected && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded">
          <LoadingSpinner size="sm" variant="pulse" />
        </div>
      )}

      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded">
          <div className="text-gray-400 text-sm">Imagem não disponível</div>
        </div>
      )}
    </div>
  );
}

// Componente para avatar otimizado
export function OptimizedAvatar({
  src,
  alt = 'Avatar',
  size = 'md',
  className = '',
  fallback = '',
  ...props
}) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24' };

  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    setHasError(true);
  };

  if (hasError || !src) {
    return (
      <div
        className={`${sizeClasses[size]} ${className} bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium`}
        {...props}
      >
        {fallback || alt.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      className={`${sizeClasses[size]} ${className} rounded-full object-cover`}
      effect="opacity"
      threshold={50}
      onError={handleError}
      {...props}
    />
  );
}

// Componente para hero image com parallax
export function HeroImage({
  src,
  alt,
  className = '',
  overlay = true,
  parallax = false,
  children,
  ...props
}) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    if (!parallax) return;

    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [parallax]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <OptimizedImage
        src={src}
        alt={alt}
        className={`w-full h-full object-cover ${parallax ? 'transform' : ''}`}
        style={parallax ? { transform: `translateY(${scrollY * 0.5}px)` } : {}}
        threshold={0}
        effect="blur"
        {...props}
      />

      {overlay && (
        <div className="absolute inset-0 bg-black/40" />
      )}

      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}

// Componente para galeria de imagens com lazy loading
export function ImageGallery({
  images = [],
  className = '',
  itemClassName = '',
  columns = 3,
  gap = 4 }) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4' };

  return (
    <div className={`grid ${gridCols[columns]} gap-${gap} ${className}`}>
      {images.map((image, index) => (
        <OptimizedImage
          key={index}
          src={image.src}
          alt={image.alt || `Imagem ${index + 1}`}
          className={`w-full h-48 object-cover rounded-lg ${itemClassName}`}
          threshold={200}
          effect="blur"
        />
      ))}
    </div>
  );
}