import { useState, useEffect } from 'react';
import landingAPI from '../services/landing.api.js';

export const useLandingData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await landingAPI.getAll();
        setData(result);
        setError(null);
      } catch (err) {
        console.error('Failed to load landing data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};

export const useLandingStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const result = await landingAPI.getStats();
        setStats(result);
        setError(null);
      } catch (err) {
        console.error('Failed to load stats:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
};

export const useFeaturedCandidates = (limit = 8) => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        const result = await landingAPI.getFeaturedCandidates(limit);
        setCandidates(result);
        setError(null);
      } catch (err) {
        console.error('Failed to load candidates:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, [limit]);

  return { candidates, loading, error };
};

export const useFeaturedCompanies = (limit = 10) => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const result = await landingAPI.getFeaturedCompanies(limit);
        setCompanies(result);
        setError(null);
      } catch (err) {
        console.error('Failed to load companies:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [limit]);

  return { companies, loading, error };
};

export const useFeaturedLocations = (limit = 10) => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        const result = await landingAPI.getFeaturedLocations(limit);
        setLocations(result);
        setError(null);
      } catch (err) {
        console.error('Failed to load locations:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, [limit]);

  return { locations, loading, error };
};

export const useCountries = () => {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoading(true);
        const result = await landingAPI.getCountries();
        setCountries(result);
        setError(null);
      } catch (err) {
        console.error('Failed to load countries:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  return { countries, loading, error };
};
