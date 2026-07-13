import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

const SectionCandidateExperience = () => {
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
