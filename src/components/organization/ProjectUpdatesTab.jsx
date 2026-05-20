import { useMemo, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Download,
  Eye,
  File,
  FileText,
  ImageIcon,
  Paperclip,
  Plus,
  X,
} from "lucide-react";
import assort_api from "@/api/axios";
import { APP_POINTS } from "@/api/apiConfig";
import toast from "react-hot-toast";

/* -------------------------------------------------------------------------- */
/*                                   HELPERS                                  */
/* -------------------------------------------------------------------------- */

const SAFE_FILE_TYPES = [
  // images
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",

  // pdf
  "application/pdf",

  // documents
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

  // excel
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

  // ppt
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",

  // text/data
  "text/plain",
  "text/csv",
  "application/json",
  "application/xml",
  "text/xml",

  // archives
  "application/zip",
  "application/x-zip-compressed",
  "application/x-rar-compressed",
  "application/x-7z-compressed",

  // media
  "video/mp4",
  "video/quicktime",
];

const isImage = (type) => type?.startsWith("image/");
const isPdf = (type) => type === "application/pdf";

const formatRelativeTime = (timestamp) => {
  const diff = Date.now() - new Date(timestamp).getTime();

  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;

  return `${days} day${days > 1 ? "s" : ""} ago`;
};

const getFileIcon = (type) => {
  if (isImage(type)) {
    return <ImageIcon className="h-5 w-5 text-primary" />;
  }

  if (isPdf(type)) {
    return <FileText className="h-5 w-5 text-primary" />;
  }

  return <File className="h-5 w-5 text-primary" />;
};

/* -------------------------------------------------------------------------- */
/*                              MAIN COMPONENT                                */
/* -------------------------------------------------------------------------- */

export function ProjectUpdatesTab({ projectId }) {
  const [showForm, setShowForm] = useState(false);
  const [updates, setUpdates] = useState([]);
  const [newUpdate, setNewUpdate] = useState("");
  const [attachments, setAttachments] = useState([]);

  const acceptedFileTypes = useMemo(() => SAFE_FILE_TYPES.join(","), []);

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        const res = await assort_api.get(
          `${APP_POINTS.PROJECTS}${projectId}/updates/`,
        );
        setUpdates(res.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchUpdates();
  }, []);

  /* ---------------------------------------------------------------------- */
  /*                            FILE HANDLING                               */
  /* ---------------------------------------------------------------------- */

  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files || []);

    const validFiles = files.filter((file) =>
      SAFE_FILE_TYPES.includes(file.type),
    );

    const mappedFiles = validFiles.map((file) => ({
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      original_file: file,
      file_data:
        isImage(file.type) || isPdf(file.type)
          ? URL.createObjectURL(file)
          : null,
    }));

    setAttachments((prev) => [...prev, ...mappedFiles]);

    e.target.value = "";
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!newUpdate.trim() && attachments.length === 0) return;

    try {
      const payload = new FormData();

      payload.append("text", newUpdate);

      attachments.forEach((file) => {
        payload.append("files", file.original_file);
      });

      const response = await assort_api.post(
        `${APP_POINTS.PROJECTS}${projectId}/updates/`,
        payload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      setUpdates((prev) => [response.data, ...prev]);

      setNewUpdate("");
      setAttachments([]);
      setShowForm(false);

      toast.success("Update posted");
    } catch (error) {
      console.log(error);
      toast.error("Couldn't post the update");
    }
  };

  const openFileModal = (file) => {
    if (!isImage(file.file_type) && !isPdf(file.file_type)) return;
    window.open(file.download_url, "_blank");
  };

  const handleDownload = async (file) => {
    try {
      const response = await fetch(file.download_url);

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = file.file_name;

      document.body.appendChild(a);
      a.click();

      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.log(error);
      toast.error("Download failed");
    }
  };

  const getPreviewUrl = (file) => {
    return file.preview_url || file.file_data || null;
  };

  /* ---------------------------------------------------------------------- */
  /*                                 RENDER                                 */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="space-y-4 w-full overflow-hidden">
      {/* New Update Button */}
      <div className="flex justify-end">
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Update
        </Button>
      </div>

      {/* Update Form */}
      {showForm && (
        <Card className="border-primary/50">
          <CardContent className="pt-6 space-y-4">
            <textarea
              placeholder="Share an update about the project..."
              value={newUpdate}
              onChange={(e) => setNewUpdate(e.target.value)}
              className="w-full p-3 border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              rows={4}
            />

            {/* Selected Files */}
            {attachments.length > 0 && (
              <div className="space-y-2">
                {attachments.map((file, index) => (
                  <div
                    key={`${file.file_name}-${index}`}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted rounded-lg px-3 py-2"
                  >
                    <div className="flex items-start sm:items-center gap-2 min-w-0 w-full">
                      {getFileIcon(file.file_type)}

                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate break-all">
                          {file.file_name}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {(file.file_size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => removeAttachment(index)}
                      className="hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2">
                <label className="cursor-pointer">
                  <Paperclip className="h-5 w-5 text-muted-foreground hover:text-foreground" />

                  <input
                    type="file"
                    hidden
                    multiple
                    accept={acceptedFileTypes}
                    onChange={handleFilesChange}
                  />
                </label>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>

                <Button onClick={handleSubmit} className="w-full sm:w-auto">
                  Post Update
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Updates List */}
      <div className="space-y-3">
        {updates.map((update) => (
          <Card key={update.id}>
            <CardContent className="pt-4 sm:pt-6 space-y-4">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <p className="font-bold text-sm">{update.member.full_name}</p>

                  <p className="text-xs text-muted-foreground">
                    {update.member.role}
                  </p>
                </div>

                <p className="text-xs text-muted-foreground">
                  {formatRelativeTime(update.created_at)}
                </p>
              </div>

              {/* Text */}
              {update.text && (
                <p className="text-sm text-foreground">{update.text}</p>
              )}

              {/* Attachments */}
              {update.attachments?.length > 0 && (
                <div className="space-y-3">
                  {update.attachments.map((file, index) => (
                    <div
                      key={index}
                      className="border rounded-lg overflow-hidden"
                    >
                      {/* IMAGE PREVIEW */}
                      {isImage(file.file_type) && file.preview_url && (
                        <div className="bg-muted flex justify-center">
                          <img
                            src={getPreviewUrl(file)}
                            alt={file.file_name}
                            className="w-full max-h-[300px] sm:max-h-[400px] object-cover"
                          />
                        </div>
                      )}

                      {/* FILE INFO */}
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {getFileIcon(file.file_type)}

                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">
                              {file.file_name}
                            </p>

                            <p className="text-xs text-muted-foreground">
                              {file.file_type}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                          {(isImage(file.file_type) ||
                            isPdf(file.file_type)) && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-2 w-full sm:w-auto"
                              onClick={() => openFileModal(file)}
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2 w-full sm:w-auto"
                            onClick={() => handleDownload(file)}
                          >
                            <Download className="h-4 w-4" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
