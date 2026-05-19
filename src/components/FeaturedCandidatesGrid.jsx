import React from 'react';
import { NavLink } from 'react-router-dom';
import useApi from '../hooks/useApi';
import candidatesService from '../services/candidatesService';
import SkeletonLoader from './SkeletonLoader';
import { publicUser } from '../globals/route-names';
import JobZImage from '../app/common/jobz-img';

const FeaturedCandidatesGrid = ({ limit = 6 }) => {
  const { data, loading, error } = useApi(
    () => candidatesService.getFeaturedCandidates(limit),
    [limit]
  );

  if (loading) return <SkeletonLoader count={limit} type="card" />;
  if (error) return <div className="error-message">Failed to load candidates</div>;

  const candidates = data?.data || [];

  return (
    <div className="row d-flex justify-content-center m-b30">
      {candidates.map((candidate) => (
        <div key={candidate.id} className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
          <div className="twm-candidates-grid-h-page7 m-b30">
            <div className="twm-top-section-content">
              <div className="twm-media">
                <div className="twm-media-pic">
                  {candidate.profile_image_url ? (
                    <JobZImage src={candidate.profile_image_url} alt={candidate.name} />
                  ) : (
                    <div className="twm-no-image-placeholder">No Image</div>
                  )}
                </div>
              </div>
              <div className="twm-mid-content">
                <div className="twm-candidates-tag"><span>Featured</span></div>
                <NavLink to={publicUser.candidate.DETAIL1} className="twm-job-title">
                  <h4>{candidate.name}</h4>
                </NavLink>
                <p>{candidate.title}</p>
              </div>
            </div>
            <div className="twm-fot-content">
              <div className="twm-left-info">
                <p className="twm-candidate-address"><i className="feather-map-pin" />{candidate.location}</p>
                {candidate.experience_years && (
                  <div className="twm-jobs-vacancies">{candidate.experience_years}<span> years exp</span></div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FeaturedCandidatesGrid;
