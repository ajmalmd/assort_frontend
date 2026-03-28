import { useNavigate } from "react-router";
import { SubscriptionModal } from "./SubscriptionModal";

export const SubscriptionRoute = () => {
  const navigate = useNavigate();

  return (
    <SubscriptionModal
      isOpen={true}
      onClose={() => navigate("/app")}
      title="Subscription Required"
      description="Please subscribe or start a trial to continue using the app."
    />
  );
};
