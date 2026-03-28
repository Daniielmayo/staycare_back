import { Response, CookieOptions } from "express";
import {
  signAccessToken,
  signRefreshToken,
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
  UserRole,
} from "./jwt";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export const generateAuthTokens = (userId: string | number, role: UserRole): AuthTokens => {
  const uid = userId.toString();
  const accessToken = signAccessToken({ userId: uid, role });
  const refreshToken = signRefreshToken({ userId: uid });
  
  return { accessToken, refreshToken };
};

export const setAuthCookies = (res: Response, tokens: AuthTokens): void => {
  res.cookie("accessToken", tokens.accessToken, getAccessTokenCookieOptions());
  res.cookie("refreshToken", tokens.refreshToken, getRefreshTokenCookieOptions());
};

export const clearAuthCookies = (res: Response): void => {
  const clearOptions: CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    maxAge: 0,
  };
  res.clearCookie("accessToken", clearOptions);
  res.clearCookie("refreshToken", clearOptions);
};
