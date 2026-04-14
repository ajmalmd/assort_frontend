import { useEffect, useState } from "react";
import {
  Edit,
  Eye,
  ToggleLeft,
  ToggleRight,
  Search,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";
import { APP_POINTS } from "@/api/apiConfig";
import assort_api from "@/api/axios";
import { CreatePlanModal } from "@/components/platform/CreatePlanModal";
import { formatEnum } from "@/appFunctions";
import { ViewPlanModal } from "@/components/platform/ViewPlanModal";
import { EditPlanModal } from "@/components/platform/EditPlanModal";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";

const AdminSubscriptionListPage = () => {
  const [plans, setPlans] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewPlan, setViewPlan] = useState(null);
  const [editPlan, setEditPlan] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await assort_api.get(APP_POINTS.PLATFORM + "plans/");
        setPlans(response.data || []);
      } catch (error) {
        toast.error("Network Error");
      }
    };

    fetchData();
  }, []);

  const handleCreatePlan = async (planData) => {
    try {
      const response = await assort_api.post(
        APP_POINTS.PLATFORM + "plans/",
        planData,
      );
      response.data.subscription_count = 0;
      setPlans((prev) => [...prev, response.data]);
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdatePlan = async (id, data) => {
    const res = await assort_api.patch(
      APP_POINTS.PLATFORM + `plans/${id}/`,
      data,
    );

    setPlans((prev) => prev.map((p) => (p.id === id ? res.data : p)));
    setEditPlan(null);
    toast.success("Plan updated successfully!");
  };

  const toggleStatus = async (plan) => {
    try {
      const res = await assort_api.patch(
        APP_POINTS.PLATFORM + `plans/${plan.id}/`,
        { is_active: !plan.is_active },
      );

      setPlans((prev) => prev.map((p) => (p.id === plan.id ? res.data : p)));

      toast.success(plan.is_active ? "Plan deactivated" : "Plan activated");
    } catch (error){
      console.log(error);      
      toast.error("Failed to update status");
    }
  };

  const filteredPlans = plans.filter((plan) =>
    plan.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="p-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search plans..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Button onClick={() => setIsModalOpen(true)}>+ Create Plan</Button>
      </div>

      {/* Table */}
      <div className="mt-4">
        {filteredPlans.length === 0 ? (
          <Empty className="border border-border/40 bg-card">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Users className="h-6 w-6" />
              </EmptyMedia>
              <EmptyTitle>No plans found</EmptyTitle>
              <EmptyDescription>
                {searchQuery
                  ? "Try adjusting your search"
                  : "No plans available"}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="rounded-lg border border-border/40 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="text-center">Plan</TableHead>
                  <TableHead className="text-center">Price</TableHead>
                  <TableHead className="text-center">Billing</TableHead>
                  <TableHead className="text-center">Projects</TableHead>
                  <TableHead className="text-center">Members</TableHead>
                  <TableHead className="text-center">Storage (GB)</TableHead>
                  <TableHead className="text-center">Subscriptions</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredPlans.map((plan) => (
                  <TableRow key={plan.id} className="text-center">
                    <TableCell className="font-medium">{plan.name}</TableCell>

                    <TableCell>₹{plan.price}</TableCell>

                    <TableCell>{formatEnum(plan.billing_cycle)}</TableCell>

                    <TableCell>{plan.max_projects}</TableCell>
                    <TableCell>{plan.max_members}</TableCell>
                    <TableCell>{plan.storage_limit_gb}</TableCell>

                    <TableCell className="font-medium">
                      {plan.subscription_count}
                    </TableCell>

                    <TableCell>
                      <Badge variant={plan.is_active ? "default" : "secondary"}>
                        {plan.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <button
                        onClick={() => setViewPlan(plan)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        onClick={() => setEditPlan(plan)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Edit size={16} />
                      </button>

                      <button
                        onClick={() => toggleStatus(plan)}
                        className={`p-1 rounded ${
                          plan.is_active
                            ? "text-green-600 hover:bg-green-100"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        {plan.is_active ? (
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

      {/* Modals */}
      <CreatePlanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreatePlan={handleCreatePlan}
      />

      <ViewPlanModal
        isOpen={!!viewPlan}
        plan={viewPlan}
        onClose={() => setViewPlan(null)}
      />

      <EditPlanModal
        isOpen={!!editPlan}
        plan={editPlan}
        onClose={() => setEditPlan(null)}
        onUpdatePlan={handleUpdatePlan}
      />
    </div>
  );
};

export default AdminSubscriptionListPage;
