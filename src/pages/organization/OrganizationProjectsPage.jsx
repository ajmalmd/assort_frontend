import { useState } from "react";
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
import { Plus, Search, Users } from "lucide-react";
import { CreateProjectModal } from "@/components/organization/CreateProjectModal";

const mockProjects = [
  {
    id: 1,
    name: "Mobile App Redesign",
    status: "In Progress",
    startDate: "2024-01-10",
    endDate: "2024-02-28",
    current_phase: "Phase 2: Development",
    projectManager: "Sarah Johnson",
    membersCount: 5,
    tasksCompleted: 12,
    totalTasks: 18,
  },
  {
    id: 2,
    name: "API Integration",
    status: "Completed",
    startDate: "2023-12-01",
    endDate: "2024-01-15",
    current_phase: "Completed",
    projectManager: "Mike Chen",
    membersCount: 3,
    tasksCompleted: 16,
    totalTasks: 16,
  },
  {
    id: 3,
    name: "Dashboard Analytics",
    status: "Planning",
    startDate: "2024-02-01",
    endDate: "2024-03-15",
    current_phase: "Phase 1: Planning",
    projectManager: "David Lee",
    membersCount: 4,
    tasksCompleted: 2,
    totalTasks: 20,
  },
  {
    id: 4,
    name: "Frontend UI Enhancement",
    status: "In Progress",
    startDate: "2024-01-20",
    endDate: "2024-02-20",
    current_phase: "Phase 2: Implementation",
    projectManager: "Emma Wilson",
    membersCount: 6,
    tasksCompleted: 8,
    totalTasks: 14,
  },
  {
    id: 5,
    name: "Database Optimization",
    status: "In Progress",
    startDate: "2024-01-15",
    endDate: "2024-02-25",
    current_phase: "Phase 1: Analysis",
    projectManager: "John Smith",
    membersCount: 2,
    tasksCompleted: 5,
    totalTasks: 12,
  },
  {
    id: 6,
    name: "Security Audit",
    status: "Planning",
    startDate: "2024-02-15",
    endDate: "2024-04-01",
    current_phase: "Phase 1: Preparation",
    projectManager: "Lisa Anderson",
    membersCount: 3,
    tasksCompleted: 0,
    totalTasks: 10,
  },
];

export default function OrganizationProjectsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const navigate = useNavigate();

  const filteredProjects = mockProjects.filter((project) => {
    const matchesSearch = project.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || project.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-end">
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Project
        </Button>
      </div>

      {/* Search and Filter */}
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
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Planning">Planning</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Projects Grid - 3 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow h-full"
            onClick={() => navigate(`/app/project/${project.id}`)}
            key={project.id}
          >
            <CardContent className="pt-6 space-y-4">
              {/* Container 1: Project Title + Status */}
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold line-clamp-2 flex-1">
                  {project.name}
                </h3>
                <Badge
                  // variant={getStatusColor(project.status)}
                  variant="default"
                  className="shrink-0 whitespace-nowrap"
                >
                  {project.status}
                </Badge>
              </div>

              {/* Container 2: Start Date + End Date */}
              <div className="grid grid-cols-2 gap-3">
                <div className="text-xs">
                  <p className="text-muted-foreground">Start Date</p>
                  <p className="font-medium">{project.startDate}</p>
                </div>
                <div className="text-xs">
                  <p className="text-muted-foreground">End Date</p>
                  <p className="font-medium">{project.endDate}</p>
                </div>
              </div>

              {/* Container 3: Project Manager + Members */}
              <div className="flex items-center justify-between text-xs">
                <div>
                  <p className="text-muted-foreground">Project Manager</p>
                  <p className="font-medium">{project.projectManager}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div className="text-right">
                    <p className="text-muted-foreground">Members</p>
                    <p className="font-medium">{project.membersCount}</p>
                  </div>
                </div>
              </div>

              {/* Container 4: Progress Bar + Stats */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">Progress</span>
                  <span className="text-muted-foreground">
                    {Math.round(
                      (project.tasksCompleted / project.totalTasks) * 100,
                    )}
                    %
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div
                    className="bg-primary h-2.5 rounded-full transition-all"
                    style={{
                      width: `${(project.tasksCompleted / project.totalTasks) * 100}%`,
                    }}
                  />
                </div>
                <div className="text-xs text-muted-foreground text-right">
                  {project.tasksCompleted}/{project.totalTasks} tasks
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No projects found</p>
        </div>
      )}
      <CreateProjectModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />
    </div>
  );
}
