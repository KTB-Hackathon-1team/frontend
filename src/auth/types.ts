export type ParentUser = {
  id: number;
  loginId: string;
  nickname: string;
  role: "PARENT" | string;
};

export type AuthData = {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: ParentUser;
};
