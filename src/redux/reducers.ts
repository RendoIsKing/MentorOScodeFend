import { combineReducers } from "redux";

import { store } from "./store";

const rootReducer = combineReducers({});

export type RootState = ReturnType<typeof store.getState>;

export default rootReducer;
