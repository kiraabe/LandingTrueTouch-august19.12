import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCandidateCvUrl } from "../../../../../globals/file-url";

const SectionEmployersCandidateSidebar = ({ type = "1" }) => {
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
    <div className="can-sidebar">
      {/* Rate Card */}
      {candidate.hourly_rate && (
        <div className="can-sidebar-card can-rate-card">
          <h3 className="can-card-title">Hourly Rate</h3>
          <div className="can-rate-display">
            <span className="can-rate-amount">${candidate.hourly_rate}</span>
            <span className="can-rate-period">/{candidate.rate_type || 'hour'}</span>
          </div>
        </div>
      )}

      {/* Contact Card */}
      <div className="can-sidebar-card can-contact-card">
        <h3 className="can-card-title">Get In Touch</h3>
        <button className="can-contact-btn can-hire-btn">
          <i className="feather-mail" /> Send Message
        </button>
        {candidate.phone && (
          <a
            href={`https://wa.me/${candidate.phone.replace(/[^0-9]/g, '')}?text=Hi ${candidate.full_name}, I'm interested in your services`}
            target="_blank"
            rel="noopener noreferrer"
            className="can-contact-btn can-whatsapp-btn"
          >
            <i className="feather-message-circle" /> WhatsApp
          </a>
        )}
      </div>

      {/* CV Download */}
      {candidate.cv && (
        <div className="can-sidebar-card can-cv-card">
          <h3 className="can-card-title">Resume</h3>
          <a
            href={getCandidateCvUrl(candidate.cv)}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="can-cv-link"
          >
            <i className="feather-download" /> Download CV
          </a>
        </div>
      )}

      {/* Key Info Card */}
      <div className="can-sidebar-card can-info-card">
        <h3 className="can-card-title">Quick Info</h3>
        {candidate.location && (
          <div className="can-info-item">
            <span className="can-info-label"><i className="feather-map-pin" /> Location</span>
            <span className="can-info-value">{candidate.location}</span>
          </div>
        )}
        {candidate.profession && (
          <div className="can-info-item">
            <span className="can-info-label"><i className="feather-briefcase" /> Profession</span>
            <span className="can-info-value">{candidate.profession}</span>
          </div>
        )}
        {candidate.status && (
          <div className="can-info-item">
            <span className="can-info-label"><i className="feather-check-circle" /> Status</span>
            <span className="can-info-value can-status-badge">{candidate.status}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SectionEmployersCandidateSidebar;
