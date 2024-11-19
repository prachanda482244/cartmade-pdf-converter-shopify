import { configureStore } from "@reduxjs/toolkit";
import planSlice from "./slices/planSlice";
export const store = configureStore({
  reducer: {
    plan: planSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
