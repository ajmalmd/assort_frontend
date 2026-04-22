import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatEnum, getInitials } from "@/appFunctions";
import { Badge } from "@/components/ui/badge";
import assort_api from "@/api/axios";
import { APP_POINTS, MEDIA_URL } from "@/api/apiConfig";
import toast from "react-hot-toast";
import BackButton from "@/components/ui/backButton";

const MemberDetailPage = () => {
  const [member, setMember] = useState({});
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  const fetchMember = async () => {
    try {
      const res = await assort_api.get(
        `${APP_POINTS.ORGANIZATIONS}member/${id}/`,
      );
      setMember(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchMember();
  }, []);

  const toggleStatus = async () => {
    try {
      const res = await assort_api.patch(
        `${APP_POINTS.ORGANIZATIONS}member/${id}/`,
        { is_active: !member.is_active },
      );
      setMember({ ...member, is_active: !member.is_active });
      if (res.data.is_active) {
        toast.success("Membership Activated");
      } else {
        toast.success("Membership Deactivated");
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleDelete = async () => {
    try {
      await assort_api.delete(`${APP_POINTS.ORGANIZATIONS}member/${id}/`);
      toast.success("Member Removed");
      navigate("/app/members", { replace: true });
    } catch (error) {
      toast.error("Couldn't remove member");
      console.log(error);
    }
  };
  return (
    <div className="space-y-4">
      <BackButton onClick={() => navigate(-1)} />
      {/* Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-lg bg-gray-300 flex items-center justify-center overflow-hidden">
                {member.profile_pic ? (
                  <img
                    src={
                      typeof member.profile_pic === "string"
                        ? MEDIA_URL + member.profile_pic
                        : URL.createObjectURL(member.profile_pic)
                    }
                    alt="Photo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-semibold text-gray-700">
                    {getInitials(member.full_name)}
                  </span>
                )}
              </div>
              <div>
                <CardTitle className="text-2xl">{member.full_name}</CardTitle>
                <p className="text-sm text-muted-foreground">{member.email}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge>{formatEnum(member.role)}</Badge>
              <Badge variant={member.is_active ? "default" : "secondary"}>
                {member.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">
                {member.project_count ? member.project_count : 0}
              </p>
              <p className="text-xs text-muted-foreground">Projects</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">
                {member.jobs_completed ? member.jobs_completed : 0}
              </p>
              <p className="text-xs text-muted-foreground">Jobs Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">
                {member.jobs_assigned ? member.jobs_assigned : 0}
              </p>
              <p className="text-xs text-muted-foreground">Job Assigned</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium">
                {member.joined_at
                  ? new Date(member.joined_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "--"}
              </p>
              <p className="text-xs text-muted-foreground">Joined On</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Card>
        <CardHeader>
          <div className="flex gap-4 border-b -mx-6 px-6">
            <div
              className={
                "pb-3 font-medium text-sm border-b-2 border-primary text-foreground"
              }
            >
              Member Info
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-muted-foreground">Date of Birth</p>
              <p className="text-sm font-medium">
                {member.date_of_birth ? member.date_of_birth : "--"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">City</p>
              <p className="text-sm font-medium">
                {member.city ? member.city : "--"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Country</p>
              <p className="text-sm font-medium">
                {member.country ? member.country : "--"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Department</p>
              <p className="text-sm font-medium">
                {member.department ? member.department : "--"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="flex gap-2 justify-end">
        <button
          onClick={() => toggleStatus()}
          className="px-6 py-2 bg-white text-gray-900 font-medium rounded-lg hover:bg-gray-200 transition-colors"
        >
          {member.is_active ? "Disable Membership" : "Enable Membership"}
        </button>
        <button
          onClick={() => setShowRemoveConfirm(true)}
          className="px-6 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
        >
          Remove Member
        </button>
      </div>
      {/* Delete Confirmation Modal */}
      {showRemoveConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Remove Member
            </h3>
            <p className="text-sm text-gray-700 mb-6">
              Are you sure you want to remove this member? This action cannot be
              undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRemoveConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete()}
                className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberDetailPage;
