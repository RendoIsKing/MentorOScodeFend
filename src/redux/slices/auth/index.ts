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
    logout: async (state) => {
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
        havemeApi.endpoints.verifyOtp.matchFulfilled,
        (state, { payload }) => {
          if (payload?.data.token) {
            state.authenticated = payload;
            setAuthCookie(payload.data.token);
            state.token = payload.data.token;
            sessionStorage.setItem(
              AUTH_TOKEN,
              JSON.stringify({ token: payload.data.token })
            );
            localStorage.setItem(
              AUTH_TOKEN,
              JSON.stringify({ token: payload.data.token })
            );
            sessionStorage.setItem(AUTH_KEY, JSON.stringify(payload));
            localStorage.setItem(AUTH_KEY, JSON.stringify(payload));
          } else {
            state = null;
            sessionStorage.removeItem(AUTH_KEY);
            localStorage.removeItem(AUTH_TOKEN);
            sessionStorage.removeItem(AUTH_TOKEN);
            localStorage.removeItem(AUTH_KEY);
            removeAuthCookies();
          }
        }
      )
      .addMatcher(
        havemeApi.endpoints.verifyOtp.matchRejected,
        (state, { payload }) => {
          if (payload.data) {
          } else {
            console.error(`something went wrong`);
          }
          console.error(payload, "error");
        }
      );
  },
});

export default authSlice.reducer;
export const { logout, setAccessToken } = authSlice.actions;
export const selectCurrentUser = (state: RootState) => state.auth.authenticated;

export const selectIsAuthenticated = (state: RootState) => !!state.auth.token;
