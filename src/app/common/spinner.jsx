import { useEffect, useState } from "react";

function Spinner({ fullPage = false, delay = 600 }) {
  const [isVisible, setIsVisible] = useState(delay === 0);

  useEffect(() => {
    if (delay === 0) return undefined;

    const timeoutId = window.setTimeout(() => setIsVisible(true), delay);
    return () => window.clearTimeout(timeoutId);
  }, [delay]);

  if (!isVisible) return null;

  return (
    <>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .spinner-container {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 40px 20px;
        }

        .spinner-container.full-page {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          height: 100vh;
          background: #ffffff;
          z-index: 9998;
          padding: 0;
        }

        .spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #3498db;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
        }

        .spinner-container.full-page .spinner {
          width: 70px;
          height: 70px;
          border-width: 6px;
        }
      `}</style>
      <div className={`spinner-container ${fullPage ? 'full-page' : ''}`}>
        <div className="spinner" />
      </div>
    </>
  );
}

export default Spinner;
