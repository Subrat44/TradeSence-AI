import React, { useState } from "react";
import { MarketNewsItem, Asset } from "../../types";
import { 
  Newspaper, 
  ExternalLink, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  Building2, 
  Calendar, 
  Sparkles,
  ArrowRight,
  ShieldAlert
} from "lucide-react";

interface IndianMarketNewsProps {
  newsList: MarketNewsItem[];
  isLoading: boolean;
  onRefreshNews: () => void;
  onSelectTicker: (symbol: string) => void;
  allAssets: Asset[];
}

export const IndianMarketNews: React.FC<IndianMarketNewsProps> = ({
  newsList,
  isLoading,
  onRefreshNews,
  onSelectTicker,
  allAssets,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const filteredNews = newsList.filter((item) => {
    if (selectedCategory === "ALL") return true;
    return item.category === selectedCategory;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded-md bg-cyan-950 text-cyan-400 border border-cyan-800 text-[11px] font-mono font-bold">
              Live Intelligence Feed
            </span>
            <span className="px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-400 border border-indigo-800 text-[11px] font-mono">
              NSE / BSE / RBI / SEBI
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-mono flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-cyan-400" />
            Indian Market News & Corporate Catalysts
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Live news grounded in Economic Times, Moneycontrol, and Livemint. Track quarterly results, railway/defense order wins, RBI interest rate stance, and SEBI surveillance actions.
          </p>
        </div>

        <button
          onClick={onRefreshNews}
          disabled={isLoading}
          className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold font-mono transition-all disabled:opacity-40 flex items-center gap-2 flex-shrink-0 shadow-lg shadow-cyan-500/10"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>{isLoading ? "Fetching Headlines..." : "Scan Latest News"}</span>
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {["ALL", "Earnings", "Order Win", "Macro / RBI", "Regulatory"].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${
              selectedCategory === cat
                ? "bg-slate-800 text-cyan-400 border border-cyan-800 font-bold"
                : "bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800/80"
            }`}
          >
            {cat === "ALL" ? "All Events & News" : cat}
          </button>
        ))}
      </div>

      {/* News Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredNews.map((item) => {
          const isBullish = item.sentiment === "Bullish";
          const isBearish = item.sentiment === "Bearish";
          const matchedAsset = allAssets.find((a) => a.symbol === item.relatedSymbol);

          return (
            <div
              key={item.id}
              className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 shadow-lg flex flex-col justify-between hover:border-slate-700 transition-all group"
            >
              <div>
                {/* Meta header */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                      {item.source}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {item.timeAgo}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                      isBullish
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                        : isBearish
                        ? "bg-rose-950 text-rose-400 border border-rose-800"
                        : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {isBullish && <TrendingUp className="w-2.5 h-2.5" />}
                    {isBearish && <TrendingDown className="w-2.5 h-2.5" />}
                    <span>{item.sentiment}</span>
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-bold text-white text-sm sm:text-base leading-snug group-hover:text-cyan-300 transition-all">
                  {item.title}
                </h3>

                {/* Summary */}
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {item.summary}
                </p>
              </div>

              {/* Footer with Related Stock */}
              {item.relatedSymbol && (
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Impacted Stock:</span>
                    <span className="text-xs font-mono font-bold text-white">
                      {item.relatedSymbol}
                    </span>
                    {matchedAsset && (
                      <span className="text-[10px] font-mono text-cyan-400">
                        (₹{matchedAsset.price.toFixed(2)})
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => onSelectTicker(item.relatedSymbol!)}
                    className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 hover:underline"
                  >
                    <span>Analyze Setup</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
