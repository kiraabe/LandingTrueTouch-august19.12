import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import Spinner from "../../../../common/spinner";
import { publicUrlFor } from "../../../../../globals/constants";
import { showErrorToast } from "../../../../../globals/error-handler";
import { getCandidateProfilePictureUrl } from "../../../../../globals/file-url";
import "./candidate-grid.css";

const cleanFilterValue = (value) => typeof value === "string"
  ? value.replace(/\\+/g, "").replace(/[{}\"]/g, "").trim()
  : value;

function CandidateGridPage() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ jobCategory: "", location: "", skillLevel: "", status: "" });
  const [filterOptions, setFilterOptions] = useState({ professions: [], locations: [], skillLevels: [], statuses: [] });

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
        skillLevels: options.skillLevels?.map(cleanFilterValue).filter(Boolean) || [],
        statuses: options.statuses?.map(cleanFilterValue).filter(Boolean) || []
      }))
      .catch((error) => showErrorToast(error, "Failed to load candidate filters."));
  }, []);

  const visibleCandidates = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return candidates.filter((candidate) => {
      const matchesSearch = !query || [candidate.full_name, candidate.profession, candidate.location]
        .some((value) => value?.toLowerCase().includes(query));
      const matchesCategory = !filters.jobCategory || candidate.profession?.trim().toLowerCase() === filters.jobCategory.trim().toLowerCase();
      const matchesLocation = !filters.location || candidate.location?.trim().toLowerCase() === filters.location.trim().toLowerCase();
      const candidateSkills = candidate.skill_level?.split(",").map((skill) => cleanFilterValue(skill).toLowerCase());
      const matchesSkill = !filters.skillLevel || candidateSkills?.includes(filters.skillLevel.trim().toLowerCase());
      const matchesStatus = !filters.status || candidate.status?.trim().toLowerCase() === filters.status.trim().toLowerCase();
      return matchesSearch && matchesCategory && matchesLocation && matchesSkill && matchesStatus;
    });
  }, [candidates, filters, searchQuery]);

  const hasActiveFilters = Object.values(filters).some(Boolean) || searchQuery;

  const updateFilter = (name, value) => {
    setFilters((currentFilters) => ({ ...currentFilters, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({ jobCategory: "", location: "", skillLevel: "", status: "" });
    setSearchQuery("");
  };

  return (
    <section className="candidate-directory section-full p-t120 p-b90 site-bg-white">
      <div className="container">
        <div className="candidate-directory-heading">
          <div>
            <div className="wt-small-separator site-text-primary"><div>Our Talent</div></div>
            <h2 className="wt-title">Browse Candidates</h2>
          </div>
          <label className="candidate-directory-search">
            <span className="sr-only">Search candidates</span>
            <i className="feather-search" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by name, role or location"
            />
          </label>
        </div>

        {loading ? (
          <div className="candidate-directory-state"><Spinner /></div>
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
                  <span>Skill level</span>
                  <select value={filters.skillLevel} onChange={(event) => updateFilter("skillLevel", event.target.value)}>
                    <option value="">All skill levels</option>
                    {Array.from(new Set(filterOptions.skillLevels)).map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </label>
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
              <p className="candidate-directory-count">Showing {visibleCandidates.length} of {candidates.length} candidate{candidates.length === 1 ? "" : "s"}</p>
              {visibleCandidates.length > 0 ? (
                <div className="row">
                  {visibleCandidates.map((candidate) => (
                    <div key={candidate.id} className="col-md-6">
                      <article className="candidate-directory-card">
                        <div className="candidate-directory-photo-wrap">
                          <img
                            className="candidate-directory-photo"
                            src={candidate.profile_picture ? getCandidateProfilePictureUrl(candidate.profile_picture) : publicUrlFor("images/candidates/pic1.jpg")}
                            alt={candidate.full_name}
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
                          <NavLink to={`/can-detail/${candidate.id}`} className="candidate-directory-profile-link">View Profile</NavLink>
                        </div>
                      </article>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="candidate-directory-state">
                  <p>{candidates.length ? "No candidates match your filters." : "No candidates are available right now."}</p>
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
