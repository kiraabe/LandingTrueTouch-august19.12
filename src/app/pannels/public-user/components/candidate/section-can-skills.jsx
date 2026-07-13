import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

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

const SectionCandidateSkills = () => {
  const { id } = useParams();
  const [candidate, setCandidate] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchCandidate = async () => {
      try {
        const response = await fetch(`/api/candidates/${id}`);
        if (response.ok) {
          const data = await response.json();
          setCandidate(data);
        }
      } catch (err) {
        console.error('Error fetching candidate:', err);
      }
    };

    fetchCandidate();
  }, [id]);

  if (!candidate) return null;

  const skillLevels = parseSkillsForDisplay(candidate.skill_level);
  const languageSkills = parseLanguageSkills(candidate.language_skills);
  const hasSkills = skillLevels.length > 0 || languageSkills.length > 0;

  if (!hasSkills) return null;

  return (
    <div className="can-skills-section">
      <h2 className="can-section-title">Skills & Languages</h2>
      {skillLevels.length > 0 && (
        <div className="can-skills-subsection">
          <h3 className="can-skills-subtitle">Skill Levels</h3>
          <div className="can-skills-list">
            {skillLevels.map((skill, index) => (
              <span key={index} className="can-skill-tag">{skill}</span>
            ))}
          </div>
        </div>
      )}
      {languageSkills.length > 0 && (
        <div className="can-skills-subsection">
          <h3 className="can-skills-subtitle">Languages</h3>
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
