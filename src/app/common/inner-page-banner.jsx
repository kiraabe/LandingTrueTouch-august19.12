import { publicUrlFor } from "../../globals/constants";
import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { blogCopy, candidateGridCopy } from "../../globals/constants";
import { publicUser } from "../../globals/route-names";

function InnerPageBanner({_data}) {
    const [currentLanguage, setCurrentLanguage] = useState(() => document.documentElement.lang || "en");
    const isBlogDetail = _data.copyKey === "blogDetail";
    const isCandidateGrid = _data.copyKey === "candidateGrid";
    const isLocalizedBanner = isBlogDetail || isCandidateGrid;
    const copySet = isCandidateGrid ? candidateGridCopy : blogCopy;
    const copy = copySet[currentLanguage] || copySet.en;
    const bannerTitle = isBlogDetail ? copy.blogDetail : isCandidateGrid ? copy.candidateGrid : _data.title;

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
                                <h2 className="wt-title">{bannerTitle}</h2>
                            </div>
                        </div>
                        {/* BREADCRUMB ROW */}
                        <div>
                            <ul className="wt-breadcrumb breadcrumb-style-2" aria-label={isLocalizedBanner ? copy[isBlogDetail ? "homeBlogDetail" : "homeCandidateGrid"] : undefined}>
                                {isLocalizedBanner ? (
                                    <>
                                        <li><NavLink to={publicUser.INITIAL}>{currentLanguage === "ar" ? "الرئيسية" : currentLanguage === "am" ? "መነሻ" : "Home"}</NavLink></li>
                                        <li className="breadcrumb-current" aria-current="page">{isBlogDetail ? copy.blogDetail : copy.candidateGrid}</li>
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
