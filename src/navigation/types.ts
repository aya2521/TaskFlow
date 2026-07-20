export type AuthStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
};

export type AppStackParamList = {
  Home: undefined;
  AddEditTask: { taskId?: string } | undefined;
  Rewards: undefined;
  AddEditReward: { rewardId?: string } | undefined;
  Statistics: undefined;
  Settings: undefined;
  Account: undefined;
};

export type RootStackParamList = AuthStackParamList & AppStackParamList;