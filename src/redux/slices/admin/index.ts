import { removeAuthCookies, setAuthCookie } from "@/actions/actions";
import { adminApi } from "@/redux/admin-services";
import { createSlice } from "@reduxjs/toolkit";

export const ADMIN_AUTH_KEY = "admin_auth";
export const ADMIN_AUTH_TOKEN = "auth_token";

let persistedAdminAuth;
let persistedAdminToken;

if (typeof window !== "undefined") {
  persistedAdminAuth =
    sessionStorage.getItem(ADMIN_AUTH_KEY) ||
    localStorage.getItem(ADMIN_AUTH_KEY);
  persistedAdminToken =
    sessionStorage.getItem(ADMIN_AUTH_TOKEN) ||
    localStorage.getItem(ADMIN_AUTH_TOKEN);
}

let initialState: any = {
  authenticated: persistedAdminAuth ? JSON.parse(persistedAdminAuth) : {},
  token: persistedAdminToken ? JSON.parse(persistedAdminToken).token : "",
};

export const adminAuthSlice = createSlice({
  name: ADMIN_AUTH_KEY,
  initialState,
  reducers: {
    setAccessToken: (state, { payload }) => {
      state.token = payload;
    },
    logoutAdmin: (state) => {
      sessionStorage.removeItem(ADMIN_AUTH_KEY);
      sessionStorage.removeItem(ADMIN_AUTH_TOKEN);
      localStorage.removeItem(ADMIN_AUTH_KEY);
      localStorage.removeItem(ADMIN_AUTH_TOKEN);
      removeAuthCookies();
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      adminApi.endpoints.registerAdmin.matchFulfilled,
      (state, { payload }) => {
        if (payload?.data.token) {
          state.authenticated = payload;
          setAuthCookie(payload.data.token);
          state.token = payload.data.token;
          sessionStorage.setItem(
            ADMIN_AUTH_TOKEN,
            JSON.stringify({ token: payload.data.token })
          );
          localStorage.setItem(
            ADMIN_AUTH_TOKEN,
            JSON.stringify({ token: payload.data.token })
          );
          sessionStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(payload));
          localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(payload));
        } else {
          state = null;
          sessionStorage.removeItem(ADMIN_AUTH_KEY);
          localStorage.removeItem(ADMIN_AUTH_TOKEN);
          sessionStorage.removeItem(ADMIN_AUTH_TOKEN);

          localStorage.removeItem(ADMIN_AUTH_KEY);
        }
      }
    );
  },
});

export default adminAuthSlice.reducer;
export const { logoutAdmin, setAccessToken } = adminAuthSlice.actions;
