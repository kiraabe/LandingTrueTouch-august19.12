import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import Spinner from "../../../../common/spinner";
import { publicUrlFor } from "../../../../../globals/constants";
import { showErrorToast } from "../../../../../globals/error-handler";
import { getCandidateProfilePictureUrl } from "../../../../../globals/file-url";
import "./candidate-grid.css";

function CandidateGridPage() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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
  }, []);

  const visibleCandidates = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return candidates;

    return candidates.filter((candidate) =>
      [candidate.full_name, candidate.profession, candidate.location]
        .some((value) => value?.toLowerCase().includes(query))
    );
  }, [candidates, searchQuery]);

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
        ) : visibleCandidates.length > 0 ? (
          <>
            <p className="candidate-directory-count">Showing {visibleCandidates.length} candidate{visibleCandidates.length === 1 ? "" : "s"}</p>
            <div className="row">
              {visibleCandidates.map((candidate) => (
                <div key={candidate.id} className="col-lg-4 col-md-6">
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
                      <h3 className="candidate-directory-name">
                        <NavLink to={`/can-detail/${candidate.id}`}>{candidate.full_name}</NavLink>
                      </h3>
                      <p className="candidate-directory-profession">{candidate.profession || "Candidate"}</p>
                      <div className="candidate-directory-meta">
                        <span><i className="feather-map-pin" />{candidate.location || "Location not specified"}</span>
                        {candidate.hourly_rate && <span>{candidate.hourly_rate}</span>}
                      </div>
                      <NavLink to={`/can-detail/${candidate.id}`} className="candidate-directory-profile-link">
                        View Profile
                      </NavLink>
                    </div>
                  </article>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="candidate-directory-state">
            <p>{candidates.length ? "No candidates match your search." : "No candidates are available right now."}</p>
            {searchQuery && <button className="site-button" onClick={() => setSearchQuery("")}>Clear Search</button>}
          </div>
        )}
      </div>
    </section>
  );
}

export default CandidateGridPage;
