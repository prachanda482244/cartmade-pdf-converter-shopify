import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface InitialStateProp {
  plan: string;
}
const initialState: InitialStateProp = {
  plan: "Free",
};
const planSlice = createSlice({
  name: "planSlice",
  initialState,
  reducers: {
    addPlan: (state, action: PayloadAction<string>) => {
      state.plan = action.payload;
    },
  },
});

export const { addPlan } = planSlice.actions;
export default planSlice.reducer;
