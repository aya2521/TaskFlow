import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import { Reward, RewardFormData } from '../types/reward';

const REWARDS_COLLECTION = 'rewards';

function toReward(id: string, data: any): Reward {
  return {
    id,
    userId: data.userId,
    title: data.title,
    description: data.description ?? '',
    cost: data.cost ?? 0,
    redeemed: data.redeemed ?? false,
    redeemedAt: (data.redeemedAt as Timestamp)?.toDate?.().toISOString() ?? null,
    createdAt: (data.createdAt as Timestamp)?.toDate?.().toISOString() ?? new Date().toISOString(),
  };
}

export function subscribeToRewards(
  userId: string,
  onChange: (rewards: Reward[]) => void,
  onError: (message: string) => void
): Unsubscribe {
  const q = query(
    collection(db, REWARDS_COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    q,
    (snapshot) => onChange(snapshot.docs.map((d) => toReward(d.id, d.data()))),
    (error) => {
      onError('Failed to load rewards. Check your connection.');
      console.error('subscribeToRewards error:', error);
    }
  );
}

export async function createReward(userId: string, form: RewardFormData): Promise<{ error: string | null }> {
  try {
    await addDoc(collection(db, REWARDS_COLLECTION), {
      userId,
      title: form.title.trim(),
      description: form.description.trim(),
      cost: form.cost,
      redeemed: false,
      redeemedAt: null,
      createdAt: serverTimestamp(),
    });
    return { error: null };
  } catch (err) {
    console.error('createReward error:', err);
    return { error: 'Failed to create reward. Please try again.' };
  }
}

export async function updateReward(rewardId: string, form: RewardFormData): Promise<{ error: string | null }> {
  try {
    await updateDoc(doc(db, REWARDS_COLLECTION, rewardId), {
      title: form.title.trim(),
      description: form.description.trim(),
      cost: form.cost,
    });
    return { error: null };
  } catch (err) {
    console.error('updateReward error:', err);
    return { error: 'Failed to update reward. Please try again.' };
  }
}

export async function redeemReward(rewardId: string): Promise<{ error: string | null }> {
  try {
    await updateDoc(doc(db, REWARDS_COLLECTION, rewardId), {
      redeemed: true,
      redeemedAt: serverTimestamp(),
    });
    return { error: null };
  } catch (err) {
    console.error('redeemReward error:', err);
    return { error: 'Failed to redeem reward. Please try again.' };
  }
}

export async function deleteReward(rewardId: string): Promise<{ error: string | null }> {
  try {
    await deleteDoc(doc(db, REWARDS_COLLECTION, rewardId));
    return { error: null };
  } catch (err) {
    console.error('deleteReward error:', err);
    return { error: 'Failed to delete reward. Please try again.' };
  }
}