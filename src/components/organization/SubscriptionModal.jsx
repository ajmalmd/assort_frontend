import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "@/context/authContext";
import assort_api from "@/api/axios";
import { APP_POINTS } from "@/api/apiConfig";
import { formatEnum } from "@/appFunctions";
import { Badge } from "lucide-react";
import { Button } from "../ui/button";
import { Check } from "lucide-react";
import toast from "react-hot-toast";
import { loadRazorpay } from "@/api/razorpay";

export const SubscriptionModal = ({
  isOpen,
  onClose,
  title = "Choose Your Plan",
  description,
}) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const hasRedirected = useRef(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { activeOrganization, organizations, setLoginData, user } = useAuth();

  useEffect(() => {
    if (!activeOrganization || hasRedirected.current) return;

    if (location.pathname !== "/onboarding/profile") return;

    if (activeOrganization.role !== "OWNER") {
      hasRedirected.current = true;
      navigate("/app", { replace: true });
      return;
    }

    if (["ACTIVE", "TRIAL"].includes(activeOrganization.subscription_status)) {
      hasRedirected.current = true;
      navigate("/app", { replace: true });
      return;
    }
  }, [activeOrganization?.id, location.pathname]);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);

    assort_api
      .get(APP_POINTS.SUBSCRIPTIONS + "plans/")
      .then((res) => setPlans(res.data || []))
      .catch(() => setPlans([]))
      .finally(() => setLoading(false));
  }, [isOpen]);

  const updateSubscriptionStatus = (status) => {
    setLoginData({
      user,
      organizations: organizations.map((org) =>
        org.id === activeOrganization.id
          ? { ...org, subscription_status: status }
          : org,
      ),
    });
    onClose?.();
  };

  const handleSubscribe = async (planId) => {
    if (isSaving) return;

    try {
      setIsSaving(true);
      setSelectedPlan(planId);

      await assort_api.post(APP_POINTS.SUBSCRIPTIONS + "subscribe/", {
        plan_id: planId,
      });

      const orderRes = await assort_api.post(
        APP_POINTS.SUBSCRIPTIONS + "create-order/",
        { plan_id: planId },
      );

      const { order_id, amount, currency, key } = orderRes.data;

      const rpLoaded = await loadRazorpay();

      if (!rpLoaded) {
        toast.error("Razorpay SDK failed to load");
        setIsSaving(false);
        return;
      }

      const options = {
        key,
        amount,
        currency,
        name: "Assort",
        description: "Subscription Payment",
        order_id,

        handler: async function (response) {
          try {
            await assort_api.post(APP_POINTS.SUBSCRIPTIONS + "verify/", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            updateSubscriptionStatus("ACTIVE");
            navigate("/app", { replace: true });
          } catch (err) {
            console.error(err);
            toast.error("Payment Verification failed");
          }
        },

        modal: {
          ondismiss: function () {
            toast.error("Payment cancelled");
          },
        },

        prefill: {
          email: activeOrganization?.email,
        },

        theme: {
          color: "#111827",
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function () {
        toast.error("Payment failed. Please try again.");
      });

      rzp.open();
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Something went wrong",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleTrial = async () => {
    try {
      setIsSaving(true);
      await assort_api.post(APP_POINTS.SUBSCRIPTIONS + "trial/");

      updateSubscriptionStatus("TRIAL");
      navigate("/app", { replace: true });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[50] flex items-center justify-center bg-black/40 px-3">
      <div
        className="w-[95vw] max-w-5xl bg-white rounded-2xl shadow-xl
        max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="text-center p-4 sm:p-6 border-b">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {title}
          </h2>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            {description ||
              (activeOrganization.subscription_status === "NONE"
                ? "Select a subscription or start a free trial"
                : "Select a subscription")}
          </p>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[75vh] p-4 sm:p-8">
          {loading && (
            <div className="text-center text-gray-600">Loading plans...</div>
          )}

          {!loading && plans.length === 0 && (
            <div className="text-center text-gray-500">No plans available</div>
          )}

          {!loading && plans.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`rounded-2xl border ${
                    plan.popular
                      ? "border-gray-900 shadow-xl"
                      : "border-gray-200 shadow-md"
                  }`}
                >
                  {plan.popular && (
                    <div className="flex justify-center -mt-4">
                      <Badge className="bg-gray-900 text-white px-3 py-1 text-xs">
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900">
                      {plan.name}
                    </h3>

                    <p className="text-sm text-gray-600 mt-1 mb-4">
                      {plan.description}
                    </p>

                    <div className="mb-4">
                      <span className="text-3xl font-bold">₹{plan.price}</span>
                      {plan.billing_cycle && (
                        <span className="text-gray-600 ml-1">
                          {formatEnum(plan.billing_cycle)}
                        </span>
                      )}
                    </div>

                    <Button
                      disabled={isSaving}
                      className="w-full mb-6 bg-gray-900 text-white hover:bg-gray-800"
                      onClick={() => handleSubscribe(plan.id)}
                    >
                      {isSaving && plan.id === selectedPlan
                        ? "Processing..."
                        : "Choose Plan"}
                    </Button>

                    <div className="space-y-3">
                      {plan.features_json?.map((feature, idx) => (
                        <div key={idx} className="flex gap-2">
                          <Check className="h-4 w-4 text-gray-500 mt-1" />
                          <span className="text-sm text-gray-700">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeOrganization.subscription_status === "NONE" && (
            <div className="text-center mt-6">
              <p className="text-sm text-gray-700 mb-3">
                You can start a free trial for 7 days with Basic plan limits.
              </p>

              <Button
                variant="outline"
                disabled={isSaving}
                onClick={handleTrial}
              >
                {isSaving ? "Starting..." : "Start Free Trial"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
