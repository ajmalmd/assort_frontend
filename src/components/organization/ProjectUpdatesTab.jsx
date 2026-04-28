import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImageIcon, Plus, X } from "lucide-react";

const mockUpdates = [
  {
    id: "1",
    user: {
      id: 101,
      full_name: "John Smith",
    },
    text: "Revised Profile page",
    attachments: [
      {
        file_name: "profile_page.png",
        file_type: "image/png",
        file_data:
          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150'%3E%3Crect fill='%23e0e0e0' width='200' height='150'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='14' fill='%23999'%3Eprofile_page.png%3C/text%3E%3C/svg%3E",
      },
      {
        file_name: "auth.ts",
        file_type: "text/plain",
        file_data: null,
      },
    ],
    created_at: "2 hours ago",
  },
  {
    id: "2",
    user: {
      id: 2,
      full_name: "Robert King",
    },
    text: "Updated project scope and timeline",
    attachments: [],
    created_at: "5 hours ago",
  },
  {
    id: "3",
    user: {
      id: 103,
      full_name: "Mike Chen",
    },
    text: "Completed API integration for authentication",
    attachments: [
      {
        file_name: "auth.ts",
        file_type: "text/plain",
        file_data: null,
      },
    ],
    created_at: "1 day ago",
  },
];

export function ProjectUpdatesTab({ projectId }) {
  const [showForm, setShowForm] = useState(false);
  const [updates, setUpdates] = useState(mockUpdates);
  const [newUpdate, setNewUpdate] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  const handleSubmit = () => {
    if (newUpdate.trim()) {
      const update = {
        id: String(updates.length + 1),
        user: {
          id: 999,
          full_name: "You",
        },
        text: newUpdate,
        attachments: attachment
          ? [
              {
                file_name: attachment.name,
                file_type: attachment.type,
                file_data: null,
              },
            ]
          : [],
        created_at: "just now",
      };

      setUpdates([update, ...updates]);
      setNewUpdate("");
      setAttachment(null);
      setShowForm(false);
    }
  };

  const openFileModal = (file) => {
    setSelectedFile(file);
    setViewModalOpen(true);
  };

  return (
    <div className="space-y-4">
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

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="cursor-pointer">
                  <ImageIcon className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                  <input
                    type="file"
                    hidden
                    onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                  />
                </label>

                {attachment && (
                  <div className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded">
                    {attachment.name}
                    <button
                      onClick={() => setAttachment(null)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>Post Update</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Updates List */}
      <div className="space-y-3">
        {updates.map((update) => (
          <Card key={update.id}>
            <CardContent className="pt-6 space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm">{update.user.full_name}</p>
                  <p className="text-xs text-muted-foreground">Team Member</p>
                </div>

                <p className="text-xs text-muted-foreground">
                  {update.created_at}
                </p>
              </div>

              {/* Text */}
              <p className="text-sm text-foreground">{update.text}</p>

              {/* Attachments */}
              {update.attachments?.length > 0 &&
                update.attachments.map((file, index) => (
                  <button
                    key={index}
                    onClick={() => openFileModal(file)}
                    className="w-full flex items-center gap-3 p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors cursor-pointer"
                  >
                    {file.file_type?.includes("image") && file.file_data ? (
                      <img
                        src={file.file_data}
                        alt={file.file_name}
                        className="h-16 w-16 object-fill rounded"
                      />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-primary flex-shrink-0" />
                    )}

                    <div className="text-left flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {file.file_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Click to view
                      </p>
                    </div>
                  </button>
                ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* File Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{selectedFile?.file_name}</DialogTitle>
          </DialogHeader>

          <div className="w-full h-full flex items-center justify-center bg-muted rounded-lg">
            {selectedFile?.file_type?.includes("image") &&
            selectedFile?.file_data ? (
              <img
                src={selectedFile.file_data}
                alt={selectedFile.file_name}
                className="max-w-full max-h-[60vh] object-fill"
              />
            ) : (
              <div className="text-center space-y-2">
                <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground">
                  {selectedFile?.file_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  File preview not available
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
