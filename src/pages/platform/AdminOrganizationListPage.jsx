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
  ToggleRight,
  ToggleLeft,
  Edit,
  Eye,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";
import { EditOrganizationModal } from "@/components/platform/EditOrganizationModal";

const AdminOrganizationListPage = () => {
  const navigate = useNavigate();

  const [organizations, setOrganizations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [editOrg, setEditOrg] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await assort_api.get(
          APP_POINTS.PLATFORM + "organizations/",
        );
        setOrganizations(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  const filteredOrganizations = organizations.filter((org) => {
    const matchesSearch =
      org.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "1" ? org.is_active : !org.is_active);

    return matchesSearch && matchesStatus;
  });

  const toggleStatus = async (org) => {
    try {
      const res = await assort_api.patch(
        APP_POINTS.PLATFORM + `organizations/${org.id}/`,
        { is_active: !org.is_active },
      );

      setOrganizations((prev) =>
        prev.map((p) => (p.id === org.id ? res.data : p)),
      );

      toast.success(
        org.is_active ? "Organization deactivated" : "Organization activated",
      );
    } catch (err) {
      console.log(err);
      toast.error("Failed to update status");
    }
  };

  const updateOrganization = async (updatedData) => {
    try {
      const res = await assort_api.patch(
        APP_POINTS.PLATFORM + `organizations/${editOrg.id}/`,
        updatedData,
      );

      setOrganizations((prev) =>
        prev.map((org) => (org.id === editOrg.id ? res.data : org)),
      );

      toast.success("Organization updated successfully");
      setEditOrg(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update organization");
    }
  };

  return (
    <div className="p-2">
      {/* Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search organizations..."
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
        {filteredOrganizations.length === 0 ? (
          <Empty className="border border-border/40 bg-card">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Users className="h-6 w-6" />
              </EmptyMedia>
              <EmptyTitle>No organizations found</EmptyTitle>
              <EmptyDescription>
                {searchQuery || filterStatus !== "all"
                  ? "Try adjusting your search or filter"
                  : "No organizations to display"}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="rounded-lg border border-border/40 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="text-center">Organization</TableHead>
                  <TableHead className="text-center">Email</TableHead>
                  <TableHead className="text-center">Members</TableHead>
                  <TableHead className="text-center">Projects</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredOrganizations.map((org) => (
                  <TableRow key={org.id} className="text-center">
                    <TableCell className="font-medium">{org.title}</TableCell>

                    <TableCell className="text-muted-foreground text-sm">
                      {org.email}
                    </TableCell>

                    <TableCell>{org.number_of_members || 0}</TableCell>
                    <TableCell>{org.projects || 0}</TableCell>

                    <TableCell>
                      <Badge variant={org.is_active ? "default" : "secondary"}>
                        {org.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <button
                        onClick={() =>
                          navigate(`/platform/organization/${org.id}`)
                        }
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        onClick={() => setEditOrg(org)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Edit size={16} />
                      </button>

                      <button
                        onClick={() => toggleStatus(org)}
                        className={`p-1 rounded ${
                          org.is_active
                            ? "text-green-600 hover:bg-green-100"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        {org.is_active ? (
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

      <EditOrganizationModal
        open={!!editOrg}
        onOpenChange={(open) => !open && setEditOrg(null)}
        organization={editOrg}
        onSubmit={updateOrganization}
      />
    </div>
  );
};

export default AdminOrganizationListPage;
