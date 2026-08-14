import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import JobZImage from "../../../../common/jobz-img";
import ImageLightbox from "../../../../common/image-lightbox";
import Spinner from "../../../../common/spinner";
import { showErrorToast } from "../../../../../globals/error-handler";
import { getHostedAssetUrl, getJobImageUrl } from "../../../../../globals/file-url";

const blogImageFallback = getHostedAssetUrl("images/blog/post-author.jpg");

const BLOGS_PER_PAGE = 9;

const formatDate = (date) => {
  const value = new Date(date);
  return Number.isNaN(value.getTime())
    ? ""
    : value.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "2-digit" });
};

const truncateText = (text, maxLength = 120) => {
  if (!text || text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}...`;
};

function BlogGrid1Page() {
  const [blogs, setBlogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState(() => document.documentElement.lang || "en");

  useEffect(() => {
    const handleLanguageChange = (event) => setCurrentLanguage(event.detail.language);
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
    <section
      id="blog-grid"
      dir={currentLanguage === "ar" ? "rtl" : "ltr"}
      className={`section-full p-t120 p-b90 site-bg-white${currentLanguage === "ar" ? " blog-section-rtl" : ""}`}
    >
      <div className="container">
        {loading ? (
          <Spinner fullPage delay={0} />
        ) : blogs.length > 0 ? (
          <>
            <div className="twm-blog-responsive-grid">
              {visibleBlogs.map((blog) => (
                <article key={blog.id} className="twm-blog-responsive-item blog-post twm-blog-post-1-outer">
                  <div className="wt-post-media">
                    <ImageLightbox
                      src={blog.image_url ? (getJobImageUrl(blog.image_url) || blogImageFallback) : blogImageFallback}
                      alt={blog.title}
                    >
                      <NavLink to={`/blog-detail/${blog.id}`}>
                        <JobZImage
                        src={blog.image_url ? (getJobImageUrl(blog.image_url) || blogImageFallback) : blogImageFallback}
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = blogImageFallback;
                        }}
                        alt={blog.title}
                        />
                      </NavLink>
                    </ImageLightbox>
                  </div>
                  <div className="wt-post-info blog-card-content">
                    <div className="wt-post-meta">
                      <ul>
                        <li className="post-date blog-card-date-ltr">{formatDate(blog.created_at)}</li>
                        <li className="post-author">By {blog.author || "Admin"}</li>
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
                      <NavLink to={`/blog-detail/${blog.id}`} className="site-button-link site-text-primary">Read More</NavLink>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <nav className="pagination-outer text-center" aria-label="Blog pages">
                <div className="pagination-style1">
                  <ul>
                    <li className="prev">
                      <a
                        href="#blog-grid"
                        onClick={(event) => {
                          event.preventDefault();
                          if (currentPage > 1) changePage(currentPage - 1);
                        }}
                        aria-label="Previous page"
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
                          aria-label={`Go to page ${page}`}
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
                        aria-label="Next page"
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
            <p>No blogs available.</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default BlogGrid1Page;
