import JobZImage from "../jobz-img";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { publicUser } from "../../../globals/route-names";
import { useState, useEffect } from "react";
import "./header1.css";

function Header1({ _config }) {

    const [menuActive, setMenuActive] = useState(false);
    const [activeSection, setActiveSection] = useState("home");
    const [currentLanguage, setCurrentLanguage] = useState("en");
    const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    function handleNavigationClick() {
        setMenuActive(!menuActive);
    }

    useEffect(() => {
        const handleScroll = () => {
            const sections = ["get-jobs", "candidates", "our-blogs", "contact-us"];
            let currentSection = "home";

            for (const sectionId of sections) {
                const element = document.getElementById(sectionId);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    if (rect.top <= 150) {
                        currentSection = sectionId;
                    }
                }
            }

            setActiveSection(currentSection);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const isNavLinkActive = (sectionId) => {
        if (sectionId === "home") {
            return location.pathname === "/" || location.pathname === publicUser.HOME1;
        }
        return activeSection === sectionId;
    };

    const handleSectionClick = (sectionId, e) => {
        e.preventDefault();
        setMenuActive(false);

        if (location.pathname !== "/" && location.pathname !== publicUser.HOME1) {
            navigate(publicUser.HOME1, { replace: false });
            setTimeout(() => {
                const element = document.getElementById(sectionId);
                if (element) {
                    element.scrollIntoView({ behavior: "smooth" });
                }
            }, 100);
        } else {
            const element = document.getElementById(sectionId);
            if (element) {
                element.scrollIntoView({ behavior: "smooth" });
            }
        }
    };

    const handleLanguageChange = (lang) => {
        setCurrentLanguage(lang);
        setShowLanguageDropdown(false);
    };

    const languageLabels = {
        en: "English",
        ar: "Arabic",
        am: "Amharic"
    };

    return (
        <>
        <header className={"site-header " + _config.style + " mobile-sider-drawer-menu " + (menuActive ? "active" : "")}>
                            <div className="sticky-header main-bar-wraper navbar-expand-lg">
                    <div className="main-bar">
                        <div className="container-fluid clearfix">
                            <div className="logo-header">
                                <div className="logo-header-inner logo-header-one">
                                    <a href="/" onClick={(e) => {
                                        e.preventDefault();
                                        if (location.pathname !== "/" && location.pathname !== publicUser.HOME1) {
                                            navigate(publicUser.INITIAL, { replace: false });
                                            setTimeout(() => {
                                                const element = document.getElementById('home-hero');
                                                if (element) {
                                                    element.scrollIntoView({ behavior: 'smooth' });
                                                }
                                            }, 100);
                                        } else {
                                            const element = document.getElementById('home-hero');
                                            if (element) {
                                                element.scrollIntoView({ behavior: 'smooth' });
                                            }
                                        }
                                    }}>
                                        <JobZImage src="images/logo-dark.png" alt="TrueTouch Logo" />
                                    </a>
                                </div>
                            </div>
                            {/* NAV Toggle Button */}
                            <button id="mobile-side-drawer"
                                data-target=".header-nav"
                                data-toggle="collapse"
                                type="button"
                                className="navbar-toggler collapsed"
                                onClick={handleNavigationClick}
                            >
                                <span className="sr-only">Toggle navigation</span>
                                <span className="icon-bar icon-bar-first" />
                                <span className="icon-bar icon-bar-two" />
                                <span className="icon-bar icon-bar-three" />
                            </button>
                            {/* MAIN Vav */}
                            <div className="nav-animation header-nav navbar-collapse collapse d-flex">
                                <div className="mobile-drawer-search">
                                    <input type="text" placeholder="Search for..." className="mobile-drawer-search-input" />
                                    <button className="mobile-drawer-search-btn"><i className="feather-search" /></button>
                                </div>
                                <div className="mobile-drawer-logo">
                                    <a href="/" onClick={(e) => {
                                        e.preventDefault();
                                        setMenuActive(false);
                                        if (location.pathname !== "/" && location.pathname !== publicUser.HOME1) {
                                            navigate(publicUser.INITIAL, { replace: false });
                                            setTimeout(() => {
                                                const element = document.getElementById('home-hero');
                                                if (element) {
                                                    element.scrollIntoView({ behavior: 'smooth' });
                                                }
                                            }, 100);
                                        } else {
                                            const element = document.getElementById('home-hero');
                                            if (element) {
                                                element.scrollIntoView({ behavior: 'smooth' });
                                            }
                                        }
                                    }}>
                                        <JobZImage src="images/logo-dark.png" alt="TrueTouch Logo" />
                                    </a>
                                </div>
                                <ul className=" nav navbar-nav">
                                    <li className={isNavLinkActive("home") ? "nav-link-active" : ""}>
                                        <a href="/" onClick={(e) => {
                                            e.preventDefault();
                                            setMenuActive(false);
                                            if (location.pathname !== "/" && location.pathname !== publicUser.HOME1) {
                                                navigate(publicUser.INITIAL, { replace: false });
                                                setTimeout(() => {
                                                    const element = document.getElementById('home-hero');
                                                    if (element) {
                                                        element.scrollIntoView({ behavior: 'smooth' });
                                                    }
                                                }, 100);
                                            } else {
                                                const element = document.getElementById('home-hero');
                                                if (element) {
                                                    element.scrollIntoView({ behavior: 'smooth' });
                                                }
                                            }
                                        }}>Home</a>
                                    </li>
                                    <li className={isNavLinkActive("get-jobs") ? "nav-link-active" : ""}>
                                        <a href="#get-jobs" onClick={(e) => handleSectionClick("get-jobs", e)}>About Us</a>
                                    </li>
                                    <li className={location.pathname === publicUser.candidate.GRID ? "nav-link-active" : ""}>
                                        <NavLink to={publicUser.candidate.GRID} onClick={() => setMenuActive(false)}>Candidates</NavLink>
                                    </li>
                                    <li className={isNavLinkActive("our-blogs") ? "nav-link-active" : ""}>
                                        <a href="#our-blogs" onClick={(e) => handleSectionClick("our-blogs", e)}>Vacancies</a>
                                    </li>
                                    <li className={isNavLinkActive("contact-us") ? "nav-link-active" : ""}>
                                        <a href="#contact-us" onClick={(e) => handleSectionClick("contact-us", e)}>Contact Us</a>
                                    </li>
                                </ul>
                            </div>
                            {/* Header Right Section*/}
                            <div className="extra-nav header-2-nav">
                                <div className="extra-cell">
                                    <div className="header-search">
                                        <a href="#search" className="header-search-icon"><i className="feather-search" /></a>
                                    </div>
                                </div>
                                <div className="extra-cell">
                                    <div className="language-switcher-wrapper">
                                        <button
                                            className="language-switcher-btn"
                                            onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                                            title="Select language"
                                        >
                                            <i className="feather-globe" />
                                            <span className="language-label">{languageLabels[currentLanguage]}</span>
                                            <i className="feather-chevron-down" />
                                        </button>
                                        {showLanguageDropdown && (
                                            <div className="language-dropdown">
                                                <button
                                                    className={`language-option ${currentLanguage === 'en' ? 'active' : ''}`}
                                                    onClick={() => handleLanguageChange('en')}
                                                >
                                                    English
                                                </button>
                                                <button
                                                    className={`language-option ${currentLanguage === 'ar' ? 'active' : ''}`}
                                                    onClick={() => handleLanguageChange('ar')}
                                                >
                                                    العربية
                                                </button>
                                                <button
                                                    className={`language-option ${currentLanguage === 'am' ? 'active' : ''}`}
                                                    onClick={() => handleLanguageChange('am')}
                                                >
                                                    አማርኛ
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* SITE Search */}
                    <div id="search">
                        <span className="close" />
                        <form role="search" id="searchform" className="radius-xl" onSubmit={(e) => {
                            e.preventDefault();
                            const query = e.target.q.value.trim();
                            if (query) {
                                navigate(`${publicUser.HOME1}?search=${encodeURIComponent(query)}`);
                                document.querySelector('#search .close')?.click();
                            }
                        }}>
                            <input className="form-control" name="q" type="search" placeholder="Type to search" />
                            <span className="input-group-append">
                                <button type="submit" className="search-btn">
                                    <i className="fa fa-paper-plane" />
                                </button>
                            </span>
                        </form>
                    </div>
                </div>
            </header>

        </>
    )
}

export default Header1;
