import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, ListChevronsDownUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import BackButton from "@/components/ui/backButton";
import { useNavigate, useParams } from "react-router";
import assort_api from "@/api/axios";
import { APP_POINTS } from "@/api/apiConfig";
import { hasProjectRight } from "@/appFunctions";

import { ProjectUpdatesTab } from "@/components/organization/ProjectDetailPage/ProjectUpdatesTab";
import { ProjectChatTab } from "@/components/organization/ProjectDetailPage/ProjectChatTab";
import { ProjectMembersTab } from "@/components/organization/ProjectDetailPage/ProjectMembersTab";

import { EditProjectModal } from "@/components/organization/EditProjectModal";
import { AddPhaseModal } from "@/components/organization/AddPhaseModal";
import { ReorderPhasesModal } from "@/components/organization/ReorderPhasesModal";
import ProjectInfoCard from "@/components/organization/ProjectDetailPage/ProjectInfoCard";
import PhaseCard from "@/components/organization/ProjectDetailPage/PhaseCard";
import { useAuthState } from "@/redux/hooks";
import { useCallback } from "react";

export default function ProjectDetailPage() {
  const [editProjectModalOpen, setEditProjectModalOpen] = useState(false);
  const [addPhaseModalOpen, setAddPhaseModalOpen] = useState(false);
  const [reorderPhasesModalOpen, setReorderPhasesModalOpen] = useState(false);

  const [project, setProject] = useState(null);
  const [phases, setPhases] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { projectId } = useParams();
  const { activeOrganization } = useAuthState();

  useEffect(() => {
    if (!projectId) return;

    const fetchProjectDetail = async () => {
      setLoading(true);
      try {
        const res = await assort_api.get(`${APP_POINTS.PROJECTS + projectId}/`);

        const {
          id,
          title,
          description,
          status,
          deadline,
          progress,
          members_count,
          chat_room_id,
          project_manager,
          phases,
        } = res.data;

        setProject({
          id,
          title,
          description: description || "",
          status,
          deadline: deadline || "",
          progress: progress || 0,
          members_count: members_count || 0,
          chat_room_id,
          project_manager: project_manager || { id: "", full_name: "" },
        });

        setPhases(phases || []);
      } catch (error) {
        console.error("Failed to fetch project:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetail();
  }, [projectId]);

  const handlePhaseReorder = (reorderedPhases) => {
    setPhases(reorderedPhases);
  };

  const updateProject = (details) => {
    setProject((prev) => ({ ...prev, ...details }));
  };

  const addPhase = (data) => {
    setPhases((prev) => [...prev, data]);
  };

  const editPhase = (updatedPhase) => {
    setPhases((prev) =>
      prev.map((phase) => {
        if (phase.id !== updatedPhase.id) return phase;

        return {
          ...phase,
          title: updatedPhase.title,
          description: updatedPhase.description,
          deadline: updatedPhase.deadline,
        };
      }),
    );
  };

  const updateProjectStatus = (newStatus) => {
    setProject((prev) => ({ ...prev, status: newStatus }));
  };

  const updatePhaseStatus = (updatedPhase) => {
    setPhases((prev) =>
      prev.map((phase) =>
        phase.id !== updatedPhase.id
          ? phase
          : { ...phase, status: updatedPhase.newStatus },
      ),
    );
  };

  const addTask = (data) => {
    setPhases((prev) =>
      prev.map((phase) =>
        phase.id == data.phaseId
          ? {
              ...phase,
              tasks: [...phase.tasks, data.taskDetails],
            }
          : phase,
      ),
    );
  };

  const handleTasksReorder = (reorderedTasks) => {
    setPhases((prev) =>
      prev.map((phase) =>
        phase.id === reorderedTasks.phaseId
          ? { ...phase, tasks: reorderedTasks.tasks }
          : phase,
      ),
    );
  };

  const handleRoomCreated = useCallback((newRoomId) => {
    setProject((prev) => ({
      ...prev,
      chat_room_id: newRoomId,
    }));
  }, []);

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (!project) {
    return (
      <>
        <BackButton onClick={() => navigate(-1)} />
        <div className="text-center py-10">Project not found</div>
      </>
    );
  }

  return (
    <div className="space-y-6">
      <BackButton onClick={() => navigate(-1)} />

      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
          <TabsTrigger value="info">Info</TabsTrigger>
          <TabsTrigger value="updates">Updates</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-6">
          <ProjectInfoCard
            activeOrganization={activeOrganization}
            project={project}
            setEditProjectModalOpen={setEditProjectModalOpen}
            updateStatus={updateProjectStatus}
          />

          {hasProjectRight(activeOrganization.role) && (
            <div className="flex justify-end gap-2">
              {phases.length > 1 && (
                <Button
                  onClick={() => setReorderPhasesModalOpen(true)}
                  variant="outline"
                  className="gap-2"
                >
                  <ListChevronsDownUp className="h-4 w-4" />
                  Reorder Phases
                </Button>
              )}
              <Button
                onClick={() => setAddPhaseModalOpen(true)}
                variant="outline"
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Phase
              </Button>
            </div>
          )}

          <div className="space-y-4 p-2 bg-gray-500/10 rounded-xl">
            <div className="font-normal pt-2 pl-2 text-xl">Phases</div>
            {phases.length === 0 && (
              <p className="text-sm text-muted-foreground text-center">
                No phases yet
              </p>
            )}

            {/* Phase Cards */}
            {phases?.map((phase) => (
              <PhaseCard
                activeOrganization={activeOrganization}
                phase={phase}
                project={project}
                addTask={addTask}
                editPhase={editPhase}
                handleTasksReorder={handleTasksReorder}
                updateStatus={updatePhaseStatus}
                key={phase.id}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="updates">
          <ProjectUpdatesTab projectId={projectId} />
        </TabsContent>

        <TabsContent value="chat">
          <ProjectChatTab
            roomId={project?.chat_room_id}
            projectId={projectId}
            hasProjectRight={hasProjectRight(activeOrganization.role)}
            onRoomCreated={handleRoomCreated}
          />
        </TabsContent>

        <TabsContent value="members">
          <ProjectMembersTab projectId={projectId} />
        </TabsContent>
      </Tabs>

      {hasProjectRight(activeOrganization.role) && (
        <>
          <EditProjectModal
            open={editProjectModalOpen}
            onOpenChange={setEditProjectModalOpen}
            project={project}
            updatedProjectDetails={updateProject}
          />

          <AddPhaseModal
            open={addPhaseModalOpen}
            onOpenChange={setAddPhaseModalOpen}
            project={project}
            addedPhaseDetails={addPhase}
          />

          <ReorderPhasesModal
            open={reorderPhasesModalOpen}
            onOpenChange={setReorderPhasesModalOpen}
            phases={phases}
            projectId={projectId}
            onPhaseReorder={handlePhaseReorder}
          />
        </>
      )}
    </div>
  );
}
