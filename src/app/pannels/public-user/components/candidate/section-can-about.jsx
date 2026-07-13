import { useParams } from "react-router-dom";
const SectionCandidateAbout = ({ candidate }) => {
  if (!candidate) return null;

  return (
    <div className="can-about-section">
      <h2 className="can-section-title">About Me</h2>
      <p className="can-about-text">{candidate.about}</p>
    </div>
  );
};

export default SectionCandidateAbout;
