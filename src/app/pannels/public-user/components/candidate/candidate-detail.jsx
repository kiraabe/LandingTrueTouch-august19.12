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
    const fetchCandidateDetail = async () => {
      try {
        setLoading(true);
        
        // Mock candidate data - replace with actual API call
        const mockCandidates = {
          1: {
            id: 1,
            full_name: 'Wanda Smith',
            job_title: 'Chartered Accountant',
            location: 'New York',
            profile_picture: 'images/candidates/pic1.jpg',
            hourly_rate: 20,
            rate_type: 'Day',
            bio: 'Experienced Chartered Accountant with 8+ years in financial planning and analysis. Specialized in tax optimization and corporate accounting.',
            skills: ['Accounting', 'Tax Planning', 'Financial Analysis', 'Bookkeeping', 'Audit'],
            experience: 'Senior Chartered Accountant at Fortune 500 Company',
            education: 'Bachelor of Commerce (Honors), University of New York',
            portfolio: ['Tax Optimization Strategy 2023', 'Financial Planning Guide', 'Audit Report Template'],
            rate: '20/Day',
            about: 'With over 8 years of experience in the accounting industry, I have developed a strong expertise in financial planning, analysis, and tax optimization. I am committed to delivering high-quality financial solutions.'
          },
          2: {
            id: 2,
            full_name: 'Peter Hawkins',
            job_title: 'Medical Professional',
            location: 'New York',
            profile_picture: 'images/candidates/pic2.jpg',
            hourly_rate: 7,
            rate_type: 'Hour',
            bio: 'Licensed Medical Professional with 5+ years of clinical experience.',
            skills: ['Clinical Care', 'Patient Management', 'Medical Diagnosis', 'Treatment Planning'],
            experience: 'Medical Doctor at New York Medical Center',
            education: 'Doctor of Medicine, Harvard Medical School',
            portfolio: ['Patient Care Protocol', 'Medical Research Paper'],
            about: 'Dedicated medical professional committed to providing excellent patient care.'
          },
          3: {
            id: 3,
            full_name: 'Ralph Johnson',
            job_title: 'Bank Manager',
            location: 'New York',
            profile_picture: 'images/candidates/pic3.jpg',
            hourly_rate: 180,
            rate_type: 'Day',
            bio: 'Experienced Bank Manager with 12+ years in banking and financial services.',
            skills: ['Banking', 'Financial Management', 'Leadership', 'Risk Management', 'Compliance'],
            experience: 'Senior Bank Manager at Major Financial Institution',
            education: 'MBA in Finance, Yale University',
            portfolio: ['Bank Operations Manual', 'Financial Strategy Document'],
            about: 'Strategic banking professional with proven track record in managing large teams and operations.'
          }
        };

        const selectedCandidate = mockCandidates[id] || null;

        if (!selectedCandidate) {
          throw new Error('Candidate not found');
        }

        setCandidate(selectedCandidate);
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
