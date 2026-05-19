import React from 'react';

export const SkeletonLoader = ({ count = 3, type = 'card' }) => {
  const skeletons = Array.from({ length: count }, (_, i) => i);

  if (type === 'text') {
    return (
      <div className="skeleton-text">
        {skeletons.map((i) => (
          <div key={i} className="skeleton-line" style={{ height: '16px', marginBottom: '8px' }} />
        ))}
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className="skeleton-grid">
        {skeletons.map((i) => (
          <div key={i} className="skeleton-card" style={{ backgroundColor: '#f0f0f0', borderRadius: '8px', padding: '20px', minHeight: '200px' }} />
        ))}
      </div>
    );
  }

  return null;
};

export default SkeletonLoader;
