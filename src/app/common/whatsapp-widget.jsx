import { useState, useEffect } from 'react';
import './whatsapp-widget.css';

const WhatsAppWidget = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const handleWhatsAppClick = () => {
    const phoneNumber = '1234567890'; // Replace with actual WhatsApp number
    const message = 'Hello! I would like to get more information.';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <button
      className={`whatsapp-widget ${isVisible ? 'visible' : ''}`}
      onClick={handleWhatsAppClick}
      title="Chat with us on WhatsApp"
      aria-label="Open WhatsApp chat"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.472 14.382c-.297-.149-1.758-.857-2.03-.96-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004c-1.537 0-2.852-.727-2.852-1.619 0-.892 1.286-1.63 2.858-1.63 1.57 0 2.859.738 2.859 1.63 0 .891-1.289 1.619-2.861 1.619m9.434-6.379c-5.85-5.699-15.298-5.681-21.123.049-5.738 5.652-5.738 14.806 0 20.458 5.825 5.729 15.273 5.748 21.123.049l6.058 2.002-2.058-6.128c4.718-5.718 4.718-14.702 0-20.431m-2.649 13.695h-1.459v-3.668h1.459v3.668zm-.729-4.171c-.469 0-.849-.38-.849-.848 0-.469.38-.849.849-.849s.849.38.849.849c0 .468-.381.848-.849.848zm5.148 4.171h-1.459v-1.782c0-.424-.015-.968-.591-.968-.591 0-.681.462-.681 939h-1.459v-3.668h1.404v.493h.02c.195-.37.673-.76 1.386-.76 1.483 0 1.756.976 1.756 2.248v2.457z" fill="currentColor"/>
      </svg>
    </button>
  );
};

export default WhatsAppWidget;
