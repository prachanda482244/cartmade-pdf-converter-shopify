import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  buttonSettings: {},
};
const buttonSettingsSlice = createSlice({
  name: "buttonSettingsSlice",
  initialState,
  reducers: {
    addButtonSettings: (state, action) => {
      state.buttonSettings = action.payload;
    },
  },
});
