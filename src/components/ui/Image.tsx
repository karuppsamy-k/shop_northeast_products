import React, { useState, useEffect } from 'react';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  placeholderColor?: string;
}

export const Image: React.FC<ImageProps> = ({ 
  src, 
  alt, 
  className = '', 
  placeholderColor = 'rgba(0,0,0,0.05)',
  ...props 
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const img = new window.Image();
    img.src = src;
    img.onload = () => setLoaded(true);
    img.onerror = () => setError(true);
  }, [src]);

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ background: placeholderColor }}>
      {!loaded && !error && (
        <div className="absolute inset-0 animate-pulse" style={{ background: 'rgba(0,0,0,0.1)' }} />
      )}
      <img
        src={error ? '/placeholder-image.webp' : src} // Assuming a fallback image exists
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'} ${className}`}
        loading="lazy"
        decoding="async"
        {...props}
      />
    </div>
  );
};
