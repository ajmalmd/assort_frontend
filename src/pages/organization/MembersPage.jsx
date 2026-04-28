import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import assort_api from "@/api/axios";
import { APP_POINTS } from "@/api/apiConfig";
import { InviteMemberModal } from "@/components/organization/InviteMemberModal";
import { Search } from "lucide-react";
import { formatEnum } from "@/appFunctions";

const MembersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [members, setMembers] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await assort_api.get(
          APP_POINTS.ORGANIZATIONS + "members/",
        );
        setMembers(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole =
      roleFilter === "All Roles" || member.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const roles = ["All Roles", ...new Set(members.map((m) => m.role))];

  const handleSendInvitation = (data) => {
    const newMember = {
      id: (members.length + 1).toString(),
      name: data.name,
      email: data.email,
      department: data.department || "",
      role: data.role,
      status: "Active",
    };
    setMembers([...members, newMember]);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <InviteMemberModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSendInvitation={handleSendInvitation}
      />

      <div className="flex items-center justify-end">
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
        >
          + Invite Member
        </button>
      </div>

      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
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
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 cursor-pointer"
        >
          {roles.map((role) => (
            <option key={role} value={role}>
              {formatEnum(role)}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-900">
                  Name
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-900">
                  Email
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-900">
                  Role
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-900">
                  Department
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-900">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr
                  key={member.id}
                  className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/app/member/${member.id}`)}
                >
                  <td className="px-6 py-4 text-center text-sm font-medium text-gray-900">
                    {member.name}
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-700">
                    {member.email}
                  </td>
                  <td className="px-6 py-4 text-center text-sm">
                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {formatEnum(member.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-700">
                    {member.department ? member.department : "--"}
                  </td>
                  <td className="px-6 py-4 text-center text-sm">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        member.is_active === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {member.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredMembers.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-gray-600">No members found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MembersPage;
