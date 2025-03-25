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
    setError(true);
    setLoading(false);
    
    // Try to load with standard img element if Next/Image fails
    const imgElement = new window.Image();
    imgElement.src = src;
    imgElement.onload = () => {
      setImgSrc(src);
      setError(false);
    };
  };

  const handleLoad = () => {
    setLoading(false);
  };

  // Use a simple img tag as fallback if needed
  if (error) {
    return (
      <img
        src={src}
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
        unoptimized={true}
        {...props}
      />
    </>
  );
} 