import { useState, useEffect } from 'react';
import candidatesAPI from '../services/candidates.api.js';

export const useCandidatesList = (params = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        const result = await candidatesAPI.getList(params);
        setData(result);
        setError(null);
      } catch (err) {
        console.error('Failed to load candidates:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, [JSON.stringify(params)]);

  return { data, loading, error };
};

export const useCandidate = (id) => {
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setCandidate(null);
      setLoading(false);
      return;
    }

    const fetchCandidate = async () => {
      try {
        setLoading(true);
        const result = await candidatesAPI.getById(id);
        setCandidate(result);
        setError(null);
      } catch (err) {
        console.error('Failed to load candidate:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidate();
  }, [id]);

  return { candidate, loading, error };
};
