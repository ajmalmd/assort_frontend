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

export default function PhaseCard({
  phase,
  project,
  activeOrganization,
  editPhase,
  addTask,
  handleTasksReorder,
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

  return (
    <>
      <Card>
        <CardHeader onClick={() => setExpanded((prev) => !prev)}>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 flex-1 hover:opacity-75">
              {expanded ? (
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
                onClick={(e) => {
                  e.stopPropagation();
                  setEditPhaseModalOpen(true);
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

        {expanded && (
          <CardContent className="space-y-3 border-t pt-3">
            {hasProjectRight(activeOrganization.role) && (
              <div className="flex justify-end gap-2">
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
