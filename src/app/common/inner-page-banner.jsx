import { publicUrlFor } from "../../globals/constants";
import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";

function InnerPageBanner({_data}) {
    const [language, setLanguage] = useState(() => document.documentElement.lang || "en");
    const isArabic = language === "ar";
    const isAmharic = language === "am";
    const isCandidateGrid = _data.title === "Candidate Grid";
    const isCandidateDetail = _data.title === "Candidate Detail";
    const isBlog = _data.title === "Blog";
    const title = isCandidateGrid
        ? (isArabic ? "دليل المرشحين" : isAmharic ? "የእጩዎች ዝርዝር" : _data.title)
        : isCandidateDetail
            ? (isArabic ? "تفاصيل المرشح" : isAmharic ? "የእጩ ዝርዝር" : _data.title)
            : isBlog
                ? (isArabic ? "المدونة" : isAmharic ? "ብሎግ" : _data.title)
                : _data.title;
    const crumb = isCandidateGrid
        ? (isArabic ? "المرشحون" : isAmharic ? "እጩዎች" : _data.crumb)
        : isCandidateDetail
            ? (isArabic ? "تفاصيل المرشح" : isAmharic ? "የእጩ ዝርዝር" : _data.crumb)
            : isBlog
            ? (isArabic ? "المدونة" : isAmharic ? "ብሎግ" : _data.crumb)
            : _data.crumb;
    const homeLabel = isArabic ? "الرئيسية" : isAmharic ? "መነሻ" : "Home";

    useEffect(() => {
        const handleLanguageChange = (event) => setLanguage(event.detail.language);
        document.addEventListener("languagechange", handleLanguageChange);
        return () => document.removeEventListener("languagechange", handleLanguageChange);
    }, []);

    return (
        <>
            <div className="wt-bnr-inr overlay-wraper bg-center" dir={isArabic ? "rtl" : "ltr"}>
                <div className="overlay-main" style={{ opacity: 0 }} />
                <div className="container">
                    <div className="wt-bnr-inr-entry">
                        <div className="banner-title-outer">
                            <div className="banner-title-name">
                                <h2 className="wt-title">{title}</h2>
                            </div>
                        </div>
                        {/* BREADCRUMB ROW */}
                        <div>
                            <ul className="wt-breadcrumb breadcrumb-style-2">
                                <li><NavLink to="/">{homeLabel}</NavLink></li>
                                <li>{crumb}</li>
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
