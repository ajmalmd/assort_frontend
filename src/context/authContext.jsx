import { setActiveOrgId } from "@/api/authStore";
import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [activeOrganization, setActiveOrganization] = useState(null);

  const setLoginData = ({ user, organizations }) => {
    setUser(user);
    setOrganizations(organizations);

    if (organizations.length === 1) {
      setActiveOrganization(organizations[0]);
      setActiveOrgId(organizations[0].id); //authStore
    }
  };

  const switchOrganization = (orgId) => {
    const org = organizations.find((o) => o.id === orgId);

    if (!org) return;

    setActiveOrganization(org);
    setActiveOrgId(org.id); //authStore
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        organizations,
        activeOrganization,
        setLoginData,
        switchOrganization,
        setActiveOrganization,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
