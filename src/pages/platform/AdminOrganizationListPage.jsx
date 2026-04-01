import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { APP_POINTS } from "@/api/apiConfig";
import assort_api from "@/api/axios";
import { Search, ToggleRight, ToggleLeft, Edit, Eye } from "lucide-react";
import toast from "react-hot-toast";

const AdminOrganizationListPage = () => {
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [viewOrg, setViewOrg] = useState(null);
  const [editOrg, setEditOrg] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await assort_api.get(
          APP_POINTS.PLATFORM + "organizations/",
        );
        // sample response.data = {
        // "count": 3,
        // "next": null,
        // "previous": null,
        // "results": [
        //     {
        //         "id": 4,
        //         "title": "Test Org",
        //         "email": "sayit55876@fun4k.com",
        //         "logo": null,
        //         "city": "Trivandrum",
        //         "country": "India",
        //         "is_active": true,
        //         "created_at": "2026-03-25T17:03:47.943177Z"
        //     }]}
        setOrganizations(response.data.results);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  const toggleStatus = async (org) => {
    try {
      const res = await assort_api.patch(
        APP_POINTS.PLATFORM + `organizations/${org.id}/`,
        { is_active: !org.is_active },
      );

      setOrganizations((prev) =>
        prev.map((p) => (p.id === org.id ? res.data : p)),
      );

      toast.success(
        org.is_active ? "Organization deactivated" : "Organization activated",
      );
    } catch (err) {
      console.log("ERROR", err);
      toast.error("Failed to update status");
    }
  };
  return (
    <>
      <div className="mb-6 flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
        <div className="relative bg-white flex-1 lg:w-64 border border-gray-300 rounded-lg">
          <Search
            size={18}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 cursor-pointer"
        >
          <option>All Status</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-center">
              <th className="px-6 py-4 text-sm font-semibold text-gray-900">
                Organization
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-900">
                Email
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-900">
                Members
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-900">
                Projects
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-900">
                Status
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-900">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {organizations?.map((org, index) => (
              <tr
                key={org.id}
                className={`border-b text-center border-gray-200 hover:bg-gray-50 transition-colors ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                }`}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-900">
                      {org.title}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{org.email}</td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {org.members ? org.members : 0}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {org.projects ? org.projects : 0}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                      org.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {org.is_active ? "Active" : "InActive"}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewOrg(org)}
                      className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                      title="View"
                    >
                      <Eye size={16} />
                    </button>

                    <button
                      onClick={() => setEditOrg(org)}
                      className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>

                    {/* Toggle Switch */}
                    <button
                      onClick={() => toggleStatus(org)}
                      className={`p-1 rounded transition-colors ${
                        org.is_active
                          ? "text-green-600 hover:bg-green-100"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                      title={org.is_active ? "Deactivate" : "Activate"}
                    >
                      {org.is_active ? (
                        <ToggleRight size={20} />
                      ) : (
                        <ToggleLeft size={20} />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default AdminOrganizationListPage;
