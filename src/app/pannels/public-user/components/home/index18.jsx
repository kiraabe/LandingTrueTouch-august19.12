import JobZImage from "../../../../common/jobz-img";
import ImageLightbox from "../../../../common/image-lightbox";
import GalleryLightbox from "../../../../common/gallery-lightbox";
import Spinner from "../../../../common/spinner";
import { loadScript, publicUrlFor, updateSkinStyle } from "../../../../../globals/constants";
import { publicUser } from "../../../../../globals/route-names";
import { downloadFileWithToast, showErrorToast, showSuccessToast } from "../../../../../globals/error-handler";
import { getCandidateProfilePictureUrl, getCandidateCvUrl, getJobImageUrl } from "../../../../../globals/file-url";
import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Toaster } from "../../../../../components/ui/toaster";
import "./cv-modal.css";
import CountUp from "react-countup";
import AirplaneCircleHighlight from "./AirplaneCircleHighlight";

// Truncate text helper
const API_BASE_URL = '';

const truncateText = (text, maxLength = 78) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

// Parse skill_level for display (handles raw PostgreSQL array strings)
function parseSkillsForDisplay(skillLevel) {
  if (!skillLevel) return "-";
  try {
    let cleaned = skillLevel.replace(/\\+/g, "");
    cleaned = cleaned.replace(/[{}"]/g, "");
    const parts = cleaned.split(",").map(p => p.trim()).filter(s => s.length > 0);
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
  const location = useLocation();
  const [allCandidates, setAllCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [candidateDetails, setCandidateDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [blogs, setBlogs] = useState([]);
  const [blogsLoading, setBlogsLoading] = useState(true);
  const [pageReady, setPageReady] = useState(false);

  const downloadResume = (event, filename, label) => {
    event.preventDefault();
    downloadFileWithToast(
      getCandidateCvUrl(filename),
      filename,
      `The ${label} file is unavailable. Please try again later.`
    );
  };

  // Search, filter, tab state
  const [searchQuery, setSearchQuery] = useState('');
  const [heroLocation, setHeroLocation] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState({ jobCategory: '', preferredWorkCountry: '', skillLevel: '', religion: '', status: '' });
  const [filterOptions, setFilterOptions] = useState({ professions: [], preferredWorkCountries: [], skillLevels: [], religions: [], statuses: [] });

  useEffect(() => {
    document.title = 'Home | TrueTouch - Foreign Employment Recruitment Agency';
    loadScript("js/custom.js");
  }, []);

  // Read search query from URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get('search');
    if (search) {
      setSearchQuery(search);
      setTimeout(() => {
        const element = document.getElementById('candidates');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [location.search]);

  // Fetch candidates + filter options in parallel
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/candidates/featured`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        const data = await response.json();
        console.log('✅ Candidates loaded:', data.length);
        setAllCandidates(data);
        setFilteredCandidates(data);
        setFilterOptions(currentOptions => ({
          ...currentOptions,
          religions: [...new Set(data.map(candidate => candidate.religion).filter(Boolean))]
        }));
      } catch (err) {
        console.error('❌ Error fetching candidates:', err);
        showErrorToast(err, 'Failed to load featured candidates.');
      } finally {
        setLoading(false);
      }
    };

    const fetchFilterOptions = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/candidates/filter-options`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        const data = await response.json();
        const cleanOptions = (options = []) => options
          .map(option => typeof option === 'string' ? option.replace(/\\+/g, '').replace(/[{}"]+/g, '').trim() : option)
          .filter(Boolean);
        setFilterOptions({
          professions: cleanOptions(data.professions),
          preferredWorkCountries: cleanOptions(data.preferredWorkCountries),
          religions: cleanOptions(data.religions),
          statuses: cleanOptions(data.statuses),
          skillLevels: cleanOptions(data.skillLevels)
        });
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

    // Search across candidate text fields, including country and skills
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(candidate =>
        Object.values(candidate)
          .flatMap(value => Array.isArray(value) ? value : [value])
          .some(value => value !== null && value !== undefined && String(value).replace(/[{}"]+/g, '').toLowerCase().includes(q))
      );
    }

    // Job Category filter
    if (filters.jobCategory) {
      result = result.filter(c =>
        c.profession?.trim().toLowerCase() === filters.jobCategory.trim().toLowerCase()
      );
    }

    // Preferred work country filter
    if (filters.preferredWorkCountry) {
      result = result.filter(c =>
        c.preferred_work_country?.trim().toLowerCase() === filters.preferredWorkCountry.trim().toLowerCase()
      );
    }

    // Skill Level filter — candidate skill_level may be a comma-separated string
    // so we check if any parsed skill matches the selected value
    if (filters.skillLevel) {
      const selectedSkill = filters.skillLevel.trim().toLowerCase();
      result = result.filter(c => {
        if (!c.skill_level) return false;
        // Clean the raw skill_level string and check if it contains the selected skill
        const skillValues = Array.isArray(c.skill_level) ? c.skill_level : c.skill_level.split(',');
        const skillParts = skillValues
          .map(skill => String(skill).replace(/\\+/g, '').replace(/[{}"]+/g, '').trim().toLowerCase())
          .filter(Boolean);
        return skillParts.includes(selectedSkill);
      });
    }

    // Religion filter
    if (filters.religion) {
      result = result.filter(c =>
        c.religion?.trim().toLowerCase() === filters.religion.trim().toLowerCase()
      );
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
        const response = await fetch('/api/blogs/latest?limit=6', {
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
    setFilters({ jobCategory: '', preferredWorkCountry: '', skillLevel: '', religion: '', status: '' });
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const hasActiveFilters = searchQuery.trim() || Object.values(filters).some(v => v);

  const clearFilters = () => {
    setSearchQuery('');
    setFilters({ jobCategory: '', preferredWorkCountry: '', skillLevel: '', religion: '', status: '' });
    setActiveTab('all');
  };

  const handleHeroSearchSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const locationValue = heroLocation.trim();
    const preferredWorkCountry = filterOptions.preferredWorkCountries.find(country =>
      country.trim().toLowerCase() === locationValue.toLowerCase()
    ) || '';

    setFilters(currentFilters => ({
      ...currentFilters,
      jobCategory: formData.get('jobCategory') || '',
      religion: formData.get('religion') || '',
      preferredWorkCountry
    }));
    setSearchQuery(preferredWorkCountry ? '' : locationValue);
    setTimeout(() => document.getElementById('candidates')?.scrollIntoView({ behavior: 'smooth' }), 0);
  };

  return (
    <>
      <Toaster position="top-right" richColors />
      {!pageReady && <Spinner fullPage={true} />}

      {/*Banner Start*/}
      <div id="home-hero" className="twm-home1-banner-section site-bg-gray bg-cover" style={{ backgroundImage: `url(${publicUrlFor("images/home-7/ofr-bg.jpg")})` }}>
        <div className="row">
          <div className="col-xl-6 col-lg-6 col-md-12">
            <div className="twm-bnr-left-section">
              <div className="twm-bnr-title-small">Your Partner in <span className="site-text-primary">Global</span> Recruitment</div>
              <div className="twm-bnr-title-large">Hire <AirplaneCircleHighlight className="site-text-primary">Skilled </AirplaneCircleHighlight>  Workers with True Touch</div>
              <p className="twm-bnr-tagline">True Touch connects employers with vetted, skilled professionals from Asia and Africa. We provide reliable domestic helpers, healthcare workers, chefs, and skilled labor across the Gulf, Middle East, and beyond.</p>
              <div className="twm-bnr-search-bar">
                <form onSubmit={handleHeroSearchSubmit}>
                  <div className="row">
                    <div className="form-group col-xl-3 col-lg-6 col-md-6">
                      <label>What</label>
                      <select name="jobCategory" value={filters.jobCategory} onChange={(event) => handleFilterChange('jobCategory', event.target.value)} className="wt-search-bar-select" id="j-Job_Title">
                        <option value="">Select Profession</option>
                        {filterOptions.professions.map(profession => <option key={profession} value={profession}>{profession}</option>)}
                      </select>
                    </div>
                    <div className="form-group col-xl-3 col-lg-6 col-md-6">
                      <label>Religion</label>
                      <select name="religion" value={filters.religion} onChange={(event) => handleFilterChange('religion', event.target.value)} className="wt-search-bar-select" id="j-All_Category">
                        <option value="">Select Religion</option>
                        {filterOptions.religions.map(religion => <option key={religion} value={religion}>{religion}</option>)}
                      </select>
                    </div>
                    <div className="form-group col-xl-3 col-lg-6 col-md-6">
                      <label>Location</label>
                      <div className="twm-inputicon-box">
                        <input name="location" type="text" value={heroLocation} onChange={(event) => setHeroLocation(event.target.value)} className="form-control hero-location-input" placeholder="Search by location..." />
                        <i className="twm-input-icon fas fa-map-marker-alt" />
                      </div>
                    </div>
                    <div className="form-group col-xl-3 col-lg-6 col-md-6">
                      <button type="submit" className="site-button">Search</button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="col-xl-6 col-lg-6 col-md-12 twm-bnr-right-section">
            <div className="twm-bnr-right-content">
              <div className="twm-bnr-right-carousel">
                <div className="owl-carousel twm-h1-bnr-carousal">
                  <div className="item">
                    <ImageLightbox src={publicUrlFor("images/main-slider/slider1/r-img1.png")} alt="True Touch recruitment services">
                      <div className="slide-img">
                        <JobZImage src="images/main-slider/slider1/r-img1.png" alt="True Touch recruitment services" />
                      </div>
                    </ImageLightbox>
                  </div>
                  <div className="item">
                    <ImageLightbox src={publicUrlFor("images/main-slider/slider1/r-img2.png")} alt="True Touch recruitment services">
                      <div className="slide-img">
                        <JobZImage src="images/main-slider/slider1/r-img2.png" alt="True Touch recruitment services" />
                      </div>
                    </ImageLightbox>
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
      <div id="get-jobs" className="section-full p-t120 p-b0 site-bg-white twm-millions-1-area pos-relative">
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
                    <div className="wt-small-separator site-text-primary"><div>Why Partner With Us</div></div>
                    <h2 className="wt-title">Trusted Manpower Recruitment Provider</h2>
                    <p>With offices in Qatar, Oman, Kenya, and the Philippines, True Touch is your trusted partner for hiring skilled and semi-skilled workers. We handle full recruitment, vetting, documentation, and placement support—so you get the perfect candidate quickly.</p>
                  </div>
                  <div className="twm-avail-jobs"><span>1000+</span> Placements Completed</div>
                  <div className="twm-read-more cplumn-2">
                    <a href="#contact-us" className="site-button" onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('contact-us')?.scrollIntoView({ behavior: 'smooth' });
                    }}>Hire Now</a>
                    <a href="#contact-us" className="site-button-link underline" onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('contact-us')?.scrollIntoView({ behavior: 'smooth' });
                    }}>View Our Solutions</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="twm-bg-shape5" />
      </div>
      {/* ABOUT SECTION END */}

                  {/* Counter SECTION START */}
            <div className="section-full p-t0 p-b0 site-bg-white twm-counter-page-5-wrap">
                <div className="container">
                    <div className="twm-company-approch5-outer">
                        <div className="twm-company-approch5">
                            <div className="row">
                                {/*block 1*/}
                                <div className="col-lg-3 col-md-6 col-sm-6">
                                    <div className="counter-outer-two">
                                        <div className="icon-content">
                                            <div className="tw-count-number site-text-white">
                                                <span className="counter">
<CountUp end={28} duration={10} />
</span>+</div>
                                            <p className="icon-content-info">Happy Client 
</p>
                                        </div>
                                    </div>
                                </div>
                                {/*block 2*/}
                                <div className="col-lg-3 col-md-6 col-sm-6">
                                    <div className="counter-outer-two">
                                        <div className="icon-content">
                                            <div className="tw-count-number site-text-white">
                                                <span className="counter">
<CountUp end={25} duration={10} />
</span>k+</div>
                                            <p className="icon-content-info">Completed Cases 
</p>
                                        </div>
                                    </div>
                                </div>
                                {/*block 3*/}
                                <div className="col-lg-3 col-md-6 col-sm-6">
                                    <div className="counter-outer-two">
                                        <div className="icon-content">
                                            <div className="tw-count-number site-text-white">
                                                <span className="counter">80</span>%</div>
                                            <p className="icon-content-info">Success Score 
</p>
                                        </div>
                                    </div>
                                </div>
                                {/*block 4*/}
                                <div className="col-lg-3 col-md-6 col-sm-6">
                                    <div className="counter-outer-two">
                                        <div className="icon-content">
                                            <div className="tw-count-number site-text-white">
                                                <span className="counter">
<CountUp end={10} duration={10} />
</span>+</div>
                                            <p className="icon-content-info">Countries</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Counter SECTION END */}

      {/* FEATURED JOBS SECTION START */}
      <div className="section-full p-t120 p-t180 pos-relative site-bg-white twm-featured-city-area">
        <div className="twm-bg-section-box" />
        <div className="container">
          <div className="wt-separator-two-part content-white">
            <div className="row wt-separator-two-part-row">
              <div className="col-xl-12 col-lg-12 col-md-12 wt-separator-two-part-left">
                <div className="section-head left wt-small-separator-outer">
                  <h2 className="wt-title">Industries we support</h2>
                  <div className="wt-small-separator site-text-primary"><div>We provide cutting-edge recruitment and workforce management solutions for positions ranging from entry-level to executive across diverse industries. With our extensive knowledge, network, and expertise, we can match you with the ideal role.</div></div>
                </div>
              </div>
            </div>
          </div>
          <div className="twm-featured-city2-section industries-cards-section">
            <div className="row">
              <div className="col-xl-4 col-lg-4 col-md-6">
                <div className="twm-featured-city2">
                  <div className="twm-media" style={{ backgroundImage: `url(${publicUrlFor("images/jobs-categories/ResidentialCleanerHousekeeper.jpg")})` }} />
                  <div className="twm-city-info">
                    <h4 className="twm-title"><NavLink to={publicUser.HOME1}>Domestic Helpers & Housekeeping</NavLink></h4>
                    <div className="wt-post-readmore">
                      <a href="blog-single.html" className="site-button-link site-text-primary">Read More</a>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xl-3 col-lg-4 col-md-6">
                <div className="twm-featured-city2">
                  <div className="twm-media" style={{ backgroundImage: `url(${publicUrlFor("images/jobs-categories/NannyChildcareSpecialist.jpg")})` }} />
                  <div className="twm-city-info">
                    <h4 className="twm-title"><NavLink to={publicUser.HOME1}>Childcare & Caregiving</NavLink></h4>
                    <div className="wt-post-readmore">
                      <a href="blog-single.html" className="site-button-link site-text-primary">Read More</a>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xl-5 col-lg-4 col-md-6">
                <div className="twm-featured-city2">
                  <div className="twm-media" style={{ backgroundImage: `url(${publicUrlFor("images/jobs-categories/PrivateChefCook.jpg")})` }} />
                  <div className="twm-city-info">
                    <h4 className="twm-title"><NavLink to={publicUser.HOME1}>Culinary Professionals</NavLink></h4>
                    <div className="wt-post-readmore">
                      <a href="blog-single.html" className="site-button-link site-text-primary">Read More</a>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xl-4 col-lg-4 col-md-6">
                <div className="twm-featured-city2">
                  <div className="twm-media" style={{ backgroundImage: `url(${publicUrlFor("images/jobs-categories/Logistics&WarehousingSupervisor.jpg")})` }} />
                  <div className="twm-city-info">
                    <h4 className="twm-title"><NavLink to={publicUser.HOME1}>Skilled & Semi-Skilled Workers</NavLink></h4>
                    <div className="wt-post-readmore">
                      <a href="blog-single.html" className="site-button-link site-text-primary">Read More</a>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xl-5 col-lg-4 col-md-6">
                <div className="twm-featured-city2">
                  <div className="twm-media" style={{ backgroundImage: `url(${publicUrlFor("images/jobs-categories/ElderlyCareCaregiver.jpg")})` }} />
                  <div className="twm-city-info">
                    <h4 className="twm-title"><NavLink to={publicUser.HOME1}>Healthcare & Elderly Care</NavLink></h4>
                    <div className="wt-post-readmore">
                      <a href="blog-single.html" className="site-button-link site-text-primary">Read More</a>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xl-3 col-lg-4 col-md-6">
                <div className="twm-featured-city2">
                  <div className="twm-media" style={{ backgroundImage: `url(${publicUrlFor("images/jobs-categories/KitchenCleanerCommercialCleaning.jpg")})` }} />
                  <div className="twm-city-info">
                    <h4 className="twm-title"><NavLink to={publicUser.HOME1}>Commercial Services</NavLink></h4>
                    <div className="wt-post-readmore">
                      <a href="blog-single.html" className="site-button-link site-text-primary">Read More</a>
                    </div>
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
                    <div className="wt-small-separator site-text-primary"><div>Our Commitment</div></div>
                    <h2 className="wt-title">Quality Staffing Solutions You Can Trust</h2>
                    <p>We specialize in supplying quality manpower to employers across Qatar, Oman, Saudi Arabia, Kuwait, Jordan, UAE, Bahrain, and Lebanon. We source, vet, and place skilled professionals from across Asia and Africa—ensuring reliable, competent staff that meets your exact requirements.</p>
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
                  <div className="wt-small-separator site-text-primary"><div>Our Network</div></div>
                  <h2 className="wt-title">Local Offices, Global Reach</h2>
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
            <div className="wt-small-separator site-text-primary"><div>Our Candidates</div></div>
            <h2 className="wt-title">Pre-Screened Professionals Available for Hiring</h2>
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
                            borderColor: activeTab === tab.key ? 'var(--site-primary, #A9C731)' : '#e0e0e0',
                            cursor: 'pointer',
                            fontWeight: '500',
                            fontSize: '14px',
                            backgroundColor: activeTab === tab.key ? 'var(--site-primary, #A9C731)' : 'white',
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
                          onFocus={e => e.target.style.borderColor = 'var(--site-primary, #A9C731)'}
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
                          style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', backgroundColor: 'white', width: '160px', cursor: 'pointer' }}
                        >
                          <option value="">All Job Categories</option>
                          {Array.from(new Set(filterOptions.professions)).map(p => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      )}

                      {/* Preferred work country — shown on tabs: all, country */}
                      {(activeTab === 'all' || activeTab === 'country') && (
                        <select
                          value={filters.preferredWorkCountry}
                          onChange={e => handleFilterChange('preferredWorkCountry', e.target.value)}
                          style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', backgroundColor: 'white', width: '160px', cursor: 'pointer' }}
                        >
                          <option value="">All Preferred Countries</option>
                          {Array.from(new Set(filterOptions.preferredWorkCountries)).map(country => (
                            <option key={country} value={country}>{country}</option>
                          ))}
                        </select>
                      )}

                      {/* Skill Level — shown on tab: all only */}
                      {activeTab === 'all' && (
                        <select
                          value={filters.skillLevel}
                          onChange={e => handleFilterChange('skillLevel', e.target.value)}
                          style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', backgroundColor: 'white', width: '160px', cursor: 'pointer' }}
                        >
                          <option value="">All Skill Levels</option>
                          {Array.from(new Set(filterOptions.skillLevels)).map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      )}

                      {/* Status — shown on tabs: all, availability — values from DB (normalized lowercase) */}
                      {(activeTab === 'all' || activeTab === 'availability') && (
                        <select
                          value={filters.status}
                          onChange={e => handleFilterChange('status', e.target.value)}
                          style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', backgroundColor: 'white', width: '160px', cursor: 'pointer' }}
                        >
                          <option value="">All Statuses</option>
                          {filterOptions.statuses.length > 0
                            ? Array.from(new Set(filterOptions.statuses)).map(s => (
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
                                    src={candidate.profile_picture ? getCandidateProfilePictureUrl(candidate.profile_picture) : "https://cdn.builder.io/api/v1/image/assets%2F5e5700cc98ef413c911c8b7a4a98ea76%2Fb069e95136284114b1d8cad46258af9e?format=webp&width=800&height=1200"}
                                    onError={(event) => {
                                      event.currentTarget.onerror = null;
                                      event.currentTarget.src = "https://cdn.builder.io/api/v1/image/assets%2F5e5700cc98ef413c911c8b7a4a98ea76%2Fb069e95136284114b1d8cad46258af9e?format=webp&width=800&height=1200";
                                    }}
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
                                <button onClick={() => openCandidateModal(candidate)} className="btn-view-profile" style={{ flex: 1, textAlign: 'center', padding: '8px 12px', fontSize: '14px', cursor: 'pointer' }}>
                                  View Profile
                                </button>
                                <a
                                  href={`https://wa.me/?text=Hi, I'm interested in contacting ${candidate.full_name}`}
                                  target="_blank" rel="noopener noreferrer"
                                  className="btn-whatsapp-action"
                                  style={{ flex: 1, textAlign: 'center', padding: '8px 12px', fontSize: '14px' }}
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
                    <NavLink to={publicUser.candidate.GRID} className="site-button">All Candidates</NavLink>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="twm-bg-candi-pattern" />

        {/* TESTIMONIAL SECTION START */}
            <div className="section-full p-t120 p-b90 site-bg-light twm-testimonial-8-area">
                <div className="container">
                    {/* title="" START*/}
                    <div className="section-head left wt-small-separator-outer">
                        <div className="section-head center wt-small-separator-outer">
                            <div className="wt-small-separator site-text-primary">
                                <div>Client Testimonials</div>
                            </div>
                            <h2 className="wt-title">What Our Partners
                                Say About Us</h2>
                        </div>
                    </div>
                    {/* title="" END*/}
                    <div className="section-content">
                        <div className="owl-carousel twm-testimonial-8-carousel m-b30 owl-btn-bottom-center ">
                            {/* COLUMNS 1 */}
                            <div className="item ">
                                <div className="testimonials-v site-bg-white">
                                    <div className="twm-testi-media">
                                        <JobZImage src="images/testimonial-placeholder.svg" alt="Client testimonial placeholder" />
                                    </div>
                                    <div className="testimonial-v-content">
                                        <div className="t-testimonial-top">
                                            <div className="t-quote"><i className="fa fa-quote-left" /></div>
                                            <div className="t-rating">
                                                <span><i className="fa fa-star" /></span>
                                                <span><i className="fa fa-star" /></span>
                                                <span><i className="fa fa-star" /></span>
                                                <span><i className="fa fa-star" /></span>
                                                <span><i className="fa fa-star" /></span>
                                            </div>
                                        </div>
                                        <div className="t-discription">Our Qatar & Oman offices provided outstanding domestic helpers
                                             and skilled workers. Efficient, global, and highly professional!
                                        </div>
                                        <div className="twm-testi-detail">
                                            <div className="twm-testi-name">Al-Mansoori Group</div>
                                            <div className="twm-testi-position">HR Director, Doha</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* COLUMNS 2 */}
                            <div className="item ">
                                <div className="testimonials-v site-bg-white">
                                    <div className="twm-testi-media">
                                        <JobZImage src="images/testimonial-placeholder.svg" alt="Client testimonial placeholder" />
                                    </div>
                                    <div className="testimonial-v-content">
                                        <div className="t-testimonial-top">
                                            <div className="t-quote"><i className="fa fa-quote-left" /></div>
                                            <div className="t-rating">
                                                <span><i className="fa fa-star" /></span>
                                                <span><i className="fa fa-star" /></span>
                                                <span><i className="fa fa-star" /></span>
                                                <span><i className="fa fa-star" /></span>
                                                <span><i className="fa fa-star" /></span>
                                            </div>
                                        </div>
                                        <div className="t-discription">Superb international recruitment! Sourced top-tier skilled
                                             personnel from Africa and Asia to our UAE and Saudi projects.
                                        </div>
                                        <div className="twm-testi-detail">
                                            <div className="twm-testi-name">Karanja & Associates</div>
                                            <div className="twm-testi-position">Operations, Kenya</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* COLUMNS 3 */}
                            <div className="item ">
                                <div className="testimonials-v site-bg-white">
                                    <div className="twm-testi-media">
                                        <JobZImage src="images/testimonial-placeholder.svg" alt="Client testimonial placeholder" />
                                    </div>
                                    <div className="testimonial-v-content">
                                        <div className="t-testimonial-top">
                                            <div className="t-quote"><i className="fa fa-quote-left" /></div>
                                            <div className="t-rating">
                                                <span><i className="fa fa-star" /></span>
                                                <span><i className="fa fa-star" /></span>
                                                <span><i className="fa fa-star" /></span>
                                                <span><i className="fa fa-star" /></span>
                                                <span><i className="fa fa-star" /></span>
                                            </div>
                                        </div>
                                        <div className="t-discription">The Philippines and Kenya pipelines delivered semi-skilled
                                             and premium local manpower swiftly to Kuwait & Bahrain.
                                        </div>
                                        <div className="twm-testi-detail">
                                            <div className="twm-testi-name">Global Tech Services</div>
                                            <div className="twm-testi-position">VP Supply Chain, Oman</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* COLUMNS 4 */}
                            <div className="item ">
                                <div className="testimonials-v site-bg-white">
                                    <div className="twm-testi-media">
                                        <JobZImage src="images/testimonial-placeholder.svg" alt="Client testimonial placeholder" />
                                    </div>
                                    <div className="testimonial-v-content">
                                        <div className="t-testimonial-top">
                                            <div className="t-quote"><i className="fa fa-quote-left" /></div>
                                            <div className="t-rating">
                                                <span><i className="fa fa-star" /></span>
                                                <span><i className="fa fa-star" /></span>
                                                <span><i className="fa fa-star" /></span>
                                                <span><i className="fa fa-star" /></span>
                                                <span><i className="fa fa-star" /></span>
                                            </div>
                                        </div>
                                        <div className="t-discription">Their local and international hiring channels saved us weeks of
                                             sourcing for our Lebanon and Jordan deployments.
                                        </div>
                                        <div className="twm-testi-detail">
                                            <div className="twm-testi-name">Pacific Horizons Ltd</div>
                                            <div className="twm-testi-position">GM, Manila Office</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* TESTIMONIAL SECTION END */}


              {/* OUR BLOG START */}
      <div id="our-blogs" className="section-full p-t120 p-b90 site-bg-gray">
        <div className="container">
          <div className="section-head center wt-small-separator-outer">
            <div className="wt-small-separator site-text-primary"><div>Industry Resources</div></div>
            <h2 className="wt-title">Insights & Updates for Employers</h2>
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
                            <JobZImage
                              src={blog.image_url ? getJobImageUrl(blog.image_url) : "https://cdn.builder.io/api/v1/image/assets%2F5e5700cc98ef413c911c8b7a4a98ea76%2F3483d0d2e206411c8f937b411ad53cfd?format=webp&width=800&height=1200"}
                              onError={(event) => {
                                event.currentTarget.onerror = null;
                                event.currentTarget.src = "https://cdn.builder.io/api/v1/image/assets%2F5e5700cc98ef413c911c8b7a4a98ea76%2F3483d0d2e206411c8f937b411ad53cfd?format=webp&width=800&height=1200";
                              }}
                              alt={blog.title}
                            />
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
                <div className="text-center" style={{ marginTop: '40px' }}>
                  <NavLink to="/blogs" className="site-button">All Blogs</NavLink>
                </div>
              </>
            ) : (
              <div className="text-center p-5"><p>No blogs available</p></div>
            )}
          </div>
        </div>
      </div>
        {/* OUR BLOG END */}

      
        <div className="container">
          <div className="twm-j-ofr-wrap">
            <div className="twm-j-ofr-content" style={{ backgroundImage: `url(${publicUrlFor("images/home-7/ofr-bg.jpg")})` }}>
      <div className="row align-items-center">
        <div className="col-lg-5 col-md-12">
          <div className="twm-j-ofr-map-content">
            <div className="section-head left wt-small-separator-outer">
              <h2 className="wt-title">Our <span className="site-text-primary">Regional Offices</span></h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <i className="fas fa-map-marker-alt site-text-primary" style={{ fontSize: '18px', marginTop: '3px' }} />
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>Primary Location</h4>
                  <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Addis Ababa, Ethiopia</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <i className="fas fa-globe site-text-primary" style={{ fontSize: '18px', marginTop: '3px' }} />
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>Regional Offices</h4>
                  <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Qatar, Oman, Kenya, Philippines</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <i className="fas fa-phone site-text-primary" style={{ fontSize: '18px', marginTop: '3px' }} />
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>Contact</h4>
                  <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>+251 91 120 8322</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <i className="fas fa-envelope site-text-primary" style={{ fontSize: '18px', marginTop: '3px' }} />
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>Email</h4>
                  <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>info@truetouchrecruitment.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-7 col-md-12" style={{ marginTop: '20px' }}>
          <div style={{ borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}>
            <iframe
              title="TrueTouch Office"
              width="100%"
              height="380"
              style={{ border: 0, display: 'block' }}
              loading="lazy"
              src="https://maps.google.com/maps?q=9.011711495201522,38.75411823390739&z=16&output=embed"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
      </div>
      {/* CANDIDATES END */}



      {/* CONTACT US SECTION START */}
      <div id="contact-us" className="section-full twm-contact-one">
        <div className="section-content">
          <div className="container">
            <div className="contact-one-inner">
              <div className="row">
                <div className="col-lg-6 col-md-12">
                  <div className="contact-form-outer">
                    <div className="section-head left wt-small-separator-outer">
                      <h2 className="wt-title">Request Your Workforce</h2>
                      <p>Tell us about your staffing needs and we'll match you with the right professionals. We'll get back to you within 24 hours.</p>
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
                      <h3 className="twm-title advantages-heading">Your advantages with True Touch</h3>
                      <div className="contact-info-section">
                        <div className="c-info-column">
                          <div className="c-info-icon"><i className="fas fa-globe-africa" /></div>
                          <h3 className="twm-title">Countries</h3>
                          <p>62 Countries</p>
                        </div>
                        <div className="c-info-column">
                          <div className="c-info-icon"><i className="fas fa-user-tie" /></div>
                          <h3 className="twm-title">Clients</h3>
                          <p>1000s of Clients</p>
                        </div>
                        <div className="c-info-column">
                          <div className="c-info-icon"><i className="fas fa-map-marked-alt" /></div>
                          <h3 className="twm-title">Locations</h3>
                          <p>3,800 Locations</p>
                        </div>
                        <div className="c-info-column">
                          <div className="c-info-icon"><i className="fas fa-users" /></div>
                          <h3 className="twm-title">Workers</h3>
                          <p>660,000 People on assignment</p>
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
                        "https://cdn.builder.io/api/v1/image/assets%2F5e5700cc98ef413c911c8b7a4a98ea76%2Fb069e95136284114b1d8cad46258af9e?format=webp&width=800&height=1200"
                      }
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = "https://cdn.builder.io/api/v1/image/assets%2F5e5700cc98ef413c911c8b7a4a98ea76%2Fb069e95136284114b1d8cad46258af9e?format=webp&width=800&height=1200";
                      }}
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
                    <div className="cv-info-item">
                      <span className="cv-info-label">Preferred Work Country</span>
                      <span className="cv-info-value">{candidateDetails.preferred_work_country || "-"}</span>
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
                    <a
                      href={getCandidateCvUrl(candidateDetails.cv) || "#"}
                      onClick={(event) => downloadResume(event, candidateDetails.cv, "CV")}
                      className="cv-resume-link"
                    >
                      <i className="fas fa-file-pdf" /> Download CV
                    </a>
                  </div>
                )}

                {candidateDetails.resume_url && (
                  <div className="cv-section">
                    <h3 className="cv-section-title">Resume</h3>
                    <a
                      href={getCandidateCvUrl(candidateDetails.resume_url) || "#"}
                      onClick={(event) => downloadResume(event, candidateDetails.resume_url, "resume")}
                      className="cv-resume-link"
                    >
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
