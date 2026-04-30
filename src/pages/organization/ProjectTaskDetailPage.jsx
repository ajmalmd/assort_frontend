import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BackButton from "@/components/ui/backButton";
import { Plus } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { formatEnum, hasProjectRight } from "@/appFunctions";
import assort_api from "@/api/axios";
import { APP_POINTS } from "@/api/apiConfig";
import { useAuth } from "@/context/authContext";
import { EditTaskModal } from "@/components/organization/EditTaskModal";
import { AddJobModal } from "@/components/organization/AddJobModal";
import { TaskHeaderCard } from "@/components/organization/ProjectTaskDetailPage/TaskHeaderCard";
import { TaskInfoSection } from "@/components/organization/ProjectTaskDetailPage/TaskInfoSection";
import { TaskStatsSection } from "@/components/organization/ProjectTaskDetailPage/TaskStatsSection";
import { JobListSection } from "@/components/organization/ProjectTaskDetailPage/JobListSection";

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
        <TaskHeaderCard
          task={task}
          canEdit={hasProjectRight(activeOrganization.role)}
          onEdit={() => setEditTaskModalOpen(true)}
        />

        <CardContent className="space-y-6">
          <TaskInfoSection task={task} formatEnum={formatEnum} />
          <TaskStatsSection task={task} />
        </CardContent>
      </Card>

      {(hasProjectRight(activeOrganization.role) || isLead()) && (
        <div className="flex justify-end gap-2">
          <Button onClick={() => setAddJobModalOpen(true)} variant="outline">
            <Plus className="h-4 w-4" />
            Add Job
          </Button>
        </div>
      )}

      <JobListSection jobs={task?.jobs} />
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
