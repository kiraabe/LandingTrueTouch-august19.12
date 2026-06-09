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

// Helper function to truncate text to 78 characters
const truncateText = (text, maxLength = 78) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

// Helper function to parse and clean skill data (for display as string or array)
// Helper function to parse and clean skill data (for display as string or array)
function parseSkillsForDisplay(skillLevel) {
  if (!skillLevel) return "-";

  try {
    // Remove ALL backslashes
    let cleaned = skillLevel.replace(/\\/g, "");

    // Remove all curly braces and quotes
    cleaned = cleaned.replace(/[{}"]/g, "");

    // Split by comma, trim each part, remove empty entries
    const parts = cleaned
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);

    // Deduplicate (case-insensitive)
    const seen = new Set();
    const unique = parts.filter((p) => {
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

// Helper function to parse and clean language skills (for display as tags)
const parseLanguageSkillsForDisplay = (skills) => {
  if (!skills) return [];

  // If already an array, clean each item and deduplicate
  if (Array.isArray(skills)) {
    const cleaned = skills
      .map(skill => {
        if (typeof skill === 'string') {
          // Remove quotes, braces, and extra whitespace
          return skill.replace(/^[\{\"]|[\}\"]$/g, '').trim();
        }
        return skill;
      })
      .filter(skill => skill && skill.length > 0);

    // Remove duplicates
    return [...new Set(cleaned)];
  }

  // If it's a string, try to parse it
  if (typeof skills === 'string') {
    // If it looks like a PostgreSQL array format
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

    // If it's a regular string, split by comma if needed
    if (skills.includes(',')) {
      return [...new Set(skills.split(',').map(s => s.trim()).filter(s => s))];
    }

    return [skills.trim()];
  }

  return [];
};

function Home18Page() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [candidateDetails, setCandidateDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [blogs, setBlogs] = useState([]);
  const [blogsLoading, setBlogsLoading] = useState(true);
  const [pageReady, setPageReady] = useState(false);

  useEffect(() => {
    document.title = 'Home | TrueTouch - Foreign Employment Recruitment Agency';
    updateSkinStyle("10", false, false)
    loadScript("js/custom.js")
  }, [])

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        const fetchUrl = '/api/candidates/featured';
        console.log('📡 Fetching from:', fetchUrl);

        const response = await fetch(fetchUrl, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ Candidates loaded:', data.length);
        setCandidates(data);
      } catch (err) {
        console.error('❌ Error fetching candidates:', err);
        showErrorToast(err, 'Failed to load featured candidates. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, [])

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setBlogsLoading(true);
        const response = await fetch('/api/jobs/latest?limit=3', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ Blogs loaded:', data.length);
        setBlogs(data);
      } catch (err) {
        console.error('❌ Error fetching blogs:', err);
        showErrorToast(err, 'Failed to load blogs. Please try again later.');
      } finally {
        setBlogsLoading(false);
      }
    };

    fetchBlogs();
  }, [])

  // Mark page as ready when critical data is loaded
  useEffect(() => {
    if (!loading && !blogsLoading) {
      setPageReady(true);
    }
  }, [loading, blogsLoading]);

  // Initialize Swiper for notifications
  useEffect(() => {
    const initSwiper = () => {
      if (window.Swiper) {
        new window.Swiper('.v-notiinfoSwiper', {
          loop: true,
          pagination: {
            el: '.swiper-pagination',
            clickable: true,
          },
          autoplay: {
            delay: 3000,
            disableOnInteraction: false,
          },
        });
      }
    };

    setTimeout(initSwiper, 500);
  }, []);

  // Reinitialize carousel after blogs load
  useEffect(() => {
    if (blogs.length > 0 && !blogsLoading && window.jQuery) {
      setTimeout(() => {
        window.jQuery('.twm-la-home-blog').owlCarousel('destroy');
        window.jQuery('.twm-la-home-blog').owlCarousel({
          loop: false,
          nav: true,
          dots: false,
          margin: 30,
          autoplay: false,
          navText: ['<i class="fa fa-angle-left"></i>', '<i class="fa fa-angle-right"></i>'],
          responsive: {
            0: { items: 1 },
            480: { items: 1 },
            991: { items: 2 },
            1199: { items: 3 }
          }
        });
      }, 100);
    }
  }, [blogs, blogsLoading])

  const openCandidateModal = async (candidate) => {
    setSelectedCandidate(candidate);
    setDetailsLoading(true);
    try {
      const url = `/api/candidates/${candidate.id}`;
      console.log('Fetching candidate details from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      console.log('Response status:', response.status);
      const contentType = response.headers.get('content-type');
      console.log('Content-Type:', contentType);

      if (!response.ok) {
        const text = await response.text();
        console.error('Error response:', text.substring(0, 200));
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Candidate details received:', data);
      console.log('✅ Name:', data.name);
      console.log('✅ Occupation:', data.occupation);
      console.log('✅ Phone:', data.phone_number);
      console.log('✅ Date of Birth:', data.date_of_birth);
      setCandidateDetails(data);
    } catch (err) {
      console.error('Error fetching candidate details:', err);
      showErrorToast(err, 'Failed to load candidate details. Please check the console.');
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

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Contact form submitted:', result);
      e.target.reset();
      showSuccessToast('Thank you! Your message has been received. We will contact you soon.');
    } catch (err) {
      console.error('❌ Error submitting contact form:', err);
      showErrorToast(null, 'Failed to submit the form. Please try again.');
    }
  };

  return (
    <>
      <Toaster position="top-right" richColors />
      {!pageReady && <Spinner fullPage={true} />}

                  {/*Banner Start*/}
            <div className="twm-home1-banner-section site-bg-gray bg-cover" style={{ backgroundImage: `url(${publicUrlFor("images/main-slider/slider1/bg1.jpg")})` }}>
                <div className="row">
                    {/*Left Section*/}
                    <div className="col-xl-6 col-lg-6 col-md-12">
                        <div className="twm-bnr-left-section">
                            <div className="twm-bnr-title-small">We Have <span className="site-text-primary">208,000+</span> Live Jobs</div>
                            <div className="twm-bnr-title-large">Find the <span className="site-text-primary">job</span> that fits your life</div>
                            <div className="twm-bnr-discription">Type your keyword, then click search to find your perfect job.</div>
                            <div className="twm-bnr-search-bar">
                                <form>
                                    <div className="row">
                                        {/*Title*/}
                                        <div className="form-group col-xl-3 col-lg-6 col-md-6">
                                            <label>What</label>
                                            <select className="wt-search-bar-select selectpicker" data-live-search="true" title="" id="j-Job_Title" data-bv-field="size">
                                                <option disabled value="" >Select Category</option>
                                                <option>Job Title</option>
                                                <option>Web Designer</option>
                                                <option>Developer</option>
                                                <option>Acountant</option>
                                            </select>
                                        </div>
                                        {/*All Category*/}
                                        <div className="form-group col-xl-3 col-lg-6 col-md-6">
                                            <label>Type</label>
                                            <select className="wt-search-bar-select selectpicker" data-live-search="true" title="" id="j-All_Category" data-bv-field="size">
                                                <option disabled value="" >Select Category</option>
                                                <option>All Category</option>
                                                <option>Web Designer</option>
                                                <option>Developer</option>
                                                <option>Acountant</option>
                                            </select>
                                        </div>
                                        {/*Location*/}
                                        <div className="form-group col-xl-3 col-lg-6 col-md-6">
                                            <label>Location</label>
                                            <div className="twm-inputicon-box">
                                                <input name="username" type="text" required className="form-control" placeholder="Search..." />
                                                <i className="twm-input-icon fas fa-map-marker-alt" />
                                            </div>
                                        </div>
                                        {/*Find job btn*/}
                                        <div className="form-group col-xl-3 col-lg-6 col-md-6">
                                            <button type="button" className="site-button">Find Job</button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div className="twm-bnr-popular-search">
                                <span className="twm-title">Popular Searches:</span>
                                <NavLink to={publicUser.jobs.LIST}>Developer</NavLink> ,
                                <NavLink to={publicUser.jobs.LIST}>Designer</NavLink> ,
                                <NavLink to={publicUser.jobs.LIST}>Architect</NavLink> ,
                                <NavLink to={publicUser.jobs.LIST}>Engineer</NavLink> ...
                            </div>
                        </div>
                    </div>
                    {/*right Section*/}
                    <div className="col-xl-6 col-lg-6 col-md-12 twm-bnr-right-section">
                        <div className="twm-bnr-right-content">
                            <div className="twm-img-bg-circle-area">
                                <div className="twm-img-bg-circle1 rotate-center">
                                    <span>
                    <JobZImage src="images/home-7/flag-icon/jordan.png" alt="JORDAN" />
                                    </span>
                                </div>
                                <div className="twm-img-bg-circle2 rotate-center-reverse">
                                    <span>
                    <JobZImage src="images/home-7/flag-icon/united-arab-emirates.png" alt="UAE" />
                                    </span>
                                </div>
                                <div className="twm-img-bg-circle3">
                                </div>
                            </div>
                            <div className="twm-bnr-right-carousel">
                                <div className="owl-carousel twm-h1-bnr-carousal">
                                    <div className="item">
                                        <div className="slide-img">
                                            <JobZImage src="images/main-slider/slider1/r-img1.png" alt="#" />
                                        </div>
                                    </div>
                                    <div className="item">
                                        <div className="slide-img">
                                            <div className="slide-img">
                                                <JobZImage src="images/main-slider/slider1/r-img2.png" alt="#" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/*Samll Ring Left*/}
                            <div className="twm-small-ring-l slide-top-animation" />
                            <div className="twm-small-ring-2 slide-top-animation" />
                        </div>
                    </div>
                </div>
                <div className="twm-gradient-text">
                    True Touch
                </div>
            </div>
            {/*Banner End*/}


      {/* GET JOBS SECTION START */}
<div id="get-jobs" className="section-full site-bg-white h-page6-getjobs-wrap">
  <div className="h-page6-client-slider-outer">
    <div className="container">
      <div className="h-page6-client-slider">
        <div className="row">
          <div className="col-xl-4 col-lg-12">
            <div className="h-page-6-client-slide-title">
              Trusted by more than <span className="site-text-primary">+50 Employers</span>
            </div>
          </div>
          <div className="col-xl-8 col-lg-12">
            <div className="owl-carousel home-client-carousel6 owl-btn-vertical-center">
              <div className="item">
                <div className="ow-client-logo">
                  <div className="client-logo client-logo-media">
                    <NavLink to={publicUser.employer.LIST}><JobZImage src="images/client-logo2/w1.png" alt="" /></NavLink></div>
                </div>
              </div>
              <div className="item">
                <div className="ow-client-logo">
                  <div className="client-logo client-logo-media">
                    <NavLink to={publicUser.employer.LIST}><JobZImage src="images/client-logo2/w2.png" alt="" /></NavLink></div>
                </div>
              </div>
              <div className="item">
                <div className="ow-client-logo">
                  <div className="client-logo client-logo-media">
                    <NavLink to={publicUser.employer.LIST}><JobZImage src="images/client-logo2/w3.png" alt="" /></NavLink></div>
                </div>
              </div>
              <div className="item">
                <div className="ow-client-logo">
                  <div className="client-logo client-logo-media">
                    <NavLink to={publicUser.employer.LIST}><JobZImage src="images/client-logo2/w4.png" alt="" /></NavLink></div>
                </div>
              </div>
              <div className="item">
                <div className="ow-client-logo">
                  <div className="client-logo client-logo-media">
                    <NavLink to={publicUser.employer.LIST}><JobZImage src="images/client-logo2/w5.png" alt="" /></NavLink></div>
                </div>
              </div>
              <div className="item">
                <div className="ow-client-logo">
                  <div className="client-logo client-logo-media">
                    <NavLink to={publicUser.employer.LIST}><JobZImage src="images/client-logo2/w6.png" alt="" /></NavLink></div>
                </div>
              </div>
              <div className="item">
                <div className="ow-client-logo">
                  <div className="client-logo client-logo-media">
                    <NavLink to={publicUser.employer.LIST}><JobZImage src="images/client-logo2/w1.png" alt="" /></NavLink></div>
                </div>
              </div>
              <div className="item">
                <div className="ow-client-logo">
                  <div className="client-logo client-logo-media">
                    <NavLink to={publicUser.employer.LIST}><JobZImage src="images/client-logo2/w2.png" alt="" /></NavLink></div>
                </div>
              </div>
              <div className="item">
                <div className="ow-client-logo">
                  <div className="client-logo client-logo-media">
                    <NavLink to={publicUser.employer.LIST}><JobZImage src="images/client-logo2/w3.png" alt="" /></NavLink></div>
                </div>
              </div>
              <div className="item">
                <div className="ow-client-logo">
                  <div className="client-logo client-logo-media">
                    <NavLink to={publicUser.employer.LIST}><JobZImage src="images/client-logo2/w5.png" alt="" /></NavLink></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div className="container">
    <div className="h-page-6-getjobs-wrap">
      <div className="row">
        <div className="col-lg-7 col-md-12">
          <div className="h-page-6-getjobs-left">
            <div className="twm-media">
              <JobZImage src="images/home-6/get-job-pic.png" alt="#" />
              <div className="twm-media-bg-circle" />
              <div className="twm-media-bg-circle2" />
              <div className="twm-media-bg-circle3">
                <div className="rotate-center">
                  <span className="ring1" />
                  <span className="ring2" />
                  <span className="ring3" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-5 col-md-12">
          <div className="h-page-6-getjobs-right">
            {/* title="" START*/}
            <div className="section-head left wt-small-separator-outer">
              <div className="wt-small-separator site-text-primary">
                <div>About Us</div>
              </div>
              <h2 className="wt-title">Your Trusted Partner for <span className="site-text-primary">Foreign Employment</span> Opportunities
              </h2>
              <p>True Touch Foreign Employment Recruitment Agency is dedicated to connecting skilled workers with top employers across the Middle East and beyond. We handle everything from job matching to visa processing so you can focus on your future.
              </p>
              <p>With years of experience in international recruitment, we have successfully placed thousands of candidates in rewarding careers abroad. Our team is committed to transparency, integrity, and your long-term success.
              </p>
            </div>
            {/* title="" END*/}
            <div className="twm-read-more">
              <NavLink to={publicUser.HOME1} className="site-button">Learn More</NavLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
{/* GET JOBS SECTION END */}



      {/* OUR SERVICES SECTION START */}
<div className="section-full p-t120 p-b90 site-bg-light twm-how-t-get-wrap7">
    <div className="container">
        <div className="twm-how-t-get-section">
            <div className="row">
                <div className="col-xl-5 col-lg-5 col-md-12">
                    <div className="twm-how-t-get-section-left">
                        <div className="section-head left wt-small-separator-outer">
                            <div className="wt-small-separator site-text-primary">
                                <div>Our Services</div>
                            </div>
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


            {/* FEATURED JOBS SECTION START */}
            <div className="section-full p-t120 pos-relative site-bg-white twm-featured-city-area">
                <div className="twm-bg-section-box" />
                <div className="container">
                    {/* title="" START*/}
                    <div className="wt-separator-two-part content-white">
                        <div className="row wt-separator-two-part-row">
                            <div className="col-xl-5 col-lg-5 col-md-12 wt-separator-two-part-left">
                                {/* title="" START*/}
                                <div className="section-head left wt-small-separator-outer">
                                    <div className="wt-small-separator site-text-primary">
                                        <div>Jobs by Categories</div>
                                    </div>
                                    <h2 className="wt-title">Find your favourite jobs and get.</h2>
                                </div>
                                {/* title="" END*/}
                            </div>
                            <div className="col-xl-7 col-lg-7 col-md-12 wt-separator-two-part-right text-right">
                                <NavLink to={publicUser.HOME1} className=" site-button white">View All Locations</NavLink>
                            </div>
                        </div>
                    </div>
                    {/* title="" END*/}
                    <div className="twm-featured-city2-section">
                        <div className="row">
                            <div className="col-xl-4 col-lg-4 col-md-6">
                                <div className="twm-featured-city2">
                                    <div className="twm-media" style={{ backgroundImage: `url(${publicUrlFor("images/jobs-categories/ResidentialCleanerHousekeeper.jpg")})` }}>
                                    </div>
                                    <div className="twm-city-info">
                                        <h4 className="twm-title"><NavLink to={publicUser.HOME1}>Residential Cleaner / Housekeeper</NavLink></h4>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-3 col-lg-4 col-md-6">
                                <div className="twm-featured-city2">
                                    <div className="twm-media" style={{ backgroundImage: `url(${publicUrlFor("images/jobs-categories/NannyChildcareSpecialist.jpg")})` }}>
                                    </div>
                                    <div className="twm-city-info">
                                        <h4 className="twm-title"><NavLink to={publicUser.HOME1}>Nanny / Childcare Specialist</NavLink></h4>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-5 col-lg-4 col-md-6">
                                <div className="twm-featured-city2">
                                    <div className="twm-media" style={{ backgroundImage: `url(${publicUrlFor("images/jobs-categories/PrivateChefCook.jpg")})` }}>
                                    </div>
                                    <div className="twm-city-info">
                                        <h4 className="twm-title"><NavLink to={publicUser.HOME1}>Private Chef / Cook</NavLink></h4>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-4 col-lg-4 col-md-6">
                                <div className="twm-featured-city2">
                                    <div className="twm-media" style={{ backgroundImage: `url(${publicUrlFor("images/jobs-categories/Logistics&WarehousingSupervisor.jpg")})` }}>
                                    </div>
                                    <div className="twm-city-info">
                                        <h4 className="twm-title"><NavLink to={publicUser.HOME1}>Logistics & Warehousing / Supervisor</NavLink></h4>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-5 col-lg-4 col-md-6">
                                <div className="twm-featured-city2">
                                    <div className="twm-media" style={{ backgroundImage: `url(${publicUrlFor("images/jobs-categories/ElderlyCareCaregiver.jpg")})` }}>
                                    </div>
                                    <div className="twm-city-info">
                                        <h4 className="twm-title"><NavLink to={publicUser.HOME1}>Elderly Care / Caregiver</NavLink></h4>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-3 col-lg-4 col-md-6">
                                <div className="twm-featured-city2">
                                    <div className="twm-media" style={{ backgroundImage: `url(${publicUrlFor("images/jobs-categories/KitchenCleanerCommercialCleaning.jpg")})` }}>
                                    </div>
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

      {}

      {/* Portfolio SECTION START */}
      <div id="portfolio" className="section-full p-t120 p-b90 site-bg-white twm-featured-city-carousal-area">
        <div className="container">
          {/* title="" START*/}
          <div className="wt-separator-two-part ">
            <div className="row wt-separator-two-part-row">
              <div className="col-xl-5 col-lg-5 col-md-12 wt-separator-two-part-left">
                {/* title="" START*/}
                <div className="section-head left wt-small-separator-outer">
                  <div className="wt-small-separator site-text-primary">
                    <div>Our Portfolio</div>
                  </div>
                  <h2 className="wt-title">Our Portfolio Projects.</h2>
                </div>
                {/* title="" END*/}
              </div>
              <div className="col-xl-7 col-lg-7 col-md-12 wt-separator-two-part-right text-right">
                <NavLink to={publicUser.HOME1} className=" site-button">View All Portfolios</NavLink>
              </div>
            </div>
          </div>
          {/* title="" END*/}
        </div>
        <GalleryLightbox
          images={[
            publicUrlFor("images/gallery/1.jpg"),
            publicUrlFor("images/gallery/2.jpg"),
            publicUrlFor("images/gallery/3.jpg"),
            publicUrlFor("images/gallery/4.jpg"),
            publicUrlFor("images/gallery/5.jpg")
          ]}
        >
          {(openLightbox) => (
            <div className="twm-featured-city-carousal-wrap">
              <div className="owl-carousel twm-featured-city-carousal">
                <div className="item" onClick={() => openLightbox(0)}>
                  {/*1*/}
                  <div className="twm-featured-city2 portfolio-card-wrapper">
                    <div className="twm-media" style={{ backgroundImage: `url(${publicUrlFor("images/gallery/1.jpg")})` }}>
                    </div>
                    <div className="portfolio-card-overlay">
                      <div className="portfolio-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="item" onClick={() => openLightbox(1)}>
                  {/*2*/}
                  <div className="twm-featured-city2 portfolio-card-wrapper">
                    <div className="twm-media" style={{ backgroundImage: `url(${publicUrlFor("images/gallery/2.jpg")})` }}>
                    </div>
                    <div className="portfolio-card-overlay">
                      <div className="portfolio-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="item" onClick={() => openLightbox(2)}>
                  {/*3*/}
                  <div className="twm-featured-city2 portfolio-card-wrapper">
                    <div className="twm-media" style={{ backgroundImage: `url(${publicUrlFor("images/gallery/3.jpg")})` }}>
                    </div>
                    <div className="portfolio-card-overlay">
                      <div className="portfolio-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="item" onClick={() => openLightbox(3)}>
                  {/*4*/}
                  <div className="twm-featured-city2 portfolio-card-wrapper">
                    <div className="twm-media" style={{ backgroundImage: `url(${publicUrlFor("images/gallery/4.jpg")})` }}>
                    </div>
                    <div className="portfolio-card-overlay">
                      <div className="portfolio-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="item" onClick={() => openLightbox(4)}>
                  {/*5*/}
                  <div className="twm-featured-city2 portfolio-card-wrapper">
                    <div className="twm-media" style={{ backgroundImage: `url(${publicUrlFor("images/gallery/5.jpg")})` }}>
                    </div>
                    <div className="portfolio-card-overlay">
                      <div className="portfolio-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </GalleryLightbox>
      </div>
      {/* FEATURED SECTION END */}



      {/* CANDIDATES START */}
      <div id="candidates" className="section-full p-t120 p-b90 site-bg-white twm-candidate-h-page7-wrap pos-relative ">
        <div className="container">
          {/* title="" START*/}
          <div className="section-head center wt-small-separator-outer">
            <div className="wt-small-separator site-text-primary">
              <div>Candidates</div>
            </div>
            <h2 className="wt-title">Featured Candidates</h2>
          </div>
          {/* title="" END*/}
        </div>
        <div className="container-fluid">
          <div className="section-content">
            <div className="twm-candidate-h-page7">
              {loading && <Spinner />}
              {!loading && (
                <>
                  <div className="row d-flex justify-content-center m-b30">
                    {candidates.length > 0 ? (
                      candidates.slice(0, 8).map((candidate) => (
                        <div key={candidate.id} className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                          <div className="twm-candidates-grid-h-page7 m-b30">
                            <div className="twm-top-section-content">
                              <div className="twm-media">
                                <div className="twm-media-pic">
                                  <JobZImage src={candidate.profile_picture ? getCandidateProfilePictureUrl(candidate.profile_picture) : publicUrlFor("images/candidates/pic1.jpg")} alt={candidate.full_name} />
                                </div>
                              </div>
                              <div className="twm-mid-content">
                                <div className="twm-candidates-tag"><span className={candidate.status?.toLowerCase()}>{candidate.status}</span></div>
                                <button onClick={() => openCandidateModal(candidate)} className="twm-job-title" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                                  <h4>{candidate.full_name}</h4>
                                </button>
                                <p>{candidate.profession}</p>
                              </div>
                            </div>
                            <div className="twm-fot-content">
                              <div className="twm-left-info">
                                <p className="twm-candidate-address"><i className="feather-map-pin" />{candidate.location || "New York"}</p>
                                <div className="twm-jobs-vacancies">{candidate.hourly_rate}</div>
                              </div>
                              <div className="twm-action-buttons" style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                                <button onClick={() => openCandidateModal(candidate)} className="site-button" style={{ flex: 1, textAlign: 'center', padding: '8px 12px', fontSize: '14px', cursor: 'pointer' }}>View Profile</button>
                                <a href={`https://wa.me/?text=Hi, I'm interested in contacting ${candidate.full_name}`} target="_blank" rel="noopener noreferrer" className="site-button" style={{ flex: 1, textAlign: 'center', padding: '8px 12px', fontSize: '14px', backgroundColor: '#25D366' }}>WhatsApp</a>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-12 text-center">
                        <p>No featured candidates available</p>
                      </div>
                    )}
                  </div>
                  <div className="text-center m-b30">
                    <NavLink to={publicUser.HOME1} className=" site-button">All  Candidates</NavLink>
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
              <div className="row">
                <div className="col-lg-7 col-md-12">
                  <div className="twm-j-ofr-map-content">
                    {/* title="" START*/}
                    <div className="section-head left wt-small-separator-outer">
                      <h2 className="wt-title">We also have <span className="site-text-primary">job offers</span> in other countries</h2>
                    </div>
                    {/* title="" END*/}
                    <div className="twm-j-ofr-map-list">
                      <ul>
                        <li>
                          <div className="flag-list">
                            <span><JobZImage src="images/home-7/flag-icon/denmark.jpg" alt="#" /></span>
                            <h4 className="flat-name">Denmark</h4>
                          </div>
                        </li>
                        <li>
                          <div className="flag-list">
                            <span><JobZImage src="images/home-7/flag-icon/france.jpg" alt="#" /></span>
                            <h4 className="flat-name">France</h4>
                          </div>
                        </li>
                        <li>
                          <div className="flag-list">
                            <span><JobZImage src="images/home-7/flag-icon/netherlands.jpg" alt="#" /></span>
                            <h4 className="flat-name">Netherlands</h4>
                          </div>
                        </li>
                        <li>
                          <div className="flag-list">
                            <span><JobZImage src="images/home-7/flag-icon/poland.jpg" alt="#" /></span>
                            <h4 className="flat-name">Poland</h4>
                          </div>
                        </li>
                        <li>
                          <div className="flag-list">
                            <span><JobZImage src="images/home-7/flag-icon/portugal.jpg" alt="#" /></span>
                            <h4 className="flat-name">Portugal</h4>
                          </div>
                        </li>
                        <li>
                          <div className="flag-list">
                            <span><JobZImage src="images/home-7/flag-icon/spain.jpg" alt="#" /></span>
                            <h4 className="flat-name">Spain</h4>
                          </div>
                        </li>
                        <li>
                          <div className="flag-list">
                            <span><JobZImage src="images/home-7/flag-icon/turkey.jpg" alt="#" /></span>
                            <h4 className="flat-name">Turkey</h4>
                          </div>
                        </li>
                        <li>
                          <div className="flag-list">
                            <span><JobZImage src="images/home-7/flag-icon/uae.jpg" alt="#" /></span>
                            <h4 className="flat-name">UAE</h4>
                          </div>
                        </li>
                        <li>
                          <div className="flag-list">
                            <span><JobZImage src="images/home-7/flag-icon/united-kingdom.jpg" alt="#" /></span>
                            <h4 className="flat-name">UK</h4>
                          </div>
                        </li>
                      </ul>
                    </div>
                    <div className="twm-read-more">
                      <NavLink to={publicUser.HOME1} className="site-button">More Offers</NavLink>
                    </div>
                  </div>
                </div>
                <div className="col-lg-5 col-md-12">
                  <div className="twm-j-ofr-map">
                    <div className="twm-media">
                      <JobZImage src="images/home-7/map-img.png" alt="" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* CANDIDATES END */}

      {/* OUR BLOG START */}
      {/* OUR BLOG START */}
<div id="our-blogs" className="section-full p-t120 p-b90 site-bg-gray">
  <div className="container">
    {/* title START */}
    <div className="section-head center wt-small-separator-outer">
      <div className="wt-small-separator site-text-primary">
        <div>Our Blogs</div>
      </div>
      <h2 className="wt-title">Latest Article</h2>
    </div>
    {/* title END */}
    <div className="section-content">
      {blogsLoading ? (
        <Spinner />
      ) : blogs.length > 0 ? (
        <>
          <div className="twm-blog-responsive-grid">
            {blogs.slice(0, 6).map((blog) => (
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
                          {new Date(blog.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: '2-digit'
                          })}
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
                      <NavLink to={`/blog-detail/${blog.id}`} className="site-button-link site-text-primary">
                        Read More
                      </NavLink>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {blogs.length > 6 && (
            <div className="text-center" style={{ marginTop: '40px' }}>
              <NavLink to={publicUser.blog.LIST} className="site-button">
                View All Blogs
              </NavLink>
            </div>
          )}
        </>
      ) : (
        <div className="text-center p-5">
          <p>No blogs available</p>
        </div>
      )}
    </div>
  </div>
</div>
{/* OUR BLOG END */}
      {/* OUR BLOG END */}

      {/* CONTACT US SECTION START */}
      <div id="contact-us" className="section-full twm-contact-one">
        <div className="section-content">
          <div className="container">
            {/* CONTACT FORM*/}
            <div className="contact-one-inner">
              <div className="row">
                <div className="col-lg-6 col-md-12">
                  <div className="contact-form-outer">
                    {/* title="" START*/}
                    <div className="section-head left wt-small-separator-outer">
                      <h2 className="wt-title">Send Us a Message</h2>
                      <p>Feel free to contact us and we will get back to you as soon as we can.</p>
                    </div>
                    {/* title="" END*/}
                    <form className="cons-contact-form" onSubmit={handleContactSubmit}>
                      <div className="row">
                        <div className="col-lg-6 col-md-6">
                          <div className="form-group mb-3">
                            <input name="username" type="text" required className="form-control" placeholder="Name" />
                          </div>
                        </div>
                        <div className="col-lg-6 col-md-6">
                          <div className="form-group mb-3">
                            <input name="email" type="email" className="form-control" required placeholder="Email" />
                          </div>
                        </div>
                        <div className="col-lg-6 col-md-6">
                          <div className="form-group mb-3">
                            <input name="phone" type="text" className="form-control" required placeholder="Phone" />
                          </div>
                        </div>
                        <div className="col-lg-6 col-md-6">
                          <div className="form-group mb-3">
                            <input name="subject" type="text" className="form-control" required placeholder="Subject" />
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
          <div className="cv-modal" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="cv-modal-header">
              <h2 className="cv-modal-title">Professional CV</h2>
              <button onClick={closeCandidateModal} className="cv-close-btn">×</button>
            </div>

            {detailsLoading ? (
              <div className="cv-loading-state">
                <p>Loading candidate profile...</p>
              </div>
            ) : candidateDetails ? (
              <div className="cv-modal-content">
                {/* CV Header Section */}
                <div className="cv-header-section">
                  <div className="cv-photo-container">
                    <JobZImage src={(candidateDetails.profile_picture ? getCandidateProfilePictureUrl(candidateDetails.profile_picture) : null) || (selectedCandidate.profile_picture ? getCandidateProfilePictureUrl(selectedCandidate.profile_picture) : null) || publicUrlFor("images/candidates/pic1.jpg")} alt={candidateDetails.name} className="cv-profile-photo" />
                  </div>
                  <div className="cv-header-info">
                    <h1 className="cv-candidate-name">{candidateDetails.name}</h1>
                    <p className="cv-job-title">{candidateDetails.occupation}</p>
                    <div className="cv-contact-info">
                      <div className="cv-contact-item">
                        <i className="fas fa-phone"></i>
                        <span>{candidateDetails.phone_number || "N/A"}</span>
                      </div>
                      <div className="cv-contact-item">
                        <i className="fas fa-map-marker-alt"></i>
                        <span>{candidateDetails.city}, {candidateDetails.nationality}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Personal Information Section */}
                <div className="cv-section">
                  <h3 className="cv-section-title">Personal Information</h3>
                  <div className="cv-info-grid">
                    <div className="cv-info-item">
                      <span className="cv-info-label">Date of Birth</span>
                      <span className="cv-info-value">{candidateDetails.date_of_birth ? new Date(candidateDetails.date_of_birth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : "-"}</span>
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

                {/* Professional Summary */}
                <div className="cv-section">
                  <h3 className="cv-section-title">Professional Summary</h3>
                  <p className="cv-summary-text">
                    {candidateDetails.bio || candidateDetails.occupation || "No summary provided"}
                  </p>
                </div>

                {/* Professional Details Section */}
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

                {/* Skills Section */}
                {candidateDetails.language_skills && (
                  <div className="cv-section">
                    <h3 className="cv-section-title">Language Skills</h3>
                    <div className="cv-skills-list">
                      {parseLanguageSkillsForDisplay(candidateDetails.language_skills).map((lang, index) => (
                        <span key={index} className="cv-skill-tag">{lang}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* CV Download Link */}
                {candidateDetails.cv && (
                  <div className="cv-section">
                    <h3 className="cv-section-title">Curriculum Vitae</h3>
                    <a href={getCandidateCvUrl(candidateDetails.cv)} target="_blank" rel="noopener noreferrer" className="cv-resume-link" download>
                      <i className="fas fa-file-pdf"></i> Download CV
                    </a>
                  </div>
                )}

                {/* Resume Link */}
                {candidateDetails.resume_url && (
                  <div className="cv-section">
                    <h3 className="cv-section-title">Resume</h3>
                    <a href={getCandidateCvUrl(candidateDetails.resume_url)} target="_blank" rel="noopener noreferrer" className="cv-resume-link" download>
                      <i className="fas fa-file-pdf"></i> Download Full Resume
                    </a>
                  </div>
                )}

                {/* Passport Information */}
                {candidateDetails.passport_number && (
                  <div className="cv-section">
                    <h3 className="cv-section-title">Travel Documents</h3>
                    <div className="cv-info-item">
                      <span className="cv-info-label">Passport Number</span>
                      <span className="cv-info-value">{candidateDetails.passport_number}</span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="cv-modal-actions">
                  <button onClick={closeCandidateModal} className="cv-action-btn cv-close-action">Close</button>
                  <a href={`https://wa.me/251911208322?text=Hi ${candidateDetails.name}, I'm interested in your profile`} target="_blank" rel="noopener noreferrer" className="cv-action-btn cv-whatsapp-action">
                    <i className="fab fa-whatsapp"></i> WhatsApp
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
  )
}
export default Home18Page;
