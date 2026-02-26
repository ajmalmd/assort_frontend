import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Edit, Trash2, Eye } from "lucide-react";
import { APP_POINTS } from "@/api/apiConfig";
import assort_api from "@/api/axios";
import { CreatePlanModal } from "@/components/platform/CreatePlanModal";

const AdminSubscriptionListPage = () => {
  const [plans, setPlans] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await assort_api.get(APP_POINTS.PLATFORM + "plans/");
        if (response.data.results) {
          setPlans(response.data.results);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  const handleCreatePlan = async (planData) => {
    try {
      const response = await assort_api.post(
        APP_POINTS.PLATFORM + "plans/",
        planData,
      );

      setPlans((prev) => [...prev, response.data]);
      setIsModalOpen(false);
    } catch (error) {
      console.error(error.response?.data || error);
    }
  };

  const handleDeletePlan = (id) => {
    setPlans(plans.filter((p) => p.id !== id));
  };

  const filteredPlans = plans.filter((plan) =>
    plan.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <>
      {/* Header */}
      <div className="mb-6 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="relative flex-1 lg:flex-none lg:w-64">
          <input
            type="text"
            placeholder="Search plans..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white hover:bg-gray-800 rounded-lg transition-colors font-medium"
        >
          + Create Plan
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">
                  Plan Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">
                  Billing
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">
                  Max Projects
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">
                  Max Members
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">
                  Storage
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">
                  Subscriptions
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredPlans.map((plan) => (
                <tr
                  key={plan.id}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {plan.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    ₹{plan.price}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 capitalize">
                    {plan.billing_cycle}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {plan.max_projects}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {plan.max_members}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {plan.storage_limit_gb}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                    {plan.subscription_count}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                        title="View"
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>

                      <button
                        onClick={() => handleDeletePlan(plan.id)}
                        className="p-1 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPlans.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-gray-600">No plans found</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <CreatePlanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreatePlan={handleCreatePlan}
      />
    </>
  );
};

export default AdminSubscriptionListPage;
