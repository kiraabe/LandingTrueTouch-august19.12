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
    const phoneNumber = '251911208322'; // WhatsApp number in international format (no +)
    const message = 'Hello! I would like to get more information.';
    const whatsappUrl = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <button
      className={`whatsapp-widget ${isVisible ? 'visible' : ''}`}
      onClick={handleWhatsAppClick}
      title="Chat with us on WhatsApp"
      aria-label="Open WhatsApp chat"
    >
      <img
        src="https://cdn.builder.io/api/v1/image/assets%2Fedbcaea3cbdc410ea3aaf9355588cf10%2F95ede0faad9c4472baa7f2b06aff91ec?format=webp&width=800&height=1200"
        alt="WhatsApp"
        className="whatsapp-icon"
      />
    </button>
  );
};

export default WhatsAppWidget;
