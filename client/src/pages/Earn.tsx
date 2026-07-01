import { useState } from "react";
import api from "../lib/api";
import { useAuth } from "../lib/auth";
import { toast } from "sonner";
import { Play, Clock, CheckCircle } from "lucide-react";

export default function Earn() {
  const { user } = useAuth();
  const [watching, setWatching] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [claimed, setClaimed] = useState(false);

  const startAd = () => {
    setWatching(true);
    setCountdown(30);
    setClaimed(false);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          claimReward();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const claimReward = async () => {
    try {
      await api.post("/ads/watch");
      toast.success("+$0.02 earned!");
      setClaimed(true);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to claim");
    } finally {
      setWatching(false);
    }
  };

  return (
    <div className="space-y-5 pt-4">
      <div>
        <h1 className="text-lg font-bold">Earn</h1>
        <p className="text-xs text-white/40">Watch ads to earn rewards</p>
      </div>

      {/* Ad Card */}
      <div className="glass-card p-6 text-center">
        {!watching && !claimed ? (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Play size={28} className="text-emerald-500 ml-1" />
            </div>
            <h2 className="text-lg font-bold">Watch an Ad</h2>
            <p className="text-sm text-white/40 mt-1">Earn $0.02 per ad</p>
            <p className="text-xs text-white/20 mt-2">30 seconds • Daily limit: 30 ads</p>
            <button onClick={startAd} className="btn-primary mt-4 w-full">
              Start Watching
            </button>
          </>
        ) : watching ? (
          <>
            <div className="relative w-24 h-24 mx-auto mb-4">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="#10B981" strokeWidth="6" strokeDasharray={`${(countdown / 30) * 264}`} strokeDashoffset="0" strokeLinecap="round" className="transition-all duration-1000" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold">{countdown}</span>
              </div>
            </div>
            <p className="text-sm text-white/40">Ad playing...</p>
          </>
        ) : (
          <>
            <CheckCircle size={48} className="mx-auto text-emerald-500 mb-3" />
            <h2 className="text-lg font-bold text-emerald-500">Earned!</h2>
            <p className="text-sm text-white/40 mt-1">+$0.02 added to your balance</p>
            <button onClick={startAd} className="btn-primary mt-4 w-full">
              Watch Another
            </button>
          </>
        )}
      </div>

      {/* Stats */}
      <div className="glass-card p-4 flex items-center gap-3">
        <Clock size={18} className="text-amber-500" />
        <div>
          <p className="text-sm font-medium">Today's Earnings</p>
          <p className="text-xs text-white/40">Keep watching to maximize your daily limit</p>
        </div>
      </div>
    </div>
  );
}
