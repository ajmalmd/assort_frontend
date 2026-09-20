const DashboardStatCard = ({ title, value, description, icon: Icon }) => {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-xs">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>

          <h3 className="mt-2 text-3xl font-semibold tabular-nums">
            {value ?? 0}
          </h3>

          {description && (
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          )}
        </div>

        {Icon && (
          <div className="rounded-xl bg-accent p-2.5 text-primary">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardStatCard;
