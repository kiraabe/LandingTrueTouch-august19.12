function Spinner({ fullPage = false }) {
  return (
    <>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
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
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(2px);
          z-index: 9998;
          padding: 0;
          animation: fadeIn 0.2s ease-out;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 3px solid #e8e8e8;
          border-top-color: #1a73e8;
          border-right-color: #1a73e8;
          animation: spin 0.9s cubic-bezier(0.65, 0.05, 0.36, 1) infinite;
        }
      `}</style>
      <div className={`spinner-container ${fullPage ? 'full-page' : ''}`}>
        <div className="spinner" />
      </div>
    </>
  );
}

export default Spinner;