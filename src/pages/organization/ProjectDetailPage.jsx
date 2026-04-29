import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronDown,
  ChevronRight,
  Edit,
  Plus,
  ListChevronsDownUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import BackButton from "@/components/ui/backButton";
import { useNavigate, useParams } from "react-router";
import assort_api from "@/api/axios";
import { APP_POINTS } from "@/api/apiConfig";
import { formatEnum, hasProjectRight } from "@/appFunctions";
import { useAuth } from "@/context/authContext";

import { ProjectUpdatesTab } from "@/components/organization/ProjectUpdatesTab";
import { ProjectChatTab } from "@/components/organization/ProjectChatTab";
import { ProjectMembersTab } from "@/components/organization/ProjectMembersTab";

import { EditProjectModal } from "@/components/organization/EditProjectModal";
import { AddPhaseModal } from "@/components/organization/AddPhaseModal";
import { ReorderPhasesModal } from "@/components/organization/ReorderPhasesModal";
import { EditPhaseModal } from "@/components/organization/EditPhaseModal";
import { AddTaskModal } from "@/components/organization/AddTaskModal";
import { ReorderTasksModal } from "@/components/organization/ReorderTasksModal";

export default function ProjectDetailPage() {
  const [expandedPhases, setExpandedPhases] = useState({});
  const [expandedTasks, setExpandedTasks] = useState({});

  const [selectedPhaseId, setSelectedPhaseId] = useState(null);
  const [selectedPhase, setSelectedPhase] = useState({});

  const [editProjectModalOpen, setEditProjectModalOpen] = useState(false);
  const [addPhaseModalOpen, setAddPhaseModalOpen] = useState(false);
  const [reorderPhasesModalOpen, setReorderPhasesModalOpen] = useState(false);
  const [editPhaseModalOpen, setEditPhaseModalOpen] = useState(false);
  const [addTaskModalOpen, setAddTaskModalOpen] = useState(false);
  const [reorderTasksModalOpen, setReorderTasksModalOpen] = useState(false);

  const [project, setProject] = useState(null);
  const [phases, setPhases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reorderTasks, setReorderTasks] = useState({});

  const navigate = useNavigate();
  const { projectId } = useParams();
  const { activeOrganization } = useAuth();

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

  const togglePhase = (id) => {
    const key = String(id);
    setExpandedPhases((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleTask = (id) => {
    const key = String(id);
    setExpandedTasks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePhaseReorder = (reorderedPhases) => {
    setPhases(reorderedPhases);
  };

  const getMaxTaskDeadline = (tasks) =>
    tasks?.length
      ? tasks.reduce((max, task) => {
          if (!task.deadline) return max;
          return !max || new Date(task.deadline) > new Date(max)
            ? task.deadline
            : max;
        }, null)
      : null;

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

  const addTask = (data) => {
    console.log(data);

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

  const mockJob = [
    {
      id: 1,
      title: "Sample Job",
      deadline: "2026-10-01",
      worked_hours: 2,
      estimated_hours: 5,
      assigned_to: { id: 4, full_name: "Ajmal" },
    },
  ];

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
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-2xl font-medium mb-2">
                    {project.title}
                  </CardTitle>
                </div>
                <div className="flex items-start gap-2">
                  <Badge>{formatEnum(project.status)}</Badge>

                  {hasProjectRight(activeOrganization.role) && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditProjectModalOpen(true)}
                      className="gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground font-mono whitespace-pre-line">
                {project.description}
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Project Manager
                  </p>
                  <p className="text-sm font-medium">
                    {project.project_manager.full_name}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Deadline</p>
                  <p className="text-sm font-medium">
                    {project.deadline || "--"}
                  </p>
                </div>

                {hasProjectRight(activeOrganization.role) && (
                  <div>
                    <p className="text-xs text-muted-foreground">Members</p>
                    <p className="text-sm font-medium">
                      {project.members_count}
                    </p>
                  </div>
                )}
              </div>

              {hasProjectRight(activeOrganization.role) && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium">Overall Progress</span>
                    <span className="text-muted-foreground">
                      {project.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className="bg-primary h-3 rounded-full transition-all"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

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

            {phases.map((phase) => (
              <Card key={phase.id}>
                <CardHeader onClick={() => togglePhase(phase.id)}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2 flex-1 hover:opacity-75">
                      {expandedPhases[String(phase.id)] ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      <CardTitle className="text-base font-medium">
                        {phase.title}
                      </CardTitle>
                    </div>

                    {hasProjectRight(activeOrganization.role) && (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => {
                          setEditPhaseModalOpen(true);
                          setSelectedPhase({
                            id: phase.id,
                            title: phase.title,
                            description: phase.description,
                            deadline: phase.deadline,
                            maxTaskDeadline: getMaxTaskDeadline(phase.tasks),
                          });
                        }}
                        className="ml-2 gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                    )}
                  </div>
                  <div className="flex grid grid-cols-2 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Deadline</p>
                      <p className="text-sm font-medium">{phase.deadline}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <Badge variant="outline" className="">
                        {formatEnum(phase.status)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                {phase.description && (
                  <CardDescription className="pl-6 pb-2 whitespace-pre-line font-mono border-t pt-4">
                    {phase.description}
                  </CardDescription>
                )}

                {expandedPhases[String(phase.id)] && (
                  <CardContent className="space-y-3 border-t pt-3">
                    {hasProjectRight(activeOrganization.role) && (
                      <div className="flex justify-end gap-2">
                        {phase?.tasks?.length > 1 && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setReorderTasksModalOpen(true);
                              setReorderTasks({
                                phaseId: phase.id,
                                tasks: phase.tasks,
                              });
                            }}
                            variant="outline"
                            className="gap-2"
                          >
                            <ListChevronsDownUp className="h-4 w-4" />
                            Reorder Tasks
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2"
                          onClick={() => {
                            setAddTaskModalOpen(true);
                            setSelectedPhase({
                              id: phase.id,
                              title: phase.title,
                              deadline: phase.deadline,
                            });
                          }}
                        >
                          <Plus className="h-4 w-4" />
                          Add Task
                        </Button>
                      </div>
                    )}
                    {phase?.tasks.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center">
                        No tasks yet
                      </p>
                    )}
                    {phase.tasks?.map((task) => (
                      <div
                        key={task.id}
                        className="space-y-2 bg-gray-500/10 rounded-lg p-3 hover:bg-gray-500/20"
                      >
                        <div className="flex justify-between items-center">
                          <div
                            onClick={() => toggleTask(task.id)}
                            className="flex items-center gap-2 w-full"
                          >
                            {expandedTasks[String(task.id)] ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                            <div className="flex-1 min-w-0 text-left cursor-pointer">
                              <p className="font-medium text-sm hover:text-primary">
                                {task.title}
                              </p>
                              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                <span>Lead: {task.lead?.full_name}</span>
                                <span>Deadline: {task.deadline}</span>
                                <span>
                                  Jobs: {task.jobs_completed || 0}/
                                  {task.total_jobs || 0}
                                </span>
                              </div>
                            </div>
                          </div>
                          {task.has_access && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                navigate(`/app/project/task/${task.id}`);
                              }}
                            >
                              View
                            </Button>
                          )}
                        </div>

                        {expandedTasks[String(task.id)] && (
                          <div className="pl-6 space-y-1">
                            {/* Jobs */}
                            {mockJob.map((job) => (
                              <button
                                key={job.id}
                                onClick={() => {}}
                                className="text-xs p-2 bg-white rounded w-full text-left hover:bg-muted transition-colors"
                              >
                                <p className="font-medium">{job.title}</p>
                                <div className="flex items-center gap-3 mt-1 text-muted-foreground">
                                  <span>
                                    Assigned to: {job.assigned_to?.full_name}
                                  </span>
                                  <span>Deadline: {job.deadline}</span>
                                  <span>
                                    Hours: {job.worked_hours}h /{" "}
                                    {job.estimated_hours}h
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="updates">
          <ProjectUpdatesTab projectId={projectId} />
        </TabsContent>

        <TabsContent value="chat">
          <ProjectChatTab projectId={projectId} />
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
          />

          <AddPhaseModal
            open={addPhaseModalOpen}
            onOpenChange={setAddPhaseModalOpen}
            project={project}
            addedPhaseDetails={addPhase}
          />

          <EditPhaseModal
            open={editPhaseModalOpen}
            onOpenChange={setEditPhaseModalOpen}
            project={project}
            phase={selectedPhase}
            editedPhaseDetails={editPhase}
          />

          <ReorderPhasesModal
            open={reorderPhasesModalOpen}
            onOpenChange={setReorderPhasesModalOpen}
            phases={phases}
            projectId={projectId}
            onPhaseReorder={handlePhaseReorder}
          />

          <AddTaskModal
            open={addTaskModalOpen}
            onOpenChange={setAddTaskModalOpen}
            project={project}
            phase={selectedPhase}
            addedTaskDetails={addTask}
          />

          <ReorderTasksModal
            open={reorderTasksModalOpen}
            onOpenChange={setReorderTasksModalOpen}
            tasks={reorderTasks.tasks}
            phaseId={reorderTasks.phaseId}
            onTasksReorder={handleTasksReorder}
          />
        </>
      )}
    </div>
  );
}
