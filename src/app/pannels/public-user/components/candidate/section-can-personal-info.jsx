import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

const SectionCandidatePersonalInfo = () => {
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

  const hasInfo = candidate.phone || candidate.email || candidate.date_of_birth || candidate.gender;

  if (!hasInfo) return null;

  return (
    <div className="can-personal-info-section">
      <h2 className="can-section-title">Personal Information</h2>
      <div className="can-personal-info-grid">
        {candidate.email && (
          <div className="can-info-block">
            <span className="can-info-label">Email</span>
            <span className="can-info-value">
              <a href={`mailto:${candidate.email}`}>{candidate.email}</a>
            </span>
          </div>
        )}
        {candidate.phone && (
          <div className="can-info-block">
            <span className="can-info-label">Phone</span>
            <span className="can-info-value">
              <a href={`tel:${candidate.phone}`}>{candidate.phone}</a>
            </span>
          </div>
        )}
        {candidate.date_of_birth && (
          <div className="can-info-block">
            <span className="can-info-label">Date of Birth</span>
            <span className="can-info-value">{new Date(candidate.date_of_birth).toLocaleDateString()}</span>
          </div>
        )}
        {candidate.gender && (
          <div className="can-info-block">
            <span className="can-info-label">Gender</span>
            <span className="can-info-value">{candidate.gender}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SectionCandidatePersonalInfo;
