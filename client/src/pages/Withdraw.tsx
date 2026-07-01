import { useState, useEffect } from "react";
import api from "../lib/api";
import { useAuth } from "../lib/auth";
import { toast } from "sonner";
import { Wallet, CheckCircle, XCircle, Clock } from "lucide-react";

const methods = [
  { id: "bkash", name: "bKash", icon: "📱" },
  { id: "nagad", name: "Nagad", icon: "📱" },
  { id: "binance", name: "Binance", icon: "💰" },
  { id: "paypal", name: "PayPal", icon: "🌐" },
  { id: "wise", name: "Wise", icon: "🏦" },
  { id: "bank", name: "Bank Transfer", icon: "🏛️" },
  { id: "crypto", name: "Crypto", icon: "🔗" },
];

export default function Withdraw() {
  const { user } = useAuth();
  const [method, setMethod] = useState("");
  const [amount, setAmount] = useState("");
  const [details, setDetails] = useState<Record<string, string>>({});
  const [withdrawals, setWithdrawals] = useState<any[]>([]);

  useEffect(() => { api.get("/withdrawals").then((r) => setWithdrawals(r.data)); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/withdrawals", { method, amount: parseFloat(amount), accountDetails: details });
      toast.success("Withdrawal requested!");
      setAmount("");
      setDetails({});
      api.get("/withdrawals").then((r) => setWithdrawals(r.data));
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed");
    }
  };

  const renderFields = () => {
    const fields: Record<string, string[]> = {
      bkash: ["bKash Number"],
      nagad: ["Nagad Number"],
      binance: ["Binance ID", "Email"],
      paypal: ["PayPal Email"],
      wise: ["Account Number", "Routing Number"],
      bank: ["Account Name", "Account Number", "Bank Name", "Routing Number"],
      crypto: ["Wallet Address", "Network (BTC/ETH/USDT)"],
    };
    return (fields[method] || []).map((f) => (
      <input key={f} type="text" placeholder={f} value={details[f] || ""}
        onChange={(e) => setDetails({ ...details, [f]: e.target.value })}
        className="glass-input" required
      />
    ));
  };

  return (
    <div className="space-y-5 pt-4">
      <div>
        <h1 className="text-lg font-bold">Withdraw</h1>
        <p className="text-xs text-white/40">Balance: ${user?.balance.toFixed(2)}</p>
      </div>

      {/* Withdrawal Methods */}
      <div className="grid grid-cols-4 gap-2">
        {methods.map(({ id, name, icon }) => (
          <button key={id} onClick={() => setMethod(id)}
            className={`glass-card p-3 text-center transition-all ${
              method === id ? "border-emerald-500/50 bg-emerald-500/5" : ""
            }`}
          >
            <span className="text-xl">{icon}</span>
            <p className="text-[10px] mt-1 text-white/60">{name}</p>
          </button>
        ))}
      </div>

      {method && (
        <form onSubmit={handleSubmit} className="glass-card p-4 space-y-3">
          <input type="number" step="0.01" min="5" placeholder={`Amount (min $5)`}
            value={amount} onChange={(e) => setAmount(e.target.value)} className="glass-input" required
          />
          {renderFields()}
          <button type="submit" className="btn-primary w-full">Request Withdrawal</button>
        </form>
      )}

      {/* Withdrawal History */}
      {withdrawals.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold mb-3">History</h2>
          <div className="space-y-2">
            {withdrawals.map((w: any) => (
              <div key={w._id} className="glass-card px-4 py-3 flex items-center gap-3">
                {w.status === "approved" ? <CheckCircle size={16} className="text-emerald-500" /> :
                 w.status === "rejected" ? <XCircle size={16} className="text-red-400" /> :
                 <Clock size={16} className="text-amber-500" />}
                <div className="flex-1">
                  <p className="text-sm">${w.amount.toFixed(2)} via {w.method}</p>
                  <p className="text-xs text-white/30">{new Date(w.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`text-xs uppercase ${
                  w.status === "approved" ? "text-emerald-500" :
                  w.status === "rejected" ? "text-red-400" : "text-amber-500"
                }`}>{w.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
