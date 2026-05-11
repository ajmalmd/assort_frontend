import { useMemo, useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import { formatEnum } from "@/appFunctions";
import JobCard from "@/components/organization/JobsPage/JobCard";
import TaskCard from "@/components/organization/JobsPage/TaskCard";
import assort_api from "@/api/axios";
import { APP_POINTS } from "@/api/apiConfig";

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");

  const [jobFilterStatus, setJobFilterStatus] = useState("ALL_STATUS");

  const [taskFilterStatus, setTaskFilterStatus] = useState("ALL_STATUS");

  const jobStatuses = useMemo(
    () => ["ALL_STATUS", ...new Set(jobs.map((j) => j.status))],
    [jobs],
  );

  const taskStatuses = useMemo(
    () => ["ALL_STATUS", ...new Set(tasks.map((t) => t.status))],
    [tasks],
  );

  useEffect(() => {
    const fetchWorks = async () => {
      try {
        const res = await assort_api.get(APP_POINTS.PROJECTS + "work-items/");
        setJobs(res.data.jobs || []);
        setTasks(res.data.tasks || []);
      } catch (error) {
        console.log(error);
      }
    };
    fetchWorks();
  }, []);

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.project_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.task_title.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      jobFilterStatus === "ALL_STATUS" || job.status === jobFilterStatus;

    return matchesSearch && matchesStatus;
  });

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.project_title.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      taskFilterStatus === "ALL_STATUS" || task.status === taskFilterStatus;

    return matchesSearch && matchesStatus;
  });

  const hasJobs = jobs.length > 0;
  const hasTasks = tasks.length > 0;

  const defaultTab = hasJobs ? "jobs" : hasTasks ? "tasks" : null;

  return (
    <>
      {!defaultTab ? (
        <Card className="p-12 text-center border border-border">
          <p className="text-muted-foreground">No jobs found</p>
        </Card>
      ) : (
        <Tabs defaultValue={defaultTab} className="space-y-6">
          {/* Top Tabs */}
          {(hasJobs || hasTasks) && (
            <TabsList
              className={`grid w-full max-w-[300px] ${
                hasJobs && hasTasks ? "grid-cols-2" : "grid-cols-1"
              }`}
            >
              {hasJobs && <TabsTrigger value="jobs">Jobs</TabsTrigger>}

              {hasTasks && <TabsTrigger value="tasks">Tasks</TabsTrigger>}
            </TabsList>
          )}

          {/* JOBS TAB */}
          {hasJobs && (
            <TabsContent value="jobs" className="space-y-6">
              {/* Search & Filter */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />

                  <Input
                    placeholder="Search jobs by title, project, or task..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-white"
                  />
                </div>

                <Select
                  value={jobFilterStatus}
                  onValueChange={setJobFilterStatus}
                >
                  <SelectTrigger className="w-full sm:w-48 bg-white">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    {jobStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {formatEnum(status)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Jobs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {filteredJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>

              {filteredJobs.length === 0 && (
                <Card className="p-12 text-center border border-border">
                  <p className="text-muted-foreground">No jobs found</p>
                </Card>
              )}
            </TabsContent>
          )}

          {/* TASKS TAB */}
          {hasTasks && (
            <TabsContent value="tasks" className="space-y-6">
              {/* Search & Filter */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />

                  <Input
                    placeholder="Search tasks by title or project..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-white"
                  />
                </div>

                <Select
                  value={taskFilterStatus}
                  onValueChange={setTaskFilterStatus}
                >
                  <SelectTrigger className="w-full sm:w-48 bg-white">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    {taskStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {formatEnum(status)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tasks Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {filteredTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>

              {filteredTasks.length === 0 && (
                <Card className="p-12 text-center border border-border">
                  <p className="text-muted-foreground">No tasks found</p>
                </Card>
              )}
            </TabsContent>
          )}
        </Tabs>
      )}
    </>
  );
}
