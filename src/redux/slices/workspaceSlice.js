import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  connected: false,
  incomingCall: null,
  organizationsSummary: [],
  minimized: true,
  waitingCalls: [],
};

const workspaceSlice = createSlice({
  name: "workspace",
  initialState,

  reducers: {
    setConnected(state, action) {
      state.connected = action.payload;
    },

    setIncomingCall(state, action) {
      state.incomingCall = action.payload;
    },

    clearIncomingCall(state) {
      state.incomingCall = null;
    },

    setWorkspaceSummary(state, action) {
      state.organizationsSummary = action.payload;
    },

    updateWorkspaceSummary(state, action) {
      const updated = action.payload;

      const index = state.organizationsSummary.findIndex(
        (org) => org.organization_id === updated.organization_id,
      );

      if (index !== -1) {
        state.organizationsSummary[index] = {
          ...state.organizationsSummary[index],
          ...updated,
        };
      }
    },

    setMinimized(state, action) {
      state.minimized = action.payload;
    },

    toggleMinimized(state) {
      state.minimized = !state.minimized;
    },

    resetWorkspaceState() {
      return initialState;
    },
  },
});

export const {
  setConnected,
  setIncomingCall,
  clearIncomingCall,
  setWorkspaceSummary,
  updateWorkspaceSummary,
  setMinimized,
  toggleMinimized,
  resetWorkspaceState,
} = workspaceSlice.actions;

export default workspaceSlice.reducer;
