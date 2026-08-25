import { useWorkspaceState } from "@/redux/hooks";
import WaitingCallCard from "./WaitingCallCard";

export default function WaitingCallsContainer() {
  const { waitingCalls } = useWorkspaceState();

  if (!waitingCalls.length) {
    return null;
  }

  const orderedCalls = [...waitingCalls].sort(
    (a, b) => new Date(a.received_at || 0) - new Date(b.received_at || 0),
  );

  return (
    <div className="fixed top-4 right-4 z-[120] flex max-h-[calc(100vh-2rem)] w-80 flex-col gap-3 overflow-y-auto">
      {orderedCalls.map((call) => (
        <WaitingCallCard key={call.session_id} call={call} />
      ))}
    </div>
  );
}
