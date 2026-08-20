import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/redux/slices/authSlice";
import workspaceReducer from "@/redux/slices/workspaceSlice";
import callSessionReducer from "@/redux/slices/callSessionSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    workspace: workspaceReducer,
    callSession: callSessionReducer,
  },
});
