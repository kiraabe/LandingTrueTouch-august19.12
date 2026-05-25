import JobZImage from "../../../../common/jobz-img";
import ImageLightbox from "../../../../common/image-lightbox";
import { loadScript, publicUrlFor, updateSkinStyle } from "../../../../../globals/constants";
import { publicUser } from "../../../../../globals/route-names";
import { showErrorToast } from "../../../../../globals/error-handler";
import { getCandidateProfilePictureUrl, getCandidateCvUrl, getJobImageUrl } from "../../../../../globals/file-url";
import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import "./cv-modal.css";

function Home18Page() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [candidateDetails, setCandidateDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [blogs, setBlogs] = useState([]);
  const [blogsLoading, setBlogsLoading] = useState(true);

  useEffect(() => {
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

  return (
    <>
      <Toaster position="top-right" richColors />
      <div className="twm-home18-banner-section">
        <div className="row" style={{ backgroundImage: `url(${publicUrlFor("images/home-18/banner/dot-map.png")})` }}>
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
                        <option disabled value="">Select Category</option>
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
                        <option disabled value="">Select Category</option>
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
          <div className="col-xl-6 col-lg-6 col-md-12">
            <div className="twm-h-page-18-bnr-right-section">
              <div className="twm-h-page18-bnr-pic">
                <JobZImage src="images/home-18/banner/bnr-pic.png" alt="#" />
              </div>
              <div className="twm-h-page-18-bnr-noti">
                {/* Swiper */}
                <div className="swiper v-notiinfoSwiper v-noti-slider-h-page-18">
                  <div className="swiper-wrapper">
                    {/*SLide 1*/}
                    <div className="swiper-slide">
                      <div className="v-noti-wrap">
                        <div className="v-media">
                          <i className="far fa-check-circle twm-bg-purple" />
                        </div>
                        <div className="v-content">
                          <h4 className="wt-title">Congratulations</h4>
                          <p>Your admission successfully completed</p>
                        </div>
                      </div>
                    </div>
                    {/*SLide 2*/}
                    <div className="swiper-slide">
                      <div className="v-noti-wrap">
                        <div className="v-media">
                          <i className="far fa-envelope twm-bg-green" />
                        </div>
                        <div className="v-content">
                          <h4 className="wt-title">Congrats</h4>
                          <p>Your have got an Email</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Add Pagination */}
                  <div className="swiper-pagination" />
                </div>
              </div>
              {/*Samll Ring Left*/}
              <div className="twm-shape-l bounce" />
              <div className="twm-shape-2 bounce2" />
            </div>
          </div>
        </div>
      </div>

      {/* FEATURED SECTION START */}
      <div className="section-full p-t120 p-b90 site-bg-white twm-featured-city-area">
        <div className="container">
          {/* title="" START*/}
          <div className="section-head center wt-small-separator-outer">
            <div className="wt-small-separator site-text-primary">
              <div>Featured Cities</div>
            </div>
            <h2 className="wt-title">Browse job offers by
              popular locations</h2>
          </div>
          {/* title="" END*/}
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
      {/* FEATURED SECTION END */}

      {/* GET JOBS SECTION START */}
      <div id="get-jobs" className="section-full site-bg-white h-page6-getjobs-wrap">
        <div className="h-page6-client-slider-outer">
          <div className="container">
            <div className="h-page6-client-slider">
              <div className="row">
                <div className="col-xl-4 col-lg-12">
                  <div className="h-page-6-client-slide-title">
                    Trusted by more than <span className="site-text-primary">+100 companies</span>
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
                      <div>Get Jobs</div>
                    </div>
                    <h2 className="wt-title">Get World <span className="site-text-primary">1500+</span>
                      Talented People in
                      one place
                    </h2>
                    <p>You need to create an account to find the best and preferred job. lorem
                      Ipsum is simply dummy text of the printing and typesetting industry
                      the standard dummy text ever took.
                    </p>
                    <p>Find the best and preferred job. lorem
                      Ipsum is simply dummy text of the printing and typesetting industry
                      the standard dummy text ever since the  when an printer took.
                    </p>
                  </div>
                  {/* title="" END*/}
                  <div className="twm-read-more">
                    <NavLink to={publicUser.pages.ABOUT} className="site-button">About More</NavLink>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* GET JOBS SECTION SECTION END */}

      {}

      {/* Portfolio SECTION START */}
      <div className="section-full p-t120 p-b90 site-bg-white twm-featured-city-carousal-area">
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
                  <h2 className="wt-title">Find your favourite jobs and get.</h2>
                </div>
                {/* title="" END*/}
              </div>
              <div className="col-xl-7 col-lg-7 col-md-12 wt-separator-two-part-right text-right">
                <NavLink to={publicUser.jobs.LIST} className=" site-button">View All Locations</NavLink>
              </div>
            </div>
          </div>
          {/* title="" END*/}
        </div>
        <div className="twm-featured-city-carousal-wrap">
          <div className="owl-carousel twm-featured-city-carousal">
            <div className="item">
              {/*1*/}
              <div className="twm-featured-city2">
                <div className="twm-media" style={{ backgroundImage: `url(${publicUrlFor("images/gallery/1.jpg")})` }}>
                </div>
              </div>
            </div>
            <div className="item">
              {/*2*/}
              <div className="twm-featured-city2">
                <div className="twm-media" style={{ backgroundImage: `url(${publicUrlFor("images/gallery/2.jpg")})` }}>
                </div>
              </div>
            </div>
            <div className="item">
              {/*3*/}
              <div className="twm-featured-city2">
                <div className="twm-media" style={{ backgroundImage: `url(${publicUrlFor("images/gallery/3.jpg")})` }}>
                </div>
              </div>
            </div>
            <div className="item">
              {/*4*/}
              <div className="twm-featured-city2">
                <div className="twm-media" style={{ backgroundImage: `url(${publicUrlFor("images/gallery/4.jpg")})` }}>
                </div>
              </div>
            </div>
            <div className="item">
              {/*5*/}
              <div className="twm-featured-city2">
                <div className="twm-media" style={{ backgroundImage: `url(${publicUrlFor("images/gallery/5.jpg")})` }}>
                </div>
              </div>
            </div>
          </div>
        </div>
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
              {loading && (
                <div className="row d-flex justify-content-center m-b30">
                  <div className="col-12 text-center">
                    <p>Loading candidates...</p>
                  </div>
                </div>
              )}
              {!loading && (
                <>
                  <div className="row d-flex justify-content-center m-b30">
                    {candidates.length > 0 ? (
                      candidates.map((candidate) => (
                        <div key={candidate.id} className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                          <div className="twm-candidates-grid-h-page7 m-b30">
                            <div className="twm-top-section-content">
                              <div className="twm-media">
                                <div className="twm-media-pic">
                                  <JobZImage src={getCandidateProfilePictureUrl(candidate.profile_picture) || "images/candidates/pic1.jpg"} alt={candidate.full_name} />
                                </div>
                              </div>
                              <div className="twm-mid-content">
                                <div className="twm-candidates-tag"><span>{candidate.status || 'Featured'}</span></div>
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
                    <NavLink to={publicUser.candidate.LIST} className=" site-button">All  Candidates</NavLink>
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
                      <NavLink to={publicUser.pages.ABOUT} className="site-button">More Offers</NavLink>
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
      <div id="our-blogs" className="section-full p-t120 p-b90 site-bg-gray">
        <div className="container">
          {/* title="" START*/}
          <div className="section-head center wt-small-separator-outer">
            <div className="wt-small-separator site-text-primary">
              <div>Our Blogs</div>
            </div>
            <h2 className="wt-title">Latest Article</h2>
          </div>
          {/* title="" END*/}
          <div className="section-content">
            {blogsLoading ? (
              <div className="text-center p-5">
                <p>Loading blogs...</p>
              </div>
            ) : blogs.length > 0 ? (
              <div className="twm-blog-post-1-outer-wrap">
                <div className="owl-carousel twm-la-home-blog owl-btn-bottom-center">
                  {blogs.map((blog) => (
                    <div key={blog.id} className="item">
                      <div className="blog-post twm-blog-post-1-outer">
                        <div className="wt-post-media">
                          <NavLink to={publicUser.blog.DETAIL}>
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
                              <NavLink to={publicUser.blog.DETAIL}>{blog.title}</NavLink>
                            </h4>
                          </div>
                          <div className="wt-post-text">
                            <p>{blog.description}</p>
                          </div>
                          <div className="wt-post-readmore">
                            <NavLink to={publicUser.blog.DETAIL} className="site-button-link site-text-primary">Read More</NavLink>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center p-5">
                <p>No blogs available</p>
              </div>
            )}
          </div>
        </div>
      </div>
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
                    <form className="cons-contact-form" method="post">
                      <div className="row">
                        <div className="col-lg-6 col-md-6">
                          <div className="form-group mb-3">
                            <input name="username" type="text" required className="form-control" placeholder="Name" />
                          </div>
                        </div>
                        <div className="col-lg-6 col-md-6">
                          <div className="form-group mb-3">
                            <input name="email" type="text" className="form-control" required placeholder="Email" />
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
                        <div className="c-info-column">
                          <div className="c-info-icon"><i className="fas fa-file-alt" /></div>
                          <h3 className="twm-title">Commercial Registration</h3>
                          <p>MT/AA/14/673/2513971/2011</p>
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
                    <JobZImage src={getCandidateProfilePictureUrl(candidateDetails.profile_picture) || getCandidateProfilePictureUrl(selectedCandidate.profile_picture) || "images/candidates/pic1.jpg"} alt={candidateDetails.name} className="cv-profile-photo" />
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
                      <span className="cv-info-value">{candidateDetails.date_of_birth || "-"}</span>
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
                      <span className="cv-info-value">{candidateDetails.skill_level || "-"}</span>
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
                      {Array.isArray(candidateDetails.language_skills) ? (
                        candidateDetails.language_skills.map((lang, index) => (
                          <span key={index} className="cv-skill-tag">{lang}</span>
                        ))
                      ) : (
                        <span className="cv-skill-tag">{candidateDetails.language_skills}</span>
                      )}
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
                  <a href={`https://wa.me/?text=Hi ${candidateDetails.name}, I'm interested in your profile`} target="_blank" rel="noopener noreferrer" className="cv-action-btn cv-whatsapp-action">
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
