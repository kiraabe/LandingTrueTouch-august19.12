import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import Spinner from "../../../../common/spinner";
import { showErrorToast } from "../../../../../globals/error-handler";
import { loadScript } from "../../../../../globals/constants";
import SectionCandidateShortIntro from "./section-can-short-intro";
import SectionCandidateAbout from "./section-can-about";
import SectionCandidateSkills from "./section-can-skills";
import SectionCandidatePersonalInfo from "./section-can-personal-info";
import SectionCandidateExperience from "./section-can-experience";
import SectionCandidateEducation from "./section-can-education";
import SectionEmployersCandidateSidebar from "./section-emp-can-sidebar";
import './candidate-detail.css';

const CandidateDetail = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [candidate, setCandidate] = useState(null);

  useEffect(() => {
    loadScript("js/custom.js");
  }, []);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchCandidateDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const url = `/api/candidates/${id}`;

        const response = await fetch(url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
          let errorData = {};
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            errorData = await response.json().catch(() => ({}));
          }
          const errorMsg = errorData.error || `No candidate found with ID: ${id}`;
          throw new Error(`HTTP ${response.status}: ${errorMsg}`);
        }

        const data = await response.json();
        setCandidate(data);
      } catch (err) {
        console.error('Error fetching candidate:', err);
        setError(err.message);
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
        <Spinner fullPage />
      </div>
    );
  }

  if (error) {
    return (
      <div className="candidate-detail-container">
        <Toaster position="top-right" richColors />
        <div className="error-message">Candidate not found</div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" richColors />
      <div className="section-full p-t120 p-b90 bg-white">
        <div className="container">
          <div className="section-content">
            <div className="row d-flex justify-content-center">
              <div className="col-lg-8 col-md-12">
                <div className="candidate-detail-info">
                  <SectionCandidateShortIntro candidate={candidate} />
                  <SectionCandidateAbout candidate={candidate} />
                  <SectionCandidatePersonalInfo candidate={candidate} />
                  <SectionCandidateSkills candidate={candidate} />
                  <SectionCandidateExperience candidate={candidate} />
                  <SectionCandidateEducation candidate={candidate} />
                </div>
              </div>

              <div className="col-lg-4 col-md-12 rightSidebar">
                <SectionEmployersCandidateSidebar candidate={candidate} type="1" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CandidateDetail;
