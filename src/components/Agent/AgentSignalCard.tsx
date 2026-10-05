import React, { useState } from "react";
import { 
  Asset, 
  AgentPersona, 
  TradeSignal, 
  PaperPosition,
  GrowwConfig 
} from "../../types";
import { 
  Bot, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownRight, 
  ShieldCheck, 
  TrendingUp, 
  Cpu,
  Play,
  RotateCcw,
  Sliders,
  ExternalLink,
  Info,
  Key,
  RefreshCw
} from "lucide-react";

interface AgentSignalCardProps {
  asset: Asset;
  activeSignal: TradeSignal | null;
  onGenerateSignal: (persona: AgentPersona, risk: string) => Promise<void>;
  isLoading: boolean;
  onExecuteTrade: (position: Omit<PaperPosition, "id" | "timestamp" | "pnl" | "pnlPercent">) => void;
  availableCash: number;
  growwConfig: GrowwConfig;
  onOpenGrowwModal: () => void;
  onExecuteGrowwLiveTrade: (order: {
    symbol: string;
    exchange: "NSE" | "BSE";
    side: "BUY" | "SELL";
    orderType: "Delivery (CNC)" | "Intraday (MIS)";
    quantity: number;
    price: number;
    stopLoss: number;
    target: number;
  }) => Promise<any>;
}

export const AgentSignalCard: React.FC<AgentSignalCardProps> = ({
  asset,
  activeSignal,
  onGenerateSignal,
  isLoading,
  onExecuteTrade,
  availableCash,
  growwConfig,
  onOpenGrowwModal,
  onExecuteGrowwLiveTrade,
}) => {
  const [persona, setPersona] = useState<AgentPersona>("Indian Momentum Breakout (NSE)");
  const [riskTolerance, setRiskTolerance] = useState<string>("Moderate (1.5%)");
  const [orderType, setOrderType] = useState<"Delivery (CNC)" | "Intraday (MIS)">("Delivery (CNC)");
  const [customShares, setCustomShares] = useState<number | null>(null);
  const [executedSuccess, setExecutedSuccess] = useState(false);
  const [liveSuccessMsg, setLiveSuccessMsg] = useState<string | null>(null);
  const [liveErrorMsg, setLiveErrorMsg] = useState<string | null>(null);
  const [isPlacingLive, setIsPlacingLive] = useState(false);
  const [showLiveConfirm, setShowLiveConfirm] = useState(false);

  const handleScan = async () => {
    setExecutedSuccess(false);
    await onGenerateSignal(persona, riskTolerance);
  };

  const handleExecute = () => {
    if (!activeSignal) return;
    const shares = customShares !== null ? customShares : (activeSignal.suggestedShares || 10);
    const side = activeSignal.action.includes("BUY") ? "BUY" : "SHORT";

    onExecuteTrade({
      symbol: asset.symbol,
      assetName: asset.name,
      side,
      orderType,
      entryPrice: asset.price,
      currentPrice: asset.price,
      shares,
      stopLoss: activeSignal.stopLoss,
      takeProfit: activeSignal.takeProfit1,
    });

    setExecutedSuccess(true);
    setTimeout(() => setExecutedSuccess(false), 4000);
  };

  const handleLiveExecute = async () => {
    if (!activeSignal) return;
    setLiveErrorMsg(null);
    setLiveSuccessMsg(null);
    const shares = customShares !== null ? customShares : (activeSignal.suggestedShares || 10);
    const side = activeSignal.action.includes("BUY") ? "BUY" : "SELL";

    try {
      setIsPlacingLive(true);
      const res = await onExecuteGrowwLiveTrade({
        symbol: asset.symbol,
        exchange: "NSE",
        side,
        orderType,
        quantity: shares,
        price: asset.price,
        stopLoss: activeSignal.stopLoss,
        target: activeSignal.takeProfit1,
      });

      setLiveSuccessMsg(res?.message || `Order executed on Groww for ${shares} shares of ${asset.symbol}! Ref: ${res?.order?.orderId}`);
      setShowLiveConfirm(false);
      setTimeout(() => setLiveSuccessMsg(null), 6000);
    } catch (err: any) {
      setLiveErrorMsg(err.message || "Failed to execute order on Groww API");
    } finally {
      setIsPlacingLive(false);
    }
  };

  const isTrade = activeSignal?.verdict === "TRADE (HIGH CONVICTION)" || activeSignal?.action.includes("BUY");
  const isAvoid = activeSignal?.verdict === "AVOID (HIGH RISK)" || activeSignal?.action === "AVOID";
  const isBuy = activeSignal?.action.includes("BUY");
  const isSell = activeSignal?.action.includes("SELL") || activeSignal?.action.includes("SHORT");

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 sm:p-5 flex flex-col gap-4 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800/80 flex items-center justify-center text-emerald-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
              Autonomous Indian Equity Agent
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                NSE / BSE Model
              </span>
            </h3>
            <p className="text-xs text-slate-400">Determines whether to trade or avoid + Groww order execution</p>
          </div>
        </div>

        <button
          id="btn-run-agent-scan"
          onClick={handleScan}
          disabled={isLoading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-xs sm:text-sm hover:from-emerald-400 hover:to-cyan-400 transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              <span>Auditing Stock...</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>Evaluate Trade Setup</span>
            </>
          )}
        </button>
      </div>

      {/* Strategy Persona & Risk Tuning */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
        <div>
          <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Sliders className="w-3 h-3 text-cyan-400" /> Strategy Persona
          </label>
          <select
            id="select-agent-persona"
            value={persona}
            onChange={(e) => setPersona(e.target.value as AgentPersona)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-medium focus:outline-none focus:border-emerald-500"
          >
            <option value="Indian Momentum Breakout (NSE)">Indian Momentum Breakout (NSE)</option>
            <option value="Mean Reversion Quantitative">Mean Reversion Quantitative (Oversold Dip)</option>
            <option value="FII/DII Flow & Swing">FII/DII Flow & Swing (Delivery)</option>
            <option value="Value & Fundamentals (Groww)">Value & Fundamentals (Moat & Multiples)</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
            Groww Order Type
          </label>
          <select
            id="select-order-type"
            value={orderType}
            onChange={(e) => setOrderType(e.target.value as any)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-medium focus:outline-none focus:border-emerald-500"
          >
            <option value="Delivery (CNC)">Delivery (CNC) - Zero Leverage</option>
            <option value="Intraday (MIS)">Intraday (MIS) - 5x Leverage</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
            Risk Tolerance (Per Trade)
          </label>
          <select
            id="select-risk-tolerance"
            value={riskTolerance}
            onChange={(e) => setRiskTolerance(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-medium focus:outline-none focus:border-emerald-500"
          >
            <option value="Conservative (0.75%)">Conservative (0.75% account capital)</option>
            <option value="Moderate (1.5%)">Moderate (1.50% account capital)</option>
            <option value="Aggressive (3.0%)">Aggressive (3.00% account capital)</option>
          </select>
        </div>
      </div>

      {/* Signal Output Display */}
      {activeSignal ? (
        <div className="flex flex-col gap-3">
          {/* Top Banner: Verdict + Action Badge + Confidence */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-black tracking-wide flex items-center gap-1.5 ${
                  isTrade
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50"
                    : isAvoid
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/50"
                    : "bg-amber-500/20 text-amber-300 border border-amber-500/50"
                }`}
              >
                {isTrade ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : isAvoid ? <AlertTriangle className="w-4 h-4 text-rose-400" /> : null}
                {activeSignal.verdict || (isTrade ? "TRADE (HIGH CONVICTION)" : "AVOID (HIGH RISK)")}
              </span>

              <span className="text-xs text-slate-400 font-mono">
                Action: <strong className="text-white">{activeSignal.action}</strong> ({activeSignal.timeframe})
              </span>
            </div>

            {/* Confidence Gauge */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono">Model Conviction:</span>
              <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      activeSignal.confidence >= 75 ? "bg-emerald-400" : activeSignal.confidence >= 55 ? "bg-amber-400" : "bg-rose-400"
                    }`}
                    style={{ width: `${activeSignal.confidence}%` }}
                  ></div>
                </div>
                <span className="text-xs font-mono font-bold text-white">{activeSignal.confidence}%</span>
              </div>
            </div>
          </div>

          {/* Direct Answer: Why Trade or Why Avoid */}
          {activeSignal.whyTradeOrAvoid && (
            <div className={`p-3 rounded-xl border text-xs leading-relaxed ${
              isAvoid ? "bg-rose-950/30 border-rose-800/60 text-rose-200" : "bg-emerald-950/30 border-emerald-800/60 text-emerald-200"
            }`}>
              <div className="font-mono font-bold uppercase tracking-wider text-[11px] mb-1 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                <span>Trade vs Avoid Assessment</span>
              </div>
              <p>{activeSignal.whyTradeOrAvoid}</p>
            </div>
          )}

          {/* Key Metric Blocks: Entry, Stop Loss, Target, R:R */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Suggested Entry (₹)</div>
              <div className="text-sm font-mono font-bold text-cyan-300 mt-0.5">
                ₹{activeSignal.entryZone?.min?.toFixed(1)} - ₹{activeSignal.entryZone?.max?.toFixed(1)}
              </div>
            </div>

            <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
              <div className="text-[10px] font-mono text-rose-400 uppercase flex items-center gap-1">
                <AlertTriangle className="w-2.5 h-2.5" /> Stop Loss (₹)
              </div>
              <div className="text-sm font-mono font-bold text-rose-400 mt-0.5">
                ₹{activeSignal.stopLoss.toFixed(1)}
              </div>
            </div>

            <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
              <div className="text-[10px] font-mono text-emerald-400 uppercase flex items-center gap-1">
                <TrendingUp className="w-2.5 h-2.5" /> Target 1 (₹)
              </div>
              <div className="text-sm font-mono font-bold text-emerald-400 mt-0.5">
                ₹{activeSignal.takeProfit1.toFixed(1)}
              </div>
            </div>

            <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Risk / Reward</div>
              <div className="text-sm font-mono font-bold text-indigo-300 mt-0.5">
                {activeSignal.riskRewardRatio}
              </div>
            </div>
          </div>

          {/* Core Reasoning */}
          <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/70 text-xs">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Bot className="w-3.5 h-3.5 text-emerald-400" /> Technical & Fundamental Breakdown
            </div>
            <p className="text-slate-200 leading-relaxed">{activeSignal.primaryReason}</p>

            {/* Checklist */}
            {activeSignal.technicalSignals && activeSignal.technicalSignals.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {activeSignal.technicalSignals.map((sig, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-300 rounded-md"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    {sig}
                  </span>
                ))}
              </div>
            )}

            {/* Invalidation Trigger */}
            <div className="mt-2.5 pt-2 border-t border-slate-800/60 text-[11px] font-mono text-rose-300/80 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
              <span><strong>Exit Invalidation:</strong> {activeSignal.invalidationCriteria}</span>
            </div>
          </div>

          {/* Position Sizer & Execution Trigger */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-slate-950 border border-emerald-900/30">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="text-xs font-mono">
                <span className="text-slate-400 block text-[10px] uppercase">Groww Recommended Sizing</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-bold text-white text-sm">{activeSignal.suggestedShares} shares</span>
                  <span className="text-slate-400 text-xs">
                    (~₹{(activeSignal.suggestedShares * asset.price).toLocaleString("en-IN", { maximumFractionDigits: 0 })})
                  </span>
                </div>
              </div>
            </div>

            {/* Execution buttons: Groww Live API & Paper Simulation */}
            <div className="w-full sm:w-auto flex flex-wrap items-center gap-2">
              {asset.growwSlug && (
                <a
                  href={`https://groww.in/stocks/${asset.growwSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-emerald-400 text-xs font-mono transition-all flex items-center gap-1"
                  title="Open live ticker on Groww"
                >
                  <span>Groww</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}

              {growwConfig.isConnected ? (
                <button
                  id="btn-execute-groww-live"
                  onClick={() => {
                    if (growwConfig.executionMode === "SEMI_AUTO") {
                      setShowLiveConfirm(true);
                    } else {
                      handleLiveExecute();
                    }
                  }}
                  disabled={isPlacingLive}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-md shadow-emerald-500/25"
                >
                  {isPlacingLive ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sending to Groww...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-slate-950" />
                      <span>Execute on Groww Live</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  id="btn-open-groww-connect"
                  onClick={onOpenGrowwModal}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-emerald-800/80 text-emerald-400 text-xs font-mono transition-all"
                  title="Connect Groww Cloud API to place live trades"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>Connect Groww for Live</span>
                </button>
              )}

              <button
                id="btn-execute-paper-trade"
                onClick={handleExecute}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium text-xs transition-all"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Simulate Paper</span>
              </button>
            </div>
          </div>

          {/* Live Order Confirmation Dialog */}
          {showLiveConfirm && (
            <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-600 text-xs space-y-2.5 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Confirm Live Groww Order Execution
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  NSE Real-Time
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px] bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <div>
                  <span className="text-slate-400 block text-[10px]">Symbol & Side</span>
                  <span className="font-bold text-white">BUY {asset.symbol}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Quantity</span>
                  <span className="font-bold text-white">
                    {customShares !== null ? customShares : (activeSignal.suggestedShares || 10)} shares
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Est. Value</span>
                  <span className="font-bold text-emerald-400">
                    ₹{((customShares !== null ? customShares : (activeSignal.suggestedShares || 10)) * asset.price).toLocaleString("en-IN")}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Stop Loss & Target</span>
                  <span className="text-slate-300">
                    SL: ₹{activeSignal.stopLoss.toFixed(1)} / TGT: ₹{activeSignal.takeProfit1.toFixed(1)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowLiveConfirm(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleLiveExecute}
                  disabled={isPlacingLive}
                  className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                >
                  {isPlacingLive ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                  <span>Authorize & Send to Groww</span>
                </button>
              </div>
            </div>
          )}

          {/* Success / Error Banners */}
          {liveSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/90 border border-emerald-700 text-emerald-300 text-xs font-mono flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block text-white font-bold">Groww Live Order Sent!</strong>
                <span>{liveSuccessMsg}</span>
              </div>
            </div>
          )}

          {liveErrorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/90 border border-rose-800 text-rose-300 text-xs font-mono flex items-start gap-2.5 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block text-white font-bold">Groww Order Rejected</strong>
                <span>{liveErrorMsg}</span>
              </div>
            </div>
          )}

          {executedSuccess && (
            <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Simulated trade logged! Stored in Groww Paper Portfolio with automatic ₹ stop-loss & take-profit tracking.</span>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 px-4 border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
          <Bot className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-300">Ready to audit {asset.symbol} for Indian Market Trading</p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Click "Evaluate Trade Setup" to get an autonomous verdict on whether to TRADE or AVOID this stock, with stop-loss in ₹ and Groww position sizing.
          </p>
        </div>
      )}
    </div>
  );
};
