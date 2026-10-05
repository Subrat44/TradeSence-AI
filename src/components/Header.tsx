import React from "react";
import { 
  Bot, 
  TrendingUp, 
  Search, 
  FlaskConical, 
  Briefcase, 
  Sparkles, 
  Activity,
  ShieldAlert,
  Layers,
  CheckCircle2,
  Newspaper,
  ExternalLink,
  Key
} from "lucide-react";
import { Asset, PaperAccount, GrowwConfig } from "../types";

export type TabType = "screener" | "terminal" | "news" | "research" | "backtest" | "portfolio";

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  selectedAsset: Asset;
  onSelectAsset: (asset: Asset) => void;
  assets: Asset[];
  paperAccount: PaperAccount;
  onOpenPortfolio: () => void;
  growwConfig: GrowwConfig;
  onOpenGrowwModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  selectedAsset,
  onSelectAsset,
  assets,
  paperAccount,
  onOpenPortfolio,
  growwConfig,
  onOpenGrowwModal,
}) => {
  // Calculate total portfolio equity: cash + value of open positions
  const positionsEquity = paperAccount.positions.reduce((acc, pos) => {
    const currentPrice = assets.find((a) => a.symbol === pos.symbol)?.price || pos.currentPrice;
    return acc + (pos.side === "BUY" ? currentPrice * pos.shares : (2 * pos.entryPrice - currentPrice) * pos.shares);
  }, 0);
  const totalEquity = paperAccount.cash + positionsEquity;
  const totalPnl = totalEquity - paperAccount.initialBalance;
  const totalPnlPercent = (totalPnl / paperAccount.initialBalance) * 100;

  // Nifty 50 and Bank Nifty reference
  const niftyAsset = assets.find((a) => a.symbol === "NIFTY 50");
  const bankNiftyAsset = assets.find((a) => a.symbol === "BANK NIFTY");

  return (
    <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur-md sticky top-0 z-30 shadow-lg">
      {/* Top Bar: Brand, Market Status, Navigation, and Capital */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-col lg:flex-row items-center justify-between gap-3">
        {/* Brand & Market Status */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Bot className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
                  TradeSense <span className="text-emerald-400 text-xs font-mono px-1.5 py-0.5 bg-emerald-950/80 border border-emerald-800/80 rounded">INDIA</span>
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  NSE / BSE Live
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                AI Stock Screener & Groww Trading Research Copilot
              </p>
            </div>
          </div>

          {/* Quick Indices Pill (Mobile view) */}
          {niftyAsset && (
            <div className="lg:hidden text-right font-mono text-xs">
              <span className="text-slate-400 block text-[10px]">NIFTY 50</span>
              <span className="font-bold text-white">₹{niftyAsset.price.toFixed(0)}</span>
              <span className={`ml-1 text-[10px] ${niftyAsset.change24h >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                +{niftyAsset.changePercent}%
              </span>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center bg-slate-950/90 p-1 rounded-xl border border-slate-800 text-xs sm:text-sm overflow-x-auto max-w-full">
          <button
            id="tab-screener"
            onClick={() => setActiveTab("screener")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
              activeTab === "screener"
                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-bold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Trade or Avoid?</span>
            <span className="text-[10px] px-1 py-0.2 bg-emerald-950 text-emerald-300 rounded border border-emerald-800">
              AI Matrix
            </span>
          </button>

          <button
            id="tab-terminal"
            onClick={() => setActiveTab("terminal")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
              activeTab === "terminal"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-bold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Terminal</span>
          </button>

          <button
            id="tab-news"
            onClick={() => setActiveTab("news")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
              activeTab === "news"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-bold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <Newspaper className="w-3.5 h-3.5" />
            <span>News & Events</span>
          </button>

          <button
            id="tab-research"
            onClick={() => setActiveTab("research")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
              activeTab === "research"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-bold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Deep Research</span>
          </button>

          <button
            id="tab-backtest"
            onClick={() => setActiveTab("backtest")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
              activeTab === "backtest"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-bold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Strategy Lab</span>
          </button>

          <button
            id="tab-portfolio"
            onClick={() => setActiveTab("portfolio")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
              activeTab === "portfolio"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-bold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Groww Paper</span>
            {paperAccount.positions.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-cyan-400 text-slate-950 text-[10px] flex items-center justify-center font-bold">
                {paperAccount.positions.length}
              </span>
            )}
          </button>
        </nav>

        {/* Account Capital Badge in INR & Groww API Connect */}
        <div className="flex items-center gap-2">
          <button
            id="btn-groww-api-connect"
            onClick={onOpenGrowwModal}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all font-mono text-xs ${
              growwConfig.isConnected
                ? "bg-emerald-950/80 border-emerald-500/80 text-emerald-300 hover:bg-emerald-900/60 shadow-sm shadow-emerald-500/20"
                : "bg-slate-950 border-slate-800 text-slate-300 hover:border-emerald-500 hover:text-white"
            }`}
            title="Configure Groww Cloud API for real-time automated trading"
          >
            <Key className={`w-3.5 h-3.5 ${growwConfig.isConnected ? "text-emerald-400" : "text-slate-400"}`} />
            <div className="text-left hidden sm:block">
              <span className="text-[9px] uppercase tracking-wider block text-slate-400 leading-none">
                Groww Cloud API
              </span>
              <span className="font-bold text-[11px] leading-tight">
                {growwConfig.isConnected ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Live Connected
                  </span>
                ) : (
                  "Connect API"
                )}
              </span>
            </div>
            <span className="sm:hidden font-bold text-[11px]">
              {growwConfig.isConnected ? "Live" : "Connect"}
            </span>
          </button>

          <button
            id="btn-paper-account-summary"
            onClick={onOpenPortfolio}
            className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-800/80 transition-all text-right group"
          >
            <div className="text-left hidden sm:block">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                Groww Virtual Capital
              </span>
              <span className="text-xs font-mono font-bold text-white">
                ₹{totalEquity.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
            </div>

            <div className="border-l border-slate-800 pl-3">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                P&L
              </span>
              <span
                className={`text-xs font-mono font-bold flex items-center gap-0.5 ${
                  totalPnl >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {totalPnl >= 0 ? "+" : ""}₹{Math.abs(totalPnl).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                <span className="text-[10px] font-normal">
                  ({totalPnl >= 0 ? "+" : ""}{totalPnlPercent.toFixed(1)}%)
                </span>
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Secondary Ribbon: Indian Market Watchlist Ticker (Nifty, Bank Nifty, Reliance, Tata Motors, Suzlon) */}
      <div className="border-t border-slate-800/60 bg-slate-950/60 px-4 sm:px-6 py-1.5 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400 flex items-center gap-1 font-bold text-[11px] uppercase tracking-wider whitespace-nowrap mr-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            NSE Market Watch:
          </span>

          <div className="flex items-center gap-2">
            {assets.map((asset) => {
              const isSelected = asset.symbol === selectedAsset.symbol;
              const isPositive = asset.change24h >= 0;
              const isTrade = asset.verdict === "TRADE (HIGH CONVICTION)";
              const isAvoid = asset.verdict === "AVOID (HIGH RISK)";

              return (
                <button
                  key={asset.symbol}
                  onClick={() => onSelectAsset(asset)}
                  className={`flex items-center gap-2 px-2.5 py-1 rounded-lg transition-all whitespace-nowrap border ${
                    isSelected
                      ? "bg-slate-800 text-white border-cyan-500 shadow-sm"
                      : "bg-slate-900/60 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-850"
                  }`}
                >
                  <span className="font-bold">{asset.symbol}</span>
                  <span className="text-slate-200">
                    ₹{asset.price.toLocaleString("en-IN", { minimumFractionDigits: 1, maximumFractionDigits: 2 })}
                  </span>
                  <span className={`text-[11px] font-bold ${isPositive ? "text-emerald-400" : "text-rose-400"}`}>
                    {isPositive ? "+" : ""}{asset.changePercent.toFixed(1)}%
                  </span>
                  {isTrade && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="AI Verdict: TRADE" />
                  )}
                  {isAvoid && (
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" title="AI Verdict: AVOID" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};
