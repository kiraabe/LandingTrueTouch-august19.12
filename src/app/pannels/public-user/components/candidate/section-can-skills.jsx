import { useParams } from "react-router-dom";

const parseSkillsForDisplay = (skillLevel) => {
  if (!skillLevel) return [];
  try {
    let cleaned = skillLevel.replace(/\\+/g, "");
    cleaned = cleaned.replace(/[{}"]/g, "");
    const parts = cleaned.split(",").map(p => p.trim()).filter(s => s.length > 0);
    const seen = new Set();
    const unique = parts.filter(p => {
      const key = p.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    return unique;
  } catch (e) {
    return [];
  }
};

const parseLanguageSkills = (skills) => {
  if (!skills) return [];
  if (Array.isArray(skills)) {
    return skills
      .map(skill => typeof skill === 'string' ? skill.replace(/^[\{\"]|[\}\"]$/g, '').trim() : skill)
      .filter(skill => skill && skill.length > 0);
  }
  if (typeof skills === 'string') {
    return parseSkillsForDisplay(skills);
  }
  return [];
};

import useLanguage from "../../../../../globals/use-language";

const SectionCandidateSkills = ({ candidate }) => {
  const language = useLanguage();
  if (!candidate) return null;
  const copy = language === "ar"
    ? { title: "المهارات واللغات", levels: "مستويات المهارة", languages: "اللغات" }
    : language === "am"
      ? { title: "ክህሎቶች እና ቋንቋዎች", levels: "የክህሎት ደረጃዎች", languages: "ቋንቋዎች" }
      : { title: "Skills & Languages", levels: "Skill Levels", languages: "Languages" };

  const skillLevels = parseSkillsForDisplay(candidate.skill_level);
  const languageSkills = parseLanguageSkills(candidate.language_skills);
  const hasSkills = skillLevels.length > 0 || languageSkills.length > 0;

  if (!hasSkills) return null;

  return (
    <div className="can-skills-section">
      <h2 className="can-section-title">{copy.title}</h2>
      {skillLevels.length > 0 && (
        <div className="can-skills-subsection">
          <h3 className="can-skills-subtitle">{copy.levels}</h3>
          <div className="can-skills-list">
            {skillLevels.map((skill, index) => (
              <span key={index} className="can-skill-tag">{skill}</span>
            ))}
          </div>
        </div>
      )}
      {languageSkills.length > 0 && (
        <div className="can-skills-subsection">
          <h3 className="can-skills-subtitle">{copy.languages}</h3>
          <div className="can-skills-list">
            {languageSkills.map((skill, index) => (
              <span key={index} className="can-language-tag">{skill}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SectionCandidateSkills;
