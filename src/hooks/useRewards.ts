import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { subscribeToRewards } from '../services/rewardService';
import { Reward } from '../types/reward';

interface UseRewardsResult {
  rewards: Reward[];
  loading: boolean;
  error: string | null;
}

export function useRewards(): UseRewardsResult {
  const { user } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setRewards([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = subscribeToRewards(
      user.uid,
      (updated) => {
        setRewards(updated);
        setLoading(false);
        setError(null);
      },
      (message) => {
        setError(message);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [user]);

  return { rewards, loading, error };
}