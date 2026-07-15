import { useEffect, useState } from 'react';
import { NavLink, useParams, useNavigate } from 'react-router-dom';
import JobZImage from '../../../../common/jobz-img';
import Spinner from '../../../../common/spinner';
import { publicUrlFor } from '../../../../../globals/constants';
import { getJobImageUrl } from '../../../../../globals/file-url';
import { showErrorToast } from '../../../../../globals/error-handler';
import { Toaster } from 'sonner';

function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogDetail = async () => {
      try {
        setLoading(true);
        console.log('📡 Fetching blog with ID:', id);
        const url = `/api/blogs/${id}`;
        console.log('📡 Full URL:', url);

        const response = await fetch(url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        console.log('📡 Response status:', response.status);

        if (!response.ok) {
          const errorData = await response.text();
          console.error('❌ Error response:', errorData);
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ Blog loaded:', data);
        setBlog(data);
      } catch (err) {
        console.error('❌ Error fetching blog:', err);
        showErrorToast(err, `Failed to load blog: ${err.message}`);
        setTimeout(() => navigate('/'), 2000);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBlogDetail();
    } else {
      console.warn('⚠ No blog ID provided');
      navigate('/');
    }
  }, [id, navigate]);

  useEffect(() => {
    if (blog) {
      document.title = `Blog Detail - ${blog.title} | TrueTouch`;
    }
  }, [blog]);

  useEffect(() => {
    const fetchRelatedBlogs = async () => {
      try {
        const response = await fetch('/api/blogs');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        setRelatedBlogs(data.filter((item) => item.id !== id).slice(0, 5));
      } catch (err) {
        console.error('❌ Error fetching related blogs:', err);
      }
    };

    fetchRelatedBlogs();
  }, [id]);

  if (loading) {
    return (
      <>
        <Toaster position="top-right" richColors />
        <Spinner fullPage />
      </>
    );
  }

  if (!blog) {
    return (
      <div className="blog-detail-not-found">
        <div className="container">
          <p>Blog not found</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" richColors />
      <section className="section-full p-t120 p-b90 bg-white blog-detail-wrapper">
        <div className="container">
          <div className="section-content">
            <div className="row d-flex justify-content-center">
              <div className="col-lg-8 col-md-12">
                <article className="blog-post-single-outer">
                  <div className="blog-post-single bg-white">
                    {blog.image_url && (
                      <div className="wt-post-media blog-featured-image">
                        <JobZImage src={getJobImageUrl(blog.image_url)} alt={blog.title} />
                      </div>
                    )}
                    <header className="blog-detail-title-section">
                      <div className="wt-post-meta-list blog-detail-meta">
                        <span className="wt-list-content post-date">
                          <i className="fas fa-calendar" /> {new Date(blog.created_at).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'long', day: '2-digit'
                          })}
                        </span>
                        <span className="wt-list-content post-author">
                          <i className="fas fa-user" /> By {blog.author || 'Admin'}
                        </span>
                        {blog.reading_time && (
                          <span className="wt-list-content post-reading-time">
                            <i className="fas fa-clock" /> {blog.reading_time}
                          </span>
                        )}
                      </div>
                      <h1 className="blog-detail-title post-title">{blog.title}</h1>
                    </header>

                    <div className="wt-post-discription blog-body">
                      {blog.content ? (
                        <div className="blog-content-text" dangerouslySetInnerHTML={{ __html: blog.content }} />
                      ) : (
                        <p>{blog.description || 'No content available'}</p>
                      )}
                      {blog.pull_quote_en && (
                        <blockquote className="blog-pull-quote">
                          <p>{blog.pull_quote_en}</p>
                          {(blog.pull_quote_author || blog.author) && <cite className="blog-pull-quote-author">— {blog.pull_quote_author || blog.author}</cite>}
                        </blockquote>
                      )}
                      {blog.description && <p className="blog-excerpt">{blog.description}</p>}
                    </div>

                    <div className="twm-posts-author">
                      {blog.author_avatar && (
                        <div className="twm-post-author-pic">
                          <JobZImage src={getJobImageUrl(blog.author_avatar)} alt={blog.author || 'Author'} />
                        </div>
                      )}
                      <div className="twm-post-author-content">
                        <span>{blog.author_role_en || 'TrueTouch Contributor'}</span>
                        <strong>{blog.author || 'Admin'}</strong>
                        <p>{blog.author_bio_en || blog.author_bio || 'Welcome to our blog. Stay tuned for more updates.'}</p>
                      </div>
                    </div>

                    <div className="post-area-tags-wrap blog-footer blog-share-footer">
                      <div className="post-social-icons-wrap">
                        <strong>Share</strong>
                        <div className="share-buttons">
                          <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook" className="share-btn share-facebook"><i className="fab fa-facebook-f" /></a>
                          <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(blog.title)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on Twitter" className="share-btn share-twitter"><i className="fab fa-twitter" /></a>
                          <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn" className="share-btn share-linkedin"><i className="fab fa-linkedin-in" /></a>
                        </div>
                      </div>
                    </div>

                    <nav className="post-navigation" aria-label="Post navigation">
                      {blog.previous_post_slug && (
                        <NavLink to={`/blog-detail/${blog.previous_post_slug}`} className="post-nav-previous"><i className="fa fa-angle-left" /> Previous post</NavLink>
                      )}
                      <NavLink to="/blogs" className="post-nav-back">Back to all blogs</NavLink>
                      {blog.next_post_slug && (
                        <NavLink to={`/blog-detail/${blog.next_post_slug}`} className="post-nav-next">Next post <i className="fa fa-angle-right" /></NavLink>
                      )}
                    </nav>
                  </div>
                </article>
              </div>

              <div className="col-lg-4 col-md-12 rightSidebar">
                <aside className="blog-sidebar">
                  <div className="sidebar-widget recent-posts-widget">
                    <h3 className="widget-title">Recent Articles</h3>
                    <div className="recent-post-list">
                      {relatedBlogs.map((item) => (
                        <NavLink key={item.id} to={`/blog-detail/${item.id}`} className="recent-post-item">
                          {item.image_url ? <JobZImage src={getJobImageUrl(item.image_url)} alt={item.title} /> : <span className="recent-post-placeholder" />}
                          <span className="recent-post-content">
                            <small>{new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</small>
                            <strong>{item.title}</strong>
                          </span>
                        </NavLink>
                      ))}
                      {relatedBlogs.length === 0 && <p className="sidebar-empty-state">No other articles yet.</p>}
                    </div>
                  </div>
                  <div className="sidebar-widget tags-widget">
                    <h3 className="widget-title">Tags</h3>
                    <div className="blog-tags">
                      {(blog.tags || []).map((tag, index) => <span key={index} className="blog-tag">{tag}</span>)}
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .blog-detail-wrapper {
          min-height: 100vh;
          background: #fff;
        }

        .blog-post-single {
          padding: 0 0 30px;
        }

        .blog-post-single-outer {
          margin-bottom: 30px;
        }

        .blog-detail-title-section {
          margin-bottom: 35px;
        }

        .blog-detail-title {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 16px;
          line-height: 1.3;
          color: #222;
        }

        .blog-detail-meta {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
          margin-bottom: 14px;
          font-size: 14px;
          color: #666;
        }

        .blog-detail-meta span {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .blog-detail-meta i {
          color: #999;
        }

        .blog-detail-content {
          padding: 60px 0;
        }

        .blog-featured-image {
          margin-bottom: 30px;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .blog-featured-image img {
          width: 100%;
          height: auto;
          display: block;
        }

        .blog-body {
          line-height: 1.8;
          color: #333;
        }

        .blog-excerpt {
          margin-bottom: 24px;
          color: #666;
          font-size: 18px;
          font-style: italic;
          line-height: 1.7;
        }

        .blog-content-text {
          font-size: 16px;
          margin-bottom: 40px;
        }

        .blog-pull-quote {
          margin: 40px 0;
          padding: 20px 25px;
          border-left: 4px solid #007bff;
          color: #222;
          font-size: 20px;
          font-style: italic;
          line-height: 1.6;
        }

        .blog-pull-quote p {
          margin: 0;
        }

        .blog-pull-quote-author {
          display: block;
          margin-top: 12px;
          color: #666;
          font-size: 14px;
          font-style: normal;
          font-weight: 600;
        }

        .blog-content-text p {
          margin-bottom: 20px;
        }

        .blog-content-text h2,
        .blog-content-text h3 {
          font-weight: 700;
          margin-top: 30px;
          margin-bottom: 15px;
          color: #222;
        }

        .blog-footer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 25px;
          padding-top: 30px;
          border-top: 1px solid #eee;
          margin-top: 40px;
        }

        .twm-posts-author {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 25px 0;
          margin-top: 35px;
          border-top: 1px solid #eee;
          border-bottom: 1px solid #eee;
        }

        .twm-post-author-pic {
          flex: 0 0 78px;
          width: 78px;
          height: 78px;
          overflow: hidden;
          border-radius: 50%;
        }

        .twm-post-author-pic img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .twm-post-author-content {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .twm-post-author-content span {
          font-size: 12px;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .twm-post-author-content strong {
          font-size: 18px;
          color: #222;
        }

        .twm-post-author-content p {
          margin: 0;
          color: #666;
          line-height: 1.6;
        }

        .post-social-icons-wrap {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .post-social-icons-wrap strong {
          color: #222;
        }

        .post-navigation {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-top: 30px;
        }

        .post-nav-back,
        .post-nav-next,
        .post-nav-previous {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #007bff;
          font-weight: 600;
          text-decoration: none;
        }

        .post-nav-back:hover,
        .post-nav-next:hover,
        .post-nav-previous:hover {
          color: #0056b3;
        }

        .post-nav-back {
          margin: auto;
        }

        .post-nav-previous + .post-nav-back {
          margin-left: 0;
        }

        .post-nav-back:has(+ .post-nav-next) {
          margin-right: 0;
        }

        .blog-tags {
          display: flex;
          align-items: center;
          gap: 15px;
          flex-wrap: wrap;
        }

        .blog-tag {
          display: inline-block;
          background: #f0f0f0;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          color: #666;
          transition: all 0.3s ease;
        }

        .blog-tag:hover {
          background: #e0e0e0;
          color: #333;
        }

        .blog-sidebar {
          margin-top: 0;
        }

        .sidebar-widget {
          background: #f8f9fa;
          padding: 25px;
          margin-bottom: 30px;
          border-radius: 8px;
        }

        .recent-post-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .recent-post-item {
          display: flex;
          align-items: center;
          gap: 12px;
          color: inherit;
          text-decoration: none;
        }

        .recent-post-item img,
        .recent-post-placeholder {
          flex: 0 0 58px;
          width: 58px;
          height: 58px;
          border-radius: 4px;
          object-fit: cover;
          background: #e7e7e7;
        }

        .recent-post-content {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
        }

        .recent-post-content small {
          color: #888;
          font-size: 11px;
        }

        .recent-post-content strong {
          display: -webkit-box;
          overflow: hidden;
          color: #222;
          font-size: 13px;
          line-height: 1.35;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }

        .recent-post-item:hover .recent-post-content strong {
          color: #007bff;
        }

        .sidebar-empty-state {
          margin: 0;
          color: #777;
          font-size: 14px;
        }

        .widget-title {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 20px;
          color: #222;
          border-bottom: 2px solid #007bff;
          padding-bottom: 10px;
        }

        .author-box {
          text-align: center;
        }

        .author-name {
          font-size: 16px;
          font-weight: 600;
          color: #222;
          margin-bottom: 10px;
        }

        .author-bio {
          font-size: 14px;
          color: #666;
          line-height: 1.6;
          margin: 0;
        }

        .share-buttons {
          display: flex;
          gap: 10px;
          justify-content: center;
        }

        .share-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          color: white;
          text-decoration: none;
          transition: all 0.3s ease;
          font-size: 16px;
        }

        .share-facebook {
          background: #1877f2;
        }

        .share-facebook:hover {
          background: #0a66c2;
          transform: translateY(-3px);
        }

        .share-twitter {
          background: #000;
        }

        .share-twitter:hover {
          background: #333;
          transform: translateY(-3px);
        }

        .share-linkedin {
          background: #0a66c2;
        }

        .share-linkedin:hover {
          background: #095196;
          transform: translateY(-3px);
        }

        .blog-detail-loading,
        .blog-detail-not-found {
          min-height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        @media (max-width: 768px) {
          .blog-detail-title {
            font-size: 28px;
          }

          .blog-detail-meta {
            flex-direction: column;
            gap: 10px;
          }

          .blog-detail-header {
            padding: 40px 0;
          }

          .blog-footer {
            align-items: center;
            flex-direction: column;
          }

          .post-social-icons-wrap {
            width: 100%;
            justify-content: space-between;
          }

          .post-navigation {
            align-items: flex-start;
            flex-direction: column;
          }

          .post-nav-back {
            margin: 0;
          }

          .twm-posts-author {
            align-items: flex-start;
          }

          .blog-sidebar {
            margin-top: 30px;
          }
        }
      `}</style>
    </>
  );
}

export default BlogDetail;
