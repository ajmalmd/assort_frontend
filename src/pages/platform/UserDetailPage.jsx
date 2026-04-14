import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, Building2, Trash2 } from "lucide-react";
import BackButton from "@/components/ui/backButton";
import toast from "react-hot-toast";
import { formatDate_MmmDD_YYYY, formatEnum, getInitials } from "@/appFunctions";
import { useNavigate, useParams } from "react-router";
import assort_api from "@/api/axios";
import { APP_POINTS } from "@/api/apiConfig";

const UserDetailPage = () => {
  const [user, setUser] = useState({ organizations: [] });
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [removeOrg, setRemoveOrg] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await assort_api.get(
          `${APP_POINTS.PLATFORM}users/${id}/`,
        );
        setUser(response.data);
      } catch (err) {
        toast.error("Failed to fetch user");
      }
    };

    if (id) fetchUser();
  }, [id]);

  const removeMembership = async (orgId) => {
    try {
      await assort_api.patch(
        `${APP_POINTS.PLATFORM}users/${id}/remove-membership/${orgId}/`,
      );
      setUser((prev) => ({
        ...prev,
        organizations: prev.organizations.filter((org) => org.id !== orgId),
      }));
      toast.success("Membership removed successfully");
      setRemoveOrg(null);
    } catch (error) {
      toast.error("Failed to remove membership");
    }
  };

  const toggleStatus = async () => {
    const newStatus = !user.is_active;
    try {
      await assort_api.patch(APP_POINTS.PLATFORM + `users/${user.id}/`, {
        is_active: !user.is_active,
      });

      setUser({ ...user, is_active: newStatus });
      toast.success(newStatus ? "User activated" : "User deactivated");
    } catch (err) {
      console.log("ERROR", err);
      toast.error("Failed to update status");
    }
  };
  const handleDeleteUser = async () => {
    try {
      await assort_api.patch(`${APP_POINTS.PLATFORM}users/${id}/delete/`);
      toast.success("User deleted successfully");
      navigate(-1, { replace: true });
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  return (
    <div className="p-2 space-y-6">
      <BackButton onClick={() => navigate(-1)} />
      {/* Header Section */}
      <div className="flex items-start gap-6">
        {typeof user?.profile_pic === "string" &&
        user?.profile_pic.length > 20 ? (
          <img
            src={user?.profile_pic}
            alt="Organization logo"
            className="w-20 h-20 rounded-lg object-contain bg-gray-100"
          />
        ) : (
          <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center text-2xl font-bold">
            {getInitials(user?.full_name)}
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{user?.full_name}</h1>
            <Badge
              variant="default"
              className={
                user?.is_active
                  ? "bg-green-100 text-green-800 hover:bg-green-100"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-100"
              }
            >
              {user?.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="text-muted-foreground">{user?.email}</p>
        </div>
      </div>

      {/* User Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Organizations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-semibold">{user?.organizations?.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Joined
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-semibold">
              {formatDate_MmmDD_YYYY(user?.created_at)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Information */}
      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Date of Birth
              </div>
              <div className="font-semibold">
                {user.date_of_birth
                  ? formatDate_MmmDD_YYYY(user.date_of_birth)
                  : "--"}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                City
              </div>
              <div className="font-semibold">
                {user.city ? user.city : "--"}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Country
              </div>
              <div className="font-semibold">
                {user.country ? user.country : "--"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Organizations List */}
      <Card>
        <CardHeader>
          <CardTitle>Organizations</CardTitle>
          <CardDescription>
            All organizations this user belongs to
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {user?.organizations?.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No organizations assigned
              </p>
            ) : (
              user?.organizations?.map((org) => (
                <div
                  key={org.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 border rounded-lg bg-muted/30"
                >
                  {/* LEFT SECTION */}
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="font-semibold text-sm">{org.title}</p>

                      <Badge
                        variant="outline"
                        className={
                          org.is_active
                            ? "bg-green-100 text-green-800 hover:bg-green-100 text-xs h-5"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-100 text-xs h-5"
                        }
                      >
                        {org.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <Badge variant="default">{formatEnum(org.role)}</Badge>

                      <span className="text-muted-foreground">
                        Joined: {formatDate_MmmDD_YYYY(org.joined_at)}
                      </span>
                    </div>
                  </div>

                  {/* RIGHT SECTION */}
                  <div className="flex items-center gap-2 sm:ml-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        navigate(`/platform/organization/${org.id}`)
                      }
                    >
                      View
                    </Button>

                    <button
                      onClick={() => setRemoveOrg(org.id)}
                      className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
                      title="Remove organization"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>User Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-2">
              Account Status
            </div>
            <Badge
              variant="outline"
              className={
                user.is_active
                  ? "bg-green-100 text-green-800 hover:bg-green-100 text-xs h-5"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-100 text-xs h-5"
              }
            >
              {user.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
          <div className="flex gap-2 pt-4">
            <Button variant="outline" size="sm" onClick={() => toggleStatus()}>
              {user?.is_active ? "Disable Account" : "Enable Account"}
            </Button>
            {user.organizations?.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteOpen(true)}
              >
                Delete User
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete User Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This action will remove the user from all associated organizations
            and mark their status as inactive. This cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                await handleDeleteUser();
                setDeleteOpen(false);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Org Membership Dialog */}
      <Dialog open={!!removeOrg} onOpenChange={() => setRemoveOrg(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Membership</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to remove this organization membership? This
            action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveOrg(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                removeMembership(removeOrg);
              }}
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserDetailPage;
