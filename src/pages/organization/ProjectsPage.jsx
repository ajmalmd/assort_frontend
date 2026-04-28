import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search } from "lucide-react";
import { CreateProjectModal } from "@/components/organization/CreateProjectModal";
import { useAuth } from "@/context/authContext";
import {
  formatDate_d_m_yyyy,
  formatEnum,
  hasProjectRight,
  isOrgOwnerorAdmin,
} from "@/appFunctions";
import assort_api from "@/api/axios";
import { APP_POINTS } from "@/api/apiConfig";

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL_STATUS");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const projectStatuses = [
    "ALL_STATUS",
    ...new Set(projects.map((p) => p.status)),
  ];

  const navigate = useNavigate();
  const { activeOrganization } = useAuth();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await assort_api.get(APP_POINTS.PROJECTS);
        setProjects(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const filteredProjects = projects?.filter((project) => {
    const matchesSearch = project.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === "ALL_STATUS" || project.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Create Button */}
      <div className="flex items-center justify-end">
        {isOrgOwnerorAdmin(activeOrganization.role) && (
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Project
          </Button>
        )}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-48 bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {projectStatuses.map((status) => (
              <SelectItem key={status} value={status}>
                {formatEnum(status)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading projects...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No projects found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const total = Number(project.total_tasks) || 0;
            const completed = Number(project.tasks_completed) || 0;

            const progress = total > 0 ? (completed / total) * 100 : 0;

            return (
              <Card
                key={project.id}
                className="cursor-pointer hover:shadow-lg transition-shadow h-full"
                onClick={(e) => {
                  if (e.target.closest("button")) return;
                  navigate(`/app/project/${project.id}`);
                }}
              >
                <CardContent className="pt-6 space-y-4">
                  {/* Title + Status */}
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold line-clamp-2 flex-1">
                      {project.title}
                    </h3>
                    <Badge className="shrink-0 whitespace-nowrap">
                      {formatEnum(project.status)}
                    </Badge>
                  </div>

                  {/* Manager + Deadline */}
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-left">
                      <p className="text-muted-foreground">Project Manager</p>
                      <p className="font-medium">{project.project_manager}</p>
                    </div>

                    <div className="text-xs text-right">
                      <p className="text-muted-foreground">Deadline</p>
                      <p className="font-medium">
                        {project.deadline
                          ? formatDate_d_m_yyyy(project.deadline)
                          : "--"}
                      </p>
                    </div>
                  </div>

                  {/* Task details for Task-leads */}
                  {project.tasks_assigned > 0 && (
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-left">
                        <p className="text-muted-foreground">Tasks Completed</p>
                        <p className="font-medium">{project.tasks_completed}</p>
                      </div>

                      <div className="text-xs text-right">
                        <p className="text-muted-foreground">Tasks Assigned</p>
                        <p className="font-medium">{project.tasks_assigned}</p>
                      </div>
                    </div>
                  )}
                  {/* Job details for Task-leads/Members */}
                  {project.jobs_assigned > 0 && (
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-left">
                        <p className="text-muted-foreground">Jobs Completed</p>
                        <p className="font-medium">{project.jobs_completed}</p>
                      </div>

                      <div className="text-xs text-right">
                        <p className="text-muted-foreground">Jobs Assigned</p>
                        <p className="font-medium">{project.jobs_assigned}</p>
                      </div>
                    </div>
                  )}

                  {/* Progress */}
                  {hasProjectRight(activeOrganization.role) && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium">Progress</span>
                        <span className="text-muted-foreground">
                          {Math.round(progress)}%
                        </span>
                      </div>

                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div
                          className="bg-primary h-2.5 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      <div className="text-xs text-muted-foreground text-right">
                        {completed}/{total} tasks
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <CreateProjectModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />
    </div>
  );
}
