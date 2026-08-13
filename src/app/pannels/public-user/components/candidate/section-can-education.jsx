import { useParams } from "react-router-dom";
import useLanguage from "../../../../../globals/use-language";

const SectionCandidateEducation = ({ candidate }) => {
  const language = useLanguage();
  if (!candidate || !candidate.education) return null;
  const title = language === "ar" ? "التعليم" : language === "am" ? "ትምህርት" : "Education";

  return (
    <div className="can-education-section">
      <h2 className="can-section-title">{title}</h2>
      <div className="can-education-item">
        <h4 className="can-education-title">{candidate.education}</h4>
      </div>
    </div>
  );
};

export default SectionCandidateEducation;
