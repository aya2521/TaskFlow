export interface Reward {
  id: string;
  userId: string;
  title: string;
  description: string;
  cost: number;
  redeemed: boolean;
  redeemedAt: string | null;
  createdAt: string;
}

export type RewardFormData = {
  title: string;
  description: string;
  cost: number;
};