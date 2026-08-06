import { useDispatch, useSelector } from "react-redux";

export const useAppDispatch = () => useDispatch();

export const useAuthState = () => useSelector((state) => state.auth);

export const useWorkspaceState = () => useSelector((state) => state.workspace);
