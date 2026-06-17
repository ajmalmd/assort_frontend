import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Search } from "lucide-react";
import { useAuthState } from "@/redux/hooks";
import { isOrgOwnerorAdmin } from "@/appFunctions";
import assort_api from "@/api/axios";
import { APP_POINTS } from "@/api/apiConfig";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";

export function NewChatModal({ open, onOpenChange, createdChat }) {
  const [step, setStep] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState({ id: null });
  const [groupTitle, setGroupTitle] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [selectedGroupMembers, setSelectedGroupMembers] = useState([]);
  const [selectedAdmins, setSelectedAdmins] = useState([]);

  const { activeOrganization } = useAuthState();

  useEffect(() => {
    if (isOrgOwnerorAdmin(activeOrganization.role)) {
      setStep("options");
    } else {
      setStep("new-chat");
    }
  }, [activeOrganization]);

  useEffect(() => {
    const fetchAvailableChatMembers = async () => {
      const res = await assort_api.get(
        APP_POINTS.CHAT + "available-members/direct/",
      );
      setMembers(res.data);
    };

    const fetchAvailableMembers = async () => {
      const res = await assort_api.get(
        APP_POINTS.CHAT + "available-members/group/",
      );
      setMembers(res.data);
    };

    if (step === "new-chat") {
      fetchAvailableChatMembers();
    } else if (step === "new-group") {
      fetchAvailableMembers();
    }
  }, [step]);

  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleNewChat = async () => {
    if (selectedMember) {
      const res = await assort_api.post(APP_POINTS.CHAT + "directs/", {
        member_id: selectedMember.id,
      });

      createdChat({
        id: res.data.id,
        type: res.data.type,
        title: selectedMember.name,
        image: selectedMember.profile_pic || null,
        status: "",
        unread_count: 0,
        last_message: {},
      });

      setSelectedMember({ id: null });
      setSearchTerm("");
      setStep("");
      onOpenChange(false);
    }
  };

  const handleNewGroup = async () => {
    if (groupTitle.trim() && selectedGroupMembers.length > 0) {
      try {
        const payload = {
          title: groupTitle,
          description: groupDescription,
          members: selectedGroupMembers.filter(
            (mem) => !selectedAdmins.includes(mem),
          ),
          admins: selectedAdmins,
        };

        await assort_api.post(APP_POINTS.CHAT + "groups/", payload);

        setGroupTitle("");
        setGroupDescription("");
        setSelectedGroupMembers([]);
        setSelectedAdmins([]);
        setStep("options");
        onOpenChange(false);
        toast.success("Group chat created");
      } catch (error) {
        console.log(error);
        const message =
          error?.response?.data?.message || "Couldn't create group chat";
        toast.error(message);
      }
    }
  };

  const toggleGroupMember = (memberId) => {
    if (selectedGroupMembers.includes(memberId)) {
      setSelectedGroupMembers((prev) => prev.filter((id) => id !== memberId));

      setSelectedAdmins((prev) => prev.filter((id) => id !== memberId));
    } else {
      setSelectedGroupMembers((prev) => [...prev, memberId]);
    }
  };

  const toggleAdmin = (memberId) => {
    if (!selectedGroupMembers.includes(memberId)) return;

    setSelectedAdmins((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId],
    );
  };

  const handleModalClose = () => {
    setStep("options");
    setSearchTerm("");
    setSelectedMember({ id: null });
    setGroupTitle("");
    setGroupDescription("");
    setSelectedGroupMembers([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleModalClose}>
      <DialogContent className="sm:max-w-md">
        {step === "options" && (
          <>
            <DialogHeader>
              <DialogTitle>Start a Conversation</DialogTitle>
              <DialogDescription>
                Choose how you want to connect with your team
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <Button
                onClick={() => setStep("new-chat")}
                variant="outline"
                className="w-full justify-start h-auto py-3"
              >
                <div className="text-left">
                  <p className="font-semibold">New Chat</p>
                  <p className="text-xs text-muted-foreground">
                    Direct message with someone
                  </p>
                </div>
              </Button>
              <Button
                onClick={() => setStep("new-group")}
                variant="outline"
                className="w-full justify-start h-auto py-3"
              >
                <div className="text-left">
                  <p className="font-semibold">New Group</p>
                  <p className="text-xs text-muted-foreground">
                    Create a group conversation
                  </p>
                </div>
              </Button>
            </div>
          </>
        )}

        {step === "new-chat" && (
          <>
            <DialogHeader>
              <DialogTitle>New Chat</DialogTitle>
              <DialogDescription>
                Select a member to start chatting
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search members..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <ScrollArea className="h-[300px] w-full border rounded-lg p-3">
                <div className="space-y-2">
                  {filteredMembers.map((member) => (
                    <button
                      key={member.id}
                      onClick={() => setSelectedMember(member)}
                      className={`w-full p-3 rounded-lg text-left hover:bg-accent transition-colors ${
                        selectedMember?.id === member.id ? "bg-accent" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{member.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {member.email}
                          </p>
                        </div>
                        {/* <div
                          className={`h-2 w-2 rounded-full flex-shrink-0 ${
                            member.is_online ? "bg-green-500" : "bg-gray-400"
                          }`}
                        /> */}
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>

              <Button
                onClick={handleNewChat}
                disabled={!selectedMember?.id}
                className="w-full"
              >
                Start Chat
              </Button>
            </div>
          </>
        )}

        {step === "new-group" && (
          <>
            <DialogHeader>
              <DialogTitle>Create Group</DialogTitle>
              <DialogDescription>
                Set up a new group conversation
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 max-h-[80vh] overflow-y-auto px-1 sm:px-0">
              <div className="space-y-2">
                <Label htmlFor="group-title">Group Name</Label>
                <Input
                  id="group-title"
                  placeholder="Enter group name..."
                  value={groupTitle}
                  onChange={(e) => setGroupTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="group-description">
                  Description (optional)
                </Label>

                <textarea
                  className="w-full min-h-[100px] rounded-md border-2 p-2 shadow-xs resize-none"
                  id="group-description"
                  placeholder="What is this group about?"
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Select Members</Label>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    placeholder="Search members..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <ScrollArea className="h-[200px] sm:h-[250px] w-full rounded-lg border">
                  <div className="p-3 space-y-2">
                    {filteredMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-start gap-3 rounded-lg p-2 hover:bg-accent"
                      >
                        <Checkbox
                          id={`member-${member.id}`}
                          checked={selectedGroupMembers.includes(member.id)}
                          onCheckedChange={() => toggleGroupMember(member.id)}
                        />

                        <label
                          htmlFor={`member-${member.id}`}
                          className="flex-1 min-w-0 cursor-pointer"
                        >
                          <div className="font-medium break-words">
                            {member.name}
                          </div>

                          <div className="text-xs text-muted-foreground break-all">
                            {member.email}
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {selectedGroupMembers.length > 0 && (
                <div className="space-y-2">
                  <Label>Select Group Admins</Label>

                  <div className="text-xs text-muted-foreground">
                    Choose one or more admins from selected members
                  </div>

                  <ScrollArea className="h-[160px] sm:h-[180px] w-full rounded-lg border">
                    <div className="p-3 space-y-2">
                      {filteredMembers
                        .filter((member) =>
                          selectedGroupMembers.includes(member.id),
                        )
                        .map((member) => (
                          <div
                            key={member.id}
                            className="flex items-start gap-3 rounded-lg p-2 hover:bg-accent"
                          >
                            <Checkbox
                              id={`admin-${member.id}`}
                              checked={selectedAdmins.includes(member.id)}
                              onCheckedChange={() => toggleAdmin(member.id)}
                            />

                            <label
                              htmlFor={`admin-${member.id}`}
                              className="flex-1 min-w-0 cursor-pointer"
                            >
                              <div className="font-medium break-words">
                                {member.name}
                              </div>

                              <div className="text-xs text-muted-foreground break-all">
                                {member.email}
                              </div>
                            </label>

                            {selectedAdmins.includes(member.id) && (
                              <Badge variant="secondary" className="shrink-0">
                                Admin
                              </Badge>
                            )}
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              <div className="sticky bottom-0 bg-background pt-2">
                <Button
                  onClick={handleNewGroup}
                  disabled={!groupTitle.trim() || selectedAdmins.length === 0}
                  className="w-full"
                >
                  Create Group
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
