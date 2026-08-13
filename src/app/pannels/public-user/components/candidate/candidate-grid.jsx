import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import Spinner from "../../../../common/spinner";
import { showErrorToast } from "../../../../../globals/error-handler";
import { getCandidateProfilePictureUrl } from "../../../../../globals/file-url";
import "./candidate-grid.css";

const cleanFilterValue = (value) => typeof value === "string"
  ? value.replace(/\\+/g, "").replace(/[{}\"]/g, "").trim()
  : value;

const CANDIDATES_PER_PAGE = 6;
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

function CandidateGridPage() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({ jobCategory: "", location: "", preferredWorkCountry: "", skillLevel: "", ageMin: 0, ageMax: 100, status: "" });
  const [filterOptions, setFilterOptions] = useState({ professions: [], locations: [], preferredWorkCountries: [], skillLevels: [], statuses: [] });
  const [language, setLanguage] = useState(() => document.documentElement.lang || "en");
  const isArabic = language === "ar";
  const copy = language === "am" ? {
    ourCandidates: "ዕጩዎቻችን",
    preScreenedTitle: "ለቅጥር ዝግጁ የሆኑ አስቀድመው የተገመገሙ ባለሙያዎች",
    allCandidates: "ሁሉም ዕጩዎች",
    byJobCategory: "በሥራ ዘርፍ",
    byCountry: "በሀገር",
    byAvailability: "በዝግጁነት",
    allJobCategories: "ሁሉም የሥራ ዘርፎች",
    allPreferredCountries: "ሁሉም ተመራጭ ሀገራት",
    allStatuses: "ሁሉም ሁኔታዎች",
    viewProfile: "ግለ-ታሪክን ይመልከቱ",
    whatsApp: "WhatsApp",
    searchCandidates: "Search candidates", clearAll: "Clear all", jobCategory: "Job category", location: "Location", allLocations: "All locations", preferredWorkCountry: "Preferred work country", skillLevel: "Skill level", allSkillLevels: "All skill levels", ageRange: "Age range", any: "Any", status: "Status", showing: "Showing", candidate: "candidate", candidates: "candidates", noMatch: "No candidates match your filters.", noCandidates: "No candidates are available right now.", clearFilters: "Clear Filters", available: "Available", candidateLabel: "Candidate", locationNotSpecified: "Location not specified", preferred: "Preferred", previous: "Previous", next: "Next", candidatePages: "Candidate pages", goToPage: "Go to page"
  } : isArabic ? {
    ourCandidates: "مرشحونا",
    preScreenedTitle: "خبراء تم تقييمهم مسبقاً ومتاحون للتوظيف",
    allCandidates: "جميع المرشحين",
    byJobCategory: "حسب الفئة الوظيفية",
    byCountry: "حسب الدولة",
    byAvailability: "حسب التوفر",
    allJobCategories: "جميع الفئات الوظيفية",
    allPreferredCountries: "جميع الدول المفضلة",
    allStatuses: "جميع الحالات",
    viewProfile: "عرض الملف الشخصي",
    whatsApp: "واتساب",
    searchCandidates: "ابحث عن المرشحين", clearAll: "مسح الكل", jobCategory: "الفئة الوظيفية", location: "الموقع", allLocations: "جميع المواقع", preferredWorkCountry: "دولة العمل المفضلة", skillLevel: "مستوى المهارة", allSkillLevels: "جميع مستويات المهارة", ageRange: "الفئة العمرية", any: "أي", status: "الحالة", showing: "عرض", candidate: "مرشح", candidates: "مرشحين", noMatch: "لا يوجد مرشحون يطابقون عوامل التصفية.", noCandidates: "لا يوجد مرشحون متاحون حالياً.", clearFilters: "مسح عوامل التصفية", available: "متاح", candidateLabel: "مرشح", locationNotSpecified: "لم يتم تحديد الموقع", preferred: "المفضل", previous: "السابق", next: "التالي", candidatePages: "صفحات المرشحين", goToPage: "الانتقال إلى الصفحة"
  } : {
    ourCandidates: "Our Talent",
    preScreenedTitle: "Browse Candidates",
    allCandidates: "All Candidates",
    byJobCategory: "By Job Category",
    byCountry: "By Country",
    byAvailability: "By Availability",
    allJobCategories: "All categories",
    allPreferredCountries: "All preferred countries",
    allStatuses: "All statuses",
    viewProfile: "View Profile",
    whatsApp: "WhatsApp",
    searchCandidates: "Search candidates", clearAll: "Clear all", jobCategory: "Job category", location: "Location", allLocations: "All locations", preferredWorkCountry: "Preferred work country", skillLevel: "Skill level", allSkillLevels: "All skill levels", ageRange: "Age range", any: "Any", status: "Status", showing: "Showing", candidate: "candidate", candidates: "candidates", noMatch: "No candidates match your filters.", noCandidates: "No candidates are available right now.", clearFilters: "Clear Filters", available: "Available", candidateLabel: "Candidate", locationNotSpecified: "Location not specified", preferred: "Preferred", previous: "Previous", next: "Next", candidatePages: "Candidate pages", goToPage: "Go to page"
  };

  useEffect(() => {
    const handleLanguageChange = (event) => setLanguage(event.detail.language);
    document.addEventListener("languagechange", handleLanguageChange);
    return () => document.removeEventListener("languagechange", handleLanguageChange);
  }, []);

  useEffect(() => {
    document.title = "Candidates | TrueTouch";

    const fetchCandidates = async () => {
      try {
        const response = await fetch("/api/candidates/featured");
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        setCandidates(await response.json());
      } catch (error) {
        showErrorToast(error, "Failed to load candidates.");
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();

    fetch("/api/candidates/filter-options")
      .then((response) => response.ok ? response.json() : Promise.reject(new Error(`HTTP ${response.status}`)))
      .then((options) => setFilterOptions({
        professions: options.professions?.map(cleanFilterValue).filter(Boolean) || [],
        locations: options.locations?.map(cleanFilterValue).filter(Boolean) || [],
        preferredWorkCountries: options.preferredWorkCountries?.map(cleanFilterValue).filter(Boolean) || [],
        skillLevels: options.skillLevels?.map(cleanFilterValue).filter(Boolean) || [],
        statuses: options.statuses?.map(cleanFilterValue).filter(Boolean) || []
      }))
      .catch((error) => showErrorToast(error, "Failed to load candidate filters."));
  }, []);

  const visibleCandidates = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return candidates.filter((candidate) => {
      const searchableValues = Object.values(candidate).flatMap((value) => Array.isArray(value) ? value : [value]);
      const matchesSearch = !query || searchableValues.some((value) =>
        value !== null && value !== undefined && cleanFilterValue(String(value)).toLowerCase().includes(query)
      );
      const matchesCategory = !filters.jobCategory || candidate.profession?.trim().toLowerCase() === filters.jobCategory.trim().toLowerCase();
      const matchesLocation = !filters.location || candidate.location?.trim().toLowerCase() === filters.location.trim().toLowerCase();
      const matchesPreferredWorkCountry = !filters.preferredWorkCountry || candidate.preferred_work_country?.trim().toLowerCase() === filters.preferredWorkCountry.trim().toLowerCase();
      const candidateSkills = (Array.isArray(candidate.skill_level) ? candidate.skill_level : candidate.skill_level?.split(",") || [])
        .map((skill) => cleanFilterValue(skill).toLowerCase());
      const matchesSkill = !filters.skillLevel || candidateSkills?.includes(filters.skillLevel.trim().toLowerCase());
      const birthday = candidate.date_of_birth && new Date(candidate.date_of_birth);
      const today = new Date();
      const candidateAge = birthday && !Number.isNaN(birthday.getTime())
        ? today.getFullYear() - birthday.getFullYear() - (today < new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate()) ? 1 : 0)
        : null;
      const matchesAge = (filters.ageMin === 0 && filters.ageMax === 100)
        || (candidateAge !== null && candidateAge >= filters.ageMin && candidateAge <= filters.ageMax);
      const matchesStatus = !filters.status || candidate.status?.trim().toLowerCase() === filters.status.trim().toLowerCase();
      return matchesSearch && matchesCategory && matchesLocation && matchesPreferredWorkCountry && matchesSkill && matchesAge && matchesStatus;
    });
  }, [candidates, filters, searchQuery]);

  const pageCount = Math.ceil(visibleCandidates.length / CANDIDATES_PER_PAGE);
  const paginatedCandidates = visibleCandidates.slice(
    (currentPage - 1) * CANDIDATES_PER_PAGE,
    currentPage * CANDIDATES_PER_PAGE
  );
  const firstVisibleCandidate = visibleCandidates.length ? (currentPage - 1) * CANDIDATES_PER_PAGE + 1 : 0;
  const lastVisibleCandidate = Math.min(currentPage * CANDIDATES_PER_PAGE, visibleCandidates.length);
  const hasActiveFilters = Object.entries(filters).some(([name, value]) =>
    name === "ageMin" ? value !== 0 : name === "ageMax" ? value !== 100 : Boolean(value)
  ) || searchQuery;

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, searchQuery]);

  const updateFilter = (name, value) => {
    setFilters((currentFilters) => ({ ...currentFilters, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({ jobCategory: "", location: "", preferredWorkCountry: "", skillLevel: "", ageMin: 0, ageMax: 100, status: "" });
    setSearchQuery("");
  };

  return (
    <section className="candidate-directory section-full p-t120 p-b90 site-bg-white" dir={isArabic ? "rtl" : "ltr"}>
      <div className="container">
        <div className="candidate-directory-heading">
          <div>
            <div className="wt-small-separator site-text-primary"><div>{copy.ourCandidates}</div></div>
            <h2 className="wt-title">{copy.preScreenedTitle}</h2>
          </div>
          <label className="candidate-directory-search">
            <span className="sr-only">{copy.allCandidates}</span>
            <i className="feather-search" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={copy.searchCandidates}
            />
          </label>
        </div>

        {loading ? (
          <div className="candidate-directory-state"><Spinner fullPage /></div>
        ) : (
          <div className="row candidate-directory-layout">
            <aside className="col-lg-4">
              <div className="candidate-filter-panel">
                <div className="candidate-filter-heading">
                  <h3>{copy.allCandidates}</h3>
                  {hasActiveFilters && <button type="button" onClick={clearFilters}>{copy.clearAll}</button>}
                </div>
                <label className="candidate-filter-field">
                  <span>{copy.jobCategory}</span>
                  <select value={filters.jobCategory} onChange={(event) => updateFilter("jobCategory", event.target.value)}>
                    <option value="">{copy.allJobCategories}</option>
                    {Array.from(new Set(filterOptions.professions)).map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </label>
                <label className="candidate-filter-field">
                  <span>{copy.location}</span>
                  <select value={filters.location} onChange={(event) => updateFilter("location", event.target.value)}>
                    <option value="">{copy.allLocations}</option>
                    {Array.from(new Set(filterOptions.locations)).map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </label>
                <label className="candidate-filter-field">
                  <span>{copy.preferredWorkCountry}</span>
                  <select value={filters.preferredWorkCountry} onChange={(event) => updateFilter("preferredWorkCountry", event.target.value)}>
                    <option value="">{copy.allPreferredCountries}</option>
                    {Array.from(new Set(filterOptions.preferredWorkCountries)).map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </label>
                <label className="candidate-filter-field">
                  <span>{copy.skillLevel}</span>
                  <select value={filters.skillLevel} onChange={(event) => updateFilter("skillLevel", event.target.value)}>
                    <option value="">{copy.allSkillLevels}</option>
                    {Array.from(new Set(filterOptions.skillLevels)).map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </label>
                <div className="candidate-filter-field candidate-age-range-field">
                  <span>{copy.ageRange}</span>
                  <div className="candidate-age-range-values" aria-live="polite">
                    <span>{filters.ageMin === 0 ? copy.any : filters.ageMin}</span>
                    <span>{filters.ageMax === 100 ? copy.any : filters.ageMax}</span>
                  </div>
                  <div className="candidate-age-range-sliders">
                    <svg className="candidate-age-range-track" viewBox="0 0 100 20" preserveAspectRatio="none" aria-hidden="true">
                      <line className="candidate-age-range-track-base" x1="0" y1="10" x2="100" y2="10" />
                      <line
                        className="candidate-age-range-track-selected"
                        x1={filters.ageMin}
                        y1="10"
                        x2={filters.ageMax}
                        y2="10"
                      />
                    </svg>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={filters.ageMin}
                      onChange={(event) => updateFilter("ageMin", Math.min(Number(event.target.value), filters.ageMax))}
                      aria-label="Minimum age"
                    />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={filters.ageMax}
                      onChange={(event) => updateFilter("ageMax", Math.max(Number(event.target.value), filters.ageMin))}
                      aria-label="Maximum age"
                    />
                  </div>
                </div>
                <label className="candidate-filter-field">
                  <span>{copy.status}</span>
                  <select value={filters.status} onChange={(event) => updateFilter("status", event.target.value)}>
                    <option value="">{copy.allStatuses}</option>
                    {Array.from(new Set(filterOptions.statuses)).map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </label>
              </div>
            </aside>
            <div className="col-lg-8">
              <p className="candidate-directory-count">
                {visibleCandidates.length
                  ? `${copy.showing} ${firstVisibleCandidate}-${lastVisibleCandidate} of ${visibleCandidates.length} ${visibleCandidates.length === 1 ? copy.candidate : copy.candidates}`
                  : `${copy.showing} 0 ${copy.candidates}`}
              </p>
              {visibleCandidates.length > 0 ? (
                <>
                  <div className="row">
                  {paginatedCandidates.map((candidate) => (
                    <div key={candidate.id} className="col-md-6">
                      <article className="candidate-directory-card">
                        <div className="candidate-directory-photo-wrap">
                          <img
                            className="candidate-directory-photo"
                            src={candidate.profile_picture ? getCandidateProfilePictureUrl(candidate.profile_picture) : "https://cdn.builder.io/api/v1/image/assets%2F5e5700cc98ef413c911c8b7a4a98ea76%2Fb069e95136284114b1d8cad46258af9e?format=webp&width=800&height=1200"}
                            onError={(event) => {
                              event.currentTarget.onerror = null;
                              event.currentTarget.src = "https://cdn.builder.io/api/v1/image/assets%2F5e5700cc98ef413c911c8b7a4a98ea76%2Fb069e95136284114b1d8cad46258af9e?format=webp&width=800&height=1200";
                            }}
                            alt={candidate.full_name}
                          />
                          <span className="candidate-directory-status">{candidate.status || copy.available}</span>
                        </div>
                        <div className="candidate-directory-content">
                          <h3 className="candidate-directory-name"><NavLink to={`/can-detail/${candidate.id}`}>{candidate.full_name}</NavLink></h3>
                          <p className="candidate-directory-profession">{candidate.profession || copy.candidateLabel}</p>
                          <div className="candidate-directory-meta">
                            <span><i className="feather-map-pin" />{candidate.location || copy.locationNotSpecified}</span>
                            {candidate.hourly_rate && <span>{candidate.hourly_rate}</span>}
                          </div>
                          {candidate.preferred_work_country && (
                            <div className="candidate-directory-preferred-country">
                              <i className="feather-briefcase" />{copy.preferred}: {candidate.preferred_work_country}
                            </div>
                          )}
                          <div className="candidate-directory-actions">
                            <NavLink to={`/can-detail/${candidate.id}`} className="candidate-directory-profile-link">{copy.viewProfile}</NavLink>
                            <a
                              href={buildWhatsAppLink(candidate)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="candidate-directory-whatsapp-link"
                            >
                              <i className="fab fa-whatsapp" /> {copy.whatsApp}
                            </a>
                          </div>
                        </div>
                      </article>
                    </div>
                  ))}
                  </div>
                  {pageCount > 1 && (
                    <nav className="candidate-directory-pagination" aria-label={copy.candidatePages}>
                      <button
                        type="button"
                        className="candidate-directory-page-button"
                        onClick={() => setCurrentPage((page) => page - 1)}
                        disabled={currentPage === 1}
                      >
                        {copy.previous}
                      </button>
                      <div className="candidate-directory-page-numbers">
                        {Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => (
                          <button
                            key={page}
                            type="button"
                            className={`candidate-directory-page-button${currentPage === page ? " is-active" : ""}`}
                            onClick={() => setCurrentPage(page)}
                            aria-label={`${copy.goToPage} ${page}`}
                            aria-current={currentPage === page ? "page" : undefined}
                          >
                            {page}
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        className="candidate-directory-page-button"
                        onClick={() => setCurrentPage((page) => page + 1)}
                        disabled={currentPage === pageCount}
                      >
                        {copy.next}
                      </button>
                    </nav>
                  )}
                </>
              ) : (
                <div className="candidate-directory-state">
                  <p>{candidates.length ? copy.noMatch : copy.noCandidates}</p>
                  {hasActiveFilters && <button className="site-button" onClick={clearFilters}>{copy.clearFilters}</button>}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default CandidateGridPage;
