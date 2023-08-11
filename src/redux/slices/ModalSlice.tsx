import { createSlice } from "@reduxjs/toolkit";
import React from "react";

export interface ISliceModal {
  active: boolean;
  Children: React.FC<any> | null;
  title?: string;
  props?: {};
  className?: React.HTMLAttributes<HTMLDivElement> | string | undefined;
}

const data: ISliceModal = {
  active: false,
  Children: null,
  title: "",
  props: {},
  className: "",
};

export const modalSlice = createSlice({
  name: "modal",
  initialState: {
    data: data,
  },
  reducers: {
    modalSet: (state, action) => {
      state.data = action.payload;
    },
  },
});

export const { modalSet } = modalSlice.actions;

export const selectModal = (state: any) => state.modal.data;

export default modalSlice.reducer;
