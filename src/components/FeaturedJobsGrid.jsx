import React from 'react';
import useApi from '../hooks/useApi';
import jobsService from '../services/jobsService';
import SkeletonLoader from './SkeletonLoader';

const FeaturedJobsGrid = ({ limit = 10 }) => {
  const { data, loading, error } = useApi(
    () => jobsService.getFeaturedJobs(limit),
    [limit]
  );

  if (loading) return <SkeletonLoader count={3} type="card" />;
  if (error) return <div className="error-message">Failed to load jobs</div>;

  const jobs = data?.data || [];

  return (
    <div className="twm-jobs-grid-section">
      <div className="row">
        {jobs.map((job) => (
          <div key={job.id} className="col-lg-4 col-md-6 m-b30">
            <div className="twm-job-card">
              <div className="twm-job-header">
                {job.logo_url && (
                  <div className="twm-job-logo">
                    <img src={job.logo_url} alt={job.company_name} />
                  </div>
                )}
                <div className="twm-job-info">
                  <h3 className="twm-job-title">{job.title}</h3>
                  <p className="twm-job-company">{job.company_name}</p>
                </div>
              </div>
              <div className="twm-job-body">
                <p className="twm-job-location">
                  <i className="fas fa-map-marker-alt" /> {job.location}
                </p>
                <p className="twm-job-type">{job.job_type}</p>
                {job.salary_min && job.salary_max && (
                  <p className="twm-job-salary">
                    ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}
                  </p>
                )}
              </div>
              <div className="twm-job-footer">
                <a href={`/job/${job.id}`} className="site-button-link">
                  View Details <i className="fas fa-arrow-right" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedJobsGrid;
