import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

const SectionCandidateEducation = () => {
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
