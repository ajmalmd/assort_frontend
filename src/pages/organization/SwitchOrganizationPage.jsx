import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowRight, Briefcase } from "lucide-react";
import { getPostLoginRoute } from "@/utils/authRedirect";
import { getActiveOrgId } from "@/api/authStore";
import { formatEnum } from "@/appFunctions";
import { useAppDispatch, useAuthState } from "@/redux/hooks";
import { switchOrganization } from "@/redux/slices/authSlice";
import assort_api from "@/api/axios";
import { APP_POINTS } from "@/api/apiConfig";
import { Badge } from "@/components/ui/badge";

export default function SwitchOrganizationPage() {
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [unreadNotifications, setUnreadNotifications] = useState([]);

  const { organizations } = useAuthState();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!organizations || organizations.length === 0) return;

    // Single org → redirect immediately
    if (organizations.length === 1) {
      const route = getPostLoginRoute(organizations);
      navigate(route, { replace: true });
      return; // 🔥 stop further execution
    }

    // Multiple orgs → preselect first
    const activeOrg = organizations.find(
      (org) => Number(org.id) === Number(getActiveOrgId()),
    );

    setSelectedOrg(activeOrg);
  }, [organizations, navigate]);

  useEffect(() => {
    const fetchNotificationSummary = async () => {
      const res = await assort_api.get(`${APP_POINTS.NOTIFICATIONS}summary/`);
      setUnreadNotifications(res.data?.organizations);
    };
    fetchNotificationSummary();
  }, []);

  const getUnreadCount = (id) => {
    const org = unreadNotifications.find((o) => o.organization_id === id);
    return org?.unread ?? 0;
  };

  const handleSwitch = () => {
    if (!selectedOrg) return;

    dispatch(switchOrganization(selectedOrg.id));

    const route = getPostLoginRoute([selectedOrg]);
    navigate(route, { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center px-4 py-8 lg:px-8">
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

      <div className="w-full max-w-2xl bg-white border border-gray-200 rounded-lg flex flex-col h-[500px]">
        <div className="flex-1 overflow-y-auto hide-scrollbar p-4 space-y-4">
          {organizations.map((org) => (
            <div
              key={org.id}
              onClick={() => selectedOrg?.id !== org.id && setSelectedOrg(org)}
              className={`flex items-center justify-between p-6 rounded-lg border transition-all cursor-pointer
                ${
                  selectedOrg?.id === org.id
                    ? "border-gray-900 ring-2 ring-gray-900"
                    : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 justify-between">
                  <div className="flex gap-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {org.title}
                    </h3>
                    {getUnreadCount(org.id) > 0 && (
                      <Badge
                        variant="destructive"
                        className="h-5 w-5 p-0 flex items-center justify-center text-xs pointer-events-none"
                      >
                        {getUnreadCount(org.id)}
                      </Badge>
                    )}
                  </div>

                  <span className="px-2 py-1 bg-gray-900 text-gray-100 text-xs font-medium rounded">
                    {formatEnum(org.role)}
                  </span>
                </div>

                <p className="text-sm text-gray-600">
                  Contact: <span className="text-gray-800">{org.email}</span>
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-200 p-4 flex justify-end">
          <button
            onClick={handleSwitch}
            disabled={!selectedOrg}
            className={`inline-flex items-center gap-2 px-4 py-2 font-medium rounded transition-colors
              ${
                selectedOrg
                  ? "bg-gray-900 text-white hover:bg-gray-800"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
          >
            Continue
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
