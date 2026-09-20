import { ArrowLeft } from "lucide-react";

const BackButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 flex items-center gap-2 justify-center font-medium text-sm text-muted-foreground border border-border bg-card hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors"
    >
      <ArrowLeft size={16} />
      Back
    </button>
  );
};

export default BackButton;
