import { useParams } from "react-router-dom";
const SectionCandidateEducation = ({ candidate }) => {
  if (!candidate || !candidate.education) return null;

  return (
    <div className="can-education-section">
      <h2 className="can-section-title">Education</h2>
      <div className="can-education-item">
        <h4 className="can-education-title">{candidate.education}</h4>
      </div>
    </div>
  );
};

export default SectionCandidateEducation;
