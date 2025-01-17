"use server";
import { cookies } from "next/headers";
const AUTH_TOKEN = "auth_token";

export const setAuthCookie = (token: string) => {
  cookies().set(AUTH_TOKEN, token);
};

export const checkAuthCookie = (cookieName: string) => {
  return cookies().get(cookieName) !== undefined;
};

export async function removeAuthCookies() {
  cookies().set(AUTH_TOKEN, "", { expires: new Date(0) });
}
