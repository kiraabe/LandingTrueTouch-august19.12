import { useParams } from "react-router-dom";
import useLanguage from "../../../../../globals/use-language";

const SectionCandidateAbout = ({ candidate }) => {
  const language = useLanguage();
  if (!candidate) return null;
  const title = language === "ar" ? "نبذة عني" : language === "am" ? "ስለ እኔ" : "About Me";

  return (
    <div className="can-about-section">
      <h2 className="can-section-title">{title}</h2>
      <p className="can-about-text">{candidate.about}</p>
    </div>
  );
};

export default SectionCandidateAbout;
