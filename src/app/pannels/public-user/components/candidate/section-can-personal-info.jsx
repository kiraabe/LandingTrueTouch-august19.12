import { useParams } from "react-router-dom";
import { getCandidateCvUrl } from "../../../../../globals/file-url";
import { downloadFileWithToast } from "../../../../../globals/error-handler";

const SectionCandidatePersonalInfo = ({ candidate }) => {
  if (!candidate) return null;

  const resumeFile = candidate.resume_url || candidate.resume;
  const resumeUrl = getCandidateCvUrl(resumeFile);
  const downloadResume = (event) => {
    event.preventDefault();
    downloadFileWithToast(
      resumeUrl,
      resumeFile,
      "Resume not available for this candidate.",
      "Failed to download resume. Please try again later."
    );
  };

  const infoFields = [
    { label: 'Full Name', value: candidate.full_name },
    { label: 'Email', value: candidate.email, href: candidate.email ? `mailto:${candidate.email}` : null },
    { label: 'Phone', value: candidate.phone, href: candidate.phone ? `tel:${candidate.phone}` : null },
    { label: 'Date of Birth', value: candidate.date_of_birth ? new Date(candidate.date_of_birth).toLocaleDateString() : null },
    { label: 'Gender', value: candidate.gender },
    { label: 'Nationality', value: candidate.nationality },
    { label: 'Religion', value: candidate.religion },
    { label: 'Marital Status', value: candidate.marital_status },
    { label: 'Job Category', value: candidate.job_category },
    { label: 'Country', value: candidate.country },
    { label: 'City', value: candidate.city },
    { label: 'Current Location', value: candidate.current_location },
  ];

  const visibleFields = infoFields.filter(field => field.value);

  if (visibleFields.length === 0) return null;

  return (
    <div className="can-personal-info-section">
      <h2 className="can-section-title">Personal Information</h2>
      <div className="can-personal-info-grid">
        {visibleFields.map((field, index) => (
          <div key={index} className="can-info-block">
            <span className="can-info-label">{field.label}</span>
            <span className="can-info-value">
              {field.href ? (
                <a href={field.href}>{field.value}</a>
              ) : (
                field.value
              )}
            </span>
          </div>
        ))}
        {resumeFile && (
          <div className="can-info-block">
            <span className="can-info-label">Resume</span>
            <span className="can-info-value">
              <a href={resumeUrl || "#"} onClick={downloadResume}>
                <i className="feather-download" /> Download Resume
              </a>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SectionCandidatePersonalInfo;
