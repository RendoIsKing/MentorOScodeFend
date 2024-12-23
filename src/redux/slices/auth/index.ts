import { createSlice } from "@reduxjs/toolkit";
import { havemeApi } from "@/redux/services/haveme";
import { IAuthResponse } from "@/contracts/responses/IAuthResponse";
import { RootState } from "@/redux/reducers";
import { removeAuthCookies, setAuthCookie } from "@/actions/actions";

export const AUTH_KEY = "auth";
export const AUTH_TOKEN = "auth_token";

let persistedAuth;
let persistedToken;

if (typeof window !== "undefined") {
  persistedAuth =
    sessionStorage.getItem(AUTH_KEY) || localStorage.getItem(AUTH_KEY);
  persistedToken =
    sessionStorage.getItem(AUTH_TOKEN) || localStorage.getItem(AUTH_TOKEN);
}

interface AuthSlice {
  authenticated?: IAuthResponse;
  token: string;
}

let initialState: any = {
  authenticated: persistedAuth ? JSON.parse(persistedAuth) : {},
  token: persistedToken ? JSON.parse(persistedToken).token : "",
};

export const authSlice = createSlice({
  name: AUTH_KEY,
  initialState,
  reducers: {
    setAccessToken: (state, { payload }) => {
      state.token = payload;
    },
    logout: (state) => {
      state.authenticated = null;
      state.token = null;
      sessionStorage.removeItem(AUTH_KEY);
      sessionStorage.removeItem(AUTH_TOKEN);
      localStorage.removeItem(AUTH_KEY);
      localStorage.removeItem(AUTH_TOKEN);
      removeAuthCookies();
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        havemeApi.endpoints.loginUser.matchFulfilled,
        (state, { payload }) => {
          if (payload?.token) {
            state.authenticated = { ...payload }; // Spread to avoid mutations
            state.token = payload.token;
            setAuthCookie(payload.token);

            const authData = JSON.stringify(payload);
            sessionStorage.setItem(AUTH_KEY, authData);
            localStorage.setItem(AUTH_KEY, authData);

            const tokenData = JSON.stringify({ token: payload.token });
            sessionStorage.setItem(AUTH_TOKEN, tokenData);
            localStorage.setItem(AUTH_TOKEN, tokenData);
          } else {
            state.authenticated = null;
            state.token = null;
            sessionStorage.removeItem(AUTH_KEY);
            localStorage.removeItem(AUTH_KEY);
            sessionStorage.removeItem(AUTH_TOKEN);
            localStorage.removeItem(AUTH_TOKEN);
            removeAuthCookies();
          }
        }
      )
      .addMatcher(
        havemeApi.endpoints.loginUser.matchRejected,
        (state, { payload }) => {
          console.error(payload?.data || "Something went wrong", payload);
        }
      );
  },
});

export default authSlice.reducer;
export const { logout, setAccessToken } = authSlice.actions;
export const selectCurrentUser = (state: RootState) => state.auth.authenticated;

export const selectIsAuthenticated = (state: RootState) => !!state.auth.token;
