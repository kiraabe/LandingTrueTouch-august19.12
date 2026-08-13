import { useParams } from "react-router-dom";
import { getCandidateCvUrl } from "../../../../../globals/file-url";
import { downloadFileWithToast } from "../../../../../globals/error-handler";
import useLanguage from "../../../../../globals/use-language";

const COMPANY_WHATSAPP_NUMBER = "251935106635";

const buildWhatsAppLink = (candidate) => {
  const message =
    `Hello, I'm interested in this candidate:\n` +
    `Name: ${candidate.full_name || candidate.name || "N/A"}\n` +
    `Role: ${candidate.profession || candidate.job_category || candidate.job_title || "N/A"}\n` +
    `Location: ${candidate.location || candidate.current_location || candidate.city || "N/A"}\n` +
    `Status: ${candidate.status || "N/A"}\n\n` +
    `Could you share more details or help me proceed?`;

  return `https://wa.me/${COMPANY_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
};

const SectionEmployersCandidateSidebar = ({ candidate, type = "1" }) => {
  const language = useLanguage();
  if (!candidate) return null;
  const copy = language === "ar"
    ? { hourlyRate: "الأجر بالساعة", getInTouch: "تواصل معنا", sendMessage: "إرسال رسالة", whatsapp: "واتساب", resume: "السيرة الذاتية", downloadResume: "تنزيل السيرة الذاتية", downloadCv: "تنزيل السيرة الذاتية", quickInfo: "معلومات سريعة", location: "الموقع", profession: "المهنة", status: "الحالة", unavailable: "السيرة الذاتية غير متاحة لهذا المرشح.", failedDownload: "تعذر تنزيل السيرة الذاتية. يرجى المحاولة مرة أخرى لاحقاً." }
    : language === "am"
      ? { hourlyRate: "የሰዓት ክፍያ", getInTouch: "ያግኙን", sendMessage: "መልዕክት ላክ", whatsapp: "WhatsApp", resume: "የሥራ ማመልከቻ", downloadResume: "የሥራ ማመልከቻ አውርድ", downloadCv: "CV አውርድ", quickInfo: "ፈጣን መረጃ", location: "አካባቢ", profession: "ሙያ", status: "ሁኔታ", unavailable: "የዚህ እጩ የሥራ ማመልከቻ አይገኝም።", failedDownload: "ማውረድ አልተቻለም። እባክዎ ቆይተው ይሞክሩ።" }
      : { hourlyRate: "Hourly Rate", getInTouch: "Get In Touch", sendMessage: "Send Message", whatsapp: "WhatsApp", resume: "Resume", downloadResume: "Download Resume", downloadCv: "Download CV", quickInfo: "Quick Info", location: "Location", profession: "Profession", status: "Status", unavailable: "Resume not available for this candidate.", failedDownload: "Failed to download resume. Please try again later." };

  const resumeFile = candidate.cv || candidate.resume_url || candidate.resume;
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

  return (
    <div className="can-sidebar">
      {/* Rate Card */}
      {candidate.hourly_rate && (
        <div className="can-sidebar-card can-rate-card">
          <h3 className="can-card-title">{copy.hourlyRate}</h3>
          <div className="can-rate-display">
            <span className="can-rate-amount">${candidate.hourly_rate}</span>
            <span className="can-rate-period">/{candidate.rate_type || 'hour'}</span>
          </div>
        </div>
      )}

      {/* Contact Card */}
      <div className="can-sidebar-card can-contact-card">
        <h3 className="can-card-title">{copy.getInTouch}</h3>
        <button className="can-contact-btn can-hire-btn">
          <i className="feather-mail" /> {copy.sendMessage}
        </button>
        <a
          href={buildWhatsAppLink(candidate)}
          target="_blank"
          rel="noopener noreferrer"
          className="can-contact-btn can-whatsapp-btn"
        >
          <i className="feather-message-circle" /> {copy.whatsapp}
        </a>
      </div>

      {/* Resume/CV Download */}
      {resumeFile && (
        <div className="can-sidebar-card can-cv-card">
          <h3 className="can-card-title">{copy.resume}</h3>
          {resumeFile && (
            <a
              href={resumeUrl || "#"}
              onClick={downloadResume}
              className="can-cv-link"
            >
              <i className="feather-download" /> {candidate.cv ? copy.downloadCv : copy.downloadResume}
            </a>
          )}
        </div>
      )}

      {/* Key Info Card */}
      <div className="can-sidebar-card can-info-card">
        <h3 className="can-card-title">{copy.quickInfo}</h3>
        {candidate.location && (
          <div className="can-info-item">
            <span className="can-info-label"><i className="feather-map-pin" /> {copy.location}</span>
            <span className="can-info-value">{candidate.location}</span>
          </div>
        )}
        {candidate.profession && (
          <div className="can-info-item">
            <span className="can-info-label"><i className="feather-briefcase" /> {copy.profession}</span>
            <span className="can-info-value">{candidate.profession}</span>
          </div>
        )}
        {candidate.status && (
          <div className="can-info-item">
            <span className="can-info-label"><i className="feather-check-circle" /> {copy.status}</span>
            <span className="can-info-value can-status-badge">{candidate.status}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SectionEmployersCandidateSidebar;
