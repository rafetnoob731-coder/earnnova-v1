import type { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { Coins, Home, Wallet, LogOut, User } from "lucide-react";

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/earn", icon: Coins, label: "Earn" },
  { path: "/withdraw", icon: Wallet, label: "Withdraw" },
];

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-navy-800 flex flex-col">
      {/* Status Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-card rounded-none border-x-0 border-t-0 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-xs font-bold">E</div>
            <span className="font-semibold text-sm">${user?.balance.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/50">{user?.name}</span>
            <button onClick={logout} className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-red-400 transition-colors">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 pt-14 pb-20 px-4 max-w-lg mx-auto w-full">
        {children}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 glass-card rounded-none border-x-0 border-b-0 px-2 py-2">
        <div className="flex justify-around max-w-lg mx-auto">
          {navItems.map(({ path, icon: Icon, label }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all ${
                location.pathname === path
                  ? "text-emerald-500 bg-emerald-500/10"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
