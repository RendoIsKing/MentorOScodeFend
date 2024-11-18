import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  phoneNumber: "",
  prefix: "",
  id: "",
};

export const USER_INFO = "user_info";

const userInfoSlice = createSlice({
  name: USER_INFO,
  initialState,
  reducers: {
    setUserPhoneNumber(state, action) {
      state.phoneNumber = action.payload.phoneNumber;
      state.prefix = action.payload.prefix;
      state.id = action.payload.id;
    },
  },
});

export const { setUserPhoneNumber } = userInfoSlice.actions;

export default userInfoSlice.reducer;
