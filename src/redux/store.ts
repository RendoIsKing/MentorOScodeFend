import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { HAVE_ME_API_REDUCER_KEY as HAVE_ME_REDUCER_PATH, HAVE_ME_ADMIN_API_REDUCER_KEY as HAVE_ME_ADMIN_REDUCER_PATH } from "@/contracts/reduxResourceTags";
import { havemeApi } from "./services/haveme";
import authSliceReducer from "./slices/auth/index";
import userInfoReducer from "./slices/user-info/index";
import adapterResultsReducer from './slices/adapters/index'
import { adminApi } from "./admin-services";
import adminAuthSliceReducer from './slices/admin/index'

export const store = configureStore({
  reducer: {
    auth: authSliceReducer,
    userInfo: userInfoReducer,
    adapterResults: adapterResultsReducer,
    adminAuth: adminAuthSliceReducer,
    [HAVE_ME_REDUCER_PATH]: havemeApi.reducer,
    [HAVE_ME_ADMIN_REDUCER_PATH]: adminApi.reducer,
  },
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware()
      .concat(havemeApi.middleware)
      .concat(adminApi.middleware);
  },
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
