export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type AppStackParamList = {
  Home: undefined;
  AddEditTask: { taskId?: string } | undefined;
  Rewards: undefined;
  AddEditReward: { rewardId?: string } | undefined;
  Statistics: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
} & AuthStackParamList &
  AppStackParamList;