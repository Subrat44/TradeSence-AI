import React, { useState } from "react";
import { Asset, TradeVerdict } from "../../types";
import { 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ExternalLink, 
  Search, 
  ShieldAlert, 
  TrendingUp, 
  TrendingDown, 
  Filter, 
  Sparkles,
  ArrowUpRight,
  HelpCircle,
  Eye
} from "lucide-react";

interface TradeVerdictMatrixProps {
  assets: Asset[];
  selectedAsset: Asset;
  onSelectAsset: (asset: Asset) => void;
  onOpenResearch: (asset: Asset) => void;
  onAnalyzeCustomStock: (symbol: string) => void;
  isAnalyzing: boolean;
}

export const TradeVerdictMatrix: React.FC<TradeVerdictMatrixProps> = ({
  assets,
  selectedAsset,
  onSelectAsset,
  onOpenResearch,
  onAnalyzeCustomStock,
  isAnalyzing,
}) => {
  const [verdictFilter, setVerdictFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [customTickerInput, setCustomTickerInput] = useState<string>("");

  const filteredAssets = assets.filter((asset) => {
    // Search query
    const matchesSearch = 
      asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (asset.sector && asset.sector.toLowerCase().includes(searchQuery.toLowerCase()));

    // Verdict filter
    const matchesVerdict = 
      verdictFilter === "ALL" ||
      (verdictFilter === "TRADE" && asset.verdict === "TRADE (HIGH CONVICTION)") ||
      (verdictFilter === "AVOID" && asset.verdict === "AVOID (HIGH RISK)") ||
      (verdictFilter === "WAIT" && asset.verdict === "WAIT / WATCHLIST");

    // Category filter
    const matchesCategory = 
      categoryFilter === "ALL" ||
      (categoryFilter === "LARGE" && asset.category.includes("Large Cap")) ||
      (categoryFilter === "MID" && asset.category.includes("Mid Cap")) ||
      (categoryFilter === "SMALL" && asset.category.includes("Small Cap"));

    return matchesSearch && matchesVerdict && matchesCategory;
  });

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTickerInput.trim() || isAnalyzing) return;
    onAnalyzeCustomStock(customTickerInput.trim().toUpperCase());
    setCustomTickerInput("");
  };

  const tradeCount = assets.filter((a) => a.verdict === "TRADE (HIGH CONVICTION)").length;
  const avoidCount = assets.filter((a) => a.verdict === "AVOID (HIGH RISK)").length;
  const waitCount = assets.filter((a) => a.verdict === "WAIT / WATCHLIST").length;

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner & Fast AI Stock Scanner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-400 border border-emerald-800 text-[11px] font-mono font-bold">
                🇮🇳 Indian Markets (NSE / BSE)
              </span>
              <span className="px-2 py-0.5 rounded-md bg-cyan-950/80 text-cyan-400 border border-cyan-800 text-[11px] font-mono">
                Groww App Companion
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-mono">
              AI Stock Screener: Which One To Trade & Which To Avoid
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Real-time quantitative verdict filtering Large-caps, Mid-caps, and Small-caps. Pinpoint high-probability setups and identify risky value traps, high promoter pledge stocks, and circuit hazards.
            </p>
          </div>

          {/* Quick custom ticker evaluation */}
          <form onSubmit={handleCustomSubmit} className="w-full md:w-80 flex-shrink-0">
            <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
              Analyze Any Indian Stock (e.g. ZOMATO, ITC, IRFC)
            </label>
            <div className="relative flex items-center">
              <input
                id="input-scan-indian-stock"
                type="text"
                value={customTickerInput}
                onChange={(e) => setCustomTickerInput(e.target.value)}
                placeholder="Enter NSE Symbol..."
                disabled={isAnalyzing}
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl pl-3 pr-24 py-2.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none"
              />
              <button
                id="btn-scan-indian-stock"
                type="submit"
                disabled={!customTickerInput.trim() || isAnalyzing}
                className="absolute right-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold font-mono transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isAnalyzing ? "Scanning..." : "Check"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Verdict Quick Summary Bar */}
        <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-slate-800/80">
          <div className="bg-emerald-950/30 border border-emerald-800/50 rounded-xl p-3 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-emerald-300 uppercase block font-bold">Recommended to Trade</span>
              <span className="text-xl font-mono font-bold text-emerald-400">{tradeCount} Stocks</span>
            </div>
            <CheckCircle2 className="w-6 h-6 text-emerald-400/80" />
          </div>

          <div className="bg-rose-950/30 border border-rose-800/50 rounded-xl p-3 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-rose-300 uppercase block font-bold">Strictly Avoid (High Risk)</span>
              <span className="text-xl font-mono font-bold text-rose-400">{avoidCount} Traps</span>
            </div>
            <AlertTriangle className="w-6 h-6 text-rose-400/80" />
          </div>

          <div className="bg-amber-950/30 border border-amber-800/50 rounded-xl p-3 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-amber-300 uppercase block font-bold">Wait for Breakout</span>
              <span className="text-xl font-mono font-bold text-amber-400">{waitCount} Watchlist</span>
            </div>
            <Clock className="w-6 h-6 text-amber-400/80" />
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 rounded-xl p-3 border border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          {/* Verdict filters */}
          <div className="flex items-center bg-slate-950 rounded-lg p-1 border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setVerdictFilter("ALL")}
              className={`px-3 py-1 rounded-md transition-all ${
                verdictFilter === "ALL" ? "bg-slate-800 text-white font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              All ({assets.length})
            </button>
            <button
              onClick={() => setVerdictFilter("TRADE")}
              className={`px-3 py-1 rounded-md transition-all flex items-center gap-1 ${
                verdictFilter === "TRADE" ? "bg-emerald-950 text-emerald-400 font-bold border border-emerald-800" : "text-slate-400 hover:text-emerald-300"
              }`}
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>To Trade</span>
            </button>
            <button
              onClick={() => setVerdictFilter("AVOID")}
              className={`px-3 py-1 rounded-md transition-all flex items-center gap-1 ${
                verdictFilter === "AVOID" ? "bg-rose-950 text-rose-400 font-bold border border-rose-800" : "text-slate-400 hover:text-rose-300"
              }`}
            >
              <AlertTriangle className="w-3 h-3 text-rose-400" />
              <span>To Avoid</span>
            </button>
            <button
              onClick={() => setVerdictFilter("WAIT")}
              className={`px-3 py-1 rounded-md transition-all flex items-center gap-1 ${
                verdictFilter === "WAIT" ? "bg-amber-950 text-amber-400 font-bold border border-amber-800" : "text-slate-400 hover:text-amber-300"
              }`}
            >
              <Clock className="w-3 h-3 text-amber-400" />
              <span>Wait / Watch</span>
            </button>
          </div>

          {/* Market Cap filters */}
          <div className="flex items-center bg-slate-950 rounded-lg p-1 border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setCategoryFilter("ALL")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                categoryFilter === "ALL" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              All Caps
            </button>
            <button
              onClick={() => setCategoryFilter("LARGE")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                categoryFilter === "LARGE" ? "bg-cyan-950 text-cyan-400 font-bold" : "text-slate-400 hover:text-cyan-300"
              }`}
            >
              Large Cap
            </button>
            <button
              onClick={() => setCategoryFilter("MID")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                categoryFilter === "MID" ? "bg-indigo-950 text-indigo-300 font-bold" : "text-slate-400 hover:text-indigo-300"
              }`}
            >
              Mid Cap
            </button>
            <button
              onClick={() => setCategoryFilter("SMALL")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                categoryFilter === "SMALL" ? "bg-violet-950 text-violet-300 font-bold" : "text-slate-400 hover:text-violet-300"
              }`}
            >
              Small Cap
            </button>
          </div>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stock, sector..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Grid of Analyzed Stocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAssets.map((asset) => {
          const isTrade = asset.verdict === "TRADE (HIGH CONVICTION)";
          const isAvoid = asset.verdict === "AVOID (HIGH RISK)";
          const isWait = asset.verdict === "WAIT / WATCHLIST";

          return (
            <div
              key={asset.symbol}
              className={`rounded-2xl border p-5 flex flex-col justify-between shadow-xl transition-all ${
                asset.symbol === selectedAsset.symbol
                  ? "border-cyan-500/80 bg-slate-900/95 ring-1 ring-cyan-500/30"
                  : isTrade
                  ? "border-emerald-900/50 bg-slate-900/80 hover:border-emerald-700/60"
                  : isAvoid
                  ? "border-rose-900/50 bg-slate-900/80 hover:border-rose-700/60"
                  : "border-slate-800 bg-slate-900/80 hover:border-slate-700"
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-mono font-bold text-base sm:text-lg text-white">
                        {asset.symbol}
                      </h3>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {asset.exchange}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                        {asset.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium truncate max-w-xs mt-0.5">
                      {asset.name}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <div className="text-base sm:text-lg font-mono font-bold text-white">
                      ₹{asset.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </div>
                    <div
                      className={`text-xs font-mono font-bold flex items-center justify-end gap-1 ${
                        asset.change24h >= 0 ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {asset.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      <span>{asset.change24h >= 0 ? "+" : ""}{asset.changePercent.toFixed(2)}%</span>
                    </div>
                  </div>
                </div>

                {/* Big Visual AI Verdict Badge */}
                <div className="mt-4">
                  <div
                    className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                      isTrade
                        ? "bg-emerald-950/40 border-emerald-800/80 text-emerald-200"
                        : isAvoid
                        ? "bg-rose-950/40 border-rose-800/80 text-rose-200"
                        : "bg-amber-950/40 border-amber-800/80 text-amber-200"
                    }`}
                  >
                    {isTrade ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    ) : isAvoid ? (
                      <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Clock className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="font-mono text-xs font-bold uppercase tracking-wider block">
                        {asset.verdict}
                      </span>
                      <p className="text-xs mt-1 leading-relaxed opacity-90">
                        {asset.verdictReason}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Key Catalysts or Risk Flags */}
                <div className="mt-3 space-y-1.5">
                  {asset.catalysts && asset.catalysts.length > 0 && (
                    <div className="text-xs">
                      <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold mr-1.5">Catalysts:</span>
                      <span className="text-slate-300">{asset.catalysts[0]}</span>
                    </div>
                  )}
                  {asset.riskFlags && asset.riskFlags.length > 0 && (
                    <div className="text-xs">
                      <span className="text-[10px] font-mono text-rose-400 uppercase font-bold mr-1.5">Risk Check:</span>
                      <span className="text-slate-400">{asset.riskFlags[0]}</span>
                    </div>
                  )}
                </div>

                {/* Fundamentals Metrics Bar */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400">
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase">Market Cap</span>
                    <span className="text-slate-200 font-bold">{asset.marketCap}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase">P/E Ratio</span>
                    <span className="text-slate-200 font-bold">{asset.peRatio || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase">Beta (Volatility)</span>
                    <span className="text-slate-200 font-bold">{asset.beta || 1.0}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 mt-5 pt-3 border-t border-slate-800/80">
                <button
                  onClick={() => onSelectAsset(asset)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-cyan-600 hover:text-white text-xs font-mono text-slate-200 transition-all flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Chart & Setup</span>
                </button>

                <button
                  onClick={() => onOpenResearch(asset)}
                  className="py-2 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-all flex items-center gap-1"
                  title="Generate Deep Research Memo"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Research</span>
                </button>

                {asset.growwSlug && (
                  <a
                    href={`https://groww.in/stocks/${asset.growwSlug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-3 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800/80 text-xs font-mono text-emerald-300 hover:text-emerald-200 transition-all flex items-center gap-1"
                    title="View on Groww platform"
                  >
                    <span>Groww</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
