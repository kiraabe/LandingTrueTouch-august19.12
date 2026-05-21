import JobZImage from "../../../../common/jobz-img";
import { loadScript, publicUrlFor, updateSkinStyle } from "../../../../../globals/constants";
import { publicUser } from "../../../../../globals/route-names";
import { NavLink } from "react-router-dom";
import { useEffect } from "react";
import { useLandingData, useFeaturedCandidates, useFeaturedLocations } from "../../../../../hooks/useLanding";
import { useLatestBlogs } from "../../../../../hooks/useBlogs";
import { useFeaturedCompanies } from "../../../../../hooks/useCompanies";
import LoadingSkeleton from "../../../../../components/LoadingSkeleton";

function Home18Page() {
  const { data: landingData, loading: landingLoading } = useLandingData();
  const { candidates, loading: candidatesLoading } = useFeaturedCandidates(8);
  const { locations, loading: locationsLoading } = useFeaturedLocations(3);
  const { companies, loading: companiesLoading } = useFeaturedCompanies(10);
  const { blogs, loading: blogsLoading } = useLatestBlogs(3);

  useEffect(() => {
    updateSkinStyle("10", false, false)
    loadScript("js/custom.js")
  })

  return (
    <>
      <div className="twm-home18-banner-section">
        <div className="row" style={{ backgroundImage: `url(${publicUrlFor("images/home-18/banner/dot-map.png")})` }}>
          {/*Left Section*/}
          <div className="col-xl-6 col-lg-6 col-md-12">
            <div className="twm-bnr-left-section">
              <div className="twm-bnr-title-small">
                We Have <span className="site-text-primary">
                  {landingLoading ? 'Loading...' : (landingData?.stats?.total_jobs || '0').toLocaleString()}+
                </span> Live Jobs
              </div>
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
            {locationsLoading ? (
              <LoadingSkeleton count={3} type="card" />
            ) : locations && locations.length > 0 ? (
              <div className="row">
                {locations.map((location, index) => (
                  <div key={location.id} className={index === 0 ? "col-xl-8 col-lg-8 col-md-12" : "col-lg-12 col-md-12"}>
                    <div className={index === 0 ? "twm-featured-city twm-large-block" : "twm-featured-city"}>
                      <div className="twm-media">
                        <JobZImage 
                          src={location.image_path || `images/featured-cities/city${index + 1}.jpg`} 
                          alt={location.name} 
                        />
                        <div className="twm-city-info">
                          <div className="twm-city-jobs">{location.job_count || 0} Jobs</div>
                          <h4 className="twm-title"><NavLink to={publicUser.jobs.LIST}>{location.name}</NavLink></h4>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
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
                    Trusted by more than <span className="site-text-primary">+{companies.length} companies</span>
                  </div>
                </div>
                <div className="col-xl-8 col-lg-12">
                  {companiesLoading ? (
                    <LoadingSkeleton count={5} type="line" height="60px" />
                  ) : companies && companies.length > 0 ? (
                    <div className="owl-carousel home-client-carousel6 owl-btn-vertical-center">
                      {companies.map((company) => (
                        <div key={company.id} className="item">
                          <div className="ow-client-logo">
                            <div className="client-logo client-logo-media">
                              <NavLink to={publicUser.employer.LIST}>
                                <JobZImage 
                                  src={company.logo_path || 'images/client-logo2/w1.png'} 
                                  alt={company.company_name} 
                                  title={company.company_name}
                                />
                              </NavLink>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
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
                    <h2 className="wt-title">Get World <span className="site-text-primary">{landingData?.stats?.total_candidates || '1500'}+</span>
                      Talented People in one place
                    </h2>
                    <p>You need to create an account to find the best and preferred job. lorem
                      Ipsum is simply dummy text of the printing and typesetting industry
                      the standard dummy text ever took.
                    </p>
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
      {/* GET JOBS SECTION SECTION END */}

      {/* CANDIDATES START */}
      <div id="candidates" className="section-full p-t120 p-b90 site-bg-white twm-candidate-h-page7-wrap pos-relative ">
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
                {candidatesLoading ? (
                  <LoadingSkeleton count={8} type="card" />
                ) : candidates && candidates.length > 0 ? (
                  candidates.map((candidate) => (
                    <div key={candidate.id} className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                      <div className="twm-candidates-grid-h-page7 m-b30">
                        <div className="twm-top-section-content">
                          <div className="twm-media">
                            <div className="twm-media-pic">
                              <JobZImage 
                                src={candidate.profile_image || 'images/candidates/pic1.jpg'} 
                                alt={`${candidate.first_name} ${candidate.last_name}`} 
                              />
                            </div>
                          </div>
                          <div className="twm-mid-content">
                            {candidate.is_featured && <div className="twm-candidates-tag"><span>Featured</span></div>}
                            <NavLink to={publicUser.candidate.DETAIL1} className="twm-job-title">
                              <h4>{candidate.first_name} {candidate.last_name}</h4>
                            </NavLink>
                            <p>{candidate.title || 'Professional'}</p>
                          </div>
                        </div>
                        <div className="twm-fot-content">
                          <div className="twm-left-info">
                            <p className="twm-candidate-address"><i className="feather-map-pin" />{candidate.location || 'Not specified'}</p>
                            <div className="twm-jobs-vacancies">${candidate.expected_salary || 'N/A'}<span>/ Day</span></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : null}
              </div>
              <div className="text-center m-b30">
                <NavLink to={publicUser.candidate.LIST} className="site-button">All Candidates</NavLink>
              </div>
            </div>
          </div>
        </div>
        <div className="twm-bg-candi-pattern" />
      </div>
      {/* CANDIDATES END */}

      {/* OUR BLOG START */}
      <div id="our-blogs" className="section-full p-t120 p-b90 site-bg-gray">
        <div className="container">
          <div className="section-head center wt-small-separator-outer">
            <div className="wt-small-separator site-text-primary">
              <div>Our Blogs</div>
            </div>
            <h2 className="wt-title">Latest Article</h2>
          </div>
          <div className="section-content">
            <div className="twm-blog-post-1-outer-wrap">
              {blogsLoading ? (
                <LoadingSkeleton count={3} type="card" />
              ) : blogs && blogs.length > 0 ? (
                <div className="owl-carousel twm-la-home-blog owl-btn-bottom-center">
                  {blogs.map((blog) => (
                    <div key={blog.id} className="item">
                      <div className="blog-post twm-blog-post-1-outer">
                        <div className="wt-post-media">
                          <NavLink to={publicUser.blog.DETAIL}>
                            <JobZImage 
                              src={blog.featured_image || 'images/blog/latest/bg1.jpg'} 
                              alt={blog.title} 
                            />
                          </NavLink>
                        </div>
                        <div className="wt-post-info">
                          <div className="wt-post-meta">
                            <ul>
                              <li className="post-date">{new Date(blog.published_date).toLocaleDateString()}</li>
                              <li className="post-author">By {blog.author || 'Admin'}</li>
                            </ul>
                          </div>
                          <div className="wt-post-title">
                            <h4 className="post-title">
                              <NavLink to={publicUser.blog.DETAIL}>{blog.title}</NavLink>
                            </h4>
                          </div>
                          <div className="wt-post-text">
                            <p>{blog.excerpt || blog.content?.substring(0, 100) + '...'}</p>
                          </div>
                          <div className="wt-post-readmore">
                            <NavLink to={publicUser.blog.DETAIL} className="site-button-link site-text-primary">Read More</NavLink>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
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
  )
}
export default Home18Page;
