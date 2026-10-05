import React from "react";
import { PaperAccount, Asset } from "../../types";
import { 
  Briefcase, 
  X, 
  TrendingUp, 
  TrendingDown, 
  RotateCcw, 
  CheckCircle2, 
  ArrowUpRight, 
  ArrowDownRight,
  Shield,
  Trash2,
  ExternalLink
} from "lucide-react";

interface PaperPortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  paperAccount: PaperAccount;
  assets: Asset[];
  onClosePosition: (positionId: string) => void;
  onResetPortfolio: () => void;
}

export const PaperPortfolioModal: React.FC<PaperPortfolioModalProps> = ({
  isOpen,
  onClose,
  paperAccount,
  assets,
  onClosePosition,
  onResetPortfolio,
}) => {
  if (!isOpen) return null;

  // Calculate live position equities & PnLs
  const positionsWithLiveMetrics = paperAccount.positions.map((pos) => {
    const asset = assets.find((a) => a.symbol === pos.symbol);
    const currentPrice = asset?.price || pos.currentPrice;
    const diff = pos.side === "BUY" ? currentPrice - pos.entryPrice : pos.entryPrice - currentPrice;
    const pnl = diff * pos.shares;
    const pnlPercent = (diff / pos.entryPrice) * 100;

    return {
      ...pos,
      currentPrice,
      pnl,
      pnlPercent,
      growwSlug: asset?.growwSlug,
    };
  });

  const positionsValue = positionsWithLiveMetrics.reduce((acc, p) => acc + p.currentPrice * p.shares, 0);
  const totalUnrealizedPnl = positionsWithLiveMetrics.reduce((acc, p) => acc + p.pnl, 0);
  const totalEquity = paperAccount.cash + positionsValue;
  const allTimePnl = totalEquity - paperAccount.initialBalance;
  const allTimePnlPercent = (allTimePnl / paperAccount.initialBalance) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800/80 flex items-center justify-center text-emerald-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                Groww Virtual Paper Portfolio
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                  NSE / BSE Simulation
                </span>
              </h3>
              <p className="text-xs text-slate-400">Track Indian stock agent executions in real-time with zero risk</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onResetPortfolio}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-800/60 text-xs font-mono text-slate-400 hover:text-rose-300 transition-all"
              title="Reset capital back to ₹5,00,000"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset (₹5L)</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Account Metric Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5 bg-slate-950/50 border-b border-slate-800">
          <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Total Portfolio Equity</span>
            <div className="text-xl font-mono font-bold text-white mt-1">
              ₹{totalEquity.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
          </div>

          <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Available Cash</span>
            <div className="text-xl font-mono font-bold text-slate-200 mt-1">
              ₹{paperAccount.cash.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
          </div>

          <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Unrealized P&L</span>
            <div className={`text-xl font-mono font-bold mt-1 ${totalUnrealizedPnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {totalUnrealizedPnl >= 0 ? "+" : ""}₹{Math.abs(totalUnrealizedPnl).toLocaleString("en-IN", { minimumFractionDigits: 1, maximumFractionDigits: 2 })}
            </div>
          </div>

          <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Total Return</span>
            <div className={`text-xl font-mono font-bold mt-1 ${allTimePnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {allTimePnl >= 0 ? "+" : ""}{allTimePnlPercent.toFixed(2)}%
            </div>
          </div>
        </div>

        {/* Content Body: Open Positions & History */}
        <div className="p-5 flex-1 overflow-y-auto space-y-6 scrollbar-thin">
          {/* Active Positions */}
          <div>
            <h4 className="font-bold text-white text-sm font-mono flex items-center justify-between mb-3">
              <span>Open Positions ({paperAccount.positions.length})</span>
              <span className="text-xs text-slate-400 font-normal">Auto-monitored with Stop-Loss & Target</span>
            </h4>

            {positionsWithLiveMetrics.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-slate-800 rounded-xl bg-slate-950/40 text-slate-400 text-xs font-mono">
                No active simulated positions. Pick a stock in the "Trade or Avoid?" screener or Terminal, and click "Simulate Paper Trade".
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="pb-2">Stock</th>
                      <th className="pb-2">Side</th>
                      <th className="pb-2">Order Type</th>
                      <th className="pb-2">Qty</th>
                      <th className="pb-2">Avg Entry</th>
                      <th className="pb-2">LTP</th>
                      <th className="pb-2">SL / Target</th>
                      <th className="pb-2">P&L</th>
                      <th className="pb-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {positionsWithLiveMetrics.map((pos) => {
                      const isProfit = pos.pnl >= 0;
                      return (
                        <tr key={pos.id} className="hover:bg-slate-800/40 transition-all">
                          <td className="py-3 font-bold text-white flex items-center gap-1.5">
                            <span>{pos.symbol}</span>
                            {pos.growwSlug && (
                              <a
                                href={`https://groww.in/stocks/${pos.growwSlug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-emerald-400 hover:text-emerald-300"
                                title="Open on Groww"
                              >
                                <ExternalLink className="w-3 h-3 inline" />
                              </a>
                            )}
                          </td>
                          <td className="py-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                pos.side === "BUY"
                                  ? "bg-emerald-950 text-emerald-400 border border-emerald-800/60"
                                  : "bg-rose-950 text-rose-400 border border-rose-800/60"
                              }`}
                            >
                              {pos.side}
                            </span>
                          </td>
                          <td className="py-3 text-slate-400 text-[11px]">{pos.orderType || "Delivery (CNC)"}</td>
                          <td className="py-3 text-slate-200">{pos.shares}</td>
                          <td className="py-3 text-slate-200">₹{pos.entryPrice.toFixed(2)}</td>
                          <td className="py-3 text-white font-bold">₹{pos.currentPrice.toFixed(2)}</td>
                          <td className="py-3 text-slate-400 text-[11px]">
                            <span className="text-rose-400">₹{pos.stopLoss.toFixed(1)}</span> /{" "}
                            <span className="text-emerald-400">₹{pos.takeProfit.toFixed(1)}</span>
                          </td>
                          <td className={`py-3 font-bold ${isProfit ? "text-emerald-400" : "text-rose-400"}`}>
                            {isProfit ? "+" : ""}₹{Math.abs(pos.pnl).toFixed(2)} ({isProfit ? "+" : ""}{pos.pnlPercent.toFixed(2)}%)
                          </td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => onClosePosition(pos.id)}
                              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 border border-slate-700 hover:border-rose-700 transition-all text-[11px]"
                            >
                              Square Off
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Trade History */}
          {paperAccount.tradeHistory.length > 0 && (
            <div>
              <h4 className="font-bold text-white text-sm font-mono mb-3">
                Closed Trade Order Log ({paperAccount.tradeHistory.length})
              </h4>
              <div className="overflow-x-auto max-h-48 scrollbar-thin">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="pb-2">Time</th>
                      <th className="pb-2">Stock</th>
                      <th className="pb-2">Action</th>
                      <th className="pb-2">Exit Price</th>
                      <th className="pb-2">Qty</th>
                      <th className="pb-2 text-right">Realized P&L</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {paperAccount.tradeHistory.map((h) => {
                      const pnl = h.pnl || 0;
                      const isWin = pnl >= 0;
                      return (
                        <tr key={h.id} className="text-slate-300">
                          <td className="py-2 text-[11px] text-slate-500">
                            {new Date(h.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </td>
                          <td className="py-2 font-bold text-white">{h.symbol}</td>
                          <td className="py-2 text-[10px] text-emerald-300">{h.side}</td>
                          <td className="py-2">₹{h.price.toFixed(2)}</td>
                          <td className="py-2">{h.shares}</td>
                          <td className={`py-2 text-right font-bold ${isWin ? "text-emerald-400" : "text-rose-400"}`}>
                            {isWin ? "+" : ""}₹{Math.abs(pnl).toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
