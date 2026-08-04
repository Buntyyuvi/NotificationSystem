import { useCallback, useEffect, useState } from 'react';
import { preferenceApi } from '../services/preferenceApi';
import type { UserPreference } from '../types/user';

export function usePreferences() {
  const [preferences, setPreferences] = useState<UserPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await preferenceApi.get();
      setPreferences(data.preferences);
    } catch (err) {
      console.error('Failed to load preferences', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (next: UserPreference[]) => {
    setSaving(true);
    try {
      const { data } = await preferenceApi.update(next);
      setPreferences(data.preferences);
    } catch (err) {
      console.error('Failed to update preferences', err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { preferences, loading, saving, update };
}
