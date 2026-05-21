import { useState, useEffect } from 'react';
import companiesAPI from '../services/companies.api.js';

export const useCompaniesList = (params = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const result = await companiesAPI.getList(params);
        setData(result);
        setError(null);
      } catch (err) {
        console.error('Failed to load companies:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [JSON.stringify(params)]);

  return { data, loading, error };
};

export const useFeaturedCompanies = (limit = 10) => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const result = await companiesAPI.getFeatured(limit);
        setCompanies(result);
        setError(null);
      } catch (err) {
        console.error('Failed to load featured companies:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [limit]);

  return { companies, loading, error };
};

export const useCompany = (id) => {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setCompany(null);
      setLoading(false);
      return;
    }

    const fetchCompany = async () => {
      try {
        setLoading(true);
        const result = await companiesAPI.getById(id);
        setCompany(result);
        setError(null);
      } catch (err) {
        console.error('Failed to load company:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [id]);

  return { company, loading, error };
};
