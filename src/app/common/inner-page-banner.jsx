import { publicUrlFor } from "../../globals/constants";
import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { blogCopy } from "../../globals/constants";
import { publicUser } from "../../globals/route-names";

function InnerPageBanner({_data}) {
    const [currentLanguage, setCurrentLanguage] = useState(() => document.documentElement.lang || "en");
    const copy = blogCopy[currentLanguage] || blogCopy.en;
    const isBlogDetail = _data.copyKey === "blogDetail";

    useEffect(() => {
        const handleLanguageChange = (event) => setCurrentLanguage(event.detail.language);
        document.addEventListener("languagechange", handleLanguageChange);
        return () => document.removeEventListener("languagechange", handleLanguageChange);
    }, []);

    return (
        <>
            <div dir={currentLanguage === "ar" ? "rtl" : "ltr"} className="wt-bnr-inr overlay-wraper bg-center">
                <div className="overlay-main" style={{ opacity: 0 }} />
                <div className="container">
                    <div className="wt-bnr-inr-entry">
                        <div className="banner-title-outer">
                            <div className="banner-title-name">
                                <h2 className="wt-title">{isBlogDetail ? copy.blogDetail : _data.title}</h2>
                            </div>
                        </div>
                        {/* BREADCRUMB ROW */}
                        <div>
                            <ul className="wt-breadcrumb breadcrumb-style-2" aria-label={isBlogDetail ? copy.homeBlogDetail : undefined}>
                                {isBlogDetail ? (
                                    <>
                                        <li><NavLink to={publicUser.INITIAL}>{currentLanguage === "ar" ? "الرئيسية" : currentLanguage === "am" ? "መነሻ" : "Home"}</NavLink></li>
                                        <li className="breadcrumb-current" aria-current="page">{copy.blogDetail}</li>
                                    </>
                                ) : (
                                    <>
                                        <li><NavLink to="/index">Home</NavLink></li>
                                        <li>{_data.crumb}</li>
                                    </>
                                )}
                            </ul>
                        </div>
                        {/* BREADCRUMB ROW END */}
                    </div>
                </div>
            </div>
        </>
    )
}

export default InnerPageBanner;
