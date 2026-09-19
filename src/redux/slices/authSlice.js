import { createSlice } from "@reduxjs/toolkit";
import { setActiveOrgId } from "@/api/authStore";

const initialState = {
  user: null,
  organizations: [],
  activeOrganization: null,
  isAdmin: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    setLoginData: (state, action) => {
      const { user, organizations, isAdmin } = action.payload;

      state.user = user;
      state.organizations = organizations;
      state.isAdmin = isAdmin || false;

      if (organizations.length === 1) {
        state.activeOrganization = organizations[0];
        setActiveOrgId(organizations[0].id);
      } else {
        state.activeOrganization = null;
      }
    },

    switchOrganization: (state, action) => {
      const orgId = action.payload;

      const org = state.organizations.find((o) => o.id === orgId);

      if (!org) return;

      state.activeOrganization = org;

      setActiveOrgId(org.id);
    },

    setActiveOrganization: (state, action) => {
      state.activeOrganization = action.payload;

      if (action.payload?.id) {
        setActiveOrgId(action.payload.id);
      }
    },

    logout: (state) => {
      state.user = null;
      state.organizations = [];
      state.activeOrganization = null;
      state.isAdmin = false;

      setActiveOrgId(null);
    },
  },
});

export const {
  setLoginData,
  switchOrganization,
  setActiveOrganization,
  logout,
} = authSlice.actions;

export default authSlice.reducer;
