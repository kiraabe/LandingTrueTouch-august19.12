const LoadingSkeleton = ({ count = 1, height = '200px', type = 'card' }) => {
  const items = Array.from({ length: count }, (_, i) => i);

  if (type === 'card') {
    return (
      <div className="loading-skeleton-container">
        {items.map((i) => (
          <div key={i} className="skeleton-card">
            <div className="skeleton-image"></div>
            <div className="skeleton-content">
              <div className="skeleton-text skeleton-title"></div>
              <div className="skeleton-text"></div>
              <div className="skeleton-text skeleton-short"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'line') {
    return (
      <div className="loading-skeleton-container">
        {items.map((i) => (
          <div key={i} className="skeleton-line" style={{ height }}></div>
        ))}
      </div>
    );
  }

  return null;
};

export default LoadingSkeleton;
