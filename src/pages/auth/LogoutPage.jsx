import { logout } from "@/api/utility";
import { useEffect } from "react";

const LogoutPage = () => {
  useEffect(() => {
    const endSession = async () => {
      await logout();
    };
    endSession();
  }, []);
  return <div>Logging out...</div>;
};

export default LogoutPage;
