import React from 'react';
import CountUp from 'react-countup';
import useApi from '../hooks/useApi';
import staticService from '../services/staticService';

const StatisticsSection = () => {
  const { data: stats, loading } = useApi(
    () => staticService.getStatistics(),
    []
  );

  const statsData = [
    { label: 'Total Jobs', value: stats?.data?.totalJobs || 0 },
    { label: 'Total Candidates', value: stats?.data?.totalCandidates || 0 },
    { label: 'Total Companies', value: stats?.data?.totalCompanies || 0 },
    { label: 'Filled Positions', value: stats?.data?.filledPositions || 0 },
  ];

  return (
    <div className="twm-statistics-section">
      <div className="section-head center wt-small-separator-outer">
        <h2 className="wt-title">Our Statistics</h2>
      </div>
      <div className="twm-stats-grid">
        <div className="row">
          {statsData.map((stat, index) => (
            <div key={index} className="col-lg-3 col-md-6 m-b30">
              <div className="twm-stat-card">
                <div className="twm-stat-number">
                  {!loading && (
                    <CountUp end={stat.value} duration={2.5} separator="," />
                  )}
                  <span className="twm-stat-plus">+</span>
                </div>
                <p className="twm-stat-label">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatisticsSection;
