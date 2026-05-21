import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Toaster } from "sonner";
import { showErrorToast } from "../../../../../globals/error-handler";
import JobZImage from "../../../../common/jobz-img";
import './candidate-detail.css';

const CandidateDetail = () => {
  const { id } = useParams();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchCandidateDetail = async () => {
      try {
        setLoading(true);
        const url = `/api/candidates/${id}`;
        console.log('Fetching candidate from:', url);

        const response = await fetch(url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('API Error:', errorData);
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Candidate data received:', data);
        setCandidate(data);
      } catch (err) {
        console.error('Error fetching candidate:', err);
        showErrorToast(err, 'Failed to load candidate profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCandidateDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="candidate-detail-container">
        <Toaster position="top-right" richColors />
        <div className="loading-spinner">Loading candidate profile...</div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="candidate-detail-container">
        <Toaster position="top-right" richColors />
        <div className="error-message">Candidate not found</div>
      </div>
    );
  }

  return (
    <div className="candidate-detail-container">
      <Toaster position="top-right" richColors />
      
      <div className="candidate-header">
        <div className="container">
          <div className="candidate-cover" style={{ backgroundImage: "url('images/candidates/cover-bg.jpg')" }}>
            <div className="candidate-profile-section">
              <div className="candidate-avatar">
                <JobZImage src={candidate.profile_picture} alt={candidate.full_name} />
              </div>
              <div className="candidate-info-header">
                <h1 className="candidate-name">{candidate.full_name}</h1>
                <p className="candidate-title">{candidate.job_title}</p>
                <div className="candidate-meta">
                  <span className="location"><i className="feather-map-pin" /> {candidate.location}</span>
                  <span className="rate"><i className="feather-dollar-sign" /> {candidate.hourly_rate}/{candidate.rate_type}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="candidate-detail-content">
          <div className="row">
            <div className="col-lg-8 col-md-12">
              {/* About Section */}
              <div className="detail-section">
                <h2>About Me</h2>
                <p>{candidate.about}</p>
              </div>

              {/* Skills Section */}
              <div className="detail-section">
                <h2>Skills</h2>
                <div className="skills-list">
                  {candidate.skills && candidate.skills.map((skill, index) => (
                    <span key={index} className="skill-tag">{skill}</span>
                  ))}
                </div>
              </div>

              {/* Experience Section */}
              <div className="detail-section">
                <h2>Experience</h2>
                <div className="experience-item">
                  <h4>{candidate.experience}</h4>
                  <p className="timeline">Currently Working</p>
                </div>
              </div>

              {/* Education Section */}
              <div className="detail-section">
                <h2>Education</h2>
                <div className="education-item">
                  <h4>{candidate.education}</h4>
                </div>
              </div>

              {/* Portfolio Section */}
              {candidate.portfolio && candidate.portfolio.length > 0 && (
                <div className="detail-section">
                  <h2>Portfolio</h2>
                  <div className="portfolio-list">
                    {candidate.portfolio.map((item, index) => (
                      <div key={index} className="portfolio-item">
                        <i className="feather-file-text" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="col-lg-4 col-md-12">
              <div className="detail-sidebar">
                {/* Rate Card */}
                <div className="card rate-card">
                  <h3>Rate</h3>
                  <div className="rate-display">
                    <span className="amount">${candidate.hourly_rate}</span>
                    <span className="period">/{candidate.rate_type}</span>
                  </div>
                </div>

                {/* Contact Card */}
                <div className="card contact-card">
                  <h3>Get In Touch</h3>
                  <button className="contact-btn hire-btn">
                    <i className="feather-mail" /> Send Message
                  </button>
                  <a href={`https://wa.me/?text=Hi ${candidate.full_name}, I'm interested in your services`} target="_blank" rel="noopener noreferrer" className="contact-btn whatsapp-btn">
                    <i className="feather-message-circle" /> WhatsApp
                  </a>
                </div>

                {/* Info Card */}
                <div className="card info-card">
                  <div className="info-item">
                    <span className="label">Location</span>
                    <span className="value">{candidate.location}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Title</span>
                    <span className="value">{candidate.job_title}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetail;
