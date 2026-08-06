import { useWorkspaceState } from "@/redux/hooks";
import IncomingCallModal from "../organization/IncomingCallModal";

export default function IncomingCallContainer() {
  const { incomingCall } = useWorkspaceState();

  if (!incomingCall) {
    return null;
  }

  return <IncomingCallModal call={incomingCall} />;
}
