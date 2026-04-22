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
import { ChevronDown, ChevronRight, Edit, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditProjectModal } from "@/components/organization/EditProjectModal";
import { AddPhaseModal } from "@/components/organization/AddPhaseModal";
import { EditPhasesModal } from "@/components/organization/EditPhasesModal";
import { AddTaskModal } from "@/components/organization/AddTaskModal";
import BackButton from "@/components/ui/backButton";
import { useNavigate, useParams } from "react-router";
import { ProjectUpdatesTab } from "@/components/organization/ProjectUpdatesTab";
import { ProjectMembersTab } from "@/components/organization/ProjectMembersTab";
import assort_api from "@/api/axios";
import { APP_POINTS } from "@/api/apiConfig";
import { formatEnum } from "@/appFunctions";

export default function ProjectDetailPage() {
  const [expandedPhases, setExpandedPhases] = useState({});
  const [expandedTasks, setExpandedTasks] = useState({});

  const [addTaskModalOpen, setAddTaskModalOpen] = useState(false);
  const [selectedPhaseId, setSelectedPhaseId] = useState(null);
  const [editProjectModalOpen, setEditProjectModalOpen] = useState(false);
  const [addPhaseModalOpen, setAddPhaseModalOpen] = useState(false);
  const [editPhasesModalOpen, setEditPhasesModalOpen] = useState(false);

  const [project, setProject] = useState(null);
  const [phases, setPhases] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { projectId } = useParams();

  useEffect(() => {
    if (!projectId) return;

    const fetchProjectDetail = async () => {
      setLoading(true);
      try {
        const res = await assort_api.get(
          `${APP_POINTS.PROJECTS}project/${projectId}/`,
        );

        const {
          id,
          title,
          description,
          status,
          deadline,
          progress,
          members_count,
          project_manager,
          phase,
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

        setPhases(phase || []);
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

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (!project) {
    return <div className="text-center py-10">Project not found</div>;
  }

  return (
    <div className="space-y-6">
      <BackButton onClick={() => navigate(-1)} />

      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
          <TabsTrigger value="info">Info</TabsTrigger>
          <TabsTrigger value="updates">Updates</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">
                    {project.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {project.description}
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <Badge>{formatEnum(project.status)}</Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditProjectModalOpen(true)}
                    className="gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                </div>
              </div>
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
                  <p className="text-xs text-muted-foreground">Members</p>
                  <p className="text-sm font-medium">{project.members_count}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Deadline</p>
                  <p className="text-sm font-medium">
                    {project.deadline || "--"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Progress</p>
                  <p className="text-sm font-medium">{project.progress}%</p>
                </div>
              </div>

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
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            {phases.length > 0 && (
              <Button
                onClick={() => setEditPhasesModalOpen(true)}
                variant="outline"
                className="gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit Phases
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

          <div className="space-y-4">
            {phases.length === 0 && (
              <p className="text-sm text-muted-foreground text-center">
                No phases yet
              </p>
            )}

            {phases.map((phase) => (
              <Card key={phase.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between w-full">
                    <button
                      onClick={() => togglePhase(phase.id)}
                      className="flex items-center gap-2 flex-1 hover:opacity-75"
                    >
                      {expandedPhases[String(phase.id)] ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      <CardTitle className="text-base">{phase.title}</CardTitle>
                      <Badge variant="outline" className="ml-auto">
                        {phase.status}
                      </Badge>
                    </button>

                    {expandedPhases[String(phase.id)] && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="ml-2 bg-transparent"
                        onClick={() => {
                          setSelectedPhaseId(phase.id);
                          setAddTaskModalOpen(true);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Task
                      </Button>
                    )}
                  </div>
                </CardHeader>

                {phase.description && (
                  <CardDescription className="pl-6 pb-2">
                    {phase.description}
                  </CardDescription>
                )}

                {expandedPhases[String(phase.id)] && (
                  <CardContent className="space-y-3 border-t pt-3">
                    {phase.tasks?.map((task) => (
                      <div
                        key={task.id}
                        className="space-y-2 bg-muted/30 rounded-lg p-3"
                      >
                        <button
                          onClick={() => toggleTask(task.id)}
                          className="flex items-center gap-2 w-full hover:opacity-75"
                        >
                          {expandedTasks[String(task.id)] ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                          <div
                            className="flex-1 min-w-0 text-left cursor-pointer"
                            onClick={() => openTaskDetail(task.id)}
                          >
                            <p className="font-medium text-sm hover:text-primary">
                              {task.title}
                            </p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              <span>Lead: {task.task_lead?.full_name}</span>
                              <span>Deadline: {task.deadline}</span>
                              <span>
                                Jobs: {task.completed_jobs}/{task.total_jobs}
                              </span>
                            </div>
                          </div>
                        </button>

                        {expandedTasks[String(task.id)] && (
                          <div className="pl-6 space-y-1">
                            {/* Jobs */}
                            {task.jobs.map((job) => (
                              <button
                                key={job.id}
                                onClick={() => {}}
                                className="text-xs p-2 bg-muted/50 rounded w-full text-left hover:bg-muted transition-colors"
                              >
                                <p className="font-medium">{job.title}</p>
                                <div className="flex items-center gap-3 mt-1 text-muted-foreground">
                                  <span>
                                    Assigned to: {job.assigned_to?.full_name}
                                  </span>
                                  <span>Deadline: {job.deadline}</span>
                                  <span>
                                    Hours: {job.hours_worked}h /{" "}
                                    {job.expected_hours}h
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
          <ProjectUpdatesTab />
        </TabsContent>

        <TabsContent value="members">
          <ProjectMembersTab projectId={projectId} />
        </TabsContent>

        <TabsContent value="chat">
          {/* <ChatTab projectName={project.title} /> */}
        </TabsContent>
      </Tabs>

      <EditProjectModal
        open={editProjectModalOpen}
        onOpenChange={setEditProjectModalOpen}
        project={project}
      />

      <AddPhaseModal
        open={addPhaseModalOpen}
        onOpenChange={setAddPhaseModalOpen}
      />

      <EditPhasesModal
        open={editPhasesModalOpen}
        onOpenChange={setEditPhasesModalOpen}
        phases={phases}
        onPhaseReorder={handlePhaseReorder}
      />

      <AddTaskModal
        open={addTaskModalOpen}
        onOpenChange={setAddTaskModalOpen}
        phaseId={selectedPhaseId}
      />
    </div>
  );
}
