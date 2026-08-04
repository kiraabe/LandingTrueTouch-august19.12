import { useEffect, useState } from "react";
import "./cookie-consent.css";

const COOKIE_CONSENT_KEY = "true-touch-cookie-consent";

const cookieCopy = {
  en: {
    eyebrow: "Privacy preferences",
    title: "We use cookies",
    message: "We use cookies to improve your browsing experience, analyze website traffic, and improve our services. By continuing to use our website, you agree to our use of cookies.",
    accept: "Accept All Cookies",
    reject: "Reject",
    settings: "Cookie Settings",
    close: "Close cookie settings",
    settingsDescription: "Choose which cookies you allow. Necessary cookies help the website function and cannot be disabled.",
    necessary: "Necessary cookies",
    necessaryDescription: "Required for core site features and security.",
    alwaysOn: "Always on",
    analytics: "Analytics cookies",
    analyticsDescription: "Help us understand how visitors use the website.",
    save: "Save Preferences"
  },
  ar: {
    eyebrow: "تفضيلات الخصوصية",
    title: "نحن نستخدم ملفات تعريف الارتباط",
    message: "نستخدم ملفات تعريف الارتباط لتحسين تجربة التصفح وتحليل حركة المرور على الموقع وتحسين خدماتنا. بمتابعة استخدام موقعنا، فإنك توافق على استخدام ملفات تعريف الارتباط.",
    accept: "قبول جميع ملفات تعريف الارتباط",
    reject: "رفض",
    settings: "إعدادات ملفات تعريف الارتباط",
    close: "إغلاق إعدادات ملفات تعريف الارتباط",
    settingsDescription: "اختر ملفات تعريف الارتباط التي تسمح بها. تساعد ملفات تعريف الارتباط الضرورية الموقع على العمل ولا يمكن تعطيلها.",
    necessary: "ملفات تعريف الارتباط الضرورية",
    necessaryDescription: "مطلوبة للميزات الأساسية وأمان الموقع.",
    alwaysOn: "مفعلة دائماً",
    analytics: "ملفات تعريف الارتباط التحليلية",
    analyticsDescription: "تساعدنا على فهم كيفية استخدام الزوار للموقع.",
    save: "حفظ التفضيلات"
  },
  am: {
    eyebrow: "የግላዊነት ምርጫዎች",
    title: "ኩኪዎችን እንጠቀማለን",
    message: "የአሰሳ ተሞክሮዎን ለማሻሻል፣ የድረ-ገጹን ትራፊክ ለመተንተን እና አገልግሎቶቻችንን ለማሻሻል ኩኪዎችን እንጠቀማለን። ድረ-ገጻችንን መጠቀምዎን በመቀጠል ኩኪዎችን መጠቀማችንን ይስማማሉ።",
    accept: "ሁሉንም ኩኪዎች ተቀበል",
    reject: "አትቀበል",
    settings: "የኩኪ ቅንብሮች",
    close: "የኩኪ ቅንብሮችን ዝጋ",
    settingsDescription: "የትኞቹን ኩኪዎች እንደሚፈቅዱ ይምረጡ። አስፈላጊ ኩኪዎች ድረ-ገጹ እንዲሰራ ያግዛሉ እና ሊጠፉ አይችሉም።",
    necessary: "አስፈላጊ ኩኪዎች",
    necessaryDescription: "ለዋና የድረ-ገጽ ባህሪያት እና ደህንነት ያስፈልጋሉ።",
    alwaysOn: "ሁልጊዜ ንቁ",
    analytics: "የትንተና ኩኪዎች",
    analyticsDescription: "ጎብኚዎች ድረ-ገጹን እንዴት እንደሚጠቀሙ እንድንረዳ ያግዙናል።",
    save: "ምርጫዎችን አስቀምጥ"
  }
};

function CookieConsent() {
  const [consent, setConsent] = useState(undefined);
  const [showSettings, setShowSettings] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [language, setLanguage] = useState(() => document.documentElement.lang || "en");

  useEffect(() => {
    const savedConsent = window.localStorage.getItem(COOKIE_CONSENT_KEY);
    if (savedConsent) setConsent(savedConsent);

    const handleLanguageChange = (event) => setLanguage(event.detail.language);
    document.addEventListener("languagechange", handleLanguageChange);
    return () => document.removeEventListener("languagechange", handleLanguageChange);
  }, []);

  const saveConsent = (value) => {
    window.localStorage.setItem(COOKIE_CONSENT_KEY, value);
    setConsent(value);
    setShowSettings(false);
  };

  if (consent) return null;

  const copy = cookieCopy[language] || cookieCopy.en;
  const isArabic = language === "ar";

  return (
    <>
      <section className="cookie-consent-banner" aria-label={copy.title} aria-live="polite" dir={isArabic ? "rtl" : "ltr"}>
        <div className="cookie-consent-content">
          <div className="cookie-consent-copy">
            <p className="cookie-consent-eyebrow">{copy.eyebrow}</p>
            <h2 className="cookie-consent-title">{copy.title}</h2>
            <p className="cookie-consent-message">{copy.message}</p>
          </div>
          <div className="cookie-consent-actions">
            <button type="button" className="cookie-consent-button cookie-consent-button-primary" onClick={() => saveConsent("accepted")}>
              {copy.accept}
            </button>
            <button type="button" className="cookie-consent-button cookie-consent-button-secondary" onClick={() => saveConsent("rejected")}>
              {copy.reject}
            </button>
            <button type="button" className="cookie-consent-settings-link" onClick={() => setShowSettings(true)}>
              {copy.settings}
            </button>
          </div>
        </div>
      </section>

      {showSettings && (
        <div className="cookie-settings-backdrop" role="presentation">
          <section className="cookie-settings-dialog" role="dialog" aria-modal="true" aria-labelledby="cookie-settings-title" dir={isArabic ? "rtl" : "ltr"}>
            <div className="cookie-settings-header">
              <div>
                <p className="cookie-consent-eyebrow">{copy.eyebrow}</p>
                <h2 id="cookie-settings-title">{copy.settings}</h2>
              </div>
              <button type="button" className="cookie-settings-close" aria-label={copy.close} onClick={() => setShowSettings(false)}>
                ×
              </button>
            </div>
            <p className="cookie-settings-description">{copy.settingsDescription}</p>
            <div className="cookie-settings-option">
              <div>
                <h3>{copy.necessary}</h3>
                <p>{copy.necessaryDescription}</p>
              </div>
              <span className="cookie-settings-status">{copy.alwaysOn}</span>
            </div>
            <label className="cookie-settings-option cookie-settings-toggle-row">
              <div>
                <h3>{copy.analytics}</h3>
                <p>{copy.analyticsDescription}</p>
              </div>
              <input type="checkbox" checked={analyticsEnabled} onChange={(event) => setAnalyticsEnabled(event.target.checked)} />
            </label>
            <button type="button" className="cookie-consent-button cookie-consent-button-primary cookie-settings-save" onClick={() => saveConsent(analyticsEnabled ? "custom-analytics" : "custom-necessary")}>
              {copy.save}
            </button>
          </section>
        </div>
      )}
    </>
  );
}

export default CookieConsent;
