import { X, GripVertical } from "lucide-react";

export function ViewPlanModal({ isOpen, onClose, plan }) {
  if (!isOpen || !plan) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-900">
            View Subscription Plan
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-700" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Plan Name */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Plan Name
            </label>
            <p className="text-gray-700">{plan.name}</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Description
            </label>
            <p className="text-gray-700">{plan.description || "-"}</p>
          </div>

          {/* Price & Billing */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Price (₹)</label>
              <p className="text-gray-700">{plan.price}</p>
            </div>
            <div>
              <label className="block text-sm font-medium">Billing Cycle</label>
              <p className="text-gray-700">{plan.billing_cycle}</p>
            </div>
          </div>

          {/* Features */}
          <div>
            <label className="block text-sm font-medium mb-2">Features</label>
            <div className="space-y-2 bg-gray-50 p-3 rounded-lg">
              {plan.features_json && plan.features_json.length > 0 ? (
                plan.features_json.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-lg"
                  >
                    <GripVertical size={16} className="text-gray-400" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No features added</p>
              )}
            </div>
          </div>

          {/* Plan Limits */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Max Projects
              </label>
              <p className="text-gray-700">
                {plan.max_projects || "Unlimited"}
              </p>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Max Members
              </label>
              <p className="text-gray-700">{plan.max_members || "Unlimited"}</p>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Storage (GB)
              </label>
              <p className="text-gray-700">{plan.storage_limit_gb || "-"}</p>
            </div>
          </div>

          {/* Subscription Count */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Active Subscriptions
            </label>
            <p className="text-gray-700">{plan.subscription_count || 0}</p>
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
