import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  Download,
  Eye,
  File,
  FileText,
  ImageIcon,
  Loader2,
  Paperclip,
  Plus,
  Send,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";

import assort_api from "@/api/axios";
import { APP_POINTS } from "@/api/apiConfig";

const SAFE_FILE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/csv",
  "application/json",
  "application/xml",
  "text/xml",
  "application/zip",
  "application/x-zip-compressed",
  "application/x-rar-compressed",
  "application/x-7z-compressed",
  "video/mp4",
  "video/quicktime",
];

const isImage = (type) => type?.startsWith("image/");
const isPdf = (type) => type === "application/pdf";

const formatRelativeTime = (timestamp) => {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) return "";

  const diff = Date.now() - date.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year:
      date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });
};

const formatFileSize = (bytes) => {
  if (!bytes && bytes !== 0) return null;

  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getInitials = (name = "") => {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "?"
  );
};

const FileTypeIcon = ({ type, className = "h-5 w-5" }) => {
  if (isImage(type)) {
    return <ImageIcon className={`${className} text-muted-foreground`} />;
  }

  if (isPdf(type)) {
    return <FileText className={`${className} text-muted-foreground`} />;
  }

  return <File className={`${className} text-muted-foreground`} />;
};

export function ProjectUpdatesTab({ projectId }) {
  const [showForm, setShowForm] = useState(false);
  const [newUpdate, setNewUpdate] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);

  const acceptedFileTypes = useMemo(() => SAFE_FILE_TYPES.join(","), []);

  const queryClient = useQueryClient();

  const { data: updates = [], isLoading } = useQuery({
    queryKey: ["project-updates", projectId],

    queryFn: async () => {
      const response = await assort_api.get(
        `${APP_POINTS.PROJECTS}${projectId}/updates/`,
      );

      return response.data;
    },

    enabled: !!projectId,
  });

  const postUpdateMutation = useMutation({
    mutationFn: async ({ text, files }) => {
      const payload = new FormData();

      payload.append("text", text);

      files.forEach((file) => {
        payload.append("files", file.original_file);
      });

      const response = await assort_api.post(
        `${APP_POINTS.PROJECTS}${projectId}/updates/`,
        payload,
      );

      return response.data;
    },

    onSuccess: (createdUpdate) => {
      queryClient.setQueryData(
        ["project-updates", projectId],
        (current = []) => [createdUpdate, ...current],
      );

      resetForm();
      toast.success("Update posted");
    },

    onError: (error) => {
      console.error("Failed to post project update:", error);
      toast.error("Couldn't post the update");
    },
  });

  const handleFilesChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);

    const validFiles = selectedFiles.filter((file) =>
      SAFE_FILE_TYPES.includes(file.type),
    );

    if (validFiles.length !== selectedFiles.length) {
      toast.error("Some unsupported files were skipped");
    }

    setAttachments((current) => {
      const existingFiles = new Set(
        current.map(
          (file) =>
            `${file.file_name}-${file.file_size}-${file.original_file.lastModified}`,
        ),
      );

      const newFiles = validFiles
        .filter(
          (file) =>
            !existingFiles.has(
              `${file.name}-${file.size}-${file.lastModified}`,
            ),
        )
        .map((file) => ({
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          original_file: file,
          file_data: isImage(file.type) ? URL.createObjectURL(file) : null,
        }));

      return [...current, ...newFiles];
    });

    event.target.value = "";
  };

  const revokePreviewUrl = (file) => {
    if (file?.file_data) {
      URL.revokeObjectURL(file.file_data);
    }
  };

  const revokeAllPreviewUrls = (files) => {
    files.forEach(revokePreviewUrl);
  };

  const removeAttachment = (index) => {
    setAttachments((current) => {
      const removedFile = current[index];

      revokePreviewUrl(removedFile);

      return current.filter((_, fileIndex) => fileIndex !== index);
    });
  };

  const resetForm = () => {
    revokeAllPreviewUrls(attachments);

    setNewUpdate("");
    setAttachments([]);
    setShowForm(false);
  };

  const handleSubmit = () => {
    const text = newUpdate.trim();

    if ((!text && attachments.length === 0) || postUpdateMutation.isPending) {
      return;
    }

    postUpdateMutation.mutate({
      text,
      files: attachments,
    });
  };

  const handlePreview = (file) => {
    if (isImage(file.file_type)) {
      setPreviewFile(file);
      return;
    }
  };

  const handleDownload = async (file) => {
    if (!file.download_url) {
      toast.error("File is unavailable");
      return;
    }

    try {
      const response = await assort_api.get(file.download_url, {
        responseType: "blob",
      });

      const objectUrl = URL.createObjectURL(response.data);

      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = file.file_name || "download";

      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error("Failed to download attachment:", error);
      toast.error("Download failed");
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Project updates</h2>
          <p className="text-sm text-muted-foreground">
            Share progress, notes and files with the team.
          </p>
        </div>

        {!showForm && (
          <Button onClick={() => setShowForm(true)} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New update
          </Button>
        )}
      </div>

      {/* Composer */}
      {showForm && (
        <Card className="mb-6 shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <textarea
              autoFocus
              placeholder="What's new with this project?"
              value={newUpdate}
              onChange={(e) => setNewUpdate(e.target.value)}
              rows={4}
              className="
                min-h-[110px] w-full resize-none
                border-0 bg-transparent p-0 text-sm
                outline-none placeholder:text-muted-foreground
                focus:ring-0
              "
            />

            {/* Selected attachments */}
            {attachments.length > 0 && (
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {attachments.map((file, index) => (
                  <div
                    key={`${file.file_name}-${index}`}
                    className="
                      flex min-w-0 items-center gap-3
                      rounded-lg border bg-muted/30 p-2.5
                    "
                  >
                    {isImage(file.file_type) && file.file_data ? (
                      <img
                        src={file.file_data}
                        alt=""
                        className="h-10 w-10 shrink-0 rounded-md object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
                        <FileTypeIcon type={file.file_type} />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {file.file_name}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.file_size)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="
                        flex h-7 w-7 shrink-0 items-center justify-center
                        rounded-md text-muted-foreground
                        transition-colors
                        hover:bg-muted hover:text-destructive
                      "
                      aria-label={`Remove ${file.file_name}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <label
                className="
                  inline-flex h-9 cursor-pointer items-center gap-2
                  rounded-md px-3 text-sm font-medium
                  text-muted-foreground transition-colors
                  hover:bg-muted hover:text-foreground
                "
              >
                <Paperclip className="h-4 w-4" />
                <span className="hidden sm:inline">Attach files</span>

                <input
                  type="file"
                  hidden
                  multiple
                  accept={acceptedFileTypes}
                  onChange={handleFilesChange}
                />
              </label>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={postUpdateMutation.isPending}
                  onClick={resetForm}
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  size="sm"
                  disabled={
                    postUpdateMutation.isPending ||
                    (!newUpdate.trim() && attachments.length === 0)
                  }
                  onClick={handleSubmit}
                >
                  {postUpdateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Posting
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Post update
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex min-h-[220px] items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading updates...
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && updates.length === 0 && (
        <div className="rounded-xl border border-dashed px-6 py-14 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <FileText className="h-5 w-5 text-muted-foreground" />
          </div>

          <h3 className="text-sm font-semibold">No updates yet</h3>

          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            Share project progress, decisions, notes or files with your team.
          </p>

          {!showForm && (
            <Button
              size="sm"
              variant="outline"
              className="mt-4"
              onClick={() => setShowForm(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add first update
            </Button>
          )}
        </div>
      )}

      {/* Feed */}
      {!isLoading && updates.length > 0 && (
        <div className="relative">
          <div className="space-y-6">
            {updates.map((update) => {
              const images =
                update.attachments?.filter((file) => isImage(file.file_type)) ||
                [];

              const files =
                update.attachments?.filter(
                  (file) => !isImage(file.file_type),
                ) || [];

              return (
                <article key={update.id} className="relative sm:pl-14">
                  {/* Avatar */}
                  {/* <div
                    className="
                      absolute left-0 top-0 z-10 hidden h-10 w-10
                      items-center justify-center rounded-full
                      border bg-background text-xs font-semibold
                      sm:flex
                    "
                  >
                    {getInitials(update.member?.full_name)}
                  </div> */}

                  <div className="rounded-xl border bg-card p-4 shadow-sm sm:p-5">
                    {/* Member */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <p className="truncate text-sm font-semibold">
                            {update.member?.full_name}
                          </p>

                          {update.member?.role && (
                            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                              {update.member.role}
                            </span>
                          )}
                        </div>

                        <p
                          className="mt-0.5 text-xs text-muted-foreground"
                          title={new Date(update.created_at).toLocaleString()}
                        >
                          {formatRelativeTime(update.created_at)}
                        </p>
                      </div>
                    </div>

                    {/* Update text */}
                    {update.text && (
                      <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-6 text-foreground">
                        {update.text}
                      </p>
                    )}

                    {/* Images */}
                    {images.length > 0 && (
                      <div
                        className={`mt-4 grid gap-2 ${images.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}
                      >
                        {images.map((file, index) => (
                          <div
                            key={file.id || index}
                            className="group relative overflow-hidden rounded-lg border bg-muted"
                          >
                            <button
                              type="button"
                              onClick={() => handlePreview(file)}
                              className="block w-full cursor-zoom-in"
                            >
                              <img
                                src={file.preview_url || file.download_url}
                                alt={file.file_name}
                                loading="lazy"
                                className={`
                                  w-full object-contain
                                  ${images.length === 1 ? "max-h-[420px]" : "h-48 sm:h-56"}
                                `}
                              />
                            </button>

                            {/* Image actions */}
                            <div
                              className="
                                absolute right-2 top-2 flex items-center gap-1 rounded-lg border bg-background/90 p-1 opacity-0
                                shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100 focus-within:opacity-100
                              "
                            >
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={() => handlePreview(file)}
                                title="Preview image"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>

                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={() => handleDownload(file)}
                                title="Download image"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>

                            {/* Filename */}
                            <div
                              className="
                                absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent
                                px-3 pb-2 pt-8 opacity-0 transition-opacity group-hover:opacity-100
                              "
                            >
                              <p className="truncate text-xs font-medium text-white">
                                {file.file_name}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Other files */}
                    {files.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {files.map((file, index) => (
                          <div
                            key={file.id || index}
                            className="
                              flex min-w-0 items-center gap-3
                              rounded-lg border bg-muted/20
                              px-3 py-2.5
                            "
                          >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted">
                              <FileTypeIcon type={file.file_type} />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">
                                {file.file_name}
                              </p>

                              <p className="truncate text-xs text-muted-foreground">
                                {file.file_type}
                                {file.file_size
                                  ? ` · ${formatFileSize(file.file_size)}`
                                  : ""}
                              </p>
                            </div>

                            <div className="flex shrink-0 items-center gap-1">
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={() => handleDownload(file)}
                                title="Download file"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}

      <Dialog
        open={Boolean(previewFile)}
        onOpenChange={(open) => {
          if (!open) setPreviewFile(null);
        }}
      >
        <DialogContent className="max-w-[95vw] overflow-hidden p-0 sm:max-w-5xl">
          {previewFile && (
            <div>
              <div className="flex items-center justify-between gap-4 border-b px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {previewFile.file_name}
                  </p>

                  {previewFile.file_size != null && (
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(previewFile.file_size)}
                    </p>
                  )}
                </div>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="mr-6 shrink-0 gap-2"
                  onClick={() => handleDownload(previewFile)}
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>

              <div className="flex max-h-[80vh] items-center justify-center overflow-auto bg-muted/30 p-4">
                <img
                  src={previewFile.preview_url || previewFile.download_url}
                  alt={previewFile.file_name}
                  className="max-h-[75vh] max-w-full object-contain"
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
