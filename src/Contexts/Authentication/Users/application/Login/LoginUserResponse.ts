export interface LoginUserResponse {
  userId: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
