import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Calendar, Users } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import BackButton from "@/components/ui/backButton";
import { formatDate_MmmDD_YYYY, formatEnum, getInitials } from "@/appFunctions";
import assort_api from "@/api/axios";
import { APP_POINTS } from "@/api/apiConfig";

const getRoleColor = (role) => {
  switch (role) {
    case "OWNER":
      return "bg-purple-100 text-purple-800 hover:bg-purple-100";
    case "ADMIN":
      return "bg-blue-100 text-blue-800 hover:bg-blue-100";
    case "PROJECT_MANAGER":
      return "bg-amber-100 text-gray-800 hover:bg-amber-100";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-100";
  }
};

const OrganizationDetailPage = () => {
  const [organization, setOrganization] = useState({ members: [] });
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await assort_api.get(
          `${APP_POINTS.PLATFORM}organizations/${id}`,
        );
        setOrganization(res.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchDetails();
  }, [id]);
  return (
    <div className="p-2 space-y-6">
      <BackButton onClick={() => navigate(-1)} />
      {/* Header Section */}
      <div className="flex items-start gap-6">
        {typeof organization.logo === "string" &&
        organization.logo.length > 20 ? (
          <img
            src={organization.logo}
            alt="Organization logo"
            className="w-20 h-20 rounded-lg object-contain bg-gray-100"
          />
        ) : (
          <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center text-2xl font-bold">
            {getInitials(organization.title)}
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{organization.title}</h1>
            <Badge
              variant="default"
              className="bg-green-100 text-green-800 hover:bg-green-100"
            >
              Active
            </Badge>
          </div>
          <p className="text-muted-foreground">{organization.email}</p>
        </div>
      </div>

      {/* Organization Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-semibold">{organization.city}</div>
            <div className="text-sm text-muted-foreground">
              {organization.country}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Start Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-semibold">
              {formatDate_MmmDD_YYYY(organization.created_at)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-semibold text-2xl">
              {organization.number_of_projects || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-semibold text-2xl">
              {organization.number_of_members || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Members and Details */}
      <Tabs defaultValue="members" className="space-y-4">
        <TabsList>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardContent>
              <div className="rounded-lg border border-border/40 overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="border-border/40 hover:bg-transparent">
                      <TableHead className="font-semibold">Name</TableHead>
                      <TableHead className="font-semibold">Email</TableHead>
                      <TableHead className="font-semibold">Role</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {organization.members?.map((member) => (
                      <TableRow
                        key={member.id}
                        className="border-border/40"
                        onClick={() => navigate(`/platform/user/${member.id}`)}
                      >
                        <TableCell className="font-medium">
                          {member.full_name}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {member.email}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={getRoleColor(member.role)}
                          >
                            {formatEnum(member.role)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={member.is_active ? "default" : "secondary"}
                          >
                            {member.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Current Plan
                </div>
                <div className="font-semibold">
                  {organization.subscription_details.plan}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Status
                </div>
                <Badge
                  variant="default"
                  className="bg-green-100 text-green-800 hover:bg-green-100"
                >
                  {formatEnum(organization.subscription_details.status)}
                </Badge>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Start Date
                </div>
                <div className="font-semibold">
                  {organization.subscription_details.start_date}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  End Date
                </div>
                <div className="font-semibold">
                  {organization.subscription_details.end_date}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrganizationDetailPage;
