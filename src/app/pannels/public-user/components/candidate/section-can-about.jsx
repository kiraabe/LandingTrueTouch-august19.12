import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

const SectionCandidateAbout = () => {
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

  return (
    <div className="can-about-section">
      <h2 className="can-section-title">About Me</h2>
      <p className="can-about-text">{candidate.about}</p>
    </div>
  );
};

export default SectionCandidateAbout;
