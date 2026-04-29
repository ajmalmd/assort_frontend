import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import BackButton from "@/components/ui/backButton";
import { Clock, Plus, Edit } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { formatEnum, hasProjectRight } from "@/appFunctions";
import assort_api from "@/api/axios";
import { APP_POINTS } from "@/api/apiConfig";
import { useAuth } from "@/context/authContext";
import { EditTaskModal } from "@/components/organization/EditTaskModal";
import { AddJobModal } from "@/components/organization/AddJobModal";

export default function ProjectTaskDetailPage() {
  const [task, setTask] = useState({});
  const [loading, setLoading] = useState(false);
  const [editTaskModalOpen, setEditTaskModalOpen] = useState(false);
  const [addJobModalOpen, setAddJobModalOpen] = useState(false);

  const navigate = useNavigate();
  const { taskId } = useParams();
  const { activeOrganization } = useAuth();

  useEffect(() => {
    const fetchTask = async () => {
      setLoading(true);
      try {
        const res = await assort_api.get(
          `${APP_POINTS.PROJECTS}task/${taskId}/`,
        );
        setTask(res.data);
      } catch (error) {
        console.log("Failed to fetch task", error);
        setTask(null);
      } finally {
        setLoading(false);
      }
    };

    if (taskId) fetchTask();
  }, [taskId]);

  const isLead = () => {
    return task?.member?.id === task?.lead?.id;
  };
  const updateTask = (updated) => {
    setTask((prev) => ({
      ...prev,
      ...updated,
    }));
  };

  const addJob = (job) => {
    setTask((prev) => ({
      ...prev,
      jobs: [...(prev.jobs || []), job],
      estimated_hours: prev.estimated_hours + job.estimated_hours,
      total_jobs: prev.total_jobs + 1,
    }));
  };

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }
  if (!task) {
    return (
      <>
        <BackButton onClick={() => navigate(-1)} />
        <div className="text-center py-10">Task not found</div>
      </>
    );
  }

  return (
    <div className="space-y-6">
      <BackButton onClick={() => navigate(-1)} />

      {/* Task Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-2xl font-medium mb-2">
                {task?.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground font-mono whitespace-pre-line">
                {task?.description}
              </p>
            </div>
            <div className="flex items-start gap-2">
              {hasProjectRight(activeOrganization.role) && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditTaskModalOpen(true)}
                  className="gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Task Details */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-sm text-muted-foreground mb-3">
              Task Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Project */}
              <div>
                <p className="text-xs text-muted-foreground mb-1">Project</p>
                <p className="text-sm font-medium">{task?.project?.title}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Project Manager
                </p>
                <p className="text-sm font-medium">
                  {task?.project?.project_manager}
                </p>
              </div>

              {/* Phase */}
              <div>
                <p className="text-xs text-muted-foreground mb-1">Phase</p>
                <p className="text-sm font-medium">{task?.phase?.title}</p>
              </div>

              {/* Task */}
              <div>
                <p className="text-xs text-muted-foreground mb-1">Task Lead</p>
                <p className="text-sm font-medium">{task?.lead?.full_name}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">Deadline</p>
                <p className="text-sm font-medium">{task?.deadline}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Status</p>
                <Badge variant="default">{formatEnum(task?.status)}</Badge>
              </div>
            </div>
          </div>

          {/* Progress & Hours */}
          <div className="border-t pt-6 grid grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                <span className="text-lg font-bold text-primary">
                  {task?.jobs_completed || 0}/{task?.total_jobs || 0}
                </span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Completed Jobs</p>
                <p className="text-sm font-medium">
                  {task?.jobs_completed || 0} of {task?.total_jobs || 0}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Worked Hours</p>
                <p className="text-sm font-medium">{task?.worked_hours}h</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Estimated Hours
                  </p>
                  <p className="text-sm font-medium">
                    {task?.estimated_hours}h
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {(hasProjectRight(activeOrganization.role) || isLead()) && (
        <div className="flex justify-end gap-2">
          <Button
            onClick={() => setAddJobModalOpen(true)}
            variant="outline"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Job
          </Button>
        </div>
      )}
      <div className="space-y-1 p-2 bg-gray-500/10 rounded-xl">
        <div className="font-normal py-2 pl-2 text-xl">Jobs</div>
        {task?.jobs?.length === 0 && (
          <p className="text-sm text-muted-foreground text-center">
            No jobs yet
          </p>
        )}
        {task?.jobs?.map((job) => (
          <div
            key={job.id}
            className="flex items-center justify-between p-3 bg-white/90 rounded-lg border border-border/40"
          >
            <div className="flex-1">
              <p className="text-sm font-medium">{job.title}</p>
              <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                <span>Deadline: {job?.deadline}</span>
                <span>
                  Hours: {job.worked_hours || 0}h / {job.estimated_hours || 0}h
                </span>
                <span>
                  Assigned to: {job?.assigned_to?.full_name || "Unassigned"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {hasProjectRight(activeOrganization.role) && (
        <EditTaskModal
          open={editTaskModalOpen}
          onOpenChange={setEditTaskModalOpen}
          task={{
            id: task.id,
            title: task.title,
            description: task?.description,
            deadline: task?.deadline,
            lead: task?.lead?.id,
            projectId: task?.project?.id,
            jobMembers: task.jobs?.map((job) => job.assigned_to.id) || [],
          }}
          maxDeadline={task?.phase?.deadline || task?.project?.deadline}
          updatedTaskDetails={updateTask}
        />
      )}
      {(hasProjectRight(activeOrganization.role) || isLead()) && (
        <AddJobModal
          open={addJobModalOpen}
          onOpenChange={setAddJobModalOpen}
          task={{ id: task?.id, title: task.title, lead: task?.lead?.id }}
          project={task.project}
          maxDeadline={
            task?.deadline || task?.phase?.deadline || task?.project?.deadline
          }
          addedJobDetails={addJob}
        />
      )}
    </div>
  );
}
