import { useParams } from "react-router-dom";
import { getCandidateProfilePictureUrl } from "../../../../../globals/file-url";
import { publicUrlFor } from "../../../../../globals/constants";
import JobZImage from "../../../../common/jobz-img";

const SectionCandidateShortIntro = ({ candidate }) => {
  if (!candidate) return null;

  return (
    <div className="can-intro-section">
      <div className="can-intro-header" style={{ backgroundImage: `url('${publicUrlFor("images/candidates/candidate-bg.jpg")}')` }}>
        <div className="can-intro-overlay" />
        <div className="can-intro-content">
          <div className="can-intro-avatar">
            <JobZImage
              src={candidate.profile_picture ? getCandidateProfilePictureUrl(candidate.profile_picture) : "https://cdn.builder.io/api/v1/image/assets%2F5e5700cc98ef413c911c8b7a4a98ea76%2Fb069e95136284114b1d8cad46258af9e?format=webp&width=800&height=1200"}
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = "https://cdn.builder.io/api/v1/image/assets%2F5e5700cc98ef413c911c8b7a4a98ea76%2Fb069e95136284114b1d8cad46258af9e?format=webp&width=800&height=1200";
              }}
              alt={candidate.full_name}
            />
          </div>
          <div className="can-intro-info">
            <h1 className="can-intro-name">{candidate.full_name}</h1>
            <p className="can-intro-title">{candidate.profession || candidate.job_title || 'Not specified'}</p>
            <div className="can-intro-meta">
              {candidate.location && <span className="can-intro-location"><i className="feather-map-pin" /> {candidate.location}</span>}
              {candidate.hourly_rate && <span className="can-intro-rate"><i className="feather-dollar-sign" /> {candidate.hourly_rate}/{candidate.rate_type || 'hour'}</span>}
              {candidate.status && <span className="can-intro-status"><i className="feather-briefcase" /> {candidate.status}</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionCandidateShortIntro;
