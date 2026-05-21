import { useState, useEffect } from 'react';
import blogsAPI from '../services/blogs.api.js';

export const useBlogsList = (params = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const result = await blogsAPI.getList(params);
        setData(result);
        setError(null);
      } catch (err) {
        console.error('Failed to load blogs:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [JSON.stringify(params)]);

  return { data, loading, error };
};

export const useLatestBlogs = (limit = 10) => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const result = await blogsAPI.getLatest(limit);
        setBlogs(result);
        setError(null);
      } catch (err) {
        console.error('Failed to load latest blogs:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [limit]);

  return { blogs, loading, error };
};

export const useBlog = (id) => {
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setBlog(null);
      setLoading(false);
      return;
    }

    const fetchBlog = async () => {
      try {
        setLoading(true);
        const result = await blogsAPI.getById(id);
        setBlog(result);
        setError(null);
      } catch (err) {
        console.error('Failed to load blog:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  return { blog, loading, error };
};
