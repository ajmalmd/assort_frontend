import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/context/authContext";
import assort_api from "@/api/axios";
import { APP_POINTS } from "@/api/apiConfig";
import { formatEnum } from "@/appFunctions";
import { Badge } from "lucide-react";
import { Button } from "../ui/button";
import { Check } from "lucide-react";
import toast from "react-hot-toast";

export const SubscriptionModal = ({
  isOpen,
  onClose,
  title = "Choose Your Plan",
  description,
}) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const navigate = useNavigate();
  const { activeOrganization, organizations, setLoginData, user } = useAuth();

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    assort_api
      .get(APP_POINTS.SUBSCRIPTIONS + "plans/")
      .then((res) => setPlans(res.data?.results || []))
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
    onClose();
  };

  const handleSubscribe = async (planId) => {
    if (isSaving) return;
    try {
      setIsSaving(true);

      // Mark subscription as PENDING
      await assort_api.post(APP_POINTS.SUBSCRIPTIONS + "subscribe/", {
        plan_id: planId,
      });

      // Create Razorpay Order
      const orderRes = await assort_api.post(
        APP_POINTS.SUBSCRIPTIONS + "create-order/",
      );

      const { order_id, amount, currency, key } = orderRes.data;
      const rpLoaded = await loadRazorpay();

      if (!rpLoaded) {
        toast.error("Razorpay SDK failed to load");
        setIsSaving(false);
        return;
      }

      // Open Razorpay Checkout
      const options = {
        key,
        amount,
        currency,
        name: "Assort",
        description: "Subscription Payment",
        order_id,

        handler: async function (response) {
          try {
            // Verify payment
            await assort_api.post(APP_POINTS.SUBSCRIPTIONS + "verify/", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            // Update UI state
            updateSubscriptionStatus("ACTIVE");

            // Redirect
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

      rzp.on("payment.failed", function (response) {
        console.error(response.error);
        toast.error("Payment failed. Please try again.");
      });

      rzp.open();
    } catch (err) {
      console.error(err);
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Something went wrong";

      toast.error(message);
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
    <div className="fixed top-16 left-0 right-0 bottom-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-xl p-6 md:p-10 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
          <p className="text-gray-600 mt-2">
            {description ||
              (activeOrganization.subscription_status === "NONE"
                ? "Select a subscription or start a free trial"
                : "Select a subscription")}
          </p>
        </div>

        {/* Plans */}
        {loading && (
          <div className="text-center text-gray-600">Loading plans...</div>
        )}

        {!loading && plans.length === 0 && (
          <div className="text-center text-gray-500">No plans available</div>
        )}

        {!loading && plans.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
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
                    {isSaving ? "Processing..." : "Choose Plan"}
                  </Button>
                  <div className="space-y-3">
                    {plan.features_json.map((feature, idx) => (
                      <div key={idx} className="flex gap-2">
                        <Check className="h-4 w-4 text-gray-500 mt-1" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Trial */}
        {activeOrganization.subscription_status === "NONE" && (
          <div className="text-center mb-6">
            <Button variant="outline" disabled={isSaving} onClick={handleTrial}>
              {isSaving ? "Starting..." : "Start Free Trial"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
