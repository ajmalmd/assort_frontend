import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { APP_POINTS } from "@/api/apiConfig";
import assort_api from "@/api/axios";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";
import {
  Search,
  Users,
  Eye,
  Edit,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { EditUserModal } from "@/components/platform/EditUserModal";

const AdminUserListPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [users, setUsers] = useState([]);
  const [editUser, setEditUser] = useState(null);

  const filteredUsers = users.filter((user) => {
    const organizationNames = user.organizations
      .map((org) => org.title.toLowerCase())
      .join(" ");

    const matchesSearch =
      user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      organizationNames.includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "1" ? user.is_active : !user.is_active);

    return matchesSearch && matchesStatus;
  });

  const navigate = useNavigate();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await assort_api.get(APP_POINTS.PLATFORM + "users/");
        setUsers(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  const toggleStatus = async (user) => {
    try {
      const res = await assort_api.patch(
        APP_POINTS.PLATFORM + `users/${user.id}/`,
        { is_active: !user.is_active },
      );

      setUsers((prev) => prev.map((u) => (u.id === user.id ? res.data : u)));

      toast.success(user.is_active ? "User deactivated" : "User activated");
    } catch (err) {
      console.log("ERROR", err);
      toast.error("Failed to update status");
    }
  };

  const updateUser = async (updatedData) => {
    try {
      const res = await assort_api.patch(
        APP_POINTS.PLATFORM + `users/${editUser.id}/`,
        updatedData,
      );

      setUsers((prev) =>
        prev.map((u) => (u.id === editUser.id ? res.data : u)),
      );

      toast.success("user updated successfully");
      setEditUser(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update user");
    }
  };
  return (
    <div className="p-2">
      {/* Header + Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="1">Active</SelectItem>
              <SelectItem value="0">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="mt-6">
        {filteredUsers.length === 0 ? (
          <Empty className="border border-border/40 bg-card">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Users className="h-6 w-6" />
              </EmptyMedia>
              <EmptyTitle>No users found</EmptyTitle>
              <EmptyDescription>
                {searchQuery || filterStatus !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "No users to display"}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="rounded-lg border border-border/40 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-border/40 hover:bg-transparent">
                  <TableHead className="font-semibold text-center">
                    Name
                  </TableHead>
                  <TableHead className="font-semibold text-center">
                    Email
                  </TableHead>
                  <TableHead className="font-semibold text-center">
                    Organization Count
                  </TableHead>
                  <TableHead className="font-semibold text-center">
                    Status
                  </TableHead>
                  <TableHead className="font-semibold text-center ">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow
                    key={user.id}
                    className="border-border/40 text-center"
                  >
                    <TableCell className="font-medium">
                      {user.full_name}
                    </TableCell>

                    <TableCell className="text-sm text-muted-foreground">
                      {user.email}
                    </TableCell>

                    <TableCell className="text-sm">
                      {user.organizations.length}
                    </TableCell>

                    <TableCell>
                      <Badge variant={user.is_active ? "default" : "secondary"}>
                        {user.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <button
                        className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                        title="View"
                        onClick={() => navigate(`/platform/user/${user.id}`)}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                        title="Edit"
                        onClick={() => setEditUser(user)}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className={`p-1 rounded transition-colors ${
                          user.is_active
                            ? "text-green-600 hover:bg-green-100"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                        title={user.is_active ? "Deactivate" : "Activate"}
                        onClick={() => toggleStatus(user)}
                      >
                        {user.is_active ? (
                          <ToggleRight size={20} />
                        ) : (
                          <ToggleLeft size={20} />
                        )}
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
      <EditUserModal
        open={!!editUser}
        onOpenChange={(open) => !open && setEditUser(null)}
        user={editUser}
        onSubmit={updateUser}
      />
    </div>
  );
};

export default AdminUserListPage;
