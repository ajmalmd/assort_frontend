import { useState, useRef, useEffect } from "react";
import { LogOut, ChevronRight } from "lucide-react";
import { logout } from "@/api/utility";
import { useNavigate } from "react-router";

export function ProfileMenu({ user, canSwitch }) {
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
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white font-semibold text-sm">
          {user.full_name.charAt(0).toUpperCase()}
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-12 right-0 w-80 bg-gray-900 text-white rounded-2xl shadow-xl p-6 z-50">
          {/* User Info */}
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-700">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center font-semibold text-lg">
              {user.full_name.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white truncate">{user.full_name}</p>
              <p className="text-sm text-gray-400 truncate">{user.email}</p>
            </div>
          </div>

          {/* Switch Workspace */}
          {canSwitch && (
            <button
              onClick={() => {
                setIsOpen(false);
                navigate("/workspaces");
              }}
              className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors mb-4 text-white font-semibold"
            >
              <span>Switch workspace</span>
              <ChevronRight size={18} />
            </button>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors text-white font-semibold"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
}
