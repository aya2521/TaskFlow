export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type AppStackParamList = {
  Home: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
} & AuthStackParamList &
  AppStackParamList;