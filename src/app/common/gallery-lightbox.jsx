import { useState, useEffect } from 'react';
import './gallery-lightbox.css';

function GalleryLightbox({ images, initialIndex = 0, children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);

  const openLightbox = (index) => {
    setCurrentIndex(index);
    setIsOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = (e) => {
    if (e && (e.target === e.currentTarget || e.target.closest('.gallery-close'))) {
      setIsOpen(false);
      setIsZoomed(false);
      document.body.style.overflow = 'auto';
    }
  };

  const goToPrevious = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    setIsZoomed(false);
  };

  const goToNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    setIsZoomed(false);
  };

  const toggleZoom = (e) => {
    e.stopPropagation();
    setIsZoomed(!isZoomed);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) return;
    if (e.key === 'Escape') {
      setIsOpen(false);
      setIsZoomed(false);
      document.body.style.overflow = 'auto';
    } else if (e.key === 'ArrowLeft') {
      goToPrevious(e);
    } else if (e.key === 'ArrowRight') {
      goToNext(e);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const currentImage = images[currentIndex];

  return (
    <>
      {children(openLightbox)}

      {isOpen && (
        <div 
          className="gallery-lightbox-overlay" 
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
        >
          <div className="gallery-lightbox-container">
            {/* Close Button */}
            <button 
              className="gallery-close" 
              onClick={closeLightbox}
              aria-label="Close gallery"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            {/* Image Wrapper */}
            <div className={`gallery-image-wrapper ${isZoomed ? 'zoomed' : ''}`}>
              <img 
                src={currentImage} 
                alt={`Gallery image ${currentIndex + 1}`}
                className="gallery-image"
              />
            </div>

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button 
                  className="gallery-nav-btn gallery-prev"
                  onClick={goToPrevious}
                  aria-label="Previous image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </button>
                <button 
                  className="gallery-nav-btn gallery-next"
                  onClick={goToNext}
                  aria-label="Next image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </>
            )}

            {/* Zoom Button */}
            <button 
              className="gallery-zoom-btn"
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

            {/* Counter */}
            {images.length > 1 && (
              <div className="gallery-counter">
                <span>{currentIndex + 1}</span>
                <span>/</span>
                <span>{images.length}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default GalleryLightbox;
