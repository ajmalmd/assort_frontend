import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddProjectMembersModal } from "./AddProjectMembersModal";
import assort_api from "@/api/axios";
import { APP_POINTS } from "@/api/apiConfig";

export function ProjectMembersTab({ projectId }) {
  const [addMemberModalOpen, setAddMemberModalOpen] = useState(false);
  const [members, setMembers] = useState([]);

  const fetchProjectMembers = async () => {
    try {
      const res = await assort_api.get(
        `${APP_POINTS.PROJECTS}project/members/${projectId}/`,
      );
      setMembers(res.data || []);
    } catch (err) {
      console.error("Failed to fetch members:", err);
    }
  };

  useEffect(() => {
    if (projectId) fetchProjectMembers();
  }, [projectId]);

  const roles = [...new Set(members.map((mem) => mem.role).filter(Boolean))];

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
            </CardContent>
          </Card>
        ))}
      </div>

      <AddProjectMembersModal
        open={addMemberModalOpen}
        onOpenChange={setAddMemberModalOpen}
        projectId={projectId}
        roles={roles}
        refreshMembers={fetchProjectMembers}
      />
    </div>
  );
}
