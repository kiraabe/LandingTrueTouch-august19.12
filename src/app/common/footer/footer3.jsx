import JobZImage from "../jobz-img";
import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { publicUser } from "../../../globals/route-names";
import { publicUrlFor } from "../../../globals/constants";
import "./footer3.css";

function Footer3() {
    const [currentLanguage, setCurrentLanguage] = useState("en");
    const isArabic = currentLanguage === "ar";
    const isAmharic = currentLanguage === "am";

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
                                    <p>{isAmharic ? 'አሠሪዎችን ለአገር ውስጥ እና ለዓለም አቀፍ የቅጥር ፍላጎቶች ከተመረጡ ባለሙያዎች ጋር ማገናኘት።' : isArabic ? 'ربط أصحاب العمل بأفضل الكوادر لمتطلبات التوظيف المحلية والدولية.' : 'Connecting employers with top talent for local and international recruitment needs.'}</p>
                                    <ul className="ftr-list">
                                        <li><p><span>{isAmharic ? 'ኢሜይል :' : isArabic ? 'البريد الإلكتروني :' : 'Email :'}</span><a href="mailto:truetouchaddis@gmail.com">truetouchaddis@gmail.com</a></p></li>
                                        <li><p><span>{isAmharic ? 'ስልክ :' : isArabic ? 'الهاتف :' : 'Call :'}</span><a href="tel:+251911208322">+251 91 120 8322</a></p></li>
                                        <li><p><span>{isAmharic ? 'ምዝገባ :' : isArabic ? 'التسجيل :' : 'Registration :'}</span>MT/AA/14/673/2513971/2011</p></li>
                                    </ul>
                                </div>
                            </div>
                            <div className="col-lg-9 col-md-12">
                                <div className="row">
                                    <div className="col-lg-4 col-md-6 col-sm-6">
                                        <div className="widget widget_services ftr-list-center">
                                            <h3 className="widget-title">{isAmharic ? 'ለአሠሪዎች' : isArabic ? 'لأصحاب العمل' : 'For Employers'}</h3>
                                            <ul>
                                                <li><NavLink to={publicUser.HOME1}>{isAmharic ? 'መነሻ' : isArabic ? 'الرئيسية' : 'Home'}</NavLink></li>
                                                <li><a href="#portfolio" onClick={(e) => { e.preventDefault(); document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' }); }}>{isAmharic ? 'ስለ እኛ' : isArabic ? 'من نحن' : 'About Us'}</a></li>
                                                <li><a href="#contact-us" onClick={(e) => { e.preventDefault(); document.getElementById('contact-us')?.scrollIntoView({ behavior: 'smooth' }); }}>{isAmharic ? 'ያግኙን' : isArabic ? 'اتصل بنا' : 'Contact Us'}</a></li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="col-lg-4 col-md-6 col-sm-6">
                                        <div className="widget widget_services ftr-list-center">
                                            <h3 className="widget-title">{isAmharic ? 'ጠቃሚ መረጃዎች' : isArabic ? 'مصادر مفيدة' : 'Helpful Resources'}</h3>
                                            <ul>
                                                <li><a href="#portfolio" onClick={(e) => { e.preventDefault(); document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' }); }}>{isAmharic ? 'የሥራ እንቅስቃሴዎች' : isArabic ? 'معرض الأعمال' : 'Portfolio'}</a></li>
                                                <li><a href="#candidates" onClick={(e) => { e.preventDefault(); document.getElementById('candidates')?.scrollIntoView({ behavior: 'smooth' }); }}>{isAmharic ? 'እጩዎች' : isArabic ? 'المرشحون' : 'Candidates'}</a></li>
                                                <li><a href="#our-blogs" onClick={(e) => { e.preventDefault(); document.getElementById('our-blogs')?.scrollIntoView({ behavior: 'smooth' }); }}>{isAmharic ? 'ክፍት የሥራ ቦታዎች' : isArabic ? 'الوظائف الشاغرة' : 'Vacancies'}</a></li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="col-lg-4 col-md-6 col-sm-6">
                                        <div className="widget widget_services ftr-list-center">
                                            <h3 className="widget-title">{isAmharic ? 'ፈጣን ማገናኛዎች' : isArabic ? 'روابط سريعة' : 'Quick Links'}</h3>
                                            <ul>
                                                <li><NavLink to={publicUser.HOME1}>{isAmharic ? 'መነሻ' : isArabic ? 'الرئيسية' : 'Home'}</NavLink></li>
                                                <li><a href="#portfolio" onClick={(e) => { e.preventDefault(); document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' }); }}>{isAmharic ? 'ስለ እኛ' : isArabic ? 'من نحن' : 'About Us'}</a></li>
                                                <li><a href="#candidates" onClick={(e) => { e.preventDefault(); document.getElementById('candidates')?.scrollIntoView({ behavior: 'smooth' }); }}>{isAmharic ? 'እጩዎች' : isArabic ? 'المرشحون' : 'Candidates'}</a></li>
                                                <li><a href="#contact-us" onClick={(e) => { e.preventDefault(); document.getElementById('contact-us')?.scrollIntoView({ behavior: 'smooth' }); }}>{isAmharic ? 'ያግኙን' : isArabic ? 'اتصل بنا' : 'Contact Us'}</a></li>
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
                                <span className="copyrights-text">{isAmharic ? `በ EKD Tech የበለፀገ። መብቱ በሕግ የተጠበቀ ነው © ${new Date().getFullYear()}።` : isArabic ? `حقوق الطبع والنشر © ${new Date().getFullYear()} تم التطوير بواسطة EKD Tech. جميع الحقوق محفوظة.` : `Copyright © ${new Date().getFullYear()} Powered by EKD Tech. All Rights Reserved.`}</span>
                            </div>
                            <ul className="social-icons">
                                <li><a href="https://www.facebook.com/" className="fab fa-facebook-f" /></li>
                                <li><a href="https://x.com/" className="footer-x-icon" aria-label="X">X</a></li>
                                <li><a href="https://www.instagram.com/" className="fab fa-instagram" /></li>
                                <li><a href="https://www.linkedin.com/" className="fab fa-linkedin-in" /></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </footer>


        </>
    )
}

export default Footer3;
