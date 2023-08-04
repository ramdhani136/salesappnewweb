import { configureStore } from "@reduxjs/toolkit";
import ModalReducer from "./slices/ModalSlice";
import logger from "redux-logger";


export const store = configureStore({
  reducer: {
    modal: ModalReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
});
