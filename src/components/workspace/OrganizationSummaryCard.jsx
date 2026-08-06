import { useAppDispatch } from "@/redux/hooks";
import { switchOrganization } from "@/redux/slices/authSlice";
import { useNavigate } from "react-router";

export default function OrganizationSummaryCard({ organization }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleSwitch = () => {
    dispatch(switchOrganization(organization.organization_id));
    navigate("/app", { replace: true });
  };

  return (
    <div
      className="
        border-b
        p-4
      "
    >
      <h4>{organization.organization_title}</h4>

      <p>
        Chats:
        {organization.unread_chatroom_count}
      </p>

      <p>
        Missed:
        {organization.call_missed_count}
      </p>

      <button onClick={handleSwitch}>Switch</button>
    </div>
  );
}
