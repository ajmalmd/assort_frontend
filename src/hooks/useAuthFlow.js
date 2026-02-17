import { useNavigate } from "react-router";

const FLOW_KEY = "auth_flow";

export const useAuthFlow = () => {
  const navigate = useNavigate();

  const getFlow = () => {
    const data = sessionStorage.getItem(FLOW_KEY);
    return data ? JSON.parse(data) : null;
  };

  const startFlow = ({ email, title = null, type }) => {
    const flowData = {
      email,
      title,
      type, // "create" or "forgot"
      otpSentTime: Date.now(),
      verificationToken: null,
    };

    sessionStorage.setItem(FLOW_KEY, JSON.stringify(flowData));
  };

  const setVerificationToken = (token) => {
    const flow = getFlow();
    if (!flow) return;

    flow.verificationToken = token;
    sessionStorage.setItem(FLOW_KEY, JSON.stringify(flow));
  };

  const requireStep = (step) => {
    const flow = getFlow();

    if (!flow) return null;

    if (step === "otp" && !flow.email) return null;

    if (step === "password" && !flow.verificationToken) return null;

    return flow;
  };
  
  const clearFlow = () => {
    sessionStorage.removeItem(FLOW_KEY);
  };

  const getRemainingOtpTime = (duration = 60) => {
    const flow = getFlow();
    if (!flow?.otpSentTime) return 0;

    const elapsed = Math.floor((Date.now() - flow.otpSentTime) / 1000);
    const remaining = duration - elapsed;

    return remaining > 0 ? remaining : 0;
  };

  const resetOtpTimer = () => {
    const flow = getFlow();
    if (!flow) return;

    flow.otpSentTime = Date.now();
    sessionStorage.setItem(FLOW_KEY, JSON.stringify(flow));
  };

  return {
    getFlow,
    startFlow,
    setVerificationToken,
    requireStep,
    clearFlow,
    getRemainingOtpTime,
    resetOtpTimer,
  };
};
