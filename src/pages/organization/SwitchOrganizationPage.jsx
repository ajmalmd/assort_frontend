import { useState } from "react";
import { useAuth } from "@/context/authContext";
import { useNavigate } from "react-router";
import { ArrowRight, Briefcase } from "lucide-react";

export default function SwitchOrganizationPage() {
  const [selectedOrg, setSelectedOrg] = useState(null);

  const { organizations, switchOrganization } = useAuth();
  const navigate = useNavigate();

  const handleSwitch = () => {
    switchOrganization(selectedOrg.id);
    navigate("/app", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center px-4 py-8 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex justify-between gap-4 items-center">
        <div className="p-3 bg-gray-800 rounded-lg">
          <Briefcase size={28} className="text-gray-100" />
        </div>

        <div>
          <h3 className="text-2xl font-normal text-gray-900 mb-1">
            Your Organizations
          </h3>

          <p className="text-gray-700 text-sm">
            Select an organization to continue
          </p>
        </div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-2xl bg-white border border-gray-200 rounded-lg flex flex-col h-[500px]">
        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto hide-scrollbar p-4 space-y-4">
          {organizations.map((org) => (
            <div
              key={org.id}
              onClick={() => setSelectedOrg(org)}
              className={`flex items-center justify-between p-6 rounded-lg border transition-all cursor-pointer
            ${
              selectedOrg?.id === org.id
                ? "border-gray-900 ring-2 ring-gray-900"
                : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
            }
          `}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {org.title}
                  </h3>

                  <span className="px-2 py-1 bg-gray-900 text-gray-100 text-xs font-medium rounded">
                    {org.role}
                  </span>
                </div>

                <p className="text-sm text-gray-600">
                  Contact: <span className="text-gray-800">{org.email}</span>
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Fixed Footer */}
        <div className="border-t border-gray-200 p-4 flex justify-end">
          <button
            onClick={handleSwitch}
            disabled={!selectedOrg}
            className={`inline-flex items-center gap-2 px-4 py-2 font-medium rounded transition-colors
          ${
            selectedOrg
              ? "bg-gray-900 text-white hover:bg-gray-800"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }
        `}
          >
            Continue
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
