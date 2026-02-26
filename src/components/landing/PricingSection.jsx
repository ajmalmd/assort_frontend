import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { APP_POINTS } from "@/api/apiConfig";
import { useNavigate } from "react-router";
import assort_api from "../../api/axios";
import { formatEnum } from "@/appFunctions";


const PricingSection = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    assort_api
      .get(APP_POINTS.SUBSCRIPTIONS + "plans/")
      .then((res) => {
        const data = res.data?.results || res.data;

        if (Array.isArray(data) && data.length > 0) {
          setPlans(data);
        } else {
          setPlans([]);
        }
      })
      .catch(() => {
        setPlans([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl font-bold text-gray-900">
            Simple, Transparent Pricing
          </h2>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center text-gray-600">Loading plans...</div>
        )}

        {/* Plans */}
        {!loading && plans.length === 0 && (
          <div className="text-center text-gray-500">
            No plans available at the moment.
          </div>
        )}

        {!loading && plans.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {plans.map((plan, index) => (
              <div
                key={plan.id || index}
                className={`relative rounded-2xl transition-all ${
                  plan.popular
                    ? "bg-white border-2 border-gray-900 shadow-xl"
                    : "bg-white border border-gray-200 shadow-lg"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gray-900 text-white px-4 py-1 text-xs font-semibold">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <div className={`p-8 ${plan.popular ? "pt-12" : ""}`}>
                  {/* Plan name */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    {plan.name}
                  </h3>

                  <p className="text-sm text-gray-600 mb-6">
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-gray-900">
                        ₹{plan.price}
                      </span>
                      {plan.billing_cycle && (
                        <span className="text-gray-600">{formatEnum(plan.billing_cycle)}</span>
                      )}
                    </div>
                  </div>

                  {/* CTA */}
                  <Button
                    className="w-full rounded-full py-6 font-semibold mb-8 bg-gray-900 hover:bg-gray-800 text-white"
                    onClick={() => navigate("/create-organization")}
                  >
                    Get Started
                  </Button>

                  {/* Features */}
                  {Array.isArray(plan.features_json) && (
                    <div className="space-y-4">
                      {plan.features_json.map((feature, featureIndex) => (
                        <div
                          key={featureIndex}
                          className="flex items-start gap-3"
                        >
                          <Check className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700 text-sm">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default PricingSection;
