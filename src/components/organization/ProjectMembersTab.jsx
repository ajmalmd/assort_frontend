import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddProjectMembersModal } from "./AddProjectMembersModal";
import assort_api from "@/api/axios";
import { APP_POINTS } from "@/api/apiConfig";

const mockMembers = [
  {
    id: "1",
    full_name: "Sarah Johnson",
    role: "Project Lead",
    email: "sarah@assort.app",
  },
  {
    id: "2",
    full_name: "Clinton",
    role: "UI/UX Designer",
    email: "clinton@assort.app",
  },
  {
    id: "3",
    full_name: "Mike Chen",
    role: "Frontend Developer",
    email: "mike@assort.app",
  },
  {
    id: "4",
    full_name: "Emma Wilson",
    role: "Backend Developer",
    email: "emma@assort.app",
  },
  {
    id: "5",
    full_name: "David Lee",
    role: "QA Engineer",
    email: "david@assort.app",
  },
];

export function ProjectMembersTab({ projectId }) {
  const [addMemberModalOpen, setAddMemberModalOpen] = useState(false);
  const [members, setMembers] = useState([]);
  const roles = [...new Set(members.map((mem) => mem.role))];

  useEffect(() => {
    const fetchProjectMembers = async () => {
      const res = await assort_api.get(
        `${APP_POINTS.PROJECTS}project/members/${projectId}/`,
      );
      setMembers(res.data || []);
    };
    fetchProjectMembers();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setAddMemberModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Member
        </Button>
      </div>

      <div className="space-y-3">
        {members?.map((member) => (
          <Card key={member.id}>
            <CardContent>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <p className="font-bold text-sm">{member.full_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {member.email}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="text-xs">{member.role}</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AddProjectMembersModal
        open={addMemberModalOpen}
        onOpenChange={setAddMemberModalOpen}
        projectId={projectId}
        roles={roles}
      />
    </div>
  );
}
