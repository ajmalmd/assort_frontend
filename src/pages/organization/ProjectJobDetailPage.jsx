import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Trash,
  CheckCircle,
  XCircle,
  FileClock,
} from "lucide-react";
import {
  formatDate_d_m_yyyy,
  formatEnum,
  hasProjectRight,
  isOrgProjectManager,
} from "@/appFunctions";
import BackButton from "@/components/ui/backButton";
import { useNavigate, useParams } from "react-router";
import assort_api from "@/api/axios";
import { APP_POINTS } from "@/api/apiConfig";
import { EditJobModal } from "@/components/organization/EditJobModal";
import { AddTimeLogModal } from "@/components/organization/AddTimeLogModal";
import ConfirmActionModal from "@/components/common/ConfirmActionModal";
import toast from "react-hot-toast";
import { useAuthState } from "@/redux/hooks";
import JobInfoCard from "@/components/organization/JobDetailPage/JobInfoCard";

export default function ProjectJobDetailPage() {
  const [loading, setLoading] = useState(false);
  const [job, setJob] = useState({});
  const [editJobModalOpen, setEditJobModalOpen] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [deleteLogId, setDeleteLogId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [expandedLogs, setExpandedLogs] = useState({});

  const navigate = useNavigate();
  const { jobId } = useParams();
  const { activeOrganization } = useAuthState();

  useEffect(() => {
    const fetchJob = async () => {
      if (jobId) {
        try {
          const res = await assort_api.get(
            `${APP_POINTS.PROJECTS}job/${jobId}/`,
          );
          setJob(res.data);
        } catch (error) {}
      }
    };
    fetchJob();
  }, [jobId]);

  const toggleExpand = (id) => {
    setExpandedLogs((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const isLead = () => {
    return job?.member?.id === job?.task?.lead?.id;
  };

  const canLog = () => {
    return job?.member?.id === job?.assigned_to?.id;
  };

  const updateJob = (details) => {
    setJob((prev) => ({ ...prev, ...details }));
  };

  const updateStatus = (newStatus) => {
    setJob((prev) => ({ ...prev, status: newStatus }));
  };

  const addLog = (details) => {
    setJob((prev) => ({
      ...prev,
      work_logs: [details, ...(prev.work_logs || [])],
    }));
  };

  const handleDelete = async () => {
    if (!deleteLogId) return;

    try {
      setDeleting(true);

      await assort_api.delete(`${APP_POINTS.PROJECTS}log/${deleteLogId}/`);

      // remove from UI
      setJob((prev) => ({
        ...prev,
        work_logs: prev.work_logs.filter((log) => log.id !== deleteLogId),
      }));

      toast.success("Log deleted");
      setDeleteLogId(null);
    } catch (error) {
      console.log(error);
      const message = error?.response?.data?.message || "Failed to delete log";
      toast.error(message);
      setDeleteLogId(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleApprove = async (logId) => {
    console.log(logId);
    try {
      await assort_api.post(`${APP_POINTS.PROJECTS}log/${logId}/approve/`);
      toast.success("Log Approved");
      setJob((prev) => ({
        ...prev,
        work_logs: prev.work_logs.map((log) =>
          log.id === logId ? { ...log, status: "APPROVED" } : log,
        ),
        worked_hours:
          prev.worked_hours +
          prev.work_logs.find((log) => log.id === logId).duration,
      }));
    } catch (error) {
      console.log(error);
      const message = error?.response?.data?.message || "Couldn't approve";
      toast.error(message);
    }
  };

  const handleReject = async (logId) => {
    console.log(logId);
    try {
      await assort_api.post(`${APP_POINTS.PROJECTS}log/${logId}/reject/`);
      toast.success("Log Rejected");
      setJob((prev) => ({
        ...prev,
        work_logs: prev.work_logs.map((log) =>
          log.id === logId ? { ...log, status: "REJECTED" } : log,
        ),
      }));
    } catch (error) {
      console.log(error);
      const message = error?.response?.data?.message || "Couldn't reject";
      toast.error(message);
    }
  };

  const StatusIcon = ({ status }) => {
    switch (status) {
      case "LOGGED":
        return <FileClock className="text-yellow-500" />;
      case "APPROVED":
        return <CheckCircle className="text-green-500" />;
      case "REJECTED":
        return <XCircle className="text-red-500" />;
      default:
        return null;
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (!job) {
    return (
      <>
        <BackButton onClick={() => navigate(-1)} />
        <div className="text-center py-10">Job not found</div>
      </>
    );
  }

  return (
    <div className="space-y-6">
      <BackButton onClick={() => navigate(-1)} />
      <JobInfoCard
        job={job}
        updateStatus={updateStatus}
        canEdit={hasProjectRight(activeOrganization.role) || isLead()}
        onEdit={() => setEditJobModalOpen(true)}
      />
      {canLog() && (
        <div className="flex justify-end gap-2">
          <Button onClick={() => setShowLogModal(true)} variant="outline">
            <Plus className="h-4 w-4" />
            Add Log
          </Button>
        </div>
      )}

      {(hasProjectRight(activeOrganization.role) || isLead() || canLog()) && (
        <div className="space-y-4 p-2 bg-gray-500/10 rounded-xl">
          <div className="font-normal pt-2 pl-2 text-xl">Logs</div>
          {job.work_logs?.length === 0 && (
            <p className="text-sm text-muted-foreground text-center">
              No logs added
            </p>
          )}
          {job?.work_logs?.map((log) => {
            const isExpanded = expandedLogs[log.id];
            const isPending = log.status === "LOGGED";
            const canDelete = log.status === "LOGGED" && canLog();

            const canReview =
              log.status === "LOGGED" &&
              (isLead() || isOrgProjectManager(activeOrganization.role));

            return (
              <Card
                key={log.id}
                className={`rounded-2xl border p-5 transition-all ${
                  isPending
                    ? "border-yellow-400 bg-yellow-50/40"
                    : "bg-background"
                }`}
              >
                {/* HEADER */}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold">
                      {formatDate_d_m_yyyy(log.date)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {log.start_time} → {log.end_time}
                    </p>

                    {isPending && canReview && (
                      <p className="text-xs mt-1 font-medium text-yellow-600">
                        Pending your approval
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {formatEnum(log.status)}
                    </Badge>

                    <StatusIcon status={log.status} />
                  </div>
                </div>

                {/*TIME SUMMARY */}
                <div className="flex items-center justify-between bg-muted/40 rounded-xl px-2">
                  <div className="flex gap-6 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Start</p>
                      <p className="font-medium">{log.start_time}</p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">End</p>
                      <p className="font-medium">{log.end_time}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="text-lg font-semibold text-primary">
                      {log.duration}h
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpand(log.id)}
                  >
                    {isExpanded ? "Hide remarks" : "View remarks"}
                  </Button>

                  <div className="flex gap-2">
                    {canReview && isPending && (
                      <>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleApprove(log.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>

                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(log.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}

                    {canDelete && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDeleteLogId(log.id)}
                      >
                        <Trash className="h-4 w-4 mr-1 text-red-500" />
                        Delete
                      </Button>
                    )}
                  </div>
                </div>

                {/* EXPANDED */}
                {isExpanded && (
                  <div className=" pt-2 border-t">
                    <p className="text-sm leading-relaxed whitespace-pre-line">
                      {log.remarks || "No remarks provided"}
                    </p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {(hasProjectRight(activeOrganization.role) || isLead()) && (
        <EditJobModal
          open={editJobModalOpen}
          onOpenChange={setEditJobModalOpen}
          job={job}
          updatedJobDetails={updateJob}
        />
      )}

      {canLog() && (
        <>
          <AddTimeLogModal
            open={showLogModal}
            onOpenChange={setShowLogModal}
            job={{ id: jobId, title: job.title }}
            addedLogDetails={addLog}
          />

          <ConfirmActionModal
            open={!!deleteLogId}
            onOpenChange={() => setDeleteLogId(null)}
            title="Delete Log"
            description="Are you sure you want to delete this work log? This cannot be undone."
            confirmText="Delete"
            loading={deleting}
            onConfirm={handleDelete}
          />
        </>
      )}
    </div>
  );
}
