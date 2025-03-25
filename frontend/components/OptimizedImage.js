'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

// Component to handle images with proper fallbacks and error handling
export default function OptimizedImage({ 
  src, 
  alt, 
  width = 0, 
  height = 0, 
  className = '',
  priority = false,
  ...props 
}) {
  const [imgSrc, setImgSrc] = useState(src);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Reset state when src changes
  useEffect(() => {
    setImgSrc(src);
    setLoading(true);
    setError(false);
  }, [src]);

  // Handle image loading error
  const handleError = () => {
    console.error(`Failed to load image: ${src}`);
    setError(true);
    setLoading(false);
    
    // Try to load with standard img element if Next/Image fails
    if (typeof window !== 'undefined') {
      const imgElement = new window.Image();
      imgElement.src = typeof src === 'string' ? src : '/assets/brand/Happy.png'; // Fallback to default image
      imgElement.onload = () => {
        setImgSrc(imgElement.src);
        setError(false);
      };
      imgElement.onerror = () => {
        // If even the direct image load fails, use a static fallback
        setImgSrc('/assets/brand/Happy.png');
      };
    }
  };

  const handleLoad = () => {
    setLoading(false);
  };

  // Use a simple img tag as fallback if needed
  if (error) {
    return (
      <img
        src={typeof src === 'string' ? src : '/assets/brand/Happy.png'}
        alt={alt}
        className={className}
        width={width || 'auto'}
        height={height || 'auto'}
        {...props}
      />
    );
  }

  return (
    <>
      {loading && <div className="image-placeholder" />}
      <Image
        src={imgSrc}
        alt={alt}
        width={width || 100}
        height={height || 100}
        className={className}
        onError={handleError}
        onLoad={handleLoad}
        priority={priority}
        loading={priority ? "eager" : "lazy"}
        unoptimized={true}
        {...props}
      />
    </>
  );
} 