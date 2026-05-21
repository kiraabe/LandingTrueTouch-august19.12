import { useState, useEffect } from 'react';
import jobsAPI from '../services/jobs.api.js';

export const useJobsList = (params = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const result = await jobsAPI.getList(params);
        setData(result);
        setError(null);
      } catch (err) {
        console.error('Failed to load jobs:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [JSON.stringify(params)]);

  return { data, loading, error };
};

export const useJob = (id) => {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setJob(null);
      setLoading(false);
      return;
    }

    const fetchJob = async () => {
      try {
        setLoading(true);
        const result = await jobsAPI.getById(id);
        setJob(result);
        setError(null);
      } catch (err) {
        console.error('Failed to load job:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  return { job, loading, error };
};

export const useFeaturedJobs = (limit = 10) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const result = await jobsAPI.getFeatured(limit);
        setJobs(result);
        setError(null);
      } catch (err) {
        console.error('Failed to load featured jobs:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [limit]);

  return { jobs, loading, error };
};
