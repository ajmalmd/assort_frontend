import { useState } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import CreateDepartmentModal from "@/components/organization/CreateDepartmentModal";
import { useEffect } from "react";
import { APP_POINTS } from "@/api/apiConfig";
import assort_api from "@/api/axios";
import { useNavigate } from "react-router";

const mockDepartments = [
  {
    id: 1,
    name: "Engineering",
    memberCount: 12,
    description: "Product Development",
  },
  { id: 2, name: "Design", memberCount: 8, description: "UX/UI Design" },
  { id: 3, name: "Sales", memberCount: 5, description: "Business Development" },
];

const DepartmentsPage = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [departments, setDepartments] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDepartments = async () => {
      const res = await assort_api.get(APP_POINTS.DEPARTMENTS);
      setDepartments(res.data);
    };
    fetchDepartments();
  }, [createModalOpen]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
        >
          + Create Department
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((dept) => (
          <div
            key={dept.id}
            onClick={() => navigate(`/app/department/${dept.id}`)}
          >
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="items-center">
                <CardTitle className="text-lg mb-2">{dept.name}</CardTitle>
                {/* <p className="text-sm text-muted-foreground mb-4">
                  Description
                </p> */}
                {dept.members_count ? (
                  <p className="text-xs text-muted-foreground">
                    <span className="text-lg text-black">
                      {dept.members_count}
                    </span>
                    {dept.members_count > 1 ? " members" : " member"}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    <span className="text-lg text-black">0</span> members
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
      <CreateDepartmentModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />
    </div>
  );
};

export default DepartmentsPage;
