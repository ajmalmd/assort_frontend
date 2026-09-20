import { useState, useRef, useEffect } from "react";
import { LogOut, ChevronRight, LifeBuoy, Ticket } from "lucide-react";
import { logout } from "@/api/utility";
import { useNavigate } from "react-router";
import { getInitials } from "@/appFunctions";
import { Badge } from "../ui/badge";

export function ProfileMenu({ user, canSwitch, totalUnread }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    await logout(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-500 to-black flex items-center justify-center text-white font-semibold text-sm">
          {getInitials(user.full_name)}
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-12 right-0 w-80 bg-primary text-white rounded-2xl shadow-xl p-6 z-50">
          {/* Profile Header */}
          <button
            onClick={() => {
              setIsOpen(false);
              navigate("/profile");
            }}
            className="group flex w-full items-center gap-4 py-4 px-2 rounded-xl border-b border-gray-800 hover:bg-primary/90/60 transition-all duration-200 mb-2"
          >
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-500 to-black flex items-center justify-center font-semibold text-base text-white shadow-md">
              {getInitials(user.full_name)}
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0 text-left">
              <p className="font-semibold text-white truncate leading-none">
                {user.full_name}
              </p>
              <p className="text-sm text-gray-400 truncate leading-none mt-1">
                {user.email}
              </p>
            </div>

            {/* Arrow */}
            <ChevronRight
              size={18}
              className="text-gray-500 group-hover:text-gray-300 group-hover:translate-x-1 transition-all"
            />
          </button>

          {/* Switch Workspace */}
          {canSwitch && (
            <button
              onClick={() => {
                setIsOpen(false);
                navigate("/workspaces");
              }}
              className="flex w-full items-center justify-between px-4 py-3 rounded-lg hover:bg-primary/90 transition-colors text-white font-semibold mb-1"
            >
              <span>Switch workspace</span>
              <div className="flex">
                {totalUnread > 0 && (
                  <Badge
                    variant="destructive"
                    className="h-5 w-5 p-0 flex items-center justify-center text-xs pointer-events-none"
                  >
                    {totalUnread > 9 ? "9+" : totalUnread}
                  </Badge>
                )}
                <ChevronRight size={18} />
              </div>
            </button>
          )}

          {/* Visual Divider separating account links from help/support actions */}
          <div className="border-t border-gray-800 my-2" />

          <div className="flex gap-2 px-2 mb-1">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate("/tickets");
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-gray-800 hover:bg-primary/90 transition-colors text-xs font-semibold text-gray-300"
            >
              <Ticket size={14} />
              <span>My Tickets</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                navigate("/tickets");
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gray-800 hover:bg-gray-700 transition-colors text-xs font-semibold text-white"
            >
              <LifeBuoy size={14} />
              <span>New Ticket</span>
            </button>
          </div>

          {/* Final Divider before Logout */}
          <div className="border-t border-gray-800 my-2" />

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 px-4 py-3 rounded-lg hover:bg-primary/90 transition-colors text-red-400 hover:text-red-300 font-semibold"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
}
