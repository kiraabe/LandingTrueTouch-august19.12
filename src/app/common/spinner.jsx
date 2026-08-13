function Spinner({ fullPage = false }) {
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
          background: #fff;
          z-index: 9998;
          padding: 0;
        }

        .spinner {
          border: 6px solid #f3f3f3;
          border-top-color: #A9C731;
          border-radius: 50%;
          width: 64px;
          height: 64px;
          animation: spin 1s linear infinite;
        }
      `}</style>
      <div className={`spinner-container ${fullPage ? 'full-page' : ''}`}>
        <div className="spinner" />
      </div>
    </>
  );
}

export default Spinner;
