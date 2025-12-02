import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

import {
  IoHome,
  IoCompass,
  IoWallet,
  IoPerson,
  IoLogOut,
} from "react-icons/io5";

import Dock from "../reactbits/components/Dock.jsx";

export default function VerticalSidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const menu = [
    { id: "dashboard", label: "Dashboard", icon: IoHome, path: "/app/dashboard" },
    { id: "explore", label: "Explore", icon: IoCompass, path: "/app/explore" },
    {
      id: "wallet",
      label: "Wallet",
      icon: IoWallet,
      path: "/app/wallet",
      allowed: user?.role === "investor",
    },
    {
      id: "profile",
      label: "My Profile",
      icon: IoPerson,
      path: user ? `/artist/${user.id}` : "#",
      allowed: user?.role === "artist",
    },
  ];

  const visible = menu.filter((m) => m.allowed ?? true);

  const isActive = (path) => location.pathname.startsWith(path);

  const dockItems = visible.map((m) => ({
    icon: <m.icon size={22} />,
    label: m.label,
    onClick: () => navigate(m.path),
    className: isActive(m.path) ? "dock-item-active" : "",
  }));

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-[#05030A] border-r border-white/5 flex flex-col justify-between z-50">
      {/* Logo */}
      <div
        className="p-6 border-b border-white/5 cursor-pointer"
        onClick={() => navigate("/")}
      >
        <div className="text-2xl font-bold tracking-tight">
          <span className="text-white">Fanny</span>
          <span className="text-[#FF48B9]">Bags</span>
        </div>
        <p className="text-xs text-gray-500 mt-1"></p>
      </div>

      {/* DOCK */}
      <div className="flex-1 flex items-center justify-center">
        <Dock
          items={dockItems}
          orientation="vertical"
          panelHeight={80}
          baseItemSize={54}
          magnification={70}
          distance={160}
          className="shadow-2xl"
        />
      </div>

      {/* User + Logout */}
      <div className="px-6 py-4 border-t border-white/5 space-y-2">
        <div className="px-4 py-2 bg-white/5 rounded-lg">
          <p className="text-xs text-gray-400">Logged in as</p>
          <p className="text-sm font-semibold text-white truncate">
            {user?.email || "User"}
          </p>
          <p className="text-xs text-[#FF48B9] capitalize">{user?.role}</p>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-[#FF48B9] hover:bg-[#FF48B9]/10 rounded-lg transition"
        >
          <IoLogOut size={20} /> Logout
        </button>
      </div>
    </aside>
  );
}
