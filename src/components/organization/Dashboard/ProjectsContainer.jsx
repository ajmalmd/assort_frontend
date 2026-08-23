import { FolderKanban } from "lucide-react";

import ProjectCard from "./ProjectCard";

const ProjectsContainer = ({
  projects = [],
  title = "Projects",
  description = "Project progress and current status",
}) => {
  return (
    <section>
      <div className="mb-4">
        <h2 className="font-semibold">{title}</h2>

        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      {projects.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border bg-card">
          <FolderKanban className="mb-2 h-6 w-6 text-muted-foreground" />

          <p className="text-sm text-muted-foreground">
            No projects available.
          </p>
        </div>
      )}
    </section>
  );
};

export default ProjectsContainer;
