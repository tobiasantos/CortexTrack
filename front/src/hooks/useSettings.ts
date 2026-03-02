import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import type { SiteClassification, Category } from '../types';

interface SettingsData {
  classifications: SiteClassification[];
  isLoading: boolean;
  error: string | null;
  updateClassification: (domain: string, category: Category) => Promise<void>;
  refetch: () => void;
}

export function useSettings(): SettingsData {
  const [classifications, setClassifications] = useState<SiteClassification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/settings/classifications');
      setClassifications(data || []);
    } catch {
      setError('Failed to load classifications');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateClassification = async (domain: string, category: Category) => {
    await api.put('/settings/classifications', { domain, category });
    setClassifications((prev) =>
      prev.map((c) => (c.domain === domain ? { ...c, category, isOverride: true } : c))
    );
    toast.success(`${domain} set to ${category}`);
  };

  return { classifications, isLoading, error, updateClassification, refetch: fetchData };
}
