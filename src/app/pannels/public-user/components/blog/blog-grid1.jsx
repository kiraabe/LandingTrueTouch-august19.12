import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import JobZImage from "../../../../common/jobz-img";
import Spinner from "../../../../common/spinner";
import { showErrorToast } from "../../../../../globals/error-handler";
import { getJobImageUrl } from "../../../../../globals/file-url";

const BLOGS_PER_PAGE = 9;

const formatDate = (date, language = "en") => {
  const value = new Date(date);
  return Number.isNaN(value.getTime())
    ? ""
    : value.toLocaleDateString(language === "ar" ? "ar-EG" : language === "am" ? "am-ET" : "en-US", { year: "numeric", month: "long", day: "2-digit" });
};

const truncateText = (text, maxLength = 120) => {
  if (!text || text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}...`;
};

function BlogGrid1Page() {
  const [blogs, setBlogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState(() => document.documentElement.lang || "en");
  const isArabic = language === "ar";
  const copy = language === "am" ? {
    blog: "ብሎግ",
    by: "በ",
    readMore: "ተጨማሪ ያንብቡ",
    previousPage: "ያለፈው ገጽ",
    nextPage: "ቀጣዩ ገጽ",
    goToPage: "ወደ ገጽ ሂድ",
    noBlogs: "አሁን ምንም ብሎጎች የሉም፟"
  } : isArabic ? {
    blog: "المدونة",
    by: "بواسطة",
    readMore: "اقرأ المزيد",
    previousPage: "الصفحة السابقة",
    nextPage: "الصفحة التالية",
    goToPage: "الانتقال إلى الصفحة",
    noBlogs: "لا توجد مدونات متاحة حالياً."
  } : {
    blog: "Blog",
    by: "By",
    readMore: "Read More",
    previousPage: "Previous page",
    nextPage: "Next page",
    goToPage: "Go to page",
    noBlogs: "No blogs available."
  };

  useEffect(() => {
    const handleLanguageChange = (event) => setLanguage(event.detail.language);
    document.addEventListener("languagechange", handleLanguageChange);
    return () => document.removeEventListener("languagechange", handleLanguageChange);
  }, []);

  useEffect(() => {
    document.title = "Blog | TrueTouch";

    const fetchBlogs = async () => {
      try {
        const response = await fetch("/api/blogs");
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        setBlogs(await response.json());
      } catch (error) {
        showErrorToast(error, "Failed to load blogs.");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const pageCount = Math.max(1, Math.ceil(blogs.length / BLOGS_PER_PAGE));
  const visibleBlogs = useMemo(
    () => blogs.slice((currentPage - 1) * BLOGS_PER_PAGE, currentPage * BLOGS_PER_PAGE),
    [blogs, currentPage]
  );

  const changePage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section id="blog-grid" className="section-full p-t120 p-b90 site-bg-white">
      <div className="container">
        {loading ? (
          <Spinner fullPage />
        ) : blogs.length > 0 ? (
          <>
            <div className="twm-blog-responsive-grid">
              {visibleBlogs.map((blog) => (
                <article key={blog.id} className="twm-blog-responsive-item blog-post twm-blog-post-1-outer">
                  <div className="wt-post-media">
                    <NavLink to={`/blog-detail/${blog.id}`}>
                      <JobZImage
                        src={blog.image_url ? getJobImageUrl(blog.image_url) : "https://cdn.builder.io/api/v1/image/assets%2F5e5700cc98ef413c911c8b7a4a98ea76%2F3483d0d2e206411c8f937b411ad53cfd?format=webp&width=800&height=1200"}
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = "https://cdn.builder.io/api/v1/image/assets%2F5e5700cc98ef413c911c8b7a4a98ea76%2F3483d0d2e206411c8f937b411ad53cfd?format=webp&width=800&height=1200";
                        }}
                        alt={blog.title}
                      />
                    </NavLink>
                  </div>
                  <div className="wt-post-info">
                    <div className="wt-post-meta">
                      <ul>
                        <li className="post-date">{formatDate(blog.created_at, language)}</li>
                        <li className="post-author">{copy.by} {blog.author || "Admin"}</li>
                      </ul>
                    </div>
                    <div className="wt-post-title">
                      <h4 className="post-title">
                        <NavLink to={`/blog-detail/${blog.id}`}>{blog.title}</NavLink>
                      </h4>
                    </div>
                    {blog.description && (
                      <div className="wt-post-text">
                        <p>{truncateText(blog.description)}</p>
                      </div>
                    )}
                    <div className="wt-post-readmore">
                      <NavLink to={`/blog-detail/${blog.id}`} className="site-button-link site-text-primary">{copy.readMore}</NavLink>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <nav className="pagination-outer text-center" aria-label={copy.blog}>
                <div className="pagination-style1">
                  <ul>
                    <li className="prev">
                      <a
                        href="#blog-grid"
                        onClick={(event) => {
                          event.preventDefault();
                          if (currentPage > 1) changePage(currentPage - 1);
                        }}
                        aria-label={copy.previousPage}
                        aria-disabled={currentPage === 1}
                      >
                        <span className="fa fa-angle-left" />
                      </a>
                    </li>
                    {Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => (
                      <li key={page} className={currentPage === page ? "active" : ""}>
                        <a
                          href="#blog-grid"
                          onClick={(event) => {
                            event.preventDefault();
                            changePage(page);
                          }}
                          aria-current={currentPage === page ? "page" : undefined}
                          aria-label={`${copy.goToPage} ${page}`}
                        >
                          {page}
                        </a>
                      </li>
                    ))}
                    <li className="next">
                      <a
                        href="#blog-grid"
                        onClick={(event) => {
                          event.preventDefault();
                          if (currentPage < pageCount) changePage(currentPage + 1);
                        }}
                        aria-label={copy.nextPage}
                        aria-disabled={currentPage === pageCount}
                      >
                        <span className="fa fa-angle-right" />
                      </a>
                    </li>
                  </ul>
                </div>
              </nav>
          </>
        ) : (
          <div className="text-center p-5">
            <p>{copy.noBlogs}</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default BlogGrid1Page;
