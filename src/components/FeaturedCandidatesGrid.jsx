import React from 'react';
import useApi from '../hooks/useApi';
import candidatesService from '../services/candidatesService';
import SkeletonLoader from './SkeletonLoader';

const FeaturedCandidatesGrid = ({ limit = 6 }) => {
  const { data, loading, error } = useApi(
    () => candidatesService.getFeaturedCandidates(limit),
    [limit]
  );

  if (loading) return <SkeletonLoader count={6} type="card" />;
  if (error) return <div className="error-message">Failed to load candidates</div>;

  const candidates = data?.data || [];

  return (
    <div className="twm-candidates-grid-section">
      <div className="row">
        {candidates.map((candidate) => (
          <div key={candidate.id} className="col-lg-4 col-md-6 m-b30">
            <div className="twm-candidate-card">
              {candidate.profile_image_url && (
                <div className="twm-candidate-avatar">
                  <img
                    src={candidate.profile_image_url}
                    alt={candidate.name}
                    className="candidate-img"
                  />
                </div>
              )}
              <div className="twm-candidate-body">
                <h3 className="twm-candidate-name">{candidate.name}</h3>
                <p className="twm-candidate-title">{candidate.title}</p>
                <p className="twm-candidate-location">
                  <i className="fas fa-map-marker-alt" /> {candidate.location}
                </p>
                <p className="twm-candidate-experience">
                  {candidate.experience_years} years experience
                </p>
                {candidate.bio && (
                  <p className="twm-candidate-bio">{candidate.bio}</p>
                )}
              </div>
              <div className="twm-candidate-footer">
                <a href={`/candidate/${candidate.id}`} className="site-button-link">
                  View Profile <i className="fas fa-arrow-right" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedCandidatesGrid;
