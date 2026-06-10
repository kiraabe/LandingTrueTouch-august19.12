import { publicUrlFor } from "../../../globals/constants";
import JobZImage from "../jobz-img";
import { NavLink } from "react-router-dom";
import { publicUser } from "../../../globals/route-names";

function Footer1() {
    return (
        <>
            <footer className="footer-dark" style={{ backgroundImage: `url(${publicUrlFor("images/f-bg.jpg")})` }}>
                <div className="container">
                    {/* NEWS LETTER SECTION START */}
                    <div className="ftr-nw-content">
                        <div className="row">
                            <div className="col-md-5">
                                <div className="ftr-nw-title">
                                    Need skilled workers? Subscribe to get updates on new recruitment solutions,
                                    industry insights, and exclusive staffing opportunities.
                                </div>
                            </div>
                            <div className="col-md-7">
                                <form>
                                    <div className="ftr-nw-form">
                                        <input name="news-letter" className="form-control" placeholder="Enter Your Email" type="text" />
                                        <button className="ftr-nw-subcribe-btn">Subscribe Now</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    {/* NEWS LETTER SECTION END */}
                    {/* FOOTER BLOCKES START */}
                    <div className="footer-top">
                        <div className="row">
                            <div className="col-lg-3 col-md-12">
                                <div className="widget widget_about">
                                    <div className="logo-footer clearfix">
                                        <NavLink to={publicUser.HOME1}><JobZImage id="skin_footer_dark_logo" src="images/truetouch-logo.webp" alt="TrueTouch Logo" /></NavLink>
                                    </div>
                                    <p>True Touch is a premium manpower recruitment agency connecting talented workers from Asia and Africa with leading employers across the Gulf and Middle East.</p>
                                    <ul className="ftr-list">
                                        <li><p><span>Email :</span><a href="mailto:info@truetouchrecruitment.com">info@truetouchrecruitment.com</a></p></li>
                                        <li><p><span>Call :</span><a href="tel:+251911208322">+251 91 120 8322</a></p></li>
                                        <li><p><span>Offices :</span>Qatar, Oman, Kenya, Philippines</p></li>
                                    </ul>
                                </div>
                            </div>
                            <div className="col-lg-9 col-md-12">
                                <div className="row">
                                    <div className="col-lg-4 col-md-6 col-sm-6">
                                        <div className="widget widget_services ftr-list-center">
                                            <h3 className="widget-title">For Employers</h3>
                                            <ul>
                                                <li><a href="#home">Home</a></li>
                                                <li><a href="#get-jobs">Our Services</a></li>
                                                <li><a href="#contact-us">Request Quote</a></li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="col-lg-4 col-md-6 col-sm-6">
                                        <div className="widget widget_services ftr-list-center">
                                            <h3 className="widget-title">Our Services</h3>
                                            <ul>
                                                <li><a href="#get-jobs">Manpower Supply</a></li>
                                                <li><a href="#candidates">Talent Pool</a></li>
                                                <li><a href="#our-blogs">News</a></li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="col-lg-4 col-md-6 col-sm-6">
                                        <div className="widget widget_services ftr-list-center">
                                            <h3 className="widget-title">Service Areas</h3>
                                            <ul>
                                                <li><a href="#home">Qatar & Oman</a></li>
                                                <li><a href="#get-jobs">Saudi Arabia</a></li>
                                                <li><a href="#contact-us">Gulf Region</a></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* FOOTER COPYRIGHT */}
                    <div className="footer-bottom">
                        <div className="footer-bottom-info">
                            <div className="footer-copy-right">
                                <span className="copyrights-text">Copyright © 2024 True Touch Foreign Employment Recruitment Agency. All Rights Reserved.</span>
                            </div>
                            <ul className="social-icons">
                                <li><a href="https://www.facebook.com/" className="fab fa-facebook-f" /></li>
                                <li><a href="https://www.twitter.com/" className="fab fa-twitter" /></li>
                                <li><a href="https://www.instagram.com/" className="fab fa-instagram" /></li>
                                <li><a href="https://www.youtube.com/" className="fab fa-youtube" /></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </footer>

        </>
    )
}

export default Footer1;
