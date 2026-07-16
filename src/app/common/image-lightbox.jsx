import { useEffect, useState } from 'react';
import './image-lightbox.css';

function ImageLightbox({ src, alt, children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    const handleDelegatedClick = (event) => {
      const trigger = event.target.closest('.image-lightbox-trigger');
      if (trigger?.dataset.lightboxSrc === src) {
        setIsOpen(true);
        document.body.style.overflow = 'hidden';
      }
    };

    document.addEventListener('click', handleDelegatedClick);
    return () => document.removeEventListener('click', handleDelegatedClick);
  }, [src]);

  const openLightbox = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = (e) => {
    if (e && (e.target === e.currentTarget || e.target.closest('.lightbox-close'))) {
      setIsOpen(false);
      setIsZoomed(false);
      document.body.style.overflow = 'auto';
    }
  };

  const toggleZoom = (e) => {
    e.stopPropagation();
    setIsZoomed(!isZoomed);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setIsZoomed(false);
      document.body.style.overflow = 'auto';
    }
  };

  return (
    <>
      <div className="image-lightbox-trigger" onClick={openLightbox}>
        {children}
      </div>

      {isOpen && (
        <div className="image-lightbox-overlay" onClick={closeLightbox} onKeyDown={handleKeyDown} tabIndex={0} role="dialog" aria-modal="true">
          <div className="lightbox-container">
            <button 
              className="lightbox-close" 
              onClick={closeLightbox}
              aria-label="Close lightbox"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            <div className={`lightbox-image-wrapper ${isZoomed ? 'zoomed' : ''}`}>
              <img 
                src={src} 
                alt={alt}
                className="lightbox-image"
              />
            </div>

            <button 
              className="lightbox-zoom-btn"
              onClick={toggleZoom}
              aria-label={isZoomed ? 'Zoom out' : 'Zoom in'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {isZoomed ? (
                  <>
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                    <line x1="8" y1="11" x2="14" y2="11"></line>
                  </>
                ) : (
                  <>
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                    <line x1="11" y1="8" x2="11" y2="14"></line>
                    <line x1="8" y1="11" x2="14" y2="11"></line>
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default ImageLightbox;
