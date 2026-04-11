import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import assort_api from "@/api/axios";
import { APP_POINTS } from "@/api/apiConfig";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Trash2, Pen } from "lucide-react";
import BackButton from "@/components/ui/backButton";
import { DeptAddMemberModal } from "@/components/organization/DeptAddMemberModal";
import { DeptSelectHeadModal } from "@/components/organization/DeptSelectHeadModal";
import { formatEnum } from "@/appFunctions";
import toast from "react-hot-toast";

const DepartmentDetailPage = () => {
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [selectHeadOpen, setSelectHeadOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [department, setDepartment] = useState(null);
  const [editedDepartment, setEditedDepartment] = useState(null);
  const [members, setMembers] = useState([]);
  const [editedMembers, setEditedMembers] = useState([]);
  const [memberOptions, setMemberOptions] = useState([]);

  const navigate = useNavigate();
  const { id } = useParams();

  // 🔹 Fetch Department Details
  const fetchDepartment = async () => {
    try {
      const res = await assort_api.get(`${APP_POINTS.DEPARTMENTS}${id}/`);
      const data = res.data;

      setDepartment(data);
      setEditedDepartment({
        id: data.id,
        name: data.name,
        head: data.head,
      });
      setMembers(data.members || []);
      setEditedMembers(data.members || []);
    } catch (error) {
      toast.error("Failed to fetch department details");
    }
  };

  // 🔹 Fetch Member Options
  const fetchMemberOptions = async () => {
    try {
      const res = await assort_api.get(
        `${APP_POINTS.ORGANIZATIONS}dept-member-options/`,
      );
      setMemberOptions(res.data);
    } catch (error) {
      toast.error("Failed to fetch member options");
    }
  };

  useEffect(() => {
    fetchDepartment();
    fetchMemberOptions();
  }, [id]);

  // 🔹 Cancel Editing
  const handleCancel = () => {
    setEditedDepartment({
      id: department.id,
      name: department.name,
      head: department.head,
    });
    setEditedMembers(members);
    setIsEditing(false);
  };

  // 🔹 Save Changes
  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);

      const payload = {
        name: editedDepartment.name,
        head: editedDepartment.head?.id || null,
        members: editedMembers.map((m) => m.id),
      };

      await assort_api.patch(`${APP_POINTS.DEPARTMENTS}${id}/update/`, payload);

      toast.success("Department updated successfully");
      setIsEditing(false);
      await fetchDepartment(); // Refresh data
    } catch (error) {
      toast.error(
        error?.response?.data?.detail || "Failed to update department",
      );
    } finally {
      setIsSaving(false);
    }
  };

  // 🔹 Remove Member
  const removeMember = (memberId) => {
    if (!isEditing) return;
    setEditedMembers((prev) => prev.filter((m) => m.id !== memberId));
  };

  // 🔹 Select Department Head
  const handleSelectHead = (member) => {
    setEditedDepartment((prev) => ({
      ...prev,
      head: member,
    }));
    // Remove head from members if present
    setEditedMembers((prev) => prev.filter((m) => m.id !== member.id));
  };

  // 🔹 Add Members
  const handleAddMembers = (newMembers) => {
    const existingIds = new Set(editedMembers.map((m) => m.id));
    const filtered = newMembers.filter(
      (m) => !existingIds.has(m.id) && m.id !== editedDepartment?.head?.id,
    );
    setEditedMembers((prev) => [...prev, ...filtered]);
  };

  const handleDeleteDepartment = async () => {
    try {
      await assort_api.delete(`${APP_POINTS.DEPARTMENTS}${id}/delete/`);
      toast.success("Department deleted successfully");
      navigate(-1); // Redirect to department list
    } catch (error) {
      toast.error(
        error?.response?.data?.detail || "Failed to delete department",
      );
    }
  };

  if (!editedDepartment) return null;

  return (
    <div className="space-y-4">
      <BackButton onClick={() => navigate(-1)} />
      {/* Department Info */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Department Details</CardTitle>
          <div className="flex gap-2">
            {!isEditing ? (
              <>
                <Button onClick={() => setIsEditing(true)}>
                  <Pen className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </>
            ) : (
              <>
                <Button onClick={handleSaveChanges} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save"}
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Department Name */}
          <div>
            <label className="text-sm text-muted-foreground">
              Department Name
            </label>
            <Input
              value={editedDepartment.name}
              disabled={!isEditing}
              className="mt-2"
              onChange={(e) =>
                setEditedDepartment((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
            />
          </div>

          {/* Department Head */}
          <div>
            <label className="text-sm text-muted-foreground">
              Department Head
            </label>
            <div className="flex items-center gap-2 mt-2 p-3 border rounded-lg bg-muted/30">
              {editedDepartment.head ? (
                <div className="flex-1">
                  <p className="font-medium text-sm">
                    {editedDepartment.head.full_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {editedDepartment.head.email}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground flex-1">
                  No head assigned
                </p>
              )}
              <button
                onClick={() => isEditing && setSelectHeadOpen(true)}
                disabled={!isEditing}
                className="p-2 hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
              >
                <Pen className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Department Members */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Members</CardTitle>
          <Button
            size="sm"
            onClick={() => setAddMemberOpen(true)}
            disabled={!isEditing}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border/40 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="w-[50px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {editedMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>{member.full_name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {member.email}
                    </TableCell>
                    <TableCell>{formatEnum(member.role)}</TableCell>
                    <TableCell>
                      <button
                        onClick={() => removeMember(member.id)}
                        disabled={!isEditing}
                        className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors disabled:opacity-50"
                        title="Remove member"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
                {editedMembers.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground"
                    >
                      No members assigned
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      {/* Modals */}
      <DeptAddMemberModal
        open={addMemberOpen}
        onOpenChange={setAddMemberOpen}
        memberOptions={memberOptions.filter(
          (mem) =>
            mem.id !== editedDepartment?.head?.id &&
            !editedMembers.some((m) => m.id === mem.id),
        )}
        onAddMembers={handleAddMembers}
      />
      <DeptSelectHeadModal
        open={selectHeadOpen}
        onOpenChange={setSelectHeadOpen}
        onSelect={handleSelectHead}
        memberOptions={memberOptions.filter(
          (mem) => !editedMembers.some((m) => m.id === mem.id),
        )}
      />

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Department</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this department? This action cannot
            be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                await handleDeleteDepartment();
                setDeleteOpen(false);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DepartmentDetailPage;
