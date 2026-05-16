import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronRight,
  ChevronDown,
  ListChevronsDownUp,
  Edit,
  Plus,
} from "lucide-react";
import { formatEnum, hasProjectRight } from "@/appFunctions";

import { EditPhaseModal } from "../EditPhaseModal";
import { AddTaskModal } from "../AddTaskModal";
import { ReorderTasksModal } from "../ReorderTasksModal";
import TaskItem from "./TaskItem";
import assort_api from "@/api/axios";
import { APP_POINTS } from "@/api/apiConfig";
import toast from "react-hot-toast";

export default function PhaseCard({
  phase,
  project,
  activeOrganization,
  editPhase,
  addTask,
  handleTasksReorder,
  updateStatus,
}) {
  const [expanded, setExpanded] = useState(false);
  const [editPhaseModalOpen, setEditPhaseModalOpen] = useState(false);
  const [addTaskModalOpen, setAddTaskModalOpen] = useState(false);
  const [reorderTasksModalOpen, setReorderTasksModalOpen] = useState(false);

  const getMaxTaskDeadline = (tasks) =>
    tasks?.length
      ? tasks.reduce((max, task) => {
          if (!task.deadline) return max;
          return !max || new Date(task.deadline) > new Date(max)
            ? task.deadline
            : max;
        }, null)
      : null;

  const changeStatus = async () => {
    try {
      const newStatus = ["PLANNED", "COMPLETED"].includes(phase.status)
        ? "IN_PROGRESS"
        : phase.status == "IN_PROGRESS"
          ? "COMPLETED"
          : "";

      await assort_api.patch(
        `${APP_POINTS.PROJECTS}phase/${phase.id}/update-status/`,
        { status: newStatus },
      );
      updateStatus({ newStatus, id: phase.id });
      toast.success("Status changed successfully");
    } catch (error) {
      toast.error("Couldn't change the status");
    }
  };

  return (
    <>
      <Card>
        <CardHeader
          onClick={() => setExpanded((prev) => !prev)}
          className="space-y-4"
        >
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 w-full">
            {/* Left Section */}
            <div className="flex items-start gap-2 flex-1 min-w-0 hover:opacity-75">
              <div className="mt-1 shrink-0">
                {expanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>

              <CardTitle className="text-base sm:text-lg font-medium break-words">
                {phase.title}
              </CardTitle>
            </div>

            {/* Right Section */}
            {hasProjectRight(activeOrganization.role) && (
              <div className="flex flex-col sm:flex-row sm:justify-end gap-2 w-full lg:w-auto">
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    changeStatus();
                  }}
                  className="w-full sm:w-auto"
                >
                  {["PLANNED", "COMPLETED"].includes(phase.status)
                    ? "Mark as Progressing"
                    : phase.status == "IN_PROGRESS"
                      ? "Mark as Completed"
                      : ""}
                </Button>

                <Button
                  size="sm"
                  variant="default"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditPhaseModalOpen(true);
                  }}
                  className="gap-2 w-full sm:w-auto"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              </div>
            )}
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Deadline</p>

              <p className="text-sm font-medium">{phase.deadline}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Status</p>

              <Badge variant="outline" className="w-fit">
                {formatEnum(phase.status)}
              </Badge>
            </div>
          </div>
        </CardHeader>

        {phase.description && (
          <CardDescription className="px-6 pb-2 whitespace-pre-line break-words font-mono border-t pt-4 text-sm">
            {phase.description}
          </CardDescription>
        )}

        {expanded && (
          <CardContent className="space-y-3 border-t pt-3">
            {hasProjectRight(activeOrganization.role) && (
              <div className="flex flex-col sm:flex-row justify-end gap-2">
                {phase?.tasks?.length > 1 && (
                  <Button
                    size="sm"
                    onClick={() => {
                      setReorderTasksModalOpen(true);
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
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Add Task
                </Button>
              </div>
            )}
            {phase?.tasks?.length === 0 && (
              <p className="text-sm text-muted-foreground text-center">
                No tasks yet
              </p>
            )}
            {phase.tasks?.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </CardContent>
        )}
      </Card>

      {hasProjectRight(activeOrganization.role) && (
        <>
          <EditPhaseModal
            open={editPhaseModalOpen}
            onOpenChange={setEditPhaseModalOpen}
            project={project}
            phase={{
              id: phase.id,
              title: phase.title,
              description: phase.description,
              deadline: phase.deadline,
              maxTaskDeadline: getMaxTaskDeadline(phase.tasks),
            }}
            editedPhaseDetails={editPhase}
          />

          <AddTaskModal
            open={addTaskModalOpen}
            onOpenChange={setAddTaskModalOpen}
            project={project}
            phase={{
              id: phase.id,
              title: phase.title,
              deadline: phase.deadline,
            }}
            addedTaskDetails={addTask}
          />

          <ReorderTasksModal
            open={reorderTasksModalOpen}
            onOpenChange={setReorderTasksModalOpen}
            tasks={phase.tasks}
            phaseId={phase.id}
            onTasksReorder={handleTasksReorder}
          />
        </>
      )}
    </>
  );
}
