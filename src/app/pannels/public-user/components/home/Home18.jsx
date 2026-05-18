import { useState, useEffect } from "react";
import JobZImage from "../../../../common/jobz-img";
import { loadScript, publicUrlFor, updateSkinStyle } from "../../../../../globals/constants";
import { publicUser } from "../../../../../globals/route-names";
import { NavLink } from "react-router-dom";
import api from "../../../../../services/api";

function Home18Page() {
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    location: ""
  });
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    updateSkinStyle("10", false, false);
    loadScript("js/custom.js");
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [jobsResponse, candidatesResponse] = await Promise.all([
        api.getJobs({ limit: 10 }),
        api.getCandidates({ limit: 8 })
      ]);

      if (jobsResponse.success) {
        setJobs(jobsResponse.data);
        if (jobsResponse.isOffline) setIsOffline(true);
      }
      if (candidatesResponse.success) {
        setCandidates(candidatesResponse.data);
        if (candidatesResponse.isOffline) setIsOffline(true);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setIsOffline(true);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearchJobs = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await api.getJobs({
        title: formData.title || undefined,
        category: formData.category || undefined,
        location: formData.location || undefined,
        limit: 10
      });
      if (response.success) {
        setJobs(response.data);
      }
    } catch (error) {
      console.error("Error searching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {isOffline && (
        <div style={{
          backgroundColor: '#fff3cd',
          color: '#856404',
          padding: '12px 20px',
          borderBottom: '1px solid #ffc107',
          fontSize: '14px',
          textAlign: 'center'
        }}>
          <strong>⚠️ Demo Mode:</strong> Backend server not running. Showing sample data. To connect to real database, start the Node.js backend with <code style={{ backgroundColor: '#fff8e1', padding: '2px 6px', borderRadius: '3px' }}>npm run dev</code>
        </div>
      )}
      <div className="twm-home18-banner-section">
        <div className="row" style={{ backgroundImage: `url(${publicUrlFor("images/home-18/banner/dot-map.png")})` }}>
          {/*Left Section*/}
          <div className="col-xl-6 col-lg-6 col-md-12">
            <div className="twm-bnr-left-section">
              <div className="twm-bnr-title-small">We Have <span className="site-text-primary">208,000+</span> Live Jobs</div>
              <div className="twm-bnr-title-large">Find the <span className="site-text-primary">job</span> that fits your life</div>
              <div className="twm-bnr-discription">Type your keyword, then click search to find your perfect job.</div>
              <div className="twm-bnr-search-bar">
                <form onSubmit={handleSearchJobs}>
                  <div className="row">
                    {/*Title*/}
                    <div className="form-group col-xl-3 col-lg-6 col-md-6">
                      <label>What</label>
                      <input 
                        type="text"
                        name="title"
                        placeholder="Job Title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="form-control"
                      />
                    </div>
                    {/*Category*/}
                    <div className="form-group col-xl-3 col-lg-6 col-md-6">
                      <label>Type</label>
                      <input 
                        type="text"
                        name="category"
                        placeholder="Category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="form-control"
                      />
                    </div>
                    {/*Location*/}
                    <div className="form-group col-xl-3 col-lg-6 col-md-6">
                      <label>Location</label>
                      <div className="twm-inputicon-box">
                        <input 
                          name="location"
                          type="text"
                          value={formData.location}
                          onChange={handleInputChange}
                          className="form-control"
                          placeholder="Search..."
                        />
                        <i className="twm-input-icon fas fa-map-marker-alt" />
                      </div>
                    </div>
                    {/*Find job btn*/}
                    <div className="form-group col-xl-3 col-lg-6 col-md-6">
                      <button type="submit" className="site-button" disabled={loading}>
                        {loading ? "Searching..." : "Find Job"}
                      </button>
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
                <div className="swiper v-notiinfoSwiper v-noti-slider-h-page-18">
                  <div className="swiper-wrapper">
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
                  <div className="swiper-pagination" />
                </div>
              </div>
              <div className="twm-shape-l bounce" />
              <div className="twm-shape-2 bounce2" />
            </div>
          </div>
        </div>
      </div>

      {/* FEATURED SECTION START */}
      <div className="section-full p-t120 p-b90 site-bg-white twm-featured-city-area">
        <div className="container">
          <div className="section-head center wt-small-separator-outer">
            <div className="wt-small-separator site-text-primary">
              <div>Featured Cities</div>
            </div>
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
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <div key={num} className="item">
                        <div className="ow-client-logo">
                          <div className="client-logo client-logo-media">
                            <NavLink to={publicUser.employer.LIST}>
                              <JobZImage src={`images/client-logo2/w${num}.png`} alt="" />
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
                  <div className="section-head left wt-small-separator-outer">
                    <div className="wt-small-separator site-text-primary">
                      <div>Get Jobs</div>
                    </div>
                    <h2 className="wt-title">Get World <span className="site-text-primary">1500+</span>
                      Talented People in one place
                    </h2>
                    <p>You need to create an account to find the best and preferred job.</p>
                    <p>Find the best and preferred job with us today.</p>
                  </div>
                  <div className="twm-read-more">
                    <NavLink to={publicUser.pages.ABOUT} className="site-button">About More</NavLink>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* GET JOBS SECTION END */}

      {/* CANDIDATES START */}
      <div id="candidates" className="section-full p-t120 p-b90 site-bg-white twm-candidate-h-page7-wrap pos-relative">
        <div className="container">
          <div className="section-head center wt-small-separator-outer">
            <div className="wt-small-separator site-text-primary">
              <div>Candidates</div>
            </div>
            <h2 className="wt-title">Featured Candidates</h2>
          </div>
        </div>
        <div className="container-fluid">
          <div className="section-content">
            <div className="twm-candidate-h-page7">
              <div className="row d-flex justify-content-center m-b30">
                {candidates.length > 0 ? (
                  candidates.map((candidate) => (
                    <div key={candidate.id} className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                      <div className="twm-candidates-grid-h-page7 m-b30">
                        <div className="twm-top-section-content">
                          <div className="twm-media">
                            <div className="twm-media-pic">
                              <JobZImage src={candidate.image_url || "images/candidates/pic1.jpg"} alt={candidate.name} />
                            </div>
                          </div>
                          <div className="twm-mid-content">
                            <div className="twm-candidates-tag"><span>Featured</span></div>
                            <NavLink to={publicUser.candidate.DETAIL1} className="twm-job-title">
                              <h4>{candidate.name}</h4>
                            </NavLink>
                            <p>{candidate.profession}</p>
                          </div>
                        </div>
                        <div className="twm-fot-content">
                          <div className="twm-left-info">
                            <p className="twm-candidate-address"><i className="feather-map-pin" />{candidate.location}</p>
                            <div className="twm-jobs-vacancies">{candidate.rate}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-12 text-center">
                    <p>No candidates found</p>
                  </div>
                )}
              </div>
              <div className="text-center m-b30">
                <NavLink to={publicUser.candidate.LIST} className="site-button">All Candidates</NavLink>
              </div>
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
                      <h2 className="wt-title">We also have <span className="site-text-primary">job offers</span> in other countries</h2>
                    </div>
                    <div className="twm-j-ofr-map-list">
                      <ul>
                        {['Denmark', 'France', 'Netherlands', 'Poland', 'Portugal', 'Spain', 'Turkey', 'UAE', 'UK'].map((country, idx) => (
                          <li key={idx}>
                            <div className="flag-list">
                              <span><JobZImage src={`images/home-7/flag-icon/${country.toLowerCase()}.jpg`} alt={country} /></span>
                              <h4 className="flat-name">{country}</h4>
                            </div>
                          </li>
                        ))}
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
                            <textarea name="message" className="form-control" rows={3} placeholder="Message" />
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
                          <p><a href="tel:+216-761-8331">+2 900 234 4241</a></p>
                          <p><a href="tel:+216-761-8331">+2 900 234 3219</a></p>
                        </div>
                        <div className="c-info-column">
                          <div className="c-info-icon"><i className="fas fa-envelope" /></div>
                          <h3 className="twm-title">Support</h3>
                          <p>infohelp@gmail.com</p>
                          <p>support12@gmail.com</p>
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
    </>
  );
}

export default Home18Page;
