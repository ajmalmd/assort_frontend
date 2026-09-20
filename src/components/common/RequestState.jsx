import { AlertCircle, Inbox, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RequestState({
  loading = false,
  error = false,
  title,
  description,
  onRetry,
}) {
  const Icon = loading ? LoaderCircle : error ? AlertCircle : Inbox;
  return (
    <div
      role={error ? "alert" : "status"}
      aria-live="polite"
      className="flex min-h-56 flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card p-8 text-center"
    >
      <div
        className={`rounded-2xl p-3 ${error ? "bg-destructive/10 text-destructive" : "bg-accent text-primary"}`}
      >
        <Icon
          aria-hidden="true"
          className={`size-6 ${loading ? "animate-spin" : ""}`}
        />
      </div>
      <p className="font-semibold text-foreground">{title}</p>
      {description && (
        <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      )}
      {onRetry && !loading && (
        <Button variant="outline" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
