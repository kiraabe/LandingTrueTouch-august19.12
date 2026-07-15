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
    const [expandedSubmenu, setExpandedSubmenu] = useState(null);
    const [mobileSearchQuery, setMobileSearchQuery] = useState("");
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (menuActive) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [menuActive]);

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

    const handleToggleSubmenu = (submenuId) => {
        setExpandedSubmenu(expandedSubmenu === submenuId ? null : submenuId);
    };

    const handleMobileSearchSubmit = (e) => {
        e.preventDefault();
        const query = mobileSearchQuery.trim();
        if (query) {
            navigate(`${publicUser.HOME1}?search=${encodeURIComponent(query)}`);
            setMobileSearchQuery("");
            setMenuActive(false);
        }
    };

    const languageLabels = {
        en: "English",
        ar: "Arabic",
        am: "Amharic"
    };

    return (
        <>
        <header className={"site-header " + _config.style + " mobile-sider-drawer-menu " + (menuActive ? "drawer-open" : "")}>
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
                            type="button"
                            className="navbar-toggler"
                            onClick={() => setMenuActive(!menuActive)}
                        >
                            <span className="sr-only">Toggle navigation</span>
                            <span className="icon-bar icon-bar-first" />
                            <span className="icon-bar icon-bar-two" />
                            <span className="icon-bar icon-bar-three" />
                        </button>
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

                {/* MOBILE DRAWER OVERLAY */}
                {menuActive && (
                    <div className="mobile-drawer-overlay" onClick={() => setMenuActive(false)} />
                )}

                {/* MOBILE SIDE DRAWER */}
                <div className="mobile-side-drawer">
                    <div className="mobile-drawer-header">
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
                        <button className="mobile-drawer-close" onClick={() => setMenuActive(false)}>
                            <i className="feather-x" />
                        </button>
                    </div>

                    <form className="mobile-drawer-search" onSubmit={handleMobileSearchSubmit}>
                        <input
                            type="text"
                            placeholder="Search for..."
                            className="mobile-drawer-search-input"
                            value={mobileSearchQuery}
                            onChange={(e) => setMobileSearchQuery(e.target.value)}
                        />
                        <button type="submit" className="mobile-drawer-search-btn"><i className="feather-search" /></button>
                    </form>

                    <nav className="mobile-drawer-nav">
                        <ul className="mobile-nav-list">
                            <li className="mobile-nav-item">
                                <a 
                                    href="/" 
                                    className={`mobile-nav-link ${isNavLinkActive("home") ? "active" : ""}`}
                                    onClick={(e) => {
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
                                    }}
                                >
                                    Home
                                </a>
                            </li>
                            <li className="mobile-nav-item">
                                <a 
                                    href="#get-jobs" 
                                    className={`mobile-nav-link ${isNavLinkActive("get-jobs") ? "active" : ""}`}
                                    onClick={(e) => handleSectionClick("get-jobs", e)}
                                >
                                    About Us
                                </a>
                            </li>
                            <li className="mobile-nav-item">
                                <NavLink 
                                    to={publicUser.candidate.GRID} 
                                    className={`mobile-nav-link ${location.pathname === publicUser.candidate.GRID ? "active" : ""}`}
                                    onClick={() => setMenuActive(false)}
                                >
                                    Candidates
                                </NavLink>
                            </li>
                            <li className="mobile-nav-item">
                                <a 
                                    href="#our-blogs" 
                                    className={`mobile-nav-link ${isNavLinkActive("our-blogs") ? "active" : ""}`}
                                    onClick={(e) => handleSectionClick("our-blogs", e)}
                                >
                                    Vacancies
                                </a>
                            </li>
                            <li className="mobile-nav-item">
                                <a 
                                    href="#contact-us" 
                                    className={`mobile-nav-link ${isNavLinkActive("contact-us") ? "active" : ""}`}
                                    onClick={(e) => handleSectionClick("contact-us", e)}
                                >
                                    Contact Us
                                </a>
                            </li>
                        </ul>
                    </nav>
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
