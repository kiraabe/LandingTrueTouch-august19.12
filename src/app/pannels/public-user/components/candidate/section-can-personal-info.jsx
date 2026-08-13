import { useParams } from "react-router-dom";
import { getCandidateCvUrl } from "../../../../../globals/file-url";
import { downloadFileWithToast } from "../../../../../globals/error-handler";
import useLanguage from "../../../../../globals/use-language";

const SectionCandidatePersonalInfo = ({ candidate }) => {
  const language = useLanguage();
  if (!candidate) return null;
  const copy = language === "ar"
    ? { title: "المعلومات الشخصية", fullName: "الاسم الكامل", email: "البريد الإلكتروني", phone: "الهاتف", dateOfBirth: "تاريخ الميلاد", gender: "الجنس", nationality: "الجنسية", religion: "الديانة", maritalStatus: "الحالة الاجتماعية", jobCategory: "الفئة الوظيفية", country: "الدولة", city: "المدينة", currentLocation: "الموقع الحالي", resume: "السيرة الذاتية", downloadResume: "تنزيل السيرة الذاتية", unavailable: "السيرة الذاتية غير متاحة لهذا المرشح.", failedDownload: "تعذر تنزيل السيرة الذاتية. يرجى المحاولة مرة أخرى لاحقاً." }
    : language === "am"
      ? { title: "የግል መረጃ", fullName: "ሙሉ ስም", email: "ኢሜይል", phone: "ስልክ", dateOfBirth: "የትውልድ ቀን", gender: "ጾታ", nationality: "ዜግነት", religion: "ሃይማኖት", maritalStatus: "የጋብቻ ሁኔታ", jobCategory: "የሥራ ዘርፍ", country: "ሀገር", city: "ከተማ", currentLocation: "የአሁኑ አካባቢ", resume: "የሥራ ማመልከቻ", downloadResume: "የሥራ ማመልከቻ አውርድ", unavailable: "የዚህ እጩ የሥራ ማመልከቻ አይገኝም።", failedDownload: "የሥራ ማመልከቻውን ማውረድ አልተቻለም። እባክዎ ቆይተው ይሞክሩ።" }
      : { title: "Personal Information", fullName: "Full Name", email: "Email", phone: "Phone", dateOfBirth: "Date of Birth", gender: "Gender", nationality: "Nationality", religion: "Religion", maritalStatus: "Marital Status", jobCategory: "Job Category", country: "Country", city: "City", currentLocation: "Current Location", resume: "Resume", downloadResume: "Download Resume", unavailable: "Resume not available for this candidate.", failedDownload: "Failed to download resume. Please try again later." };

  const resumeFile = candidate.resume_url || candidate.resume;
  const resumeUrl = getCandidateCvUrl(resumeFile);
  const downloadResume = (event) => {
    event.preventDefault();
    downloadFileWithToast(
      resumeUrl,
      resumeFile,
      copy.unavailable,
      copy.failedDownload
    );
  };

  const infoFields = [
    { label: copy.fullName, value: candidate.full_name },
    { label: copy.email, value: candidate.email, href: candidate.email ? `mailto:${candidate.email}` : null },
    { label: copy.phone, value: candidate.phone, href: candidate.phone ? `tel:${candidate.phone}` : null },
    { label: copy.dateOfBirth, value: candidate.date_of_birth ? new Date(candidate.date_of_birth).toLocaleDateString() : null },
    { label: copy.gender, value: candidate.gender },
    { label: copy.nationality, value: candidate.nationality },
    { label: copy.religion, value: candidate.religion },
    { label: copy.maritalStatus, value: candidate.marital_status },
    { label: copy.jobCategory, value: candidate.job_category },
    { label: copy.country, value: candidate.country },
    { label: copy.city, value: candidate.city },
    { label: copy.currentLocation, value: candidate.current_location },
  ];

  const visibleFields = infoFields.filter(field => field.value);

  if (visibleFields.length === 0) return null;

  return (
    <div className="can-personal-info-section">
      <h2 className="can-section-title">{copy.title}</h2>
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
            <span className="can-info-label">{copy.resume}</span>
            <span className="can-info-value">
              <a href={resumeUrl || "#"} onClick={downloadResume}>
                <i className="feather-download" /> {copy.downloadResume}
              </a>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SectionCandidatePersonalInfo;
