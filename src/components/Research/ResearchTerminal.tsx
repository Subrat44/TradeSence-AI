import React, { useState } from "react";
import Markdown from "react-markdown";
import { Asset, ResearchReport } from "../../types";
import { 
  Search, 
  Sparkles, 
  Globe, 
  ExternalLink, 
  Copy, 
  Check, 
  Clock, 
  FileText,
  ShieldAlert,
  CheckCircle2,
  TrendingUp,
  AlertTriangle
} from "lucide-react";

interface ResearchTerminalProps {
  selectedAsset: Asset;
  onSelectAsset: (asset: Asset) => void;
  allAssets: Asset[];
  report: ResearchReport | null;
  onGenerateResearch: (ticker: string, name: string, horizon: string) => Promise<void>;
  isLoading: boolean;
}

export const ResearchTerminal: React.FC<ResearchTerminalProps> = ({
  selectedAsset,
  onSelectAsset,
  allAssets,
  report,
  onGenerateResearch,
  isLoading,
}) => {
  const [customTicker, setCustomTicker] = useState("");
  const [horizon, setHorizon] = useState("Swing (1-4 weeks)");
  const [copied, setCopied] = useState(false);
  const [activeCapFilter, setActiveCapFilter] = useState<string>("ALL");

  const filteredAssets = allAssets.filter((a) => {
    if (activeCapFilter === "ALL") return true;
    if (activeCapFilter === "LARGE") return a.marketCapTier === "Large Cap";
    if (activeCapFilter === "MID") return a.marketCapTier === "Mid Cap";
    if (activeCapFilter === "SMALL") return a.marketCapTier === "Small Cap" || a.marketCapTier === "Micro Cap";
    return true;
  });

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTicker.trim()) return;
    const existing = allAssets.find(
      (a) => a.symbol.toLowerCase() === customTicker.trim().toLowerCase()
    );
    if (existing) {
      onSelectAsset(existing);
      onGenerateResearch(existing.symbol, existing.name, horizon);
    } else {
      onGenerateResearch(customTicker.toUpperCase().trim(), customTicker.toUpperCase().trim(), horizon);
    }
  };

  const handleCopy = () => {
    if (!report?.report) return;
    navigator.clipboard.writeText(report.report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Controls Bar */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 sm:p-5 shadow-xl flex flex-col gap-4">
        {/* Quick Cap Filters */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="text-slate-400 mr-1">Filter Universe:</span>
            {[
              { id: "ALL", label: "All Stocks" },
              { id: "LARGE", label: "Large Cap (Nifty 50)" },
              { id: "MID", label: "Mid Cap" },
              { id: "SMALL", label: "Small / Micro Cap" },
            ].map((chip) => (
              <button
                key={chip.id}
                onClick={() => setActiveCapFilter(chip.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  activeCapFilter === chip.id
                    ? "bg-emerald-500 text-slate-950 font-bold shadow-sm"
                    : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {selectedAsset.growwSlug && (
            <a
              href={`https://groww.in/stocks/${selectedAsset.growwSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <span>Groww: {selectedAsset.symbol}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Left: Quick Ticker Search / Selector */}
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                Active Research Target (NSE)
              </span>
              <div className="flex items-center gap-2">
                <select
                  id="select-research-asset"
                  value={selectedAsset.symbol}
                  onChange={(e) => {
                    const found = allAssets.find((a) => a.symbol === e.target.value);
                    if (found) onSelectAsset(found);
                  }}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-bold text-white font-mono focus:outline-none focus:border-emerald-500"
                >
                  {filteredAssets.map((a) => (
                    <option key={a.symbol} value={a.symbol}>
                      {a.symbol} - {a.name} ({a.marketCapTier})
                    </option>
                  ))}
                </select>

                <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-mono">
                  ₹{selectedAsset.price.toLocaleString("en-IN", { minimumFractionDigits: 1, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Custom Ticker Input */}
            <form onSubmit={handleCustomSubmit} className="flex items-center gap-2 flex-1 min-w-[200px]">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="input-custom-ticker-search"
                  type="text"
                  value={customTicker}
                  onChange={(e) => setCustomTicker(e.target.value)}
                  placeholder="Or type any Indian stock (e.g. TATASTEEL, ZOMATO, SUZLON)..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono uppercase"
                />
              </div>
            </form>
          </div>

          {/* Right: Horizon & Trigger Button */}
          <div className="flex items-center gap-3">
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                Trading Horizon
              </span>
              <select
                id="select-research-horizon"
                value={horizon}
                onChange={(e) => setHorizon(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-300 font-medium focus:outline-none focus:border-emerald-500"
              >
                <option value="Intraday (Day trade)">Intraday (MIS)</option>
                <option value="Swing (1-4 weeks)">Short Swing (1-4 weeks)</option>
                <option value="Positional Delivery (1-6 months)">Positional Delivery (1-6 months)</option>
              </select>
            </div>

            <button
              id="btn-run-deep-research"
              onClick={() => onGenerateResearch(selectedAsset.symbol, selectedAsset.name, horizon)}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-xs sm:text-sm hover:from-emerald-400 hover:to-cyan-400 transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed mt-4 md:mt-0"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  <span>Auditing SEBI, Earnings & Web Grounding...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 fill-slate-950" />
                  <span>Run AI Research Memo</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Fundamental & Risk Snapshot Cards for Indian Markets */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Cap Tier & Size</div>
          <div className="text-base font-mono font-bold text-white mt-0.5">{selectedAsset.marketCapTier || "Mid Cap"}</div>
          <div className="text-[11px] text-slate-400">{selectedAsset.marketCap}</div>
        </div>

        <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Promoter Pledge</div>
          <div className={`text-base font-mono font-bold mt-0.5 ${
            (selectedAsset.promoterPledgePercent || 0) > 15 ? "text-rose-400" : "text-emerald-400"
          }`}>
            {selectedAsset.promoterPledgePercent !== undefined ? `${selectedAsset.promoterPledgePercent}%` : "0.0%"}
          </div>
          <div className="text-[10px] text-slate-500">
            {(selectedAsset.promoterPledgePercent || 0) > 15 ? "High Risk" : "Clean"}
          </div>
        </div>

        <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800">
          <div className="text-[10px] font-mono text-slate-400 uppercase">SEBI Surveillance</div>
          <div className={`text-xs font-mono font-bold mt-1 px-1.5 py-0.5 rounded inline-block ${
            selectedAsset.sebiSurveillanceStage ? "bg-rose-950 text-rose-300 border border-rose-800" : "bg-emerald-950 text-emerald-300 border border-emerald-800"
          }`}>
            {selectedAsset.sebiSurveillanceStage || "None (Clear)"}
          </div>
        </div>

        <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800">
          <div className="text-[10px] font-mono text-slate-400 uppercase">P/E Ratio</div>
          <div className="text-base font-mono font-bold text-white mt-0.5">{selectedAsset.peRatio || "N/A"}</div>
          <div className="text-[11px] text-slate-400">Beta: {selectedAsset.beta ?? "1.0"}</div>
        </div>

        <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Current AI Verdict</div>
          <div className={`text-xs font-bold font-mono mt-1 ${
            selectedAsset.verdict === "TRADE (HIGH CONVICTION)" ? "text-emerald-400" : selectedAsset.verdict === "AVOID (HIGH RISK)" ? "text-rose-400" : "text-amber-400"
          }`}>
            {selectedAsset.verdict || "READY FOR AUDIT"}
          </div>
        </div>
      </div>

      {/* Report Section */}
      {report ? (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-xl flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  Institutional Research Memo: <span className="font-mono text-emerald-400">{report.ticker}</span>
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                  NSE Grounding Active
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Generated on {new Date(report.timestamp).toLocaleDateString()} at {new Date(report.timestamp).toLocaleTimeString()}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-copy-research-report"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 hover:text-white hover:border-slate-700 transition-all font-mono"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy Report"}</span>
              </button>
            </div>
          </div>

          {/* Real Grounding Citations */}
          {report.sources && report.sources.length > 0 && (
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-semibold mb-2.5">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span>Live Indian Financial Sources & Filings ({report.sources.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                {report.sources.map((src, i) => (
                  <a
                    key={i}
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800/90 text-xs text-slate-300 hover:text-emerald-300 hover:border-emerald-800/60 transition-all group"
                  >
                    <span className="truncate text-[11px]">{src.title}</span>
                    <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-emerald-400 flex-shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Formatted Markdown Content */}
          <div className="prose prose-invert max-w-none prose-headings:text-slate-100 prose-headings:font-bold prose-h1:text-xl prose-h2:text-lg prose-h3:text-base prose-p:text-slate-300 prose-p:leading-relaxed prose-li:text-slate-300 prose-strong:text-emerald-300 prose-table:border prose-table:border-slate-800 prose-th:bg-slate-950 prose-th:text-slate-200 prose-td:border-t prose-td:border-slate-800/70 text-sm">
            <Markdown>{report.report}</Markdown>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/40 rounded-2xl border border-dashed border-slate-800 p-12 text-center flex flex-col items-center justify-center">
          <FileText className="w-12 h-12 text-slate-600 mb-3" />
          <h3 className="text-base font-semibold text-slate-200">No Research Report Generated Yet</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md">
            Trigger a deep Indian equity research report for {selectedAsset.symbol} to analyze its latest Q3/Q4 earnings, corporate announcements, promoter holding/pledge, ASM/GSM surveillance, and trade vs avoid recommendations.
          </p>
          <button
            onClick={() => onGenerateResearch(selectedAsset.symbol, selectedAsset.name, horizon)}
            disabled={isLoading}
            className="mt-4 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono transition-all shadow-md shadow-emerald-500/20"
          >
            Start Research on {selectedAsset.symbol}
          </button>
        </div>
      )}
    </div>
  );
};
