import React, { useState, useMemo, useRef } from "react";
import { Asset, Candle, TradeSignal } from "../../types";
import { 
  Eye, 
  EyeOff, 
  TrendingUp, 
  Crosshair, 
  BarChart2, 
  Target,
  Maximize2,
  Minimize2
} from "lucide-react";

interface TradingChartProps {
  asset: Asset;
  activeSignal: TradeSignal | null;
  timeframe: string;
  setTimeframe: (tf: string) => void;
}

export const TradingChart: React.FC<TradingChartProps> = ({
  asset,
  activeSignal,
  timeframe,
  setTimeframe,
}) => {
  const [showSMA, setShowSMA] = useState(true);
  const [showEMA, setShowEMA] = useState(true);
  const [showRSI, setShowRSI] = useState(true);
  const [showVolume, setShowVolume] = useState(true);
  const [showAgentLevels, setShowAgentLevels] = useState(true);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const candles = asset.history;

  // Compute coordinate geometry for SVG
  const chartWidth = 840;
  const mainHeight = showRSI ? 290 : 380;
  const rsiHeight = showRSI ? 90 : 0;
  const volumeHeight = 65;
  const padding = { top: 25, right: 70, bottom: 25, left: 15 };

  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = mainHeight - padding.top - padding.bottom;

  // Price range (min / max)
  const { minPrice, maxPrice } = useMemo(() => {
    if (!candles.length) return { minPrice: 0, maxPrice: 100 };
    let min = Math.min(...candles.map((c) => c.low));
    let max = Math.max(...candles.map((c) => c.high));

    // Also factor in agent levels if visible
    if (activeSignal && showAgentLevels) {
      if (activeSignal.stopLoss) min = Math.min(min, activeSignal.stopLoss);
      if (activeSignal.takeProfit2) max = Math.max(max, activeSignal.takeProfit2);
      if (activeSignal.entryZone?.min) min = Math.min(min, activeSignal.entryZone.min);
    }

    const margin = (max - min) * 0.08 || 5;
    return {
      minPrice: Math.max(0.1, min - margin),
      maxPrice: max + margin,
    };
  }, [candles, activeSignal, showAgentLevels]);

  // Max volume for volume bars
  const maxVolume = useMemo(() => {
    return Math.max(...candles.map((c) => c.volume), 1);
  }, [candles]);

  // Scale helpers
  const getX = (index: number) => {
    if (candles.length <= 1) return padding.left;
    return padding.left + (index / (candles.length - 1)) * plotWidth;
  };

  const getY = (price: number) => {
    if (maxPrice === minPrice) return mainHeight / 2;
    return padding.top + (1 - (price - minPrice) / (maxPrice - minPrice)) * plotHeight;
  };

  const getRsiY = (rsiVal: number) => {
    const rsiTop = mainHeight + 20;
    const rsiPlotHeight = rsiHeight - 25;
    return rsiTop + (1 - rsiVal / 100) * rsiPlotHeight;
  };

  // Generate paths for SMA 20 & EMA 50
  const smaPath = useMemo(() => {
    const points: string[] = [];
    candles.forEach((c, idx) => {
      if (c.sma20 !== undefined) {
        const x = getX(idx);
        const y = getY(c.sma20);
        points.push(`${points.length === 0 ? "M" : "L"} ${x} ${y}`);
      }
    });
    return points.join(" ");
  }, [candles, minPrice, maxPrice]);

  const emaPath = useMemo(() => {
    const points: string[] = [];
    candles.forEach((c, idx) => {
      if (c.ema50 !== undefined) {
        const x = getX(idx);
        const y = getY(c.ema50);
        points.push(`${points.length === 0 ? "M" : "L"} ${x} ${y}`);
      }
    });
    return points.join(" ");
  }, [candles, minPrice, maxPrice]);

  const rsiPath = useMemo(() => {
    const points: string[] = [];
    candles.forEach((c, idx) => {
      if (c.rsi !== undefined) {
        const x = getX(idx);
        const y = getRsiY(c.rsi);
        points.push(`${points.length === 0 ? "M" : "L"} ${x} ${y}`);
      }
    });
    return points.join(" ");
  }, [candles]);

  // Active hover candle
  const hoveredCandle = hoverIndex !== null && candles[hoverIndex] ? candles[hoverIndex] : candles[candles.length - 1];

  // Price grid levels
  const priceGridSteps = 5;
  const priceTicks = useMemo(() => {
    const ticks: number[] = [];
    const step = (maxPrice - minPrice) / priceGridSteps;
    for (let i = 0; i <= priceGridSteps; i++) {
      ticks.push(minPrice + i * step);
    }
    return ticks;
  }, [minPrice, maxPrice]);

  const candleWidth = Math.max(3, Math.min(14, (plotWidth / candles.length) * 0.65));

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 sm:p-5 flex flex-col gap-4 shadow-xl">
      {/* Top Header: Symbol Info + Timeframe Selectors + Indicator Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        {/* Symbol and price info */}
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white font-mono tracking-tight">{asset.symbol}</h2>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                {asset.name}
              </span>
              <span className="text-xs text-slate-400 font-mono">({asset.category})</span>
              {asset.growwSlug && (
                <a
                  href={`https://groww.in/stocks/${asset.growwSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 hover:bg-emerald-900 transition-all flex items-center gap-1"
                >
                  <span>Groww</span>
                </a>
              )}
            </div>
            {/* Live details ribbon */}
            <div className="flex items-center gap-4 text-xs font-mono mt-1 text-slate-400">
              <span>O: <span className="text-slate-200">₹{hoveredCandle?.open?.toFixed(2)}</span></span>
              <span>H: <span className="text-emerald-400">₹{hoveredCandle?.high?.toFixed(2)}</span></span>
              <span>L: <span className="text-rose-400">₹{hoveredCandle?.low?.toFixed(2)}</span></span>
              <span>C: <span className="text-white font-semibold">₹{hoveredCandle?.close?.toFixed(2)}</span></span>
              {hoveredCandle?.rsi && (
                <span>RSI: <span className={hoveredCandle.rsi > 70 ? "text-amber-400 font-semibold" : hoveredCandle.rsi < 30 ? "text-cyan-400 font-semibold" : "text-slate-300"}>{hoveredCandle.rsi}</span></span>
              )}
            </div>
          </div>
        </div>

        {/* Timeframes & Indicators */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Timeframe pill group */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
            {["1D", "1W", "1M", "1Y"].map((tf) => (
              <button
                key={tf}
                id={`timeframe-btn-${tf}`}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 rounded transition-all ${
                  timeframe === tf
                    ? "bg-cyan-500 text-slate-950 font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Indicator toggles */}
          <div className="flex items-center gap-1.5 text-xs font-mono bg-slate-950/70 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setShowSMA(!showSMA)}
              className={`px-2 py-1 rounded flex items-center gap-1 transition-all ${
                showSMA ? "bg-cyan-950 text-cyan-300 border border-cyan-700/60" : "text-slate-500 hover:text-slate-300"
              }`}
              title="20-day Simple Moving Average"
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              SMA 20
            </button>

            <button
              onClick={() => setShowEMA(!showEMA)}
              className={`px-2 py-1 rounded flex items-center gap-1 transition-all ${
                showEMA ? "bg-amber-950 text-amber-300 border border-amber-700/60" : "text-slate-500 hover:text-slate-300"
              }`}
              title="50-day Exponential Moving Average"
            >
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              EMA 50
            </button>

            <button
              onClick={() => setShowRSI(!showRSI)}
              className={`px-2 py-1 rounded flex items-center gap-1 transition-all ${
                showRSI ? "bg-purple-950 text-purple-300 border border-purple-700/60" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <BarChart2 className="w-3 h-3" />
              RSI (14)
            </button>

            {activeSignal && (
              <button
                onClick={() => setShowAgentLevels(!showAgentLevels)}
                className={`px-2 py-1 rounded flex items-center gap-1 transition-all ${
                  showAgentLevels ? "bg-emerald-950 text-emerald-300 border border-emerald-700/60" : "text-slate-500 hover:text-slate-300"
                }`}
                title="Agent Trade Levels (Entry, SL, TP)"
              >
                <Target className="w-3 h-3 text-emerald-400" />
                AI Levels
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SVG Candlestick & Indicator Stage */}
      <div 
        ref={containerRef}
        className="relative w-full overflow-hidden select-none bg-slate-950/60 rounded-xl border border-slate-800/70"
        onMouseLeave={() => setHoverIndex(null)}
        onMouseMove={(e) => {
          if (!containerRef.current) return;
          const rect = containerRef.current.getBoundingClientRect();
          const mouseX = e.clientX - rect.left;
          const normalizedX = (mouseX / rect.width) * chartWidth;
          const relativeX = normalizedX - padding.left;
          const ratio = Math.max(0, Math.min(1, relativeX / plotWidth));
          const idx = Math.round(ratio * (candles.length - 1));
          setHoverIndex(idx);
        }}
      >
        <svg
          viewBox={`0 0 ${chartWidth} ${mainHeight + rsiHeight}`}
          className="w-full h-auto block"
          style={{ minHeight: "360px" }}
        >
          <defs>
            <linearGradient id="volGradUp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="volGradDown" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="rsiAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#818cf8" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#818cf8" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines (Price axes) */}
          {priceTicks.map((price, idx) => {
            const y = getY(price);
            return (
              <g key={idx}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={chartWidth - padding.right}
                  y2={y}
                  stroke="#334155"
                  strokeWidth="0.75"
                  strokeDasharray="3 3"
                  opacity="0.4"
                />
                <text
                  x={chartWidth - padding.right + 8}
                  y={y + 4}
                  fill="#94a3b8"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  ₹{price >= 1000 ? price.toFixed(0) : price.toFixed(2)}
                </text>
              </g>
            );
          })}

          {/* Volume bars */}
          {showVolume &&
            candles.map((c, idx) => {
              const x = getX(idx);
              const isUp = c.close >= c.open;
              const barH = (c.volume / maxVolume) * volumeHeight;
              const barY = mainHeight - padding.bottom - barH;
              return (
                <rect
                  key={`vol-${idx}`}
                  x={x - candleWidth / 2}
                  y={barY}
                  width={candleWidth}
                  height={barH}
                  fill={isUp ? "url(#volGradUp)" : "url(#volGradDown)"}
                />
              );
            })}

          {/* Moving average overlays */}
          {showSMA && smaPath && (
            <path
              d={smaPath}
              fill="none"
              stroke="#22d3ee"
              strokeWidth="1.8"
              strokeLinecap="round"
              opacity="0.9"
            />
          )}

          {showEMA && emaPath && (
            <path
              d={emaPath}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="1.8"
              strokeLinecap="round"
              opacity="0.9"
            />
          )}

          {/* Candlesticks */}
          {candles.map((c, idx) => {
            const x = getX(idx);
            const isUp = c.close >= c.open;
            const highY = getY(c.high);
            const lowY = getY(c.low);
            const openY = getY(c.open);
            const closeY = getY(c.close);

            const bodyY = Math.min(openY, closeY);
            const bodyH = Math.max(2, Math.abs(closeY - openY));

            const color = isUp ? "#10b981" : "#f43f5e";

            return (
              <g key={`candle-${idx}`}>
                {/* Wick */}
                <line
                  x1={x}
                  y1={highY}
                  x2={x}
                  y2={lowY}
                  stroke={color}
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
                {/* Body */}
                <rect
                  x={x - candleWidth / 2}
                  y={bodyY}
                  width={candleWidth}
                  height={bodyH}
                  fill={color}
                  rx="1"
                />
              </g>
            );
          })}

          {/* AI Agent Targets / Stop Loss Lines on Chart */}
          {activeSignal && showAgentLevels && (
            <g id="ai-agent-chart-levels">
              {/* Entry Zone */}
              <line
                x1={padding.left}
                y1={getY(activeSignal.entryZone.min)}
                x2={chartWidth - padding.right}
                y2={getY(activeSignal.entryZone.min)}
                stroke="#38bdf8"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />
              <rect
                x={chartWidth - padding.right + 4}
                y={getY(activeSignal.entryZone.min) - 8}
                width="60"
                height="16"
                fill="#0284c7"
                rx="3"
              />
              <text
                x={chartWidth - padding.right + 7}
                y={getY(activeSignal.entryZone.min) + 3}
                fill="#ffffff"
                fontSize="9"
                fontWeight="bold"
                fontFamily="monospace"
              >
                ENTRY ₹{activeSignal.entryZone.min.toFixed(1)}
              </text>

              {/* Stop Loss */}
              <line
                x1={padding.left}
                y1={getY(activeSignal.stopLoss)}
                x2={chartWidth - padding.right}
                y2={getY(activeSignal.stopLoss)}
                stroke="#f43f5e"
                strokeWidth="1.8"
                strokeDasharray="5 3"
              />
              <rect
                x={chartWidth - padding.right + 4}
                y={getY(activeSignal.stopLoss) - 8}
                width="60"
                height="16"
                fill="#e11d48"
                rx="3"
              />
              <text
                x={chartWidth - padding.right + 7}
                y={getY(activeSignal.stopLoss) + 3}
                fill="#ffffff"
                fontSize="9"
                fontWeight="bold"
                fontFamily="monospace"
              >
                SL ₹{activeSignal.stopLoss.toFixed(1)}
              </text>

              {/* Take Profit 1 */}
              <line
                x1={padding.left}
                y1={getY(activeSignal.takeProfit1)}
                x2={chartWidth - padding.right}
                y2={getY(activeSignal.takeProfit1)}
                stroke="#10b981"
                strokeWidth="1.8"
                strokeDasharray="5 3"
              />
              <rect
                x={chartWidth - padding.right + 4}
                y={getY(activeSignal.takeProfit1) - 8}
                width="60"
                height="16"
                fill="#059669"
                rx="3"
              />
              <text
                x={chartWidth - padding.right + 7}
                y={getY(activeSignal.takeProfit1) + 3}
                fill="#ffffff"
                fontSize="9"
                fontWeight="bold"
                fontFamily="monospace"
              >
                TP1 ₹{activeSignal.takeProfit1.toFixed(1)}
              </text>

              {/* Take Profit 2 */}
              {activeSignal.takeProfit2 && (
                <>
                  <line
                    x1={padding.left}
                    y1={getY(activeSignal.takeProfit2)}
                    x2={chartWidth - padding.right}
                    y2={getY(activeSignal.takeProfit2)}
                    stroke="#059669"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  <rect
                    x={chartWidth - padding.right + 4}
                    y={getY(activeSignal.takeProfit2) - 8}
                    width="60"
                    height="16"
                    fill="#047857"
                    rx="3"
                  />
                  <text
                    x={chartWidth - padding.right + 7}
                    y={getY(activeSignal.takeProfit2) + 3}
                    fill="#ffffff"
                    fontSize="9"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    TP2 ₹{activeSignal.takeProfit2.toFixed(1)}
                  </text>
                </>
              )}
            </g>
          )}

          {/* RSI Subchart Section */}
          {showRSI && (
            <g id="rsi-subchart">
              {/* Divider */}
              <line
                x1={padding.left}
                y1={mainHeight + 5}
                x2={chartWidth - padding.right}
                y2={mainHeight + 5}
                stroke="#334155"
                strokeWidth="1"
              />

              {/* RSI Overbought line (70) */}
              <line
                x1={padding.left}
                y1={getRsiY(70)}
                x2={chartWidth - padding.right}
                y2={getRsiY(70)}
                stroke="#f59e0b"
                strokeWidth="0.8"
                strokeDasharray="3 3"
                opacity="0.6"
              />
              <text
                x={chartWidth - padding.right + 8}
                y={getRsiY(70) + 3}
                fill="#d97706"
                fontSize="9"
                fontFamily="monospace"
              >
                70 OB
              </text>

              {/* RSI Center line (50) */}
              <line
                x1={padding.left}
                y1={getRsiY(50)}
                x2={chartWidth - padding.right}
                y2={getRsiY(50)}
                stroke="#475569"
                strokeWidth="0.7"
                strokeDasharray="2 2"
                opacity="0.4"
              />

              {/* RSI Oversold line (30) */}
              <line
                x1={padding.left}
                y1={getRsiY(30)}
                x2={chartWidth - padding.right}
                y2={getRsiY(30)}
                stroke="#22d3ee"
                strokeWidth="0.8"
                strokeDasharray="3 3"
                opacity="0.6"
              />
              <text
                x={chartWidth - padding.right + 8}
                y={getRsiY(30) + 3}
                fill="#0284c7"
                fontSize="9"
                fontFamily="monospace"
              >
                30 OS
              </text>

              {/* RSI Curve */}
              {rsiPath && (
                <path
                  d={rsiPath}
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              )}

              <text
                x={padding.left + 5}
                y={mainHeight + 18}
                fill="#c084fc"
                fontSize="10"
                fontFamily="monospace"
                fontWeight="bold"
              >
                RSI (14): {hoveredCandle?.rsi || 50}
              </text>
            </g>
          )}

          {/* Interactive Crosshair */}
          {hoverIndex !== null && (
            <g id="chart-crosshair">
              {/* Vertical line */}
              <line
                x1={getX(hoverIndex)}
                y1={padding.top}
                x2={getX(hoverIndex)}
                y2={mainHeight + rsiHeight - 10}
                stroke="#e2e8f0"
                strokeWidth="0.9"
                strokeDasharray="3 3"
                opacity="0.7"
              />
              {/* Horizontal line at close price */}
              <line
                x1={padding.left}
                y1={getY(hoveredCandle.close)}
                x2={chartWidth - padding.right}
                y2={getY(hoveredCandle.close)}
                stroke="#e2e8f0"
                strokeWidth="0.9"
                strokeDasharray="3 3"
                opacity="0.7"
              />

              {/* Date tag at bottom */}
              <rect
                x={getX(hoverIndex) - 32}
                y={mainHeight - padding.bottom + 4}
                width="64"
                height="16"
                fill="#1e293b"
                rx="3"
                stroke="#475569"
                strokeWidth="0.8"
              />
              <text
                x={getX(hoverIndex)}
                y={mainHeight - padding.bottom + 15}
                fill="#cbd5e1"
                fontSize="9"
                fontFamily="monospace"
                textAnchor="middle"
              >
                {hoveredCandle.time}
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Indicator Legend Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-cyan-400"></span> SMA(20): ₹{candles[candles.length - 1]?.sma20?.toFixed(2) || "N/A"}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-amber-400"></span> EMA(50): ₹{candles[candles.length - 1]?.ema50?.toFixed(2) || "N/A"}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-purple-400"></span> RSI(14): {candles[candles.length - 1]?.rsi || "50"}
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span>High 24h: <strong className="text-white">₹{asset.high24h.toFixed(2)}</strong></span>
          <span className="text-slate-600">|</span>
          <span>Low 24h: <strong className="text-white">₹{asset.low24h.toFixed(2)}</strong></span>
          <span className="text-slate-600">|</span>
          <span>Vol: <strong className="text-white">{asset.volume24h}</strong></span>
        </div>
      </div>
    </div>
  );
};
