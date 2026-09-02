import { useEffect, useMemo, useState } from "react";
import { Check, Loader2, Search, UserPlus, Users, X } from "lucide-react";

import assort_api from "@/api/axios";
import { APP_POINTS } from "@/api/apiConfig";

export default function CallInviteMembers({ sessionId, open, onClose }) {
  const [roomMembers, setRoomMembers] = useState([]);
  const [orgMembers, setOrgMembers] = useState([]);

  const [selectedIds, setSelectedIds] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !sessionId) {
      return;
    }

    fetchAvailableMembers();
  }, [open, sessionId]);

  useEffect(() => {
    if (!open) {
      setSearch("");
      setSelectedIds([]);
      setError("");
    }
  }, [open]);

  const fetchAvailableMembers = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await assort_api.get(
        `${APP_POINTS.CALL}${sessionId}/invitation-available-members/`,
      );

      setRoomMembers(res.data.available_room_members || []);

      setOrgMembers(res.data.available_org_members || []);
    } catch (error) {
      console.error("Failed to fetch invite members:", error);

      setError(
        error.response?.data?.detail || "Failed to load available members.",
      );
    } finally {
      setLoading(false);
    }
  };

  const normalizedSearch = search.trim().toLowerCase();

  const filterMembers = (members) => {
    if (!normalizedSearch) {
      return members;
    }

    return members.filter((member) =>
      member.full_name?.toLowerCase().includes(normalizedSearch),
    );
  };

  const filteredRoomMembers = useMemo(
    () => filterMembers(roomMembers),
    [roomMembers, normalizedSearch],
  );

  const filteredOrgMembers = useMemo(
    () => filterMembers(orgMembers),
    [orgMembers, normalizedSearch],
  );

  const toggleMember = (memberId) => {
    setSelectedIds((current) => {
      if (current.includes(memberId)) {
        return current.filter((id) => id !== memberId);
      }

      return [...current, memberId];
    });
  };

  const handleInvite = async () => {
    if (!selectedIds.length || inviting) {
      return;
    }

    try {
      setInviting(true);
      setError("");

      const res = await assort_api.post(
        `${APP_POINTS.CALL}${sessionId}/invite/`,
        {
          organization_member_ids: selectedIds,
        },
      );

      const invitedIds = new Set(
        (res.data.invited || []).map((item) => item.member_id),
      );

      if (invitedIds.size) {
        setRoomMembers((members) =>
          members.filter((member) => !invitedIds.has(member.id)),
        );

        setOrgMembers((members) =>
          members.filter((member) => !invitedIds.has(member.id)),
        );
      }

      setSelectedIds([]);

      // Re-fetch because call mode may have changed
      // ROOM -> MEETING after inviting an org member.
      await fetchAvailableMembers();
    } catch (error) {
      console.error("Failed to invite members:", error);

      setError(error.response?.data?.detail || "Failed to invite members.");
    } finally {
      setInviting(false);
    }
  };

  if (!open) {
    return null;
  }

  const noResults =
    !loading &&
    filteredRoomMembers.length === 0 &&
    filteredOrgMembers.length === 0;

  return (
    <div className="fixed inset-0 z-[120]">
      {/* Backdrop */}

      <button
        type="button"
        aria-label="Close invite members"
        onClick={onClose}
        className="absolute inset-0 bg-black/60"
      />

      {/* Desktop drawer / Mobile sheet */}

      <div className="absolute inset-x-0 bottom-0 flex max-h-[85dvh] flex-col rounded-t-2xl border border-white/10 bg-neutral-950 shadow-2xl sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:w-[420px] sm:rounded-none sm:border-y-0 sm:border-r-0 sm:border-l">
        {/* Header */}

        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-4">
          <div>
            <h3 className="font-semibold text-white">Invite members</h3>

            <p className="mt-0.5 text-xs text-white/50">
              Add people to this call
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            <X size={19} />
          </button>
        </div>

        {/* Search */}

        <div className="shrink-0 px-4 py-3">
          <div className="relative">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search members..."
              className="h-10 w-full rounded-lg border border-white/10 bg-white/5 pl-9 pr-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/20 focus:bg-white/[0.07]"
            />
          </div>
        </div>

        {/* Member list */}

        <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="animate-spin text-white/50" />
            </div>
          ) : (
            <>
              {error && (
                <div className="mx-2 mb-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
                  {error}
                </div>
              )}

              {filteredRoomMembers.length > 0 && (
                <MemberSection
                  title="Room members"
                  members={filteredRoomMembers}
                  selectedIds={selectedIds}
                  onToggle={toggleMember}
                />
              )}

              {filteredOrgMembers.length > 0 && (
                <MemberSection
                  title="Organization members"
                  members={filteredOrgMembers}
                  selectedIds={selectedIds}
                  onToggle={toggleMember}
                />
              )}

              {noResults && (
                <div className="flex h-48 flex-col items-center justify-center px-6 text-center">
                  <Users size={30} className="mb-3 text-white/20" />

                  <p className="text-sm text-white/50">
                    {search
                      ? "No members match your search."
                      : "No members available to invite."}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}

        <div className="shrink-0 border-t border-white/10 p-4">
          <button
            type="button"
            disabled={!selectedIds.length || inviting}
            onClick={handleInvite}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-white font-medium text-neutral-950 transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {inviting ? (
              <>
                <Loader2 size={17} className="animate-spin" />
                Inviting...
              </>
            ) : (
              <>
                <UserPlus size={17} />

                {selectedIds.length
                  ? `Invite ${selectedIds.length}`
                  : "Invite members"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function MemberSection({ title, members, selectedIds, onToggle }) {
  return (
    <div className="mb-4">
      <div className="px-3 pb-2 pt-2">
        <p className="text-xs font-medium uppercase tracking-wide text-white/40">
          {title}
        </p>
      </div>

      <div className="space-y-1">
        {members.map((member) => (
          <MemberRow
            key={member.id}
            member={member}
            selected={selectedIds.includes(member.id)}
            onClick={() => onToggle(member.id)}
          />
        ))}
      </div>
    </div>
  );
}

function MemberRow({ member, selected, onClick }) {
  const initial = member.full_name?.trim()?.charAt(0)?.toUpperCase() || "?";

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-white/5"
    >
      {member.profile_pic ? (
        <img
          src={member.profile_pic}
          alt={member.full_name}
          className="h-10 w-10 shrink-0 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-medium text-white">
          {initial}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-white">
          {member.full_name}
        </p>
      </div>

      <div
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition ${
          selected
            ? "border-white bg-white text-neutral-950"
            : "border-white/20"
        }`}
      >
        {selected && <Check size={14} />}
      </div>
    </button>
  );
}
