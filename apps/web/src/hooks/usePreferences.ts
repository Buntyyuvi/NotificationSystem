import { useState, useEffect, useCallback } from 'react';
import { preferenceApi } from '../services/preferenceApi';
import { UserPreference } from '../types/preference';

export function usePreferences() {
  const [preferences, setPreferences] = useState<UserPreference[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPreferences = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await preferenceApi.getPreferences();
      setPreferences(data.preferences);
    } catch (err) {
      console.error('Failed to fetch preferences', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePreference = useCallback(async (channel: string, updates: Partial<UserPreference>) => {
    try {
      const { data } = await preferenceApi.updatePreference(channel, updates);
      setPreferences(data.preferences);
    } catch (err) {
      console.error('Failed to update preference', err);
    }
  }, []);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  return { preferences, loading, updatePreference, refresh: fetchPreferences };
}
