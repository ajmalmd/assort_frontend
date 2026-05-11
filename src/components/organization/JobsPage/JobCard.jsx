import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar } from "lucide-react";
import { formatDate_d_m_yyyy, formatEnum } from "@/appFunctions";
import { useNavigate } from "react-router";

export default function JobCard({ job }) {
  const navigate = useNavigate();
  return (
    <Card
      key={job.id}
      className="h-full p-5 md:p-6 hover:shadow-lg transition-shadow cursor-pointer border border-border flex flex-col"
      onClick={() => {
        navigate(`/app/project/job/${job.id}`);
      }}
    >
      <CardContent className="pt-6 space-y-4">
        {/* Title + Status */}
        <div className="flex items-start justify-between gap-3 mb-4 pb-4 border-b border-border">
          <h3 className="font-semibold line-clamp-2 flex-1">{job.title}</h3>
          <Badge className="shrink-0 whitespace-nowrap">
            {formatEnum(job.status)}
          </Badge>
        </div>

        {/* Project Hierarchy */}
        <div className="mb-4 pb-4 border-b border-border flex-1">
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">Project</p>
              <p className="text-sm font-medium text-foreground">
                {job.project_title}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Task</p>
              <p className="text-sm font-medium text-foreground">
                {job.task_title}
              </p>
            </div>
          </div>
        </div>

        {/* Hours and Issues */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Deadline</p>
              <p className="text-sm font-medium text-foreground">
                {formatDate_d_m_yyyy(job.deadline)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Hours</p>
              <p className="text-sm font-semibold text-foreground">
                {job.worked_hours}h / {job.estimated_hours}h
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
