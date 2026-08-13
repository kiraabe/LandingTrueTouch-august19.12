import { useParams } from "react-router-dom";
import useLanguage from "../../../../../globals/use-language";

const SectionCandidateExperience = ({ candidate }) => {
  const language = useLanguage();
  if (!candidate || !candidate.experience) return null;
  const copy = language === "ar"
    ? { title: "الخبرة", current: "يعمل حالياً" }
    : language === "am"
      ? { title: "የሥራ ልምድ", current: "በአሁኑ ጊዜ እየሰራ ነው" }
      : { title: "Experience", current: "Currently Working" };

  return (
    <div className="can-experience-section">
      <h2 className="can-section-title">{copy.title}</h2>
      <div className="can-experience-item">
        <h4 className="can-experience-title">{candidate.experience}</h4>
        <p className="can-experience-status">{copy.current}</p>
      </div>
    </div>
  );
};

export default SectionCandidateExperience;
