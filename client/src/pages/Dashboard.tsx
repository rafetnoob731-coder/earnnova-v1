import { useState, useEffect } from "react";
import { useAuth } from "../lib/auth";
import api from "../lib/api";
import { Coins, Users, TrendingUp, Eye } from "lucide-react";

interface DashboardData {
  user: any;
  dailyAdCount: number;
  dailyLimit: number;
  transactions: any[];
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    api.get("/dashboard").then((res) => setData(res.data));
  }, []);

  const stats = [
    { label: "Balance", value: `$${user?.balance.toFixed(2) || "0.00"}`, icon: Coins, color: "text-emerald-500" },
    { label: "Ads Today", value: `${data?.dailyAdCount || 0}/${data?.dailyLimit || 30}`, icon: Eye, color: "text-amber-500" },
    { label: "Referrals", value: "0", icon: Users, color: "text-blue-400" },
    { label: "Earned", value: `$${user?.balance.toFixed(2) || "0.00"}`, icon: TrendingUp, color: "text-gold" },
  ];

  return (
    <div className="space-y-5 pt-4">
      <div>
        <h1 className="text-lg font-bold">Dashboard</h1>
        <p className="text-xs text-white/40">Welcome back, {user?.name}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass-card p-4">
            <Icon size={18} className={color} />
            <p className="text-lg font-bold mt-2">{value}</p>
            <p className="text-xs text-white/40">{label}</p>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="glass-card p-4">
        <div className="flex justify-between text-sm mb-2">
          <span>Daily Limit</span>
          <span className="text-emerald-500">{data?.dailyAdCount || 0}/{data?.dailyLimit || 30}</span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all"
            style={{ width: `${((data?.dailyAdCount || 0) / (data?.dailyLimit || 30)) * 100}%` }}
          />
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <h2 className="text-sm font-semibold mb-3">Recent Activity</h2>
        <div className="space-y-2">
          {data?.transactions?.slice(0, 5).map((tx: any) => (
            <div key={tx._id} className="glass-card px-4 py-3 flex justify-between items-center">
              <div>
                <p className="text-sm">{tx.description}</p>
                <p className="text-xs text-white/30">{new Date(tx.createdAt).toLocaleDateString()}</p>
              </div>
              <span className={tx.amount > 0 ? "text-emerald-500" : "text-red-400"}>
                {tx.amount > 0 ? "+" : ""}${Math.abs(tx.amount).toFixed(2)}
              </span>
            </div>
          ))}
          {(!data?.transactions || data.transactions.length === 0) && (
            <p className="text-sm text-white/30 text-center py-8">No activity yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
