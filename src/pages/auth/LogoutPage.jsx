import { logout } from "@/api/utility";
import { useAppDispatch } from "@/redux/hooks";
import { clearLoginData } from "@/redux/slices/authSlice";
import { useEffect } from "react";

const LogoutPage = () => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    const endSession = async () => {
      await logout();
      dispatch(clearLoginData());
    };
    endSession();
  }, []);
  return <div>Logging out...</div>;
};

export default LogoutPage;
