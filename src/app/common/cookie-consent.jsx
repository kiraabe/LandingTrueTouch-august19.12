import { useEffect, useState } from "react";
import "./cookie-consent.css";

const COOKIE_CONSENT_KEY = "true-touch-cookie-consent";

function CookieConsent() {
  const [consent, setConsent] = useState(undefined);
  const [showSettings, setShowSettings] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  useEffect(() => {
    const savedConsent = window.localStorage.getItem(COOKIE_CONSENT_KEY);
    if (savedConsent) {
      setConsent(savedConsent);
    }
  }, []);

  const saveConsent = (value) => {
    window.localStorage.setItem(COOKIE_CONSENT_KEY, value);
    setConsent(value);
    setShowSettings(false);
  };

  if (consent) return null;

  return (
    <>
      <section className="cookie-consent-banner" aria-label="Cookie consent" aria-live="polite">
        <div className="cookie-consent-content">
          <div className="cookie-consent-copy">
            <p className="cookie-consent-eyebrow">Privacy preferences</p>
            <h2 className="cookie-consent-title">We use cookies</h2>
            <p className="cookie-consent-message">
              We use cookies to improve your browsing experience, analyze website traffic, and improve our services. By continuing to use our website, you agree to our use of cookies.
            </p>
          </div>
          <div className="cookie-consent-actions">
            <button type="button" className="cookie-consent-button cookie-consent-button-primary" onClick={() => saveConsent("accepted")}>
              Accept All Cookies
            </button>
            <button type="button" className="cookie-consent-button cookie-consent-button-secondary" onClick={() => saveConsent("rejected")}>
              Reject
            </button>
            <button type="button" className="cookie-consent-settings-link" onClick={() => setShowSettings(true)}>
              Cookie Settings
            </button>
          </div>
        </div>
      </section>

      {showSettings && (
        <div className="cookie-settings-backdrop" role="presentation">
          <section className="cookie-settings-dialog" role="dialog" aria-modal="true" aria-labelledby="cookie-settings-title">
            <div className="cookie-settings-header">
              <div>
                <p className="cookie-consent-eyebrow">Privacy preferences</p>
                <h2 id="cookie-settings-title">Cookie Settings</h2>
              </div>
              <button type="button" className="cookie-settings-close" aria-label="Close cookie settings" onClick={() => setShowSettings(false)}>
                ×
              </button>
            </div>
            <p className="cookie-settings-description">
              Choose which cookies you allow. Necessary cookies help the website function and cannot be disabled.
            </p>
            <div className="cookie-settings-option">
              <div>
                <h3>Necessary cookies</h3>
                <p>Required for core site features and security.</p>
              </div>
              <span className="cookie-settings-status">Always on</span>
            </div>
            <label className="cookie-settings-option cookie-settings-toggle-row">
              <div>
                <h3>Analytics cookies</h3>
                <p>Help us understand how visitors use the website.</p>
              </div>
              <input type="checkbox" checked={analyticsEnabled} onChange={(event) => setAnalyticsEnabled(event.target.checked)} />
            </label>
            <button type="button" className="cookie-consent-button cookie-consent-button-primary cookie-settings-save" onClick={() => saveConsent(analyticsEnabled ? "custom-analytics" : "custom-necessary")}>
              Save Preferences
            </button>
          </section>
        </div>
      )}
    </>
  );
}

export default CookieConsent;
