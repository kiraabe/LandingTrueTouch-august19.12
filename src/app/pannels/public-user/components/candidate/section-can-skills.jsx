import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

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

  if (!candidate || !candidate.skills || candidate.skills.length === 0) return null;

  return (
    <div className="can-skills-section">
      <h2 className="can-section-title">Skills</h2>
      <div className="can-skills-list">
        {candidate.skills.map((skill, index) => (
          <span key={index} className="can-skill-tag">{skill}</span>
        ))}
      </div>
    </div>
  );
};

export default SectionCandidateSkills;
