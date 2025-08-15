export interface JwtPayload {
  sub: number; // user_id
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}