import JobZImage from "../../../../common/jobz-img";
import ImageLightbox from "../../../../common/image-lightbox";
import GalleryLightbox from "../../../../common/gallery-lightbox";
import Spinner from "../../../../common/spinner";
import { loadScript, publicUrlFor, updateSkinStyle } from "../../../../../globals/constants";
import { publicUser } from "../../../../../globals/route-names";
import { showErrorToast, showSuccessToast } from "../../../../../globals/error-handler";
import { getCandidateProfilePictureUrl, getCandidateCvUrl, getJobImageUrl } from "../../../../../globals/file-url";
import { NavLink } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Toaster } from "sonner";
import "./cv-modal.css";
import CountUp from "react-countup";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const truncateText = (text, maxLength = 78) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

function parseSkillsForDisplay(skillLevel) {
  if (!skillLevel) return "-";
  try {
    let cleaned = skillLevel.replace(/\\/g, "");
    cleaned = cleaned.replace(/[{}"]/g, "");
    const parts = cleaned.split(",").map((p) => p.trim()).filter(Boolean);
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

const parseLanguageSkillsForDisplay = (skills) => {
  if (!skills) return [];
  if (Array.isArray(skills)) {
    const cleaned = skills
      .map(skill => {
        if (typeof skill === 'string') return skill.replace(/^[\{\"]|[\}\"]$/g, '').trim();
        return skill;
      })
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
        if (char === '"') { inQuotes = !inQuotes; }
        else if (char === ',' && !inQuotes) {
          if (currentItem.trim()) {
            const c = currentItem.trim().replace(/^"|"$/g, '').trim();
            if (c) parsed.push(c);
          }
          currentItem = '';
        } else { currentItem += char; }
      }
      if (currentItem.trim()) {
        const c = currentItem.trim().replace(/^"|"$/g, '').trim();
        if (c) parsed.push(c);
      }
      return [...new Set(parsed)];
    }
    if (skills.includes(',')) return [...new Set(skills.split(',').map(s => s.trim()).filter(s => s))];
    return [skills.trim()];
  }
  return [];
};

// ─────────────────────────────────────────────────────────────────────────────
// Orbital system constants
// ─────────────────────────────────────────────────────────────────────────────

const FLAG_BUBBLES = [
  { src: "images/home-7/flag-icon/uae.jpg", alt: "UAE" },
  { src: "images/home-7/flag-icon/united-kingdom.jpg", alt: "UK" },
  { src: "images/home-7/flag-icon/spain.jpg", alt: "Spain" },
  { src: "images/home-7/flag-icon/france.jpg", alt: "France" },
  { src: "images/home-7/flag-icon/turkey.jpg", alt: "Turkey" },
  { src: "images/home-7/flag-icon/portugal.jpg", alt: "Portugal" },
];

// Two tilted ellipses — rx/ry are fractions of the container dimensions
const ORBITS = [
  { rx: 0.44, ry: 0.26, tilt: -18 },
  { rx: 0.52, ry: 0.32, tilt: 22 },
];

// Which orbit, starting angle (deg), rotation direction
const PLANET_CONFIGS = [
  { orbit: 0, start: 0, dir: 1 },
  { orbit: 0, start: 180, dir: 1 },
  { orbit: 0, start: 90, dir: 1 },
  { orbit: 1, start: 45, dir: -1 },
  { orbit: 1, start: 225, dir: -1 },
  { orbit: 1, start: 135, dir: -1 },
];

// degrees per millisecond
const PLANET_SPEEDS = [0.032, 0.032, 0.032, 0.024, 0.024, 0.024];

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

function Home18Page() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [candidateDetails, setCandidateDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [blogs, setBlogs] = useState([]);
  const [blogsLoading, setBlogsLoading] = useState(true);
  const [pageReady, setPageReady] = useState(false);

  // ref to the right-section column — the orbit anchor
  const orbitAnchorRef = useRef(null);

  // ── Initialise page ────────────────────────────────────────────────────────
  useEffect(() => {
    document.title = 'Home | TrueTouch - Foreign Employment Recruitment Agency';
    updateSkinStyle("10", false, false);
    loadScript("js/custom.js");
  }, []);

  // ── Fetch candidates ───────────────────────────────────────────────────────
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/candidates/featured', {
          headers: { 'Content-Type': 'application/json' },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setCandidates(await res.json());
      } catch (err) {
        showErrorToast(err, 'Failed to load featured candidates. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, []);

  // ── Fetch blogs ────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setBlogsLoading(true);
        const res = await fetch('/api/jobs/latest?limit=3', {
          headers: { 'Content-Type': 'application/json' },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setBlogs(await res.json());
      } catch (err) {
        showErrorToast(err, 'Failed to load blogs. Please try again later.');
      } finally {
        setBlogsLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  // ── Page ready ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!loading && !blogsLoading) setPageReady(true);
  }, [loading, blogsLoading]);

  // ── Swiper ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    setTimeout(() => {
      if (window.Swiper) {
        new window.Swiper('.v-notiinfoSwiper', {
          loop: true,
          pagination: { el: '.swiper-pagination', clickable: true },
          autoplay: { delay: 3000, disableOnInteraction: false },
        });
      }
    }, 500);
  }, []);

  // ── Blog owl carousel ──────────────────────────────────────────────────────
  useEffect(() => {
    if (blogs.length > 0 && !blogsLoading && window.jQuery) {
      setTimeout(() => {
        window.jQuery('.twm-la-home-blog').owlCarousel('destroy');
        window.jQuery('.twm-la-home-blog').owlCarousel({
          loop: false, nav: true, dots: false, margin: 30, autoplay: false,
          navText: ['<i class="fa fa-angle-left"></i>', '<i class="fa fa-angle-right"></i>'],
          responsive: { 0: { items: 1 }, 480: { items: 1 }, 991: { items: 2 }, 1199: { items: 3 } },
        });
      }, 100);
    }
  }, [blogs, blogsLoading]);

  // ── Orbital planet animation ───────────────────────────────────────────────
  //
  //  Strategy: we attach the orbit to .twm-bnr-right-section (the Bootstrap
  //  column) via orbitAnchorRef.  The planets div (.twm-orbit-system) is a
  //  direct child of that column — rendered AFTER .twm-bnr-right-content —
  //  so it lives completely outside the .twm-img-bg-circle-area stacking
  //  context and can never be clipped or buried by it.
  //
  useEffect(() => {
    if (!pageReady) return;

    const tid = setTimeout(() => {
      const anchor = orbitAnchorRef.current;
      if (!anchor) return;

      let raf;
      let t0 = null;

      function orbitPos(oIdx, angleDeg) {
        const W = anchor.offsetWidth;
        const H = anchor.offsetHeight;
        const o = ORBITS[oIdx];
        const rx = o.rx * W;
        const ry = o.ry * H;
        const rad = (angleDeg * Math.PI) / 180;
        const tilt = (o.tilt * Math.PI) / 180;
        const lx = rx * Math.cos(rad);
        const ly = ry * Math.sin(rad);
        return {
          x: W / 2 + lx * Math.cos(tilt) - ly * Math.sin(tilt),
          y: H / 2 + lx * Math.sin(tilt) + ly * Math.cos(tilt),
          // depth: -1 (far back) → +1 (front)
          depth: Math.sin(rad - tilt),
        };
      }

      function frame(ts) {
        if (!t0) t0 = ts;
        const elapsed = ts - t0;

        anchor.querySelectorAll('.twm-flag-planet').forEach((el, i) => {
          const cfg = PLANET_CONFIGS[i];
          const angle = cfg.start + elapsed * PLANET_SPEEDS[i] * cfg.dir;
          const W = anchor.offsetWidth;
          const H = anchor.offsetHeight;
          const { x, y, depth } = orbitPos(cfg.orbit, angle);

          const scale = 0.72 + 0.32 * ((depth + 1) / 2);   // 0.72 → 1.04
          const opacity = 0.50 + 0.50 * ((depth + 1) / 2);   // 0.50 → 1.00

          el.style.transform = `translate(${x - W / 2}px, ${y - H / 2}px) scale(${scale})`;
          el.style.opacity = opacity;
          // planets behind the hero sit at z 6, planets in front at z 20
          el.style.zIndex = depth > 0 ? 20 : 6;
        });

        raf = requestAnimationFrame(frame);
      }

      raf = requestAnimationFrame(frame);
      return () => cancelAnimationFrame(raf);
    }, 350);

    return () => clearTimeout(tid);
  }, [pageReady]);
  // ── End orbital animation ──────────────────────────────────────────────────

  // ── Candidate modal ────────────────────────────────────────────────────────
  const openCandidateModal = async (candidate) => {
    setSelectedCandidate(candidate);
    setDetailsLoading(true);
    try {
      const res = await fetch(`/api/candidates/${candidate.id}`, {
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setCandidateDetails(await res.json());
    } catch (err) {
      showErrorToast(err, 'Failed to load candidate details.');
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeCandidateModal = () => {
    setSelectedCandidate(null);
    setCandidateDetails(null);
  };

  // ── Contact form ───────────────────────────────────────────────────────────
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData(e.target);
      const res = await fetch('/api/contact-us', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: fd.get('username'),
          email: fd.get('email'),
          phone: fd.get('phone'),
          subject: fd.get('subject'),
          message: fd.get('message'),
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      e.target.reset();
      showSuccessToast('Thank you! Your message has been received. We will contact you soon.');
    } catch (err) {
      showErrorToast(null, 'Failed to submit the form. Please try again.');
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <Toaster position="top-right" richColors />
      {!pageReady && <Spinner fullPage={true} />}

      {/* ── BANNER ── */}
      <div
        className="twm-home1-banner-section site-bg-gray bg-cover"
        style={{ backgroundImage: `url(${publicUrlFor("images/main-slider/slider1/bg1.jpg")})` }}
      >
        <div className="row">

          {/* Left */}
          <div className="col-xl-6 col-lg-6 col-md-12">
            <div className="twm-bnr-left-section">
              <div className="twm-bnr-title-small">
                We Have <span className="site-text-primary">208,000+</span> Live Jobs
              </div>
              <div className="twm-bnr-title-large">
                Find the <span className="site-text-primary">job</span> that fits your life
              </div>
              <div className="twm-bnr-discription">
                Type your keyword, then click search to find your perfect job.
              </div>
              <div className="twm-bnr-search-bar">
                <form>
                  <div className="row">
                    <div className="form-group col-xl-3 col-lg-6 col-md-6">
                      <label>What</label>
                      <select className="wt-search-bar-select selectpicker" data-live-search="true" title="" id="j-Job_Title" data-bv-field="size">
                        <option disabled value="">Select Category</option>
                        <option>Job Title</option>
                        <option>Web Designer</option>
                        <option>Developer</option>
                        <option>Acountant</option>
                      </select>
                    </div>
                    <div className="form-group col-xl-3 col-lg-6 col-md-6">
                      <label>Type</label>
                      <select className="wt-search-bar-select selectpicker" data-live-search="true" title="" id="j-All_Category" data-bv-field="size">
                        <option disabled value="">Select Category</option>
                        <option>All Category</option>
                        <option>Web Designer</option>
                        <option>Developer</option>
                        <option>Acountant</option>
                      </select>
                    </div>
                    <div className="form-group col-xl-3 col-lg-6 col-md-6">
                      <label>Location</label>
                      <div className="twm-inputicon-box">
                        <input name="username" type="text" required className="form-control" placeholder="Search..." />
                        <i className="twm-input-icon fas fa-map-marker-alt" />
                      </div>
                    </div>
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

          {/*
            Right column — orbitAnchorRef is placed HERE (on the column itself),
            NOT inside twm-bnr-right-content.  This means:
              • twm-orbit-system is a sibling of twm-bnr-right-content
              • It is never inside twm-img-bg-circle-area's stacking context
              • z-index values on the planets work correctly
          */}
          <div
            className="col-xl-6 col-lg-6 col-md-12 twm-bnr-right-section"
            ref={orbitAnchorRef}
            style={{ position: 'relative', overflow: 'visible' }}
          >
            {/* Hero image + decorative rings */}
            <div className="twm-bnr-right-content">
              <div className="twm-img-bg-circle-area">
                <div className="twm-img-bg-circle1 rotate-center"><span /></div>
                <div className="twm-img-bg-circle2 rotate-center-reverse"><span /></div>
                <div className="twm-img-bg-circle3"><span /></div>
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
                      <JobZImage src="images/main-slider/slider1/r-img2.png" alt="#" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/*
              Orbit system — sibling of twm-bnr-right-content, rendered AFTER it
              so it naturally sits above in the stacking order.
              position:absolute + inset:0 makes it overlay the entire column.
              pointer-events:none so clicks pass through to the carousel.
              z-index:15 clears ALL children of twm-bnr-right-content
              (circles are typically z 1–9 in the theme).
            */}
            <div className="twm-orbit-system">
              {FLAG_BUBBLES.map(({ src, alt }) => (
                <div key={alt} className="twm-flag-planet" title={alt}>
                  <img src={publicUrlFor(src)} alt={alt} />
                </div>
              ))}
            </div>

          </div>
          {/* End right column */}

        </div>
        <div className="twm-gradient-text">True Touch</div>
      </div>
      {/* ── END BANNER ── */}

      {/* ── FEATURED CITIES ── */}
      <div className="section-full p-t120 p-b90 site-bg-white twm-featured-city-area">
        <div className="container">
          <div className="section-head center wt-small-separator-outer">
            <div className="wt-small-separator site-text-primary"><div>Featured Cities</div></div>
            <h2 className="wt-title">Browse job offers by popular locations</h2>
          </div>
          <div className="twm-featured-city-section">
            <div className="row">
              <div className="col-xl-8 col-lg-8 col-md-12">
                <div className="twm-featured-city twm-large-block">
                  <div className="twm-media">
                    <JobZImage src="images/featured-cities/city1.jpg" alt="" />
                    <div className="twm-city-info">
                      <div className="twm-city-jobs">Jobs</div>
                      <h4 className="twm-title"><NavLink to={publicUser.jobs.LIST}>Saudi Arabia</NavLink></h4>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xl-4 col-lg-4 col-md-12">
                <div className="row">
                  <div className="col-lg-12 col-md-12">
                    <div className="twm-featured-city">
                      <div className="twm-media">
                        <JobZImage src="images/featured-cities/city2.jpg" alt="" />
                        <div className="twm-city-info">
                          <div className="twm-city-jobs">Jobs</div>
                          <h4 className="twm-title"><NavLink to={publicUser.jobs.LIST}>Qatar</NavLink></h4>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-12 col-md-12">
                    <div className="twm-featured-city">
                      <div className="twm-media">
                        <JobZImage src="images/featured-cities/city3.jpg" alt="" />
                        <div className="twm-city-info">
                          <div className="twm-city-jobs">Jobs</div>
                          <h4 className="twm-title"><NavLink to={publicUser.jobs.LIST}>Jordan</NavLink></h4>
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

      {/* ── GET JOBS / ABOUT ── */}
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
                    {["w1", "w2", "w3", "w4", "w5", "w6", "w1", "w2", "w3", "w5"].map((w, i) => (
                      <div className="item" key={i}>
                        <div className="ow-client-logo">
                          <div className="client-logo client-logo-media">
                            <NavLink to={publicUser.employer.LIST}>
                              <JobZImage src={`images/client-logo2/${w}.png`} alt="" />
                            </NavLink>
                          </div>
                        </div>
                      </div>
                    ))}
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
                        <span className="ring1" /><span className="ring2" /><span className="ring3" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-5 col-md-12">
                <div className="h-page-6-getjobs-right">
                  <div className="section-head left wt-small-separator-outer">
                    <div className="wt-small-separator site-text-primary"><div>About Us</div></div>
                    <h2 className="wt-title">
                      Your Trusted Partner for <span className="site-text-primary">Foreign Employment</span> Opportunities
                    </h2>
                    <p>True Touch Foreign Employment Recruitment Agency is dedicated to connecting skilled workers with top employers across the Middle East and beyond. We handle everything from job matching to visa processing so you can focus on your future.</p>
                    <p>With years of experience in international recruitment, we have successfully placed thousands of candidates in rewarding careers abroad. Our team is committed to transparency, integrity, and your long-term success.</p>
                  </div>
                  <div className="twm-read-more">
                    <NavLink to={publicUser.HOME1} className="site-button">Learn More</NavLink>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── OUR SERVICES ── */}
      <div className="section-full p-t120 p-b90 site-bg-light twm-how-t-get-wrap7">
        <div className="container">
          <div className="twm-how-t-get-section">
            <div className="row">
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

      {/* ── JOBS BY CATEGORY ── */}
      <div className="section-full p-t120 pos-relative site-bg-white twm-featured-city-area">
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
              {[
                { col: "col-xl-4 col-lg-4 col-md-6", img: "ResidentialCleanerHousekeeper.jpg", label: "Residential Cleaner / Housekeeper" },
                { col: "col-xl-3 col-lg-4 col-md-6", img: "NannyChildcareSpecialist.jpg", label: "Nanny / Childcare Specialist" },
                { col: "col-xl-5 col-lg-4 col-md-6", img: "PrivateChefCook.jpg", label: "Private Chef / Cook" },
                { col: "col-xl-4 col-lg-4 col-md-6", img: "Logistics&WarehousingSupervisor.jpg", label: "Logistics & Warehousing / Supervisor" },
                { col: "col-xl-5 col-lg-4 col-md-6", img: "ElderlyCareCaregiver.jpg", label: "Elderly Care / Caregiver" },
                { col: "col-xl-3 col-lg-4 col-md-6", img: "KitchenCleanerCommercialCleaning.jpg", label: "Kitchen Cleaner / House Cleaning" },
              ].map(({ col, img, label }) => (
                <div key={label} className={col}>
                  <div className="twm-featured-city2">
                    <div className="twm-media" style={{ backgroundImage: `url(${publicUrlFor(`images/jobs-categories/${img}`)})` }} />
                    <div className="twm-city-info">
                      <h4 className="twm-title"><NavLink to={publicUser.HOME1}>{label}</NavLink></h4>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── PORTFOLIO ── */}
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
        <GalleryLightbox images={[1, 2, 3, 4, 5].map(n => publicUrlFor(`images/gallery/${n}.jpg`))}>
          {(openLightbox) => (
            <div className="twm-featured-city-carousal-wrap">
              <div className="owl-carousel twm-featured-city-carousal">
                {[1, 2, 3, 4, 5].map((n, i) => (
                  <div className="item" key={n} onClick={() => openLightbox(i)}>
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

      {/* ── CANDIDATES ── */}
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
                  <div className="row d-flex justify-content-center m-b30">
                    {candidates.length > 0 ? (
                      candidates.slice(0, 8).map((candidate) => (
                        <div key={candidate.id} className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                          <div className="twm-candidates-grid-h-page7 m-b30">
                            <div className="twm-top-section-content">
                              <div className="twm-media">
                                <div className="twm-media-pic">
                                  <JobZImage
                                    src={candidate.profile_picture
                                      ? getCandidateProfilePictureUrl(candidate.profile_picture)
                                      : publicUrlFor("images/candidates/pic1.jpg")}
                                    alt={candidate.full_name}
                                  />
                                </div>
                              </div>
                              <div className="twm-mid-content">
                                <div className="twm-candidates-tag">
                                  <span className={candidate.status?.toLowerCase()}>{candidate.status}</span>
                                </div>
                                <button
                                  onClick={() => openCandidateModal(candidate)}
                                  className="twm-job-title"
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                >
                                  <h4>{candidate.full_name}</h4>
                                </button>
                                <p>{candidate.profession}</p>
                              </div>
                            </div>
                            <div className="twm-fot-content">
                              <div className="twm-left-info">
                                <p className="twm-candidate-address">
                                  <i className="feather-map-pin" />{candidate.location || "New York"}
                                </p>
                                <div className="twm-jobs-vacancies">{candidate.hourly_rate}</div>
                              </div>
                              <div className="twm-action-buttons" style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                                <button
                                  onClick={() => openCandidateModal(candidate)}
                                  className="site-button"
                                  style={{ flex: 1, textAlign: 'center', padding: '8px 12px', fontSize: '14px', cursor: 'pointer' }}
                                >
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
                      <div className="col-12 text-center"><p>No featured candidates available</p></div>
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
              <div className="row">
                <div className="col-lg-7 col-md-12">
                  <div className="twm-j-ofr-map-content">
                    <div className="section-head left wt-small-separator-outer">
                      <h2 className="wt-title">
                        We also have <span className="site-text-primary">job offers</span> in other countries
                      </h2>
                    </div>
                    <div className="twm-j-ofr-map-list">
                      <ul>
                        {[
                          { img: "denmark.jpg", name: "Denmark" },
                          { img: "france.jpg", name: "France" },
                          { img: "netherlands.jpg", name: "Netherlands" },
                          { img: "poland.jpg", name: "Poland" },
                          { img: "portugal.jpg", name: "Portugal" },
                          { img: "spain.jpg", name: "Spain" },
                          { img: "turkey.jpg", name: "Turkey" },
                          { img: "uae.jpg", name: "UAE" },
                          { img: "united-kingdom.jpg", name: "UK" },
                        ].map(({ img, name }) => (
                          <li key={name}>
                            <div className="flag-list">
                              <span><JobZImage src={`images/home-7/flag-icon/${img}`} alt={name} /></span>
                              <h4 className="flat-name">{name}</h4>
                            </div>
                          </li>
                        ))}
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

      {/* ── BLOGS ── */}
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
                          <div className="wt-post-text"><p>{truncateText(blog.description)}</p></div>
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

      {/* ── CONTACT ── */}
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
                        <div className="col-lg-6 col-md-6"><div className="form-group mb-3"><input name="username" type="text" required className="form-control" placeholder="Name" /></div></div>
                        <div className="col-lg-6 col-md-6"><div className="form-group mb-3"><input name="email" type="email" required className="form-control" placeholder="Email" /></div></div>
                        <div className="col-lg-6 col-md-6"><div className="form-group mb-3"><input name="phone" type="text" required className="form-control" placeholder="Phone" /></div></div>
                        <div className="col-lg-6 col-md-6"><div className="form-group mb-3"><input name="subject" type="text" required className="form-control" placeholder="Subject" /></div></div>
                        <div className="col-lg-12"><div className="form-group mb-3"><textarea name="message" className="form-control" rows={3} placeholder="Message" defaultValue={""} /></div></div>
                        <div className="col-md-12"><button type="submit" className="site-button">Submit Now</button></div>
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

      {/* ── CANDIDATE CV MODAL ── */}
      {selectedCandidate && (
        <div className="cv-modal-overlay" onClick={closeCandidateModal}>
          <div className="cv-modal" onClick={(e) => e.stopPropagation()}>
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
                        (candidateDetails.profile_picture
                          ? getCandidateProfilePictureUrl(candidateDetails.profile_picture)
                          : null) ||
                        (selectedCandidate.profile_picture
                          ? getCandidateProfilePictureUrl(selectedCandidate.profile_picture)
                          : null) ||
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
                      <div className="cv-contact-item"><i className="fas fa-phone"></i><span>{candidateDetails.phone_number || "N/A"}</span></div>
                      <div className="cv-contact-item"><i className="fas fa-map-marker-alt"></i><span>{candidateDetails.city}, {candidateDetails.nationality}</span></div>
                    </div>
                  </div>
                </div>
                <div className="cv-section">
                  <h3 className="cv-section-title">Personal Information</h3>
                  <div className="cv-info-grid">
                    <div className="cv-info-item"><span className="cv-info-label">Date of Birth</span><span className="cv-info-value">{candidateDetails.date_of_birth ? new Date(candidateDetails.date_of_birth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : "-"}</span></div>
                    <div className="cv-info-item"><span className="cv-info-label">Gender</span><span className="cv-info-value">{candidateDetails.gender || "-"}</span></div>
                    <div className="cv-info-item"><span className="cv-info-label">Nationality</span><span className="cv-info-value">{candidateDetails.nationality || "-"}</span></div>
                    <div className="cv-info-item"><span className="cv-info-label">Religion</span><span className="cv-info-value">{candidateDetails.religion || "-"}</span></div>
                    <div className="cv-info-item"><span className="cv-info-label">Marital Status</span><span className="cv-info-value">{candidateDetails.marital_status || "-"}</span></div>
                    <div className="cv-info-item"><span className="cv-info-label">Current Location</span><span className="cv-info-value">{candidateDetails.current_location || "-"}</span></div>
                  </div>
                </div>
                <div className="cv-section">
                  <h3 className="cv-section-title">Professional Summary</h3>
                  <p className="cv-summary-text">{candidateDetails.bio || candidateDetails.occupation || "No summary provided"}</p>
                </div>
                <div className="cv-section">
                  <h3 className="cv-section-title">Professional Details</h3>
                  <div className="cv-info-grid">
                    <div className="cv-info-item"><span className="cv-info-label">Job Category</span><span className="cv-info-value">{candidateDetails.job_category || "-"}</span></div>
                    <div className="cv-info-item"><span className="cv-info-label">Skill Level</span><span className="cv-info-value">{parseSkillsForDisplay(candidateDetails.skill_level) || "-"}</span></div>
                    <div className="cv-info-item"><span className="cv-info-label">Education Level</span><span className="cv-info-value">{candidateDetails.education_level || "-"}</span></div>
                    <div className="cv-info-item"><span className="cv-info-label">Medical Status</span><span className="cv-info-value">{candidateDetails.medical_status || "-"}</span></div>
                  </div>
                </div>
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
                {candidateDetails.cv && (
                  <div className="cv-section">
                    <h3 className="cv-section-title">Curriculum Vitae</h3>
                    <a href={getCandidateCvUrl(candidateDetails.cv)} target="_blank" rel="noopener noreferrer" className="cv-resume-link" download>
                      <i className="fas fa-file-pdf"></i> Download CV
                    </a>
                  </div>
                )}
                {candidateDetails.resume_url && (
                  <div className="cv-section">
                    <h3 className="cv-section-title">Resume</h3>
                    <a href={getCandidateCvUrl(candidateDetails.resume_url)} target="_blank" rel="noopener noreferrer" className="cv-resume-link" download>
                      <i className="fas fa-file-pdf"></i> Download Full Resume
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
  );
}

export default Home18Page;