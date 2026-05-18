import JobZImage from "../jobz-img";
import { NavLink, useLocation } from "react-router-dom";
import { publicUser } from "../../../globals/route-names";
import { useState, useEffect } from "react";

function Header1({ _config }) {

    const [menuActive, setMenuActive] = useState(false);
    const [activeSection, setActiveSection] = useState("home");
    const location = useLocation();

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
            return location.hash === "" || location.hash === "#";
        }
        return activeSection === sectionId;
    };

    return (
        <>
            <header className={"site-header " + _config.style + " mobile-sider-drawer-menu " + (menuActive ? "active" : "") }>
                <div className="sticky-header main-bar-wraper navbar-expand-lg">
                    <div className="main-bar">
                        <div className="container-fluid clearfix">
                            <div className="logo-header">
                                <div className="logo-header-inner logo-header-one">
                                    <NavLink to={publicUser.HOME1}>
                                        {
                                            _config.withBlackLogo
                                                ?
                                                <JobZImage src="images/logo-12.png" alt="" />
                                                :
                                                (
                                                    _config.withWhiteLogo
                                                        ?
                                                        <JobZImage src="images/logo-white.png" alt="" />
                                                        :
                                                        (
                                                            _config.withLightLogo ?
                                                                <>
                                                                    <JobZImage id="skin_header_logo_light" src="images/logo-light-3.png" alt="" className="default-scroll-show" />
                                                                    <JobZImage id="skin_header_logo" src="images/logo-dark.png" alt="" className="on-scroll-show" />
                                                                </> :
                                                                <JobZImage id="skin_header_logo" src="images/logo-dark.png" alt="" />
                                                        )
                                                )
                                        }
                                    </NavLink>
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
                            <div className="nav-animation header-nav navbar-collapse collapse d-flex justify-content-center">
                                <ul className=" nav navbar-nav">
                                    <li className={isNavLinkActive("home") ? "nav-link-active" : ""}>
                                        <NavLink to={publicUser.HOME18}>Home</NavLink>
                                    </li>
                                    <li className={isNavLinkActive("get-jobs") ? "nav-link-active" : ""}>
                                        <a href="#get-jobs" onClick={(e) => {
                                            e.preventDefault();
                                            document.getElementById("get-jobs")?.scrollIntoView({ behavior: "smooth" });
                                        }}>About Us</a>
                                    </li>
                                    <li className={isNavLinkActive("candidates") ? "nav-link-active" : ""}>
                                        <a href="#candidates" onClick={(e) => {
                                            e.preventDefault();
                                            document.getElementById("candidates")?.scrollIntoView({ behavior: "smooth" });
                                        }}>Candidates</a>
                                    </li>
                                    <li className={isNavLinkActive("our-blogs") ? "nav-link-active" : ""}>
                                        <a href="#our-blogs" onClick={(e) => {
                                            e.preventDefault();
                                            document.getElementById("our-blogs")?.scrollIntoView({ behavior: "smooth" });
                                        }}>Vacancies</a>
                                    </li>
                                    <li className={isNavLinkActive("contact-us") ? "nav-link-active" : ""}>
                                        <a href="#contact-us" onClick={(e) => {
                                            e.preventDefault();
                                            document.getElementById("contact-us")?.scrollIntoView({ behavior: "smooth" });
                                        }}>Contact Us</a>
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
                                    <div className="header-nav-btn-section">
                                        <div className="twm-nav-btn-left">
                                            <a className="twm-nav-sign-up" href="#">
                                                <i className="feather-log-in" /> Get a Quote
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* SITE Search */}
                    <div id="search">
                        <span className="close" />
                        <form role="search" id="searchform" action="/search" method="get" className="radius-xl">
                            <input className="form-control" name="q" type="search" placeholder="Type to search" />
                            <span className="input-group-append">
                                <button type="button" className="search-btn">
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
