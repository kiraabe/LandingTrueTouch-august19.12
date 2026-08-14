import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import Spinner from "../../../../common/spinner";
import { showErrorToast } from "../../../../../globals/error-handler";
import { getCandidateProfilePictureUrl } from "../../../../../globals/file-url";
import { candidateEmptyStateCopy, candidateGridCopy } from "../../../../../globals/constants";
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

  return `whatsapp://send?phone=${COMPANY_WHATSAPP_NUMBER}&text=${encodeURIComponent(message)}`;
};

function CandidateGridPage() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentLanguage, setCurrentLanguage] = useState(() => document.documentElement.lang || "en");
  const copy = candidateGridCopy[currentLanguage] || candidateGridCopy.en;
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({ jobCategory: "", location: "", preferredWorkCountry: "", skillLevel: "", ageMin: 0, ageMax: 100, status: "" });
  const [filterOptions, setFilterOptions] = useState({ professions: [], locations: [], preferredWorkCountries: [], skillLevels: [], statuses: [] });

  useEffect(() => {
    const handleLanguageChange = (event) => setCurrentLanguage(event.detail.language);
    document.addEventListener("languagechange", handleLanguageChange);
    return () => document.removeEventListener("languagechange", handleLanguageChange);
  }, []);

  useEffect(() => {
    document.title = `${copy.candidateGrid} | TrueTouch`;

    const fetchCandidates = async () => {
      try {
        const response = await fetch("/api/candidates/featured");
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        setCandidates(data.filter((candidate) =>
          candidate.status?.trim().toLowerCase() === "available"
        ));
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
  }, [copy.candidateGrid]);

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
    <section className="candidate-directory section-full p-t120 p-b90 site-bg-white">
      <div className="container">
        <div className="candidate-directory-heading">
          <div>
            <div className="wt-small-separator site-text-primary"><div>{copy.ourTalent}</div></div>
            <h2 className="wt-title">{copy.browseCandidates}</h2>
          </div>
          <label className="candidate-directory-search">
            <span className="sr-only">{copy.searchCandidates}</span>
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
          <div className="candidate-directory-state"><Spinner fullPage delay={0} /></div>
        ) : (
          <div className="row candidate-directory-layout">
            <aside className="col-lg-4">
              <div className="candidate-filter-panel">
                <div className="candidate-filter-heading">
                  <h3>Filter Candidates</h3>
                  {hasActiveFilters && <button type="button" onClick={clearFilters}>Clear all</button>}
                </div>
                <label className="candidate-filter-field">
                  <span>Job category</span>
                  <select value={filters.jobCategory} onChange={(event) => updateFilter("jobCategory", event.target.value)}>
                    <option value="">All categories</option>
                    {Array.from(new Set(filterOptions.professions)).map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </label>
                <label className="candidate-filter-field">
                  <span>Location</span>
                  <select value={filters.location} onChange={(event) => updateFilter("location", event.target.value)}>
                    <option value="">All locations</option>
                    {Array.from(new Set(filterOptions.locations)).map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </label>
                <label className="candidate-filter-field">
                  <span>Preferred work country</span>
                  <select value={filters.preferredWorkCountry} onChange={(event) => updateFilter("preferredWorkCountry", event.target.value)}>
                    <option value="">All preferred countries</option>
                    {Array.from(new Set(filterOptions.preferredWorkCountries)).map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </label>
                <label className="candidate-filter-field">
                  <span>Skill level</span>
                  <select value={filters.skillLevel} onChange={(event) => updateFilter("skillLevel", event.target.value)}>
                    <option value="">All skill levels</option>
                    {Array.from(new Set(filterOptions.skillLevels)).map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </label>
                <div className="candidate-filter-field candidate-age-range-field">
                  <span>Age range</span>
                  <div className="candidate-age-range-values" aria-live="polite">
                    <span>{filters.ageMin === 0 ? "Any" : filters.ageMin}</span>
                    <span>{filters.ageMax === 100 ? "Any" : filters.ageMax}</span>
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
                  <span>Status</span>
                  <select value={filters.status} onChange={(event) => updateFilter("status", event.target.value)}>
                    <option value="">All statuses</option>
                    {Array.from(new Set(filterOptions.statuses)).map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </label>
              </div>
            </aside>
            <div className="col-lg-8">
              <p className="candidate-directory-count">
                {copy.showingCandidates(visibleCandidates.length, firstVisibleCandidate, lastVisibleCandidate)}
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
                            loading="lazy"
                            decoding="async"
                          />
                          <span className="candidate-directory-status">{candidate.status || "Available"}</span>
                        </div>
                        <div className="candidate-directory-content">
                          <h3 className="candidate-directory-name"><NavLink to={`/can-detail/${candidate.id}`}>{candidate.full_name}</NavLink></h3>
                          <p className="candidate-directory-profession">{candidate.profession || "Candidate"}</p>
                          <div className="candidate-directory-meta">
                            <span><i className="feather-map-pin" />{candidate.location || "Location not specified"}</span>
                            {candidate.hourly_rate && <span>{candidate.hourly_rate}</span>}
                          </div>
                          {candidate.preferred_work_country && (
                            <div className="candidate-directory-preferred-country">
                              <i className="feather-briefcase" />Preferred: {candidate.preferred_work_country}
                            </div>
                          )}
                          <div className="candidate-directory-actions">
                            <NavLink to={`/can-detail/${candidate.id}`} className="candidate-directory-profile-link">View Profile</NavLink>
                            <a
                              href={buildWhatsAppLink(candidate)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="candidate-directory-whatsapp-link"
                            >
                              <i className="fab fa-whatsapp" /> WhatsApp
                            </a>
                          </div>
                        </div>
                      </article>
                    </div>
                  ))}
                  </div>
                  {pageCount > 1 && (
                    <nav className="candidate-directory-pagination" aria-label="Candidate pages">
                      <button
                        type="button"
                        className="candidate-directory-page-button"
                        onClick={() => setCurrentPage((page) => page - 1)}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </button>
                      <div className="candidate-directory-page-numbers">
                        {Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => (
                          <button
                            key={page}
                            type="button"
                            className={`candidate-directory-page-button${currentPage === page ? " is-active" : ""}`}
                            onClick={() => setCurrentPage(page)}
                            aria-label={`Go to page ${page}`}
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
                        Next
                      </button>
                    </nav>
                  )}
                </>
              ) : (
                <div className="candidate-directory-state">
                  <p>{candidates.length ? "No candidates match your filters." : (candidateEmptyStateCopy[currentLanguage] || candidateEmptyStateCopy.en).noCandidatesAvailable}</p>
                  {hasActiveFilters && <button className="site-button" onClick={clearFilters}>Clear Filters</button>}
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
