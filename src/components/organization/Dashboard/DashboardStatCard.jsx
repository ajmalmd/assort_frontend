const DashboardStatCard = ({ title, value, description, icon: Icon }) => {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>

          <h3 className="mt-2 text-2xl font-semibold">{value ?? 0}</h3>

          {description && (
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          )}
        </div>

        {Icon && (
          <div className="rounded-lg bg-muted p-2">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardStatCard;
