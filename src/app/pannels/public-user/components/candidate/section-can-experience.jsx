import { useParams } from "react-router-dom";
const SectionCandidateExperience = ({ candidate }) => {
  if (!candidate || !candidate.experience) return null;

  return (
    <div className="can-experience-section">
      <h2 className="can-section-title">Experience</h2>
      <div className="can-experience-item">
        <h4 className="can-experience-title">{candidate.experience}</h4>
        <p className="can-experience-status">Currently Working</p>
      </div>
    </div>
  );
};

export default SectionCandidateExperience;
