import JobZImage from "../jobz-img";
import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { publicUser } from "../../../globals/route-names";
import { publicUrlFor } from "../../../globals/constants";
import "./footer3.css";

function Footer3() {
    const [currentLanguage, setCurrentLanguage] = useState(() => document.documentElement.lang || "en");
    const isArabic = currentLanguage === "ar";

    useEffect(() => {
        const handleLanguageChange = (event) => setCurrentLanguage(event.detail.language);
        document.addEventListener("languagechange", handleLanguageChange);
        return () => document.removeEventListener("languagechange", handleLanguageChange);
    }, []);

    return (
        <>
            <footer className={`footer-light ftr-light-with-bg site-bg-cover${isArabic ? ' footer3-rtl' : ''}`} dir={isArabic ? 'rtl' : 'ltr'} style={{ backgroundImage: `url(${publicUrlFor("images/ftr-bg.jpg")})`, backgroundSize: "cover" }}>
                <div className="container">
                    {/* FOOTER BLOCKES START */}
                    <div className="footer-top">
                        <div className="row">
                            <div className="col-lg-3 col-md-12">
                                <div className="widget widget_about">
                                    <div className="logo-footer clearfix">
                                        <NavLink to={publicUser.INITIAL}><JobZImage id="skin_footer_light_logo" src="images/logo-dark.png" alt="TrueTouch Logo" /></NavLink>
                                    </div>
                                    <p>{isArabic ? 'ربط أصحاب العمل بأفضل الكوادر لمتطلبات التوظيف المحلية والدولية.' : 'Connecting employers with top talent for local and international recruitment needs.'}</p>
                                    <ul className="ftr-list">
                                        <li><p><span>{isArabic ? 'البريد الإلكتروني :' : 'Email :'}</span><a href="mailto:truetouchaddis@gmail.com">truetouchaddis@gmail.com</a></p></li>
                                        <li><p><span>{isArabic ? 'الهاتف :' : 'Call :'}</span><a href="tel:+251911208322">+251 91 120 8322</a></p></li>
                                        <li><p><span>{isArabic ? 'التسجيل :' : 'Registration :'}</span>MT/AA/14/673/2513971/2011</p></li>
                                    </ul>
                                </div>
                            </div>
                            <div className="col-lg-9 col-md-12">
                                <div className="row">
                                    <div className="col-lg-4 col-md-6 col-sm-6">
                                        <div className="widget widget_services ftr-list-center">
                                            <h3 className="widget-title">{isArabic ? 'لأصحاب العمل' : 'For Employers'}</h3>
                                            <ul>
                                                <li><NavLink to={publicUser.HOME1}>{isArabic ? 'الرئيسية' : 'Home'}</NavLink></li>
                                                <li><a href="#portfolio" onClick={(e) => { e.preventDefault(); document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' }); }}>{isArabic ? 'من نحن' : 'About Us'}</a></li>
                                                <li><a href="#contact-us" onClick={(e) => { e.preventDefault(); document.getElementById('contact-us')?.scrollIntoView({ behavior: 'smooth' }); }}>{isArabic ? 'اتصل بنا' : 'Contact Us'}</a></li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="col-lg-4 col-md-6 col-sm-6">
                                        <div className="widget widget_services ftr-list-center">
                                            <h3 className="widget-title">{isArabic ? 'مصادر مفيدة' : 'Helpful Resources'}</h3>
                                            <ul>
                                                <li><a href="#portfolio" onClick={(e) => { e.preventDefault(); document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' }); }}>{isArabic ? 'معرض الأعمال' : 'Portfolio'}</a></li>
                                                <li><a href="#candidates" onClick={(e) => { e.preventDefault(); document.getElementById('candidates')?.scrollIntoView({ behavior: 'smooth' }); }}>{isArabic ? 'المرشحون' : 'Candidates'}</a></li>
                                                <li><a href="#our-blogs" onClick={(e) => { e.preventDefault(); document.getElementById('our-blogs')?.scrollIntoView({ behavior: 'smooth' }); }}>{isArabic ? 'الوظائف الشاغرة' : 'Vacancies'}</a></li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="col-lg-4 col-md-6 col-sm-6">
                                        <div className="widget widget_services ftr-list-center">
                                            <h3 className="widget-title">{isArabic ? 'روابط سريعة' : 'Quick Links'}</h3>
                                            <ul>
                                                <li><NavLink to={publicUser.HOME1}>{isArabic ? 'الرئيسية' : 'Home'}</NavLink></li>
                                                <li><a href="#portfolio" onClick={(e) => { e.preventDefault(); document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' }); }}>{isArabic ? 'من نحن' : 'About Us'}</a></li>
                                                <li><a href="#candidates" onClick={(e) => { e.preventDefault(); document.getElementById('candidates')?.scrollIntoView({ behavior: 'smooth' }); }}>{isArabic ? 'المرشحون' : 'Candidates'}</a></li>
                                                <li><a href="#contact-us" onClick={(e) => { e.preventDefault(); document.getElementById('contact-us')?.scrollIntoView({ behavior: 'smooth' }); }}>{isArabic ? 'اتصل بنا' : 'Contact Us'}</a></li>
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
                                <span className="copyrights-text">{isArabic ? `حقوق الطبع والنشر © ${new Date().getFullYear()} تم التطوير بواسطة EKD Tech. جميع الحقوق محفوظة.` : `Copyright © ${new Date().getFullYear()} Powered by EKD Tech. All Rights Reserved.`}</span>
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

export default Footer3;
