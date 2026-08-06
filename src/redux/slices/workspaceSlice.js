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

    addWaitingCall: (state, action) => {
      const exists = state.waitingCalls.some(
        (call) => call.session_id === action.payload.session_id,
      );

      if (!exists) {
        state.waitingCalls.push(action.payload);
      }
    },

    removeWaitingCall: (state, action) => {
      state.waitingCalls = state.waitingCalls.filter(
        (call) => call.session_id !== action.payload,
      );
    },

    clearWaitingCalls: (state) => {
      state.waitingCalls = [];
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
  addWaitingCall,
  removeWaitingCall,
  clearWaitingCalls,
  clearIncomingCall,
  setWorkspaceSummary,
  updateWorkspaceSummary,
  setMinimized,
  toggleMinimized,
  resetWorkspaceState,
} = workspaceSlice.actions;

export default workspaceSlice.reducer;
