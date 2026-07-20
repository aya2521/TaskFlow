export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export function getAchievements(
  totalCompleted: number,
  longestStreak: number,
  rewardsRedeemed: number
): Achievement[] {
  return [
    { id: 'first-step', title: 'First Step', description: 'Complete your first task', icon: '🌱', unlocked: totalCompleted >= 1 },
    { id: 'getting-started', title: 'Getting Started', description: 'Complete 10 tasks', icon: '🚀', unlocked: totalCompleted >= 10 },
    { id: 'task-master', title: 'Task Master', description: 'Complete 50 tasks', icon: '🏆', unlocked: totalCompleted >= 50 },
    { id: 'streak-starter', title: 'Streak Starter', description: '3-day streak', icon: '🔥', unlocked: longestStreak >= 3 },
    { id: 'on-fire', title: 'On Fire', description: '7-day streak', icon: '🔥', unlocked: longestStreak >= 7 },
    { id: 'consistent', title: 'Consistent', description: '30-day streak', icon: '🗓️', unlocked: longestStreak >= 30 },
    { id: 'reward-seeker', title: 'Reward Seeker', description: 'Redeem your first reward', icon: '🎁', unlocked: rewardsRedeemed >= 1 },
  ];
}