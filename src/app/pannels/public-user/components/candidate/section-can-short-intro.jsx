import { useParams } from "react-router-dom";
import { getCandidateProfilePictureUrl } from "../../../../../globals/file-url";
import { publicUrlFor } from "../../../../../globals/constants";
import JobZImage from "../../../../common/jobz-img";

const SectionCandidateShortIntro = ({ candidate }) => {
  if (!candidate) return null;

  return (
    <div className="can-intro-section">
      <div className="can-intro-header" style={{ backgroundImage: "url('images/candidates/cover-bg.jpg')" }}>
        <div className="can-intro-overlay" />
        <div className="can-intro-content">
          <div className="can-intro-avatar">
            <JobZImage
              src={candidate.profile_picture ? getCandidateProfilePictureUrl(candidate.profile_picture) : publicUrlFor("images/candidates/default.jpg")}
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
