import JobZImage from "../../../../common/jobz-img";
import ImageLightbox from "../../../../common/image-lightbox";
import GalleryLightbox from "../../../../common/gallery-lightbox";
import Spinner from "../../../../common/spinner";
import { loadScript, publicUrlFor, updateSkinStyle } from "../../../../../globals/constants";
import { publicUser } from "../../../../../globals/route-names";
import { showErrorToast, showSuccessToast } from "../../../../../globals/error-handler";
import { getCandidateProfilePictureUrl, getCandidateCvUrl, getJobImageUrl } from "../../../../../globals/file-url";
import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import "./cv-modal.css";
import CountUp from "react-countup";

// Truncate text helper
const truncateText = (text, maxLength = 78) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

// Parse skill_level for display (handles raw PostgreSQL array strings)
function parseSkillsForDisplay(skillLevel) {
  if (!skillLevel) return "-";
  try {
    let cleaned = skillLevel.replace(/\\/g, "");
    cleaned = cleaned.replace(/[{}"]/g, "");
    const parts = cleaned.split(",").map(p => p.trim()).filter(Boolean);
    const seen = new Set();
    const unique = parts.filter(p => {
      const key = p.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    return unique.length > 0 ? unique.join(", ") : "-";
  } catch (e) {
    return "-";
  }
}

// Parse language_skills for display as tags
const parseLanguageSkillsForDisplay = (skills) => {
  if (!skills) return [];

  if (Array.isArray(skills)) {
    const cleaned = skills
      .map(skill => typeof skill === 'string' ? skill.replace(/^[\{\"]|[\}\"]$/g, '').trim() : skill)
      .filter(skill => skill && skill.length > 0);
    return [...new Set(cleaned)];
  }

  if (typeof skills === 'string') {
    if (skills.startsWith('{') && skills.endsWith('}')) {
      let content = skills.slice(1, -1);
      const parsed = [];
      let currentItem = '';
      let inQuotes = false;

      for (let i = 0; i < content.length; i++) {
        const char = content[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          if (currentItem.trim()) {
            const cleaned = currentItem.trim().replace(/^"|"$/g, '').trim();
            if (cleaned) parsed.push(cleaned);
          }
          currentItem = '';
        } else {
          currentItem += char;
        }
      }

      if (currentItem.trim()) {
        const cleaned = currentItem.trim().replace(/^"|"$/g, '').trim();
        if (cleaned) parsed.push(cleaned);
      }

      return [...new Set(parsed)];
    }

    if (skills.includes(',')) {
      return [...new Set(skills.split(',').map(s => s.trim()).filter(s => s))];
    }

    return [skills.trim()];
  }

  return [];
};

function Home18Page() {
  const [allCandidates, setAllCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [candidateDetails, setCandidateDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [blogs, setBlogs] = useState([]);
  const [blogsLoading, setBlogsLoading] = useState(true);
  const [pageReady, setPageReady] = useState(false);

  // Search, filter, tab state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState({ jobCategory: '', location: '', skillLevel: '', status: '' });
  const [filterOptions, setFilterOptions] = useState({ professions: [], locations: [], skillLevels: [], statuses: [] });

  useEffect(() => {
    document.title = 'Home | TrueTouch - Foreign Employment Recruitment Agency';
    loadScript("js/custom.js");
  }, []);

  // Fetch candidates + filter options in parallel
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/candidates/featured', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        const data = await response.json();
        console.log('✅ Candidates loaded:', data.length);
        setAllCandidates(data);
        setFilteredCandidates(data);
      } catch (err) {
        console.error('❌ Error fetching candidates:', err);
        showErrorToast(err, 'Failed to load featured candidates.');
      } finally {
        setLoading(false);
      }
    };

    const fetchFilterOptions = async () => {
      try {
        const response = await fetch('/api/candidates/filter-options', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        const data = await response.json();
        console.log('✅ Filter options loaded:', data);
        setFilterOptions(data);
      } catch (err) {
        console.error('❌ Error fetching filter options:', err);
      }
    };

    fetchCandidates();
    fetchFilterOptions();
  }, []);

  // Apply all filters reactively — case-insensitive + trimmed comparisons
  useEffect(() => {
    let result = [...allCandidates];

    // Search: matches name, profession, or location
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(c =>
        c.full_name?.toLowerCase().includes(q) ||
        c.profession?.toLowerCase().includes(q) ||
        c.location?.toLowerCase().includes(q)
      );
    }

    // Job Category filter
    if (filters.jobCategory) {
      result = result.filter(c =>
        c.profession?.trim().toLowerCase() === filters.jobCategory.trim().toLowerCase()
      );
    }

    // Location filter
    if (filters.location) {
      result = result.filter(c =>
        c.location?.trim().toLowerCase() === filters.location.trim().toLowerCase()
      );
    }

    // Skill Level filter — candidate skill_level may be a comma-separated string
    // so we check if any parsed skill matches the selected value
    if (filters.skillLevel) {
      const selectedSkill = filters.skillLevel.trim().toLowerCase();
      result = result.filter(c => {
        if (!c.skill_level) return false;
        // Clean the raw skill_level string and check if it contains the selected skill
        const cleaned = c.skill_level.replace(/[{}"\\]/g, '');
        const skillParts = cleaned.split(',').map(s => s.trim().toLowerCase());
        return skillParts.includes(selectedSkill);
      });
    }

    // Status filter — both sides normalized to lowercase in DB and here
    if (filters.status) {
      result = result.filter(c =>
        c.status?.trim().toLowerCase() === filters.status.trim().toLowerCase()
      );
    }

    setFilteredCandidates(result);
  }, [searchQuery, filters, allCandidates]);

  // Fetch blogs
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setBlogsLoading(true);
        const response = await fetch('/api/jobs/latest?limit=3', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        const data = await response.json();
        console.log('✅ Blogs loaded:', data.length);
        setBlogs(data);
      } catch (err) {
        console.error('❌ Error fetching blogs:', err);
        showErrorToast(err, 'Failed to load blogs.');
      } finally {
        setBlogsLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  // Mark page as ready
  useEffect(() => {
    if (!loading && !blogsLoading) setPageReady(true);
  }, [loading, blogsLoading]);

  // Init Swiper
  useEffect(() => {
    const initSwiper = () => {
      if (window.Swiper) {
        new window.Swiper('.v-notiinfoSwiper', {
          loop: true,
          pagination: { el: '.swiper-pagination', clickable: true },
          autoplay: { delay: 3000, disableOnInteraction: false },
        });
      }
    };
    setTimeout(initSwiper, 500);
  }, []);

  // Reinit blog carousel
  useEffect(() => {
    if (blogs.length > 0 && !blogsLoading && window.jQuery) {
      setTimeout(() => {
        window.jQuery('.twm-la-home-blog').owlCarousel('destroy');
        window.jQuery('.twm-la-home-blog').owlCarousel({
          loop: false, nav: true, dots: false, margin: 30, autoplay: false,
          navText: ['<i class="fa fa-angle-left"></i>', '<i class="fa fa-angle-right"></i>'],
          responsive: { 0: { items: 1 }, 480: { items: 1 }, 991: { items: 2 }, 1199: { items: 3 } }
        });
      }, 100);
    }
  }, [blogs, blogsLoading]);

  const openCandidateModal = async (candidate) => {
    setSelectedCandidate(candidate);
    setDetailsLoading(true);
    try {
      const response = await fetch(`/api/candidates/${candidate.id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const data = await response.json();
      setCandidateDetails(data);
    } catch (err) {
      console.error('Error fetching candidate details:', err);
      showErrorToast(err, 'Failed to load candidate details.');
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeCandidateModal = () => {
    setSelectedCandidate(null);
    setCandidateDetails(null);
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.target);
      const data = {
        username: formData.get('username'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        subject: formData.get('subject'),
        message: formData.get('message')
      };
      const response = await fetch('/api/contact-us', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      e.target.reset();
      showSuccessToast('Thank you! Your message has been received. We will contact you soon.');
    } catch (err) {
      console.error('❌ Error submitting contact form:', err);
      showErrorToast(null, 'Failed to submit the form. Please try again.');
    }
  };

  // Tab click: reset everything
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setSearchQuery('');
    setFilters({ jobCategory: '', location: '', skillLevel: '', status: '' });
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const hasActiveFilters = searchQuery.trim() || Object.values(filters).some(v => v);

  const clearFilters = () => {
    setSearchQuery('');
    setFilters({ jobCategory: '', location: '', skillLevel: '', status: '' });
    setActiveTab('all');
  };

  return (
    <>
      <Toaster position="top-right" richColors />
      {!pageReady && <Spinner fullPage={true} />}

      {/*Banner Start*/}
      <div className="twm-home1-banner-section site-bg-gray bg-cover" style={{ backgroundImage: `url(${publicUrlFor("images/home-7/ofr-bg.jpg")})` }}>
        <div className="row">
          <div className="col-xl-6 col-lg-6 col-md-12">
            <div className="twm-bnr-left-section">
              <div className="twm-bnr-title-small">We Have <span className="site-text-primary">208,000+</span> Live Jobs</div>
              <div className="twm-bnr-title-large">Find the <span className="site-text-primary">job</span> that fits your life</div>
            </div>
          </div>
          <div className="col-xl-6 col-lg-6 col-md-12 twm-bnr-right-section">
            <div className="twm-bnr-right-content">
              <div className="twm-bnr-right-carousel">
                <div className="owl-carousel twm-h1-bnr-carousal">
                  <div className="item">
                    <div className="slide-img">
                      <JobZImage src="images/main-slider/slider1/r-img1.png" alt="#" />
                    </div>
                  </div>
                  <div className="item">
                    <div className="slide-img">
                      <JobZImage src="images/main-slider/slider1/r-img2.png" alt="#" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="twm-small-ring-l slide-top-animation" />
              <div className="twm-small-ring-2 slide-top-animation" />
            </div>
          </div>
        </div>
        <div className="twm-gradient-text">True Touch</div>
      </div>
      {/*Banner End*/}

      {/* ABOUT SECTION START */}
      <div className="section-full p-t120 p-b0 site-bg-white twm-millions-1-area pos-relative">
        <div className="container">
          <div className="twm-millions-section-wrap">
            <div className="row">
              <div className="col-lg-7 col-md-12">
                <div className="twm-millions-1-section">
                  <div className="twm-media">
                    <JobZImage src="images/home-5/millions-jobs/main-pic.png" alt="" />
                    <div className="twm-circle-jobs-wrap">
                      <div className="twm-circle-jobs-box one bounce2">
                        <div className="twm-circle-job-pics"><JobZImage src="images/home-7/flag-icon/qatar.png" alt="#" /></div>
                      </div>
                      <div className="twm-circle-jobs-box two bounce">
                        <div className="twm-circle-job-pics"><JobZImage src="images/home-7/flag-icon/saudi-arabia.png" alt="#" /></div>
                      </div>
                      <div className="twm-circle-jobs-box three bounce2">
                        <div className="twm-circle-job-pics"><JobZImage src="images/home-7/flag-icon/jordan.png" alt="#" /></div>
                      </div>
                      <div className="twm-circle-jobs-box four bounce">
                        <div className="twm-circle-job-pics"><JobZImage src="images/home-7/flag-icon/united-arab-emirates.png" alt="#" /></div>
                      </div>
                      <div className="twm-circle-jobs-box five bounce2">
                        <div className="twm-circle-job-pics"><JobZImage src="images/home-7/flag-icon/qatar.png" alt="#" /></div>
                      </div>
                      <div className="twm-circle-jobs-box six bounce">
                        <div className="twm-circle-job-pics"><JobZImage src="images/home-7/flag-icon/saudi-arabia.png" alt="#" /></div>
                      </div>
                    </div>
                  </div>
                  <div className="twm-bg-circle-pic">
                    <JobZImage src="images/home-5/millions-jobs/bg-circle.png" alt="#" />
                  </div>
                </div>
              </div>
              <div className="col-lg-5 col-md-12">
                <div className="twm-millions-1-section-right">
                  <div className="section-head left wt-small-separator-outer">
                    <div className="wt-small-separator site-text-primary"><div>Millions of Jobs</div></div>
                    <h2 className="wt-title">Find The One That's Right For You</h2>
                    <p>You need to create an account to find the best and preferred job. lorem Ipsum is simply dummy text of the printing and typesetting industry the standard dummy text ever since took.</p>
                  </div>
                  <div className="twm-avail-jobs"><span>45 +</span> Jobs Available</div>
                  <div className="twm-read-more cplumn-2">
                    <NavLink to={publicUser.pages.ABOUT} className="site-button">Search Jobs</NavLink>
                    <NavLink to={publicUser.pages.ABOUT} className="site-button-link underline">Learn More</NavLink>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="twm-bg-shape5" />
      </div>
      {/* ABOUT SECTION END */}

      {/* FEATURED JOBS SECTION START */}
      <div className="section-full p-t120 p-t180 pos-relative site-bg-white twm-featured-city-area">
        <div className="twm-bg-section-box" />
        <div className="container">
          <div className="wt-separator-two-part content-white">
            <div className="row wt-separator-two-part-row">
              <div className="col-xl-5 col-lg-5 col-md-12 wt-separator-two-part-left">
                <div className="section-head left wt-small-separator-outer">
                  <div className="wt-small-separator site-text-primary"><div>Jobs by Categories</div></div>
                  <h2 className="wt-title">Find your favourite jobs and get.</h2>
                </div>
              </div>
              <div className="col-xl-7 col-lg-7 col-md-12 wt-separator-two-part-right text-right">
                <NavLink to={publicUser.HOME1} className="site-button white">View All Locations</NavLink>
              </div>
            </div>
          </div>
          <div className="twm-featured-city2-section">
            <div className="row">
              <div className="col-xl-4 col-lg-4 col-md-6">
                <div className="twm-featured-city2">
                  <div className="twm-media" style={{ backgroundImage: `url(${publicUrlFor("images/jobs-categories/ResidentialCleanerHousekeeper.jpg")})` }} />
                  <div className="twm-city-info">
                    <h4 className="twm-title"><NavLink to={publicUser.HOME1}>Residential Cleaner / Housekeeper</NavLink></h4>
                  </div>
                </div>
              </div>
              <div className="col-xl-3 col-lg-4 col-md-6">
                <div className="twm-featured-city2">
                  <div className="twm-media" style={{ backgroundImage: `url(${publicUrlFor("images/jobs-categories/NannyChildcareSpecialist.jpg")})` }} />
                  <div className="twm-city-info">
                    <h4 className="twm-title"><NavLink to={publicUser.HOME1}>Nanny / Childcare Specialist</NavLink></h4>
                  </div>
                </div>
              </div>
              <div className="col-xl-5 col-lg-4 col-md-6">
                <div className="twm-featured-city2">
                  <div className="twm-media" style={{ backgroundImage: `url(${publicUrlFor("images/jobs-categories/PrivateChefCook.jpg")})` }} />
                  <div className="twm-city-info">
                    <h4 className="twm-title"><NavLink to={publicUser.HOME1}>Private Chef / Cook</NavLink></h4>
                  </div>
                </div>
              </div>
              <div className="col-xl-4 col-lg-4 col-md-6">
                <div className="twm-featured-city2">
                  <div className="twm-media" style={{ backgroundImage: `url(${publicUrlFor("images/jobs-categories/Logistics&WarehousingSupervisor.jpg")})` }} />
                  <div className="twm-city-info">
                    <h4 className="twm-title"><NavLink to={publicUser.HOME1}>Logistics & Warehousing / Supervisor</NavLink></h4>
                  </div>
                </div>
              </div>
              <div className="col-xl-5 col-lg-4 col-md-6">
                <div className="twm-featured-city2">
                  <div className="twm-media" style={{ backgroundImage: `url(${publicUrlFor("images/jobs-categories/ElderlyCareCaregiver.jpg")})` }} />
                  <div className="twm-city-info">
                    <h4 className="twm-title"><NavLink to={publicUser.HOME1}>Elderly Care / Caregiver</NavLink></h4>
                  </div>
                </div>
              </div>
              <div className="col-xl-3 col-lg-4 col-md-6">
                <div className="twm-featured-city2">
                  <div className="twm-media" style={{ backgroundImage: `url(${publicUrlFor("images/jobs-categories/KitchenCleanerCommercialCleaning.jpg")})` }} />
                  <div className="twm-city-info">
                    <h4 className="twm-title"><NavLink to={publicUser.HOME1}>Kitchen Cleaner / House Cleaning</NavLink></h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* FEATURED SECTION END */}

      {/* OUR SERVICES SECTION START */}
      <div className="section-full p-t120 p-b90 site-bg-light twm-how-t-get-wrap7">
        <div className="container">
          <div className="twm-how-t-get-section">
            <div className="row g-5 gy-5 align-items-center">
              <div className="col-xl-5 col-lg-5 col-md-12">
                <div className="twm-how-t-get-section-left">
                  <div className="section-head left wt-small-separator-outer">
                    <div className="wt-small-separator site-text-primary"><div>Our Services</div></div>
                    <h2 className="wt-title">We Connect You to Global Opportunities</h2>
                    <p>True Touch Foreign Employment Recruitment Agency helps you find the right job abroad with full support from documentation to placement. We guide you every step of the way.</p>
                  </div>
                  <div className="twm-how-t-get-bottom">
                    <NavLink to={publicUser.HOME1} className="site-button">Get Started</NavLink>
                    <div className="twm-left-icon-bx">
                      <div className="twm-left-icon-media site-bg-primary">
                        <i className="flaticon-bell site-text-white" />
                      </div>
                      <div className="twm-left-icon-content">
                        <h4 className="icon-title">New Job Available</h4>
                        <p>New opportunities added today</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xl-7 col-lg-7 col-md-12">
                <div className="twm-how-t-get-section-right">
                  <div className="twm-media">
                    <JobZImage src="images/gallery/7.jpeg" alt="#" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* OUR SERVICES SECTION END */}

      {/* Portfolio SECTION START */}
      <div id="portfolio" className="section-full p-t120 p-b90 site-bg-white twm-featured-city-carousal-area">
        <div className="container">
          <div className="wt-separator-two-part">
            <div className="row wt-separator-two-part-row">
              <div className="col-xl-5 col-lg-5 col-md-12 wt-separator-two-part-left">
                <div className="section-head left wt-small-separator-outer">
                  <div className="wt-small-separator site-text-primary"><div>Our Portfolio</div></div>
                  <h2 className="wt-title">Our Portfolio Projects.</h2>
                </div>
              </div>
              <div className="col-xl-7 col-lg-7 col-md-12 wt-separator-two-part-right text-right">
                <NavLink to={publicUser.HOME1} className="site-button">View All Portfolios</NavLink>
              </div>
            </div>
          </div>
        </div>
        <GalleryLightbox images={[
          publicUrlFor("images/gallery/1.jpg"),
          publicUrlFor("images/gallery/2.jpg"),
          publicUrlFor("images/gallery/3.jpg"),
          publicUrlFor("images/gallery/4.jpg"),
          publicUrlFor("images/gallery/5.jpg")
        ]}>
          {(openLightbox) => (
            <div className="twm-featured-city-carousal-wrap">
              <div className="owl-carousel twm-featured-city-carousal">
                {[1, 2, 3, 4, 5].map((n, i) => (
                  <div key={n} className="item" onClick={() => openLightbox(i)}>
                    <div className="twm-featured-city2 portfolio-card-wrapper">
                      <div className="twm-media" style={{ backgroundImage: `url(${publicUrlFor(`images/gallery/${n}.jpg`)})` }} />
                      <div className="portfolio-card-overlay">
                        <div className="portfolio-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </GalleryLightbox>
      </div>
      {/* Portfolio SECTION END */}

      {/* CANDIDATES START */}
      <div id="candidates" className="section-full p-t120 p-b90 site-bg-white twm-candidate-h-page7-wrap pos-relative">
        <div className="container">
          <div className="section-head center wt-small-separator-outer">
            <div className="wt-small-separator site-text-primary"><div>Candidates</div></div>
            <h2 className="wt-title">Featured Candidates</h2>
          </div>
        </div>

        <div className="container-fluid">
          <div className="section-content">
            <div className="twm-candidate-h-page7">
              {loading && <Spinner />}
              {!loading && (
                <>
                  {/* ── SEARCH, TABS & FILTER UI ── */}
                  <div className="twm-candidate-filter-section" style={{ marginBottom: '40px' }}>

                    {/* Tabs */}
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '24px', flexWrap: 'wrap' }}>
                      {[
                        { key: 'all',          label: 'All Candidates' },
                        { key: 'category',     label: 'By Job Category' },
                        { key: 'country',      label: 'By Country' },
                        { key: 'availability', label: 'By Availability' },
                      ].map(tab => (
                        <button
                          key={tab.key}
                          onClick={() => handleTabClick(tab.key)}
                          style={{
                            padding: '10px 22px',
                            borderRadius: '22px',
                            border: '2px solid',
                            borderColor: activeTab === tab.key ? 'var(--site-primary, #7FD87F)' : '#e0e0e0',
                            cursor: 'pointer',
                            fontWeight: '500',
                            fontSize: '14px',
                            backgroundColor: activeTab === tab.key ? 'var(--site-primary, #7FD87F)' : 'white',
                            color: activeTab === tab.key ? 'white' : '#555',
                            transition: 'all 0.25s ease'
                          }}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Search Input */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                      <div style={{ position: 'relative', width: '100%', maxWidth: '500px' }}>
                        <i className="feather-search" style={{
                          position: 'absolute', left: '16px', top: '50%',
                          transform: 'translateY(-50%)', color: '#aaa', fontSize: '15px'
                        }} />
                        <input
                          type="text"
                          placeholder="Search by name, profession, or location..."
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '12px 20px 12px 42px',
                            borderRadius: '26px',
                            border: '1px solid #ddd',
                            fontSize: '14px',
                            outline: 'none',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                            transition: 'border-color 0.2s'
                          }}
                          onFocus={e => e.target.style.borderColor = 'var(--site-primary, #7FD87F)'}
                          onBlur={e => e.target.style.borderColor = '#ddd'}
                        />
                      </div>
                    </div>

                    {/* Filter Dropdowns */}
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '16px' }}>

                      {/* Job Category — shown on tabs: all, category */}
                      {(activeTab === 'all' || activeTab === 'category') && (
                        <select
                          value={filters.jobCategory}
                          onChange={e => handleFilterChange('jobCategory', e.target.value)}
                          style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', backgroundColor: 'white', minWidth: '160px', cursor: 'pointer' }}
                        >
                          <option value="">All Job Categories</option>
                          {filterOptions.professions.map(p => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      )}

                      {/* Location — shown on tabs: all, country */}
                      {(activeTab === 'all' || activeTab === 'country') && (
                        <select
                          value={filters.location}
                          onChange={e => handleFilterChange('location', e.target.value)}
                          style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', backgroundColor: 'white', minWidth: '160px', cursor: 'pointer' }}
                        >
                          <option value="">All Locations</option>
                          {filterOptions.locations.map(l => (
                            <option key={l} value={l}>{l}</option>
                          ))}
                        </select>
                      )}

                      {/* Skill Level — shown on tab: all only */}
                      {activeTab === 'all' && (
                        <select
                          value={filters.skillLevel}
                          onChange={e => handleFilterChange('skillLevel', e.target.value)}
                          style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', backgroundColor: 'white', minWidth: '160px', cursor: 'pointer' }}
                        >
                          <option value="">All Skill Levels</option>
                          {filterOptions.skillLevels.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      )}

                      {/* Status — shown on tabs: all, availability — values from DB (normalized lowercase) */}
                      {(activeTab === 'all' || activeTab === 'availability') && (
                        <select
                          value={filters.status}
                          onChange={e => handleFilterChange('status', e.target.value)}
                          style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', backgroundColor: 'white', minWidth: '160px', cursor: 'pointer' }}
                        >
                          <option value="">All Statuses</option>
                          {filterOptions.statuses.length > 0
                            ? filterOptions.statuses.map(s => (
                                <option key={s} value={s}>
                                  {s.charAt(0).toUpperCase() + s.slice(1)}
                                </option>
                              ))
                            : (
                              <>
                                <option value="available">Available</option>
                                <option value="hired">Hired</option>
                                <option value="pending">Pending</option>
                              </>
                            )
                          }
                        </select>
                      )}

                      {/* Clear Filters */}
                      {hasActiveFilters && (
                        <button
                          onClick={clearFilters}
                          style={{
                            padding: '10px 16px', borderRadius: '8px', border: 'none',
                            fontSize: '14px', backgroundColor: '#ff4444', color: 'white',
                            cursor: 'pointer', fontWeight: '500', display: 'flex',
                            alignItems: 'center', gap: '6px'
                          }}
                        >
                          ✕ Clear Filters
                        </button>
                      )}
                    </div>

                    {/* Results Count */}
                    <div style={{ textAlign: 'center', color: '#999', fontSize: '13px', marginBottom: '24px' }}>
                      Showing <strong>{filteredCandidates.length}</strong> of <strong>{allCandidates.length}</strong> candidates
                    </div>
                  </div>
                  {/* ── END FILTER UI ── */}

                  <div className="row d-flex justify-content-center m-b30">
                    {filteredCandidates.length > 0 ? (
                      filteredCandidates.slice(0, 8).map(candidate => (
                        <div key={candidate.id} className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                          <div className="twm-candidates-grid-h-page7 m-b30">
                            <div className="twm-top-section-content">
                              <div className="twm-media">
                                <div className="twm-media-pic">
                                  <JobZImage
                                    src={candidate.profile_picture ? getCandidateProfilePictureUrl(candidate.profile_picture) : publicUrlFor("images/candidates/pic1.jpg")}
                                    alt={candidate.full_name}
                                  />
                                </div>
                              </div>
                              <div className="twm-mid-content">
                                <div className="twm-candidates-tag">
                                  <span className={candidate.status?.toLowerCase()}>{candidate.status}</span>
                                </div>
                                <button onClick={() => openCandidateModal(candidate)} className="twm-job-title" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                                  <h4>{candidate.full_name}</h4>
                                </button>
                                <p>{candidate.profession}</p>
                              </div>
                            </div>
                            <div className="twm-fot-content">
                              <div className="twm-left-info">
                                <p className="twm-candidate-address">
                                  <i className="feather-map-pin" />{candidate.location || "N/A"}
                                </p>
                                <div className="twm-jobs-vacancies">{candidate.hourly_rate}</div>
                              </div>
                              <div className="twm-action-buttons" style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                                <button onClick={() => openCandidateModal(candidate)} className="site-button" style={{ flex: 1, textAlign: 'center', padding: '8px 12px', fontSize: '14px', cursor: 'pointer' }}>
                                  View Profile
                                </button>
                                <a
                                  href={`https://wa.me/?text=Hi, I'm interested in contacting ${candidate.full_name}`}
                                  target="_blank" rel="noopener noreferrer"
                                  className="site-button"
                                  style={{ flex: 1, textAlign: 'center', padding: '8px 12px', fontSize: '14px', backgroundColor: '#25D366' }}
                                >
                                  WhatsApp
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-12 text-center" style={{ padding: '40px 0' }}>
                        <p style={{ color: '#999', fontSize: '15px' }}>
                          {hasActiveFilters ? 'No candidates match your search or filters.' : 'No candidates available.'}
                        </p>
                        {hasActiveFilters && (
                          <button onClick={clearFilters} className="site-button" style={{ marginTop: '12px' }}>
                            Clear Filters
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="text-center m-b30">
                    <NavLink to={publicUser.HOME1} className="site-button">All Candidates</NavLink>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="twm-bg-candi-pattern" />
        <div className="container">
          <div className="twm-j-ofr-wrap">
            <div className="twm-j-ofr-content" style={{ backgroundImage: `url(${publicUrlFor("images/home-7/ofr-bg.jpg")})` }}>
              <div className="row align-items-center">

                {/* Left: company info */}
                <div className="col-lg-5 col-md-12">
                  <div className="twm-j-ofr-map-content">
                    <div className="section-head left wt-small-separator-outer">
                      <h2 className="wt-title">Find Us at Our <span className="site-text-primary">Office</span></h2>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <i className="fas fa-map-marker-alt site-text-primary" style={{ fontSize: '18px', marginTop: '3px' }} />
                        <div>
                          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>Our Address</h4>
                          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Addis Ababa, Ethiopia</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <i className="fas fa-phone site-text-primary" style={{ fontSize: '18px', marginTop: '3px' }} />
                        <div>
                          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>Phone</h4>
                          <p style={{ margin: 0 }}>
                            <a href="tel:+251911208322" style={{ color: '#666', fontSize: '14px' }}>+251 91 120 8322</a>
                          </p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <i className="fas fa-envelope site-text-primary" style={{ fontSize: '18px', marginTop: '3px' }} />
                        <div>
                          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>Email</h4>
                          <p style={{ margin: 0 }}>
                            <a href="mailto:truetouchaddis@gmail.com" style={{ color: '#666', fontSize: '14px' }}>truetouchaddis@gmail.com</a>
                          </p>
                        </div>
                      </div>
                    </div>

                    href="https://www.google.com/maps?q=9.011711495201522,38.75411823390739"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="site-button"
            >
                    Get Directions
                  </a>
                </div>
              </div>

              {/* Right: embedded Google Map */}
              <div className="col-lg-7 col-md-12" style={{ marginTop: '20px' }}>
                <div style={{ borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}>
                  <iframe
                    title="TrueTouch Office Location"
                    src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d100!2d38.75411823390739!3d9.011711495201522!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zOcKwMDAnNDIuMiJOIDM4wrA0NSc5NC44IkU!5e0!3m2!1sen!2set!4v1700000000000"
                    width="100%"
                    height="380"
                    style={{ border: 0, display: 'block' }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
      </div>
      {/* CANDIDATES END */}

      {/* OUR BLOG START */}
      <div id="our-blogs" className="section-full p-t120 p-b90 site-bg-gray">
        <div className="container">
          <div className="section-head center wt-small-separator-outer">
            <div className="wt-small-separator site-text-primary"><div>Our Blogs</div></div>
            <h2 className="wt-title">Latest Article</h2>
          </div>
          <div className="section-content">
            {blogsLoading ? (
              <Spinner />
            ) : blogs.length > 0 ? (
              <>
                <div className="twm-blog-responsive-grid">
                  {blogs.slice(0, 6).map(blog => (
                    <div key={blog.id} className="twm-blog-responsive-item">
                      <div className="blog-post twm-blog-post-1-outer">
                        <div className="wt-post-media">
                          <NavLink to={`/blog-detail/${blog.id}`}>
                            <JobZImage src={getJobImageUrl(blog.image_url)} alt={blog.title} />
                          </NavLink>
                        </div>
                        <div className="wt-post-info">
                          <div className="wt-post-meta">
                            <ul>
                              <li className="post-date">
                                {new Date(blog.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: '2-digit' })}
                              </li>
                              <li className="post-author">By {blog.author}</li>
                            </ul>
                          </div>
                          <div className="wt-post-title">
                            <h4 className="post-title">
                              <NavLink to={`/blog-detail/${blog.id}`}>{blog.title}</NavLink>
                            </h4>
                          </div>
                          <div className="wt-post-text">
                            <p>{truncateText(blog.description)}</p>
                          </div>
                          <div className="wt-post-readmore">
                            <NavLink to={`/blog-detail/${blog.id}`} className="site-button-link site-text-primary">Read More</NavLink>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {blogs.length > 6 && (
                  <div className="text-center" style={{ marginTop: '40px' }}>
                    <NavLink to={publicUser.blog.LIST} className="site-button">View All Blogs</NavLink>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center p-5"><p>No blogs available</p></div>
            )}
          </div>
        </div>
      </div>
      {/* OUR BLOG END */}

      {/* CONTACT US SECTION START */}
      <div id="contact-us" className="section-full twm-contact-one">
        <div className="section-content">
          <div className="container">
            <div className="contact-one-inner">
              <div className="row">
                <div className="col-lg-6 col-md-12">
                  <div className="contact-form-outer">
                    <div className="section-head left wt-small-separator-outer">
                      <h2 className="wt-title">Send Us a Message</h2>
                      <p>Feel free to contact us and we will get back to you as soon as we can.</p>
                    </div>
                    <form className="cons-contact-form" onSubmit={handleContactSubmit}>
                      <div className="row">
                        <div className="col-lg-6 col-md-6">
                          <div className="form-group mb-3">
                            <input name="username" type="text" required className="form-control" placeholder="Name" />
                          </div>
                        </div>
                        <div className="col-lg-6 col-md-6">
                          <div className="form-group mb-3">
                            <input name="email" type="email" required className="form-control" placeholder="Email" />
                          </div>
                        </div>
                        <div className="col-lg-6 col-md-6">
                          <div className="form-group mb-3">
                            <input name="phone" type="text" required className="form-control" placeholder="Phone" />
                          </div>
                        </div>
                        <div className="col-lg-6 col-md-6">
                          <div className="form-group mb-3">
                            <input name="subject" type="text" required className="form-control" placeholder="Subject" />
                          </div>
                        </div>
                        <div className="col-lg-12">
                          <div className="form-group mb-3">
                            <textarea name="message" className="form-control" rows={3} placeholder="Message" defaultValue={""} />
                          </div>
                        </div>
                        <div className="col-md-12">
                          <button type="submit" className="site-button">Submit Now</button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
                <div className="col-lg-6 col-md-12">
                  <div className="contact-info-wrap">
                    <div className="contact-info">
                      <div className="contact-info-section">
                        <div className="c-info-column">
                          <div className="c-info-icon"><i className="fas fa-map-marker-alt" /></div>
                          <h3 className="twm-title">In the bay area?</h3>
                          <p>1363-1385 Sunset Blvd Los Angeles, CA 90026, USA</p>
                        </div>
                        <div className="c-info-column">
                          <div className="c-info-icon custome-size"><i className="fas fa-mobile-alt" /></div>
                          <h3 className="twm-title">Feel free to contact us</h3>
                          <p><a href="tel:+251911208322">+251 91 120 8322</a></p>
                        </div>
                        <div className="c-info-column">
                          <div className="c-info-icon"><i className="fas fa-envelope" /></div>
                          <h3 className="twm-title">Support</h3>
                          <p><a href="mailto:truetouchaddis@gmail.com">truetouchaddis@gmail.com</a></p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* CONTACT US SECTION END */}

      {/* CANDIDATE CV MODAL */}
      {selectedCandidate && (
        <div className="cv-modal-overlay" onClick={closeCandidateModal}>
          <div className="cv-modal" onClick={e => e.stopPropagation()}>
            <div className="cv-modal-header">
              <h2 className="cv-modal-title">Professional CV</h2>
              <button onClick={closeCandidateModal} className="cv-close-btn">×</button>
            </div>

            {detailsLoading ? (
              <div className="cv-loading-state"><p>Loading candidate profile...</p></div>
            ) : candidateDetails ? (
              <div className="cv-modal-content">
                <div className="cv-header-section">
                  <div className="cv-photo-container">
                    <JobZImage
                      src={
                        (candidateDetails.profile_picture ? getCandidateProfilePictureUrl(candidateDetails.profile_picture) : null) ||
                        (selectedCandidate.profile_picture ? getCandidateProfilePictureUrl(selectedCandidate.profile_picture) : null) ||
                        publicUrlFor("images/candidates/pic1.jpg")
                      }
                      alt={candidateDetails.name}
                      className="cv-profile-photo"
                    />
                  </div>
                  <div className="cv-header-info">
                    <h1 className="cv-candidate-name">{candidateDetails.name}</h1>
                    <p className="cv-job-title">{candidateDetails.occupation}</p>
                    <div className="cv-contact-info">
                      <div className="cv-contact-item">
                        <i className="fas fa-phone" />
                        <span>{candidateDetails.phone_number || "N/A"}</span>
                      </div>
                      <div className="cv-contact-item">
                        <i className="fas fa-map-marker-alt" />
                        <span>{candidateDetails.city}, {candidateDetails.nationality}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="cv-section">
                  <h3 className="cv-section-title">Personal Information</h3>
                  <div className="cv-info-grid">
                    <div className="cv-info-item">
                      <span className="cv-info-label">Date of Birth</span>
                      <span className="cv-info-value">
                        {candidateDetails.date_of_birth
                          ? new Date(candidateDetails.date_of_birth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                          : "-"}
                      </span>
                    </div>
                    <div className="cv-info-item">
                      <span className="cv-info-label">Gender</span>
                      <span className="cv-info-value">{candidateDetails.gender || "-"}</span>
                    </div>
                    <div className="cv-info-item">
                      <span className="cv-info-label">Nationality</span>
                      <span className="cv-info-value">{candidateDetails.nationality || "-"}</span>
                    </div>
                    <div className="cv-info-item">
                      <span className="cv-info-label">Religion</span>
                      <span className="cv-info-value">{candidateDetails.religion || "-"}</span>
                    </div>
                    <div className="cv-info-item">
                      <span className="cv-info-label">Marital Status</span>
                      <span className="cv-info-value">{candidateDetails.marital_status || "-"}</span>
                    </div>
                    <div className="cv-info-item">
                      <span className="cv-info-label">Current Location</span>
                      <span className="cv-info-value">{candidateDetails.current_location || "-"}</span>
                    </div>
                  </div>
                </div>

                <div className="cv-section">
                  <h3 className="cv-section-title">Professional Summary</h3>
                  <p className="cv-summary-text">{candidateDetails.bio || candidateDetails.occupation || "No summary provided"}</p>
                </div>

                <div className="cv-section">
                  <h3 className="cv-section-title">Professional Details</h3>
                  <div className="cv-info-grid">
                    <div className="cv-info-item">
                      <span className="cv-info-label">Job Category</span>
                      <span className="cv-info-value">{candidateDetails.job_category || "-"}</span>
                    </div>
                    <div className="cv-info-item">
                      <span className="cv-info-label">Skill Level</span>
                      <span className="cv-info-value">{parseSkillsForDisplay(candidateDetails.skill_level) || "-"}</span>
                    </div>
                    <div className="cv-info-item">
                      <span className="cv-info-label">Education Level</span>
                      <span className="cv-info-value">{candidateDetails.education_level || "-"}</span>
                    </div>
                    <div className="cv-info-item">
                      <span className="cv-info-label">Medical Status</span>
                      <span className="cv-info-value">{candidateDetails.medical_status || "-"}</span>
                    </div>
                  </div>
                </div>

                {candidateDetails.language_skills && (
                  <div className="cv-section">
                    <h3 className="cv-section-title">Language Skills</h3>
                    <div className="cv-skills-list">
                      {parseLanguageSkillsForDisplay(candidateDetails.language_skills).map((lang, i) => (
                        <span key={i} className="cv-skill-tag">{lang}</span>
                      ))}
                    </div>
                  </div>
                )}

                {candidateDetails.cv && (
                  <div className="cv-section">
                    <h3 className="cv-section-title">Curriculum Vitae</h3>
                    <a href={getCandidateCvUrl(candidateDetails.cv)} target="_blank" rel="noopener noreferrer" className="cv-resume-link" download>
                      <i className="fas fa-file-pdf" /> Download CV
                    </a>
                  </div>
                )}

                {candidateDetails.resume_url && (
                  <div className="cv-section">
                    <h3 className="cv-section-title">Resume</h3>
                    <a href={getCandidateCvUrl(candidateDetails.resume_url)} target="_blank" rel="noopener noreferrer" className="cv-resume-link" download>
                      <i className="fas fa-file-pdf" /> Download Full Resume
                    </a>
                  </div>
                )}

                {candidateDetails.passport_number && (
                  <div className="cv-section">
                    <h3 className="cv-section-title">Travel Documents</h3>
                    <div className="cv-info-item">
                      <span className="cv-info-label">Passport Number</span>
                      <span className="cv-info-value">{candidateDetails.passport_number}</span>
                    </div>
                  </div>
                )}

                <div className="cv-modal-actions">
                  <button onClick={closeCandidateModal} className="cv-action-btn cv-close-action">Close</button>
                  <a
                    href={`https://wa.me/251911208322?text=Hi ${candidateDetails.name}, I'm interested in your profile`}
                    target="_blank" rel="noopener noreferrer"
                    className="cv-action-btn cv-whatsapp-action"
                  >
                    <i className="fab fa-whatsapp" /> WhatsApp
                  </a>
                </div>
              </div>
            ) : (
              <div className="cv-error-state">Failed to load candidate profile</div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Home18Page;