import React, { useState, useMemo } from "react";
import { 
  Asset, 
  AgentPersona, 
  TradeSignal, 
  PaperPosition,
  GrowwConfig,
  CustomTradeSetup,
  TradeDirection
} from "../../types";
import { 
  Bot, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  TrendingUp, 
  TrendingDown,
  Cpu,
  Play,
  Sliders,
  ExternalLink,
  Info,
  Key,
  RefreshCw,
  Wallet,
  RotateCcw,
  Calculator
} from "lucide-react";

interface AgentSignalCardProps {
  asset: Asset;
  activeSignal: TradeSignal | null;
  customSetup: CustomTradeSetup;
  onUpdateCustomSetup: (updates: Partial<CustomTradeSetup>) => void;
  onResetCustomSetup: () => void;
  onGenerateSignal: (
    persona: AgentPersona,
    risk: string,
    options?: {
      direction?: TradeDirection;
      customPrice?: number;
      customBudget?: number;
    }
  ) => Promise<void>;
  isLoading: boolean;
  onExecuteTrade: (position: Omit<PaperPosition, "id" | "timestamp" | "pnl" | "pnlPercent">) => boolean | void;
  availableCash: number;
  onUpdateWalletBalance?: (newBalance: number) => void;
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
  customSetup,
  onUpdateCustomSetup,
  onResetCustomSetup,
  onGenerateSignal,
  isLoading,
  onExecuteTrade,
  availableCash,
  onUpdateWalletBalance,
  growwConfig,
  onOpenGrowwModal,
  onExecuteGrowwLiveTrade,
}) => {
  const [persona, setPersona] = useState<AgentPersona>("Indian Momentum Breakout (NSE)");
  const [riskTolerance, setRiskTolerance] = useState<string>("Moderate (1.5%)");
  const [executedSuccess, setExecutedSuccess] = useState(false);
  const [validationMsg, setValidationMsg] = useState<string | null>(null);
  const [liveSuccessMsg, setLiveSuccessMsg] = useState<string | null>(null);
  const [liveErrorMsg, setLiveErrorMsg] = useState<string | null>(null);
  const [isPlacingLive, setIsPlacingLive] = useState(false);
  const [showLiveConfirm, setShowLiveConfirm] = useState(false);
  const [isEditingWallet, setIsEditingWallet] = useState(false);
  const [walletInput, setWalletInput] = useState<string>("");

  const isBearish = customSetup.direction === "BEARISH";
  const leverage = customSetup.orderType === "Intraday (MIS)" ? 5 : 1;

  // Effective entry price: user's custom price if entered, else AI signal entry or live LTP for reference calculations
  const hasCustomPrice = Number(customSetup.customPrice) > 0;
  const effectiveEntryPrice = hasCustomPrice
    ? Number(customSetup.customPrice)
    : activeSignal?.entryZone?.min || asset.price;

  const effectiveCostPerShare = Math.max(0.01, effectiveEntryPrice / leverage);

  // Budget & Quantity Range calculations
  const parsedBudget = Number(customSetup.customBudget) > 0 ? Number(customSetup.customBudget) : 0;
  const maxWalletShares = Math.max(1, Math.floor(availableCash / effectiveCostPerShare));
  const maxBudgetShares = parsedBudget > 0
    ? Math.max(1, Math.floor(parsedBudget / effectiveCostPerShare))
    : maxWalletShares;

  const resolvedShares = useMemo(() => {
    if (Number(customSetup.customShares) > 0) {
      return Math.max(1, Math.floor(Number(customSetup.customShares)));
    }
    if (parsedBudget > 0) {
      return Math.max(1, Math.floor(parsedBudget / effectiveCostPerShare));
    }
    if (activeSignal?.suggestedShares && activeSignal.suggestedShares > 0) {
      return activeSignal.suggestedShares;
    }
    return 0;
  }, [customSetup.customShares, parsedBudget, effectiveCostPerShare, activeSignal]);

  // Stop-Loss & Target resolution supporting both Bullish (BUY) and Bearish (SHORT/SELL)
  const resolvedStopLoss = useMemo(() => {
    if (Number(customSetup.customStopLoss) > 0) {
      return Number(customSetup.customStopLoss);
    }
    if (activeSignal?.stopLoss) {
      if (isBearish && activeSignal.stopLoss < effectiveEntryPrice) {
        return Number((effectiveEntryPrice * 1.035).toFixed(2));
      }
      if (!isBearish && activeSignal.stopLoss > effectiveEntryPrice) {
        return Number((effectiveEntryPrice * 0.962).toFixed(2));
      }
      return activeSignal.stopLoss;
    }
    return Number((effectiveEntryPrice * (isBearish ? 1.035 : 0.962)).toFixed(2));
  }, [customSetup.customStopLoss, activeSignal, isBearish, effectiveEntryPrice]);

  const resolvedTarget1 = useMemo(() => {
    if (Number(customSetup.customTarget1) > 0) {
      return Number(customSetup.customTarget1);
    }
    if (activeSignal?.takeProfit1) {
      if (isBearish && activeSignal.takeProfit1 > effectiveEntryPrice) {
        return Number((effectiveEntryPrice * 0.945).toFixed(2));
      }
      if (!isBearish && activeSignal.takeProfit1 < effectiveEntryPrice) {
        return Number((effectiveEntryPrice * 1.058).toFixed(2));
      }
      return activeSignal.takeProfit1;
    }
    return Number((effectiveEntryPrice * (isBearish ? 0.945 : 1.058)).toFixed(2));
  }, [customSetup.customTarget1, activeSignal, isBearish, effectiveEntryPrice]);

  const resolvedTarget2 = useMemo(() => {
    if (Number(customSetup.customTarget2) > 0) {
      return Number(customSetup.customTarget2);
    }
    if (activeSignal?.takeProfit2) {
      if (isBearish && activeSignal.takeProfit2 > effectiveEntryPrice) {
        return Number((effectiveEntryPrice * 0.895).toFixed(2));
      }
      if (!isBearish && activeSignal.takeProfit2 < effectiveEntryPrice) {
        return Number((effectiveEntryPrice * 1.115).toFixed(2));
      }
      return activeSignal.takeProfit2;
    }
    return Number((effectiveEntryPrice * (isBearish ? 0.895 : 1.115)).toFixed(2));
  }, [customSetup.customTarget2, activeSignal, isBearish, effectiveEntryPrice]);

  // Financial Payoff Telemetry
  const requiredMargin = resolvedShares * effectiveCostPerShare;
  const totalOrderNotional = resolvedShares * effectiveEntryPrice;
  const perShareProfit = isBearish
    ? effectiveEntryPrice - resolvedTarget1
    : resolvedTarget1 - effectiveEntryPrice;
  const perShareRisk = isBearish
    ? resolvedStopLoss - effectiveEntryPrice
    : effectiveEntryPrice - resolvedStopLoss;

  const estimatedProfit = resolvedShares * perShareProfit;
  const estimatedRisk = resolvedShares * Math.abs(perShareRisk);
  const computedRR = Math.abs(perShareRisk) > 0
    ? `1:${Math.max(0.1, perShareProfit / Math.abs(perShareRisk)).toFixed(1)}`
    : "1:2.5";

  // Helper: Auto-fill SL & Target based on current direction and custom/live entry price
  const handleAutoCalcLevels = (dir: TradeDirection = customSetup.direction, basePrice?: number) => {
    const price = basePrice ?? (Number(customSetup.customPrice) > 0 ? Number(customSetup.customPrice) : asset.price);
    if (dir === "BEARISH") {
      onUpdateCustomSetup({
        direction: "BEARISH",
        orderType: "Intraday (MIS)",
        customStopLoss: (price * 1.035).toFixed(2),
        customTarget1: (price * 0.945).toFixed(2),
        customTarget2: (price * 0.895).toFixed(2),
      });
    } else {
      onUpdateCustomSetup({
        direction: "BULLISH",
        customStopLoss: (price * 0.962).toFixed(2),
        customTarget1: (price * 1.058).toFixed(2),
        customTarget2: (price * 1.115).toFixed(2),
      });
    }
  };

  const handleDirectionSwitch = (dir: TradeDirection) => {
    setValidationMsg(null);
    const hasSLOrTP = Number(customSetup.customStopLoss) > 0 || Number(customSetup.customTarget1) > 0;
    if (hasSLOrTP) {
      handleAutoCalcLevels(dir);
    } else {
      onUpdateCustomSetup({
        direction: dir,
        orderType: dir === "BEARISH" ? "Intraday (MIS)" : customSetup.orderType,
      });
    }
  };

  const handleBudgetChange = (val: string) => {
    setValidationMsg(null);
    const numBudget = Number(val);
    if (numBudget > 0) {
      const autoQty = Math.max(1, Math.floor(numBudget / effectiveCostPerShare));
      onUpdateCustomSetup({
        customBudget: val,
        customShares: String(autoQty),
      });
    } else {
      onUpdateCustomSetup({
        customBudget: val,
        customShares: "",
      });
    }
  };

  const handleScan = async () => {
    setExecutedSuccess(false);
    setValidationMsg(null);
    await onGenerateSignal(persona, riskTolerance, {
      direction: customSetup.direction,
      customPrice: Number(customSetup.customPrice) > 0 ? Number(customSetup.customPrice) : undefined,
      customBudget: parsedBudget > 0 ? parsedBudget : undefined,
    });
  };

  const validateBeforeExecution = (): boolean => {
    setValidationMsg(null);
    if (resolvedShares <= 0) {
      setValidationMsg("Please enter your Trade Budget (₹) or Custom Quantity (Shares) first.");
      return false;
    }
    if (effectiveEntryPrice <= 0) {
      setValidationMsg("Please enter a valid Custom Trade Price (₹) or click 'Use Live LTP'.");
      return false;
    }
    if (isBearish && resolvedStopLoss <= effectiveEntryPrice) {
      setValidationMsg(
        `For a Bearish (Short / Down-Market) trade, Stop-Loss (₹${resolvedStopLoss}) must be ABOVE Entry Price (₹${effectiveEntryPrice}). Click 'Auto SL/Target' to fix.`
      );
      return false;
    }
    if (!isBearish && resolvedStopLoss >= effectiveEntryPrice) {
      setValidationMsg(
        `For a Bullish (BUY / Upper-Side) trade, Stop-Loss (₹${resolvedStopLoss}) must be BELOW Entry Price (₹${effectiveEntryPrice}). Click 'Auto SL/Target' to fix.`
      );
      return false;
    }
    if (requiredMargin > availableCash) {
      setValidationMsg(
        `Order requires ₹${Math.round(requiredMargin).toLocaleString("en-IN")} margin, which exceeds your available wallet cash (₹${Math.round(availableCash).toLocaleString("en-IN")}). Reduce quantity or update your wallet balance.`
      );
      return false;
    }
    return true;
  };

  const handleExecute = () => {
    if (!validateBeforeExecution()) return;
    const side: "BUY" | "SHORT" = isBearish ? "SHORT" : "BUY";

    const result = onExecuteTrade({
      symbol: asset.symbol,
      assetName: asset.name,
      side,
      orderType: customSetup.orderType,
      entryPrice: effectiveEntryPrice,
      currentPrice: asset.price,
      shares: resolvedShares,
      stopLoss: resolvedStopLoss,
      takeProfit: resolvedTarget1,
      growwSlug: asset.growwSlug,
    });

    if (result !== false) {
      setExecutedSuccess(true);
      setTimeout(() => setExecutedSuccess(false), 4500);
    }
  };

  const handleLiveExecute = async () => {
    if (!validateBeforeExecution()) return;
    setLiveErrorMsg(null);
    setLiveSuccessMsg(null);
    const side: "BUY" | "SELL" = isBearish ? "SELL" : "BUY";

    try {
      setIsPlacingLive(true);
      const res = await onExecuteGrowwLiveTrade({
        symbol: asset.symbol,
        exchange: asset.exchange || "NSE",
        side,
        orderType: customSetup.orderType,
        quantity: resolvedShares,
        price: effectiveEntryPrice,
        stopLoss: resolvedStopLoss,
        target: resolvedTarget1,
      });

      setLiveSuccessMsg(
        res?.message ||
          `${side} order executed on Groww for ${resolvedShares} shares of ${asset.symbol} at ₹${effectiveEntryPrice.toFixed(2)}! Ref: ${res?.order?.orderId}`
      );
      setShowLiveConfirm(false);
      setTimeout(() => setLiveSuccessMsg(null), 6000);
    } catch (err: any) {
      setLiveErrorMsg(err.message || "Failed to execute order on Groww API");
    } finally {
      setIsPlacingLive(false);
    }
  };

  const isTrade = activeSignal?.verdict === "TRADE (HIGH CONVICTION)" || activeSignal?.action === "BUY" || activeSignal?.action === "SHORT";
  const isAvoid = activeSignal?.verdict === "AVOID (HIGH RISK)" || activeSignal?.action === "AVOID";

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 sm:p-5 flex flex-col gap-4 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800/80 flex items-center justify-center text-emerald-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
              Custom Trade & AI Setup Workbench
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                Bull & Bear • Custom Budget
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Trade your own custom price & wallet budget in Bullish (BUY) or Bearish (SELL/Short) mode with Stop-Loss
            </p>
          </div>
        </div>

        <button
          id="btn-run-agent-scan"
          onClick={handleScan}
          disabled={isLoading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-xs sm:text-sm hover:from-emerald-400 hover:to-cyan-400 transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              <span>Auditing Setup...</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>Evaluate AI Trade Setup</span>
            </>
          )}
        </button>
      </div>

      {/* SECTION 1: Custom Trade Price, Direction (Bull/Bear) & Wallet Budget Builder */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 sm:p-4 flex flex-col gap-4">
        {/* Top Row: Bullish vs Bearish Toggle + Wallet Balance Editor */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-bold">
              Trade Direction:
            </span>
            <div className="inline-flex rounded-xl bg-slate-900 p-1 border border-slate-800 font-mono text-xs">
              <button
                type="button"
                onClick={() => handleDirectionSwitch("BULLISH")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  !isBearish
                    ? "bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Bullish (BUY / Upper-Side)</span>
              </button>
              <button
                type="button"
                onClick={() => handleDirectionSwitch("BEARISH")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  isBearish
                    ? "bg-rose-500 text-white shadow-sm shadow-rose-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <TrendingDown className="w-3.5 h-3.5" />
                <span>Bearish (SELL / Down-Market)</span>
              </button>
            </div>
          </div>

          {/* Wallet Balance Display & Quick Customizer */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <Wallet className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">My Wallet:</span>
            {!isEditingWallet ? (
              <div className="flex items-center gap-1.5">
                <strong className="text-white tabular-nums">
                  ₹{availableCash.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </strong>
                {onUpdateWalletBalance && (
                  <button
                    type="button"
                    onClick={() => {
                      setWalletInput(String(Math.round(availableCash)));
                      setIsEditingWallet(true);
                    }}
                    className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-800 text-[10px] cursor-pointer"
                    title="Change your virtual wallet balance to match your real budget"
                  >
                    Edit Wallet
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="100"
                  step="100"
                  value={walletInput}
                  onChange={(e) => setWalletInput(e.target.value)}
                  placeholder="Wallet ₹"
                  className="w-28 bg-slate-900 border border-cyan-500 rounded px-2 py-0.5 text-xs text-white font-mono focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    const v = Number(walletInput);
                    if (v > 0 && onUpdateWalletBalance) {
                      onUpdateWalletBalance(v);
                    }
                    setIsEditingWallet(false);
                  }}
                  className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-bold text-[10px] cursor-pointer"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingWallet(false)}
                  className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Row 2: Custom Price (No Default Lock-In), My Trade Budget (₹), and Custom Quantity Range */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* 1. Custom Trade Price Input */}
          <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-mono text-slate-300 uppercase font-bold">
                1. Custom Trade Price (₹)
              </label>
              <button
                type="button"
                onClick={() => {
                  const ltp = asset.price.toFixed(2);
                  onUpdateCustomSetup({ customPrice: ltp });
                }}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/80 transition-all cursor-pointer"
                title="Fill current NSE live price"
              >
                Use LTP ₹{asset.price.toFixed(2)}
              </button>
            </div>
            <input
              id="input-custom-trade-price"
              type="number"
              min="0.05"
              step="0.05"
              value={customSetup.customPrice}
              onChange={(e) => {
                setValidationMsg(null);
                const newPrice = e.target.value;
                const updates: Partial<CustomTradeSetup> = { customPrice: newPrice };
                if (Number(newPrice) > 0 && Number(customSetup.customBudget) > 0) {
                  const lev = customSetup.orderType === "Intraday (MIS)" ? 5 : 1;
                  const newShares = Math.max(1, Math.floor(Number(customSetup.customBudget) / (Number(newPrice) / lev)));
                  updates.customShares = String(newShares);
                }
                onUpdateCustomSetup(updates);
              }}
              placeholder="Enter custom price (₹)..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-slate-500 tabular-nums focus:outline-none"
            />
            <span className="block text-[10px] font-mono text-slate-400 mt-1.5">
              {hasCustomPrice ? (
                <span className="text-cyan-400">
                  Using your custom price: <strong>₹{Number(customSetup.customPrice).toFixed(2)}</strong>
                </span>
              ) : (
                <span>Blank = type any price you want to trade or setup</span>
              )}
            </span>
          </div>

          {/* 2. My Trade Budget Input */}
          <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-mono text-slate-300 uppercase font-bold">
                2. My Trade Budget (₹)
              </label>
              <button
                type="button"
                onClick={() => handleBudgetChange(String(Math.floor(availableCash)))}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/80 transition-all cursor-pointer"
              >
                Max Wallet
              </button>
            </div>
            <input
              id="input-custom-trade-budget"
              type="number"
              min="1"
              step="100"
              value={customSetup.customBudget}
              onChange={(e) => handleBudgetChange(e.target.value)}
              placeholder="Enter your budget in ₹..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-slate-500 tabular-nums focus:outline-none"
            />
            <div className="flex flex-wrap items-center gap-1 mt-1.5">
              {[1000, 2500, 5000, 10000, 25000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleBudgetChange(String(amt))}
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded border transition-all cursor-pointer ${
                    Number(customSetup.customBudget) === amt
                      ? "bg-emerald-500 text-slate-950 border-emerald-400 font-bold"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                  }`}
                >
                  ₹{amt >= 1000 ? `${amt / 1000}k` : amt}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Custom Quantity & Wallet Range Slider */}
          <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-mono text-slate-300 uppercase font-bold">
                3. Quantity (Shares Range)
              </label>
              <span className="text-[10px] font-mono text-cyan-400 tabular-nums">
                Range: 1 – {maxBudgetShares} sh
              </span>
            </div>
            <input
              id="input-custom-trade-shares"
              type="number"
              min="1"
              step="1"
              value={customSetup.customShares}
              onChange={(e) => {
                setValidationMsg(null);
                onUpdateCustomSetup({ customShares: e.target.value });
              }}
              placeholder="Enter custom quantity..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-slate-500 tabular-nums focus:outline-none"
            />
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-500">1</span>
              <input
                type="range"
                min={1}
                max={Math.max(1, maxBudgetShares)}
                value={Math.min(Math.max(1, resolvedShares || 1), Math.max(1, maxBudgetShares))}
                onChange={(e) => {
                  setValidationMsg(null);
                  onUpdateCustomSetup({ customShares: e.target.value });
                }}
                className="flex-1 accent-emerald-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] font-mono text-slate-400 tabular-nums">{maxBudgetShares}</span>
            </div>
          </div>
        </div>

        {/* Row 3: Stop-Loss (SL) & Target Inputs (Supports both Bullish & Bearish) */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-mono text-rose-400 uppercase font-bold">
                Stop-Loss (SL ₹) {isBearish ? "(Above Entry)" : "(Below Entry)"}
              </label>
            </div>
            <input
              id="input-custom-stop-loss"
              type="number"
              min="0.05"
              step="0.05"
              value={customSetup.customStopLoss}
              onChange={(e) => onUpdateCustomSetup({ customStopLoss: e.target.value })}
              placeholder={`Auto: ₹${resolvedStopLoss.toFixed(2)}`}
              className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-lg px-2.5 py-1.5 text-xs font-mono text-rose-300 placeholder-slate-500 tabular-nums focus:outline-none"
            />
          </div>

          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-mono text-emerald-400 uppercase font-bold">
                Target 1 (TP1 ₹) {isBearish ? "(Below Entry)" : "(Above Entry)"}
              </label>
            </div>
            <input
              id="input-custom-target-1"
              type="number"
              min="0.05"
              step="0.05"
              value={customSetup.customTarget1}
              onChange={(e) => onUpdateCustomSetup({ customTarget1: e.target.value })}
              placeholder={`Auto: ₹${resolvedTarget1.toFixed(2)}`}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-xs font-mono text-emerald-300 placeholder-slate-500 tabular-nums focus:outline-none"
            />
          </div>

          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-mono text-emerald-400 uppercase font-bold">
                Target 2 (TP2 ₹)
              </label>
            </div>
            <input
              id="input-custom-target-2"
              type="number"
              min="0.05"
              step="0.05"
              value={customSetup.customTarget2}
              onChange={(e) => onUpdateCustomSetup({ customTarget2: e.target.value })}
              placeholder={`Auto: ₹${resolvedTarget2.toFixed(2)}`}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-xs font-mono text-emerald-300 placeholder-slate-500 tabular-nums focus:outline-none"
            />
          </div>

          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 flex flex-col justify-between gap-1.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">
              Quick Setup Helpers
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleAutoCalcLevels(customSetup.direction)}
                className="flex-1 py-1.5 px-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-[11px] font-mono text-cyan-300 flex items-center justify-center gap-1 transition-all cursor-pointer"
                title="Auto-calculate Stop-Loss and Target from your Entry Price and Direction"
              >
                <Calculator className="w-3 h-3" />
                <span>Auto SL/Target</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setValidationMsg(null);
                  onResetCustomSetup();
                }}
                className="py-1.5 px-2 rounded-lg bg-slate-950 hover:bg-rose-950/60 border border-slate-800 text-[11px] font-mono text-slate-400 hover:text-rose-300 transition-all cursor-pointer"
                title="Clear all custom inputs"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Row 4: Strategy Persona, Order Type & Risk */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800/80">
          <div>
            <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Sliders className="w-3 h-3 text-cyan-400" /> AI Strategy Persona
            </label>
            <select
              id="select-agent-persona"
              value={persona}
              onChange={(e) => setPersona(e.target.value as AgentPersona)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-medium focus:outline-none focus:border-emerald-500"
            >
              <option value="Indian Momentum Breakout (NSE)">Indian Momentum Breakout (NSE)</option>
              <option value="Mean Reversion Quantitative">Mean Reversion Quantitative</option>
              <option value="FII/DII Flow & Swing">FII/DII Flow & Swing</option>
              <option value="Value & Fundamentals (Groww)">Value & Fundamentals (Groww)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
              Groww Order Mode
            </label>
            <select
              id="select-order-type"
              value={customSetup.orderType}
              onChange={(e) => onUpdateCustomSetup({ orderType: e.target.value as any })}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-medium focus:outline-none focus:border-emerald-500"
            >
              <option value="Delivery (CNC)">Delivery (CNC) - 1x Cash</option>
              <option value="Intraday (MIS)">Intraday (MIS) - 5x Margin (Bull & Bear Short)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
              Risk Profile
            </label>
            <select
              id="select-risk-tolerance"
              value={riskTolerance}
              onChange={(e) => setRiskTolerance(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-medium focus:outline-none focus:border-emerald-500"
            >
              <option value="Conservative (0.75%)">Conservative (0.75% risk)</option>
              <option value="Moderate (1.5%)">Moderate (1.50% risk)</option>
              <option value="Aggressive (3.0%)">Aggressive (3.00% risk)</option>
            </select>
          </div>
        </div>

        {/* Live Budget & Payoff Summary Bar + Direct Trade Execution Buttons */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1 font-mono text-xs tabular-nums">
            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Active Entry & Side</span>
              <span className={`font-bold ${isBearish ? "text-rose-400" : "text-emerald-400"}`}>
                {isBearish ? "SHORT / SELL" : "BUY / LONG"} @ ₹{effectiveEntryPrice.toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Quantity & Margin</span>
              <span className="font-bold text-white">
                {resolvedShares > 0 ? `${resolvedShares} sh (₹${Math.round(requiredMargin).toLocaleString("en-IN")})` : "Enter Budget / Qty"}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-rose-400 uppercase block">Stop-Loss Risk</span>
              <span className="font-bold text-rose-400">
                ₹{resolvedStopLoss.toFixed(1)} {resolvedShares > 0 ? `(-₹${Math.round(estimatedRisk).toLocaleString("en-IN")})` : ""}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-emerald-400 uppercase block">Target 1 Profit ({computedRR})</span>
              <span className="font-bold text-emerald-400">
                ₹{resolvedTarget1.toFixed(1)} {resolvedShares > 0 ? `(+₹${Math.round(Math.max(0, estimatedProfit)).toLocaleString("en-IN")})` : ""}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {growwConfig.isConnected ? (
              <button
                id="btn-execute-groww-live"
                type="button"
                onClick={() => {
                  if (!validateBeforeExecution()) return;
                  if (growwConfig.executionMode === "SEMI_AUTO") {
                    setShowLiveConfirm(true);
                  } else {
                    handleLiveExecute();
                  }
                }}
                disabled={isPlacingLive}
                className={`flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs transition-all shadow-md cursor-pointer ${
                  isBearish
                    ? "bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-400 hover:to-orange-400 text-white shadow-rose-500/20"
                    : "bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-emerald-500/20"
                }`}
              >
                {isPlacingLive ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5" />
                    <span>{isBearish ? "Live SELL / Short on Groww" : "Live BUY on Groww"}</span>
                  </>
                )}
              </button>
            ) : (
              <button
                id="btn-open-groww-connect"
                type="button"
                onClick={onOpenGrowwModal}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-emerald-800/80 text-emerald-400 text-xs font-mono transition-all cursor-pointer"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Connect Groww Live</span>
              </button>
            )}

            <button
              id="btn-execute-paper-trade"
              type="button"
              onClick={handleExecute}
              className={`flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl font-bold font-mono text-xs transition-all cursor-pointer ${
                isBearish
                  ? "bg-rose-600 hover:bg-rose-500 text-white border border-rose-500 shadow-sm"
                  : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-sm"
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isBearish ? "Simulate Bearish SHORT" : "Simulate Bullish BUY"}</span>
            </button>
          </div>
        </div>

        {/* Validation / Status Banners */}
        {validationMsg && (
          <div className="p-2.5 rounded-lg bg-amber-950/80 border border-amber-700 text-amber-200 text-xs font-mono flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>{validationMsg}</span>
          </div>
        )}

        {executedSuccess && (
          <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>
              {isBearish ? "Bearish SHORT" : "Bullish BUY"} order for {resolvedShares} shares of {asset.symbol} at ₹{effectiveEntryPrice.toFixed(2)} (SL: ₹{resolvedStopLoss.toFixed(2)}, Target: ₹{resolvedTarget1.toFixed(2)}) added to your Groww Paper Portfolio!
            </span>
          </div>
        )}

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

        {/* Live Order Confirmation Dialog */}
        {showLiveConfirm && (
          <div className="p-3.5 rounded-xl bg-slate-900 border border-emerald-600 text-xs space-y-2.5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Confirm Live Groww Order ({isBearish ? "BEARISH SHORT / SELL" : "BULLISH BUY"})
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                NSE Real-Time
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px] bg-slate-950 p-2.5 rounded-lg border border-slate-800 tabular-nums">
              <div>
                <span className="text-slate-400 block text-[10px]">Symbol & Direction</span>
                <span className={`font-bold ${isBearish ? "text-rose-400" : "text-emerald-400"}`}>
                  {isBearish ? "SELL / SHORT" : "BUY"} {asset.symbol}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Quantity & Entry</span>
                <span className="font-bold text-white">
                  {resolvedShares} sh @ ₹{effectiveEntryPrice.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Required Margin</span>
                <span className="font-bold text-emerald-400">
                  ₹{Math.round(requiredMargin).toLocaleString("en-IN")} (Notional ₹{Math.round(totalOrderNotional).toLocaleString("en-IN")})
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Stop-Loss & Target</span>
                <span className="text-slate-300">
                  SL: ₹{resolvedStopLoss.toFixed(1)} / TGT: ₹{resolvedTarget1.toFixed(1)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowLiveConfirm(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLiveExecute}
                disabled={isPlacingLive}
                className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer"
              >
                {isPlacingLive ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                <span>Authorize & Send to Groww</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: AI Signal Evaluation Output */}
      {activeSignal && (
        <div className="flex flex-col gap-3">
          {/* Top Banner: Verdict + Action Badge + Confidence */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-2 flex-wrap">
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
                AI Action: <strong className="text-white">{activeSignal.action}</strong> ({activeSignal.timeframe})
              </span>

              <button
                type="button"
                onClick={() => {
                  const aiDir: TradeDirection =
                    activeSignal.action === "SHORT" || activeSignal.action === "SELL"
                      ? "BEARISH"
                      : "BULLISH";
                  onUpdateCustomSetup({
                    direction: aiDir,
                    customPrice: String(activeSignal.entryZone?.min || asset.price),
                    customStopLoss: String(activeSignal.stopLoss),
                    customTarget1: String(activeSignal.takeProfit1),
                    customTarget2: String(activeSignal.takeProfit2),
                  });
                }}
                className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 transition-all cursor-pointer"
              >
                Apply AI Levels to Custom Setup
              </button>
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
                <span>AI Trade Analysis ({isBearish ? "Bearish / Down-Market" : "Bullish / Upper-Side"})</span>
              </div>
              <p>{activeSignal.whyTradeOrAvoid}</p>
            </div>
          )}

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
              <span><strong>Stop-Loss Invalidation:</strong> {activeSignal.invalidationCriteria}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
