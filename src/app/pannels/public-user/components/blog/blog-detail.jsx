import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

  if (loading) {
    return (
      <>
        <Toaster position="top-right" richColors />
        <div className="blog-detail-loading">
          <Spinner />
        </div>
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
      <div className="blog-detail-wrapper">
        {/* Blog Content */}
        <div className="blog-detail-content">
          <div className="container">
            <div className="row">
              <div className="col-lg-8 col-md-12">
                <article className="blog-article">
                  {/* Blog Title and Meta */}
                  <div className="blog-detail-title-section">
                    <h1 className="blog-detail-title">{blog.title}</h1>
                    <div className="blog-detail-meta">
                      <span className="blog-author">
                        <i className="fas fa-user"></i> By {blog.author || 'Admin'}
                      </span>
                      <span className="blog-date">
                        <i className="fas fa-calendar"></i> {new Date(blog.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                  {/* Featured Image */}
                  {blog.image_url && (
                    <div className="blog-featured-image">
                      <JobZImage
                        src={getJobImageUrl(blog.image_url)}
                        alt={blog.title}
                        className="img-fluid"
                      />
                    </div>
                  )}

                  {/* Article Body */}
                  <div className="blog-body">
                    {blog.content ? (
                      <div className="blog-content-text" dangerouslySetInnerHTML={{ __html: blog.content }} />
                    ) : (
                      <p>{blog.description || 'No content available'}</p>
                    )}
                  </div>

                  {/* Article Footer */}
                  <div className="blog-footer">
                    <div className="blog-tags">
                      {blog.tags && blog.tags.length > 0 && (
                        <>
                          <strong>Tags:</strong>
                          {blog.tags.map((tag, index) => (
                            <span key={index} className="blog-tag">{tag}</span>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                </article>
              </div>

              {/* Sidebar */}
              <div className="col-lg-4 col-md-12">
                <aside className="blog-sidebar">
                  <div className="sidebar-widget">
                    <h3 className="widget-title">About the Author</h3>
                    <div className="author-box">
                      <p className="author-name">{blog.author || 'Admin'}</p>
                      <p className="author-bio">{blog.author_bio || 'Welcome to our blog. Stay tuned for more updates.'}</p>
                    </div>
                  </div>

                  <div className="sidebar-widget">
                    <h3 className="widget-title">Share This Post</h3>
                    <div className="share-buttons">
                      <a href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`} target="_blank" rel="noopener noreferrer" className="share-btn share-facebook">
                        <i className="fab fa-facebook"></i>
                      </a>
                      <a href={`https://twitter.com/intent/tweet?url=${window.location.href}&text=${blog.title}`} target="_blank" rel="noopener noreferrer" className="share-btn share-twitter">
                        <i className="fab fa-twitter"></i>
                      </a>
                      <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${window.location.href}`} target="_blank" rel="noopener noreferrer" className="share-btn share-linkedin">
                        <i className="fab fa-linkedin"></i>
                      </a>
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .blog-detail-wrapper {
          min-height: 100vh;
          background: #fff;
        }

        .blog-detail-title-section {
          margin-bottom: 40px;
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
          margin-bottom: 40px;
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

        .blog-content-text {
          font-size: 16px;
          margin-bottom: 40px;
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
          padding-top: 30px;
          border-top: 1px solid #eee;
          margin-top: 40px;
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
          margin-top: 40px;
        }

        .sidebar-widget {
          background: #f8f9fa;
          padding: 25px;
          margin-bottom: 30px;
          border-radius: 8px;
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
        }
      `}</style>
    </>
  );
}

export default BlogDetail;
