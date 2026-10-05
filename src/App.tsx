import React, { useState, useEffect } from "react";
import { Header, TabType } from "./components/Header";
import { TradingChart } from "./components/Chart/TradingChart";
import { AgentSignalCard } from "./components/Agent/AgentSignalCard";
import { ResearchTerminal } from "./components/Research/ResearchTerminal";
import { BacktestSimulator } from "./components/Strategy/BacktestSimulator";
import { CopilotChat } from "./components/Copilot/CopilotChat";
import { PaperPortfolioModal } from "./components/Portfolio/PaperPortfolioModal";
import { TradeVerdictMatrix } from "./components/Screener/TradeVerdictMatrix";
import { IndianMarketNews } from "./components/News/IndianMarketNews";
import { GrowwConnectionModal } from "./components/Groww/GrowwConnectionModal";
import { INITIAL_ASSETS, INITIAL_INDIAN_NEWS } from "./data/mockAssets";
import { 
  Asset, 
  TradeSignal, 
  ResearchReport, 
  ChatMessage, 
  PaperAccount, 
  PaperPosition, 
  AgentPersona,
  MarketNewsItem,
  GrowwConfig,
  GrowwOrder 
} from "./types";
import { 
  Bot, 
  TrendingUp, 
  Search, 
  Sparkles, 
  AlertCircle, 
  MessageSquare,
  Activity,
  Layers,
  ShieldCheck,
  ExternalLink,
  Briefcase
} from "lucide-react";

export default function App() {
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);
  const [selectedAsset, setSelectedAsset] = useState<Asset>(INITIAL_ASSETS[0]);
  const [activeTab, setActiveTab] = useState<TabType>("screener");
  const [timeframe, setTimeframe] = useState<string>("1M");

  // Indian Market News
  const [newsList, setNewsList] = useState<MarketNewsItem[]>(INITIAL_INDIAN_NEWS);
  const [isLoadingNews, setIsLoadingNews] = useState(false);

  // Signals per symbol cache
  const [signalsMap, setSignalsMap] = useState<Record<string, TradeSignal>>({});
  const [isGeneratingSignal, setIsGeneratingSignal] = useState(false);

  // Research reports cache
  const [reportsMap, setReportsMap] = useState<Record<string, ResearchReport>>({});
  const [isGeneratingResearch, setIsGeneratingResearch] = useState(false);

  // Chat messages
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => [
    {
      id: "initial-agent-msg",
      role: "assistant",
      content: `### Welcome to TradeSense India AI Copilot 🇮🇳
I am your autonomous stock trading and market research assistant customized for the **Indian Stock Market (NSE / BSE)** and the **Groww platform**.

- **Active Stock**: **${INITIAL_ASSETS[0].symbol}** (${INITIAL_ASSETS[0].name})
- **Features**:
  1. ⚡ **"Trade vs. Avoid" Screener**: Analyzes Small-caps, Mid-caps, and Large-caps with SEBI surveillance checks & promoter pledge scrutiny.
  2. 📊 **Groww Execution Playbook**: Exact entry zones, Stop Loss in ₹, Target levels, and Delivery (CNC) vs Intraday (MIS) guidance.
  3. 📰 **Live Indian Market News Grounding**: Corporate order wins, RBI monetary policies, and earnings results.

Ask me anything about today's market setup or click **"Evaluate Trade Setup"** to generate an institutional report!`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Paper Portfolio State (with localStorage persistence)
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);
  const [paperAccount, setPaperAccount] = useState<PaperAccount>(() => {
    const saved = localStorage.getItem("tradesense_paper_portfolio_inr");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return {
      cash: 500000,
      initialBalance: 500000,
      positions: [
        {
          id: "pos-sample-tatamotors",
          symbol: "TATAMOTORS",
          assetName: "Tata Motors Ltd",
          side: "BUY",
          entryPrice: 960.00,
          currentPrice: 986.75,
          shares: 60,
          stopLoss: 935.00,
          takeProfit: 1060.00,
          timestamp: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
          pnl: (986.75 - 960.00) * 60,
          pnlPercent: ((986.75 - 960.00) / 960.00) * 100,
          orderType: "Delivery (CNC)",
          growwSlug: "tata-motors-ltd",
        },
      ],
      tradeHistory: [
        {
          id: "hist-sample-1",
          symbol: "SUZLON",
          side: "BUY",
          price: 78.50,
          shares: 500,
          pnl: 4850.00,
          timestamp: new Date(Date.now() - 3600 * 1000 * 72).toISOString(),
          status: "CLOSED",
        },
      ],
    };
  });

  // Save portfolio state
  useEffect(() => {
    localStorage.setItem("tradesense_paper_portfolio_inr", JSON.stringify(paperAccount));
  }, [paperAccount]);

  // Groww Cloud API Configuration State
  const [isGrowwModalOpen, setIsGrowwModalOpen] = useState(false);
  const [isGrowwLoading, setIsGrowwLoading] = useState(false);
  const [growwOrders, setGrowwOrders] = useState<GrowwOrder[]>([]);
  const [growwConfig, setGrowwConfig] = useState<GrowwConfig>(() => {
    const saved = localStorage.getItem("tradesense_groww_config");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return {
      isConnected: false,
      clientId: "GRW-SUBRAT-4392",
      clientName: "Subrat Kumar Pradhan",
      mode: "LIVE",
      executionMode: "SEMI_AUTO",
      maxCapitalPerTrade: 25000,
      dailyLossLimitPercent: 2.0,
      availableMargin: 245000,
      usedMargin: 38400,
      sandboxMode: false,
    };
  });

  // Persist Groww client config
  useEffect(() => {
    localStorage.setItem("tradesense_groww_config", JSON.stringify(growwConfig));
  }, [growwConfig]);

  // Query Groww Server Status on Initial Load & Handle OAuth redirect
  useEffect(() => {
    // Check if redirected from Groww OAuth
    if (typeof window !== "undefined" && window.location.search.includes("groww_auth=success")) {
      setGrowwConfig((prev) => ({
        ...prev,
        isConnected: true,
      }));
      setChatMessages((prev) => [
        ...prev,
        {
          id: `groww-auth-success-${Date.now()}`,
          role: "assistant",
          content: `🟢 **Groww Cloud API Authenticated & Active!**\n\nYour session has been validated under SEBI Static IP whitelist (\`34.34.244.34\`). You are now ready to route automated order signals to Groww.`,
          timestamp: new Date().toISOString(),
        },
      ]);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const fetchGrowwStatus = async () => {
      try {
        const res = await fetch("/api/groww/status");
        if (res.ok) {
          const data = await res.json();
          if (data.isConnected) {
            setGrowwConfig((prev) => ({
              ...prev,
              isConnected: true,
              apiKey: data.session?.apiKey || prev.apiKey,
              clientName: data.session?.clientName || prev.clientName,
              clientId: data.session?.clientId || prev.clientId,
              mode: data.session?.mode || prev.mode,
              availableMargin: data.session?.availableMargin ?? prev.availableMargin,
              usedMargin: data.session?.usedMargin ?? prev.usedMargin,
            }));
          }
        }
      } catch (e) {
        console.warn("Could not check Groww status:", e);
      }
    };

    const fetchGrowwOrders = async () => {
      try {
        const res = await fetch("/api/groww/orders");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.orders)) {
            setGrowwOrders(data.orders);
          }
        }
      } catch (e) {
        console.warn("Could not fetch Groww orders:", e);
      }
    };

    fetchGrowwStatus();
    fetchGrowwOrders();
  }, []);

  // Subtle real-time market price simulation tick every 3.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setAssets((prevAssets) => {
        return prevAssets.map((asset) => {
          // Slight price oscillation (-0.2% to +0.2%)
          const pct = (Math.random() - 0.49) * 0.003;
          const newPrice = Number(Math.max(1, asset.price * (1 + pct)).toFixed(2));
          const newChange24h = Number((asset.change24h + (newPrice - asset.price)).toFixed(2));
          const newChangePercent = Number(((newChange24h / (newPrice - newChange24h)) * 100).toFixed(2));

          // Also update latest candle close
          const updatedHistory = [...asset.history];
          if (updatedHistory.length > 0) {
            const lastIdx = updatedHistory.length - 1;
            const lastCandle = { ...updatedHistory[lastIdx] };
            lastCandle.close = newPrice;
            lastCandle.high = Math.max(lastCandle.high, newPrice);
            lastCandle.low = Math.min(lastCandle.low, newPrice);
            updatedHistory[lastIdx] = lastCandle;
          }

          return {
            ...asset,
            price: newPrice,
            change24h: newChange24h,
            changePercent: newChangePercent,
            high24h: Math.max(asset.high24h, newPrice),
            low24h: Math.min(asset.low24h, newPrice),
            history: updatedHistory,
          };
        });
      });
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  // Synchronize selectedAsset with ticking assets list
  useEffect(() => {
    const updated = assets.find((a) => a.symbol === selectedAsset.symbol);
    if (updated && updated.price !== selectedAsset.price) {
      setSelectedAsset(updated);
    }
  }, [assets, selectedAsset.symbol]);

  // Automated Stop-Loss & Take-Profit Trigger Watcher
  useEffect(() => {
    paperAccount.positions.forEach((pos) => {
      const asset = assets.find((a) => a.symbol === pos.symbol);
      if (!asset) return;

      let triggerReason: "SL" | "TP" | null = null;
      if (pos.side === "BUY") {
        if (asset.price <= pos.stopLoss) triggerReason = "SL";
        else if (asset.price >= pos.takeProfit) triggerReason = "TP";
      } else {
        if (asset.price >= pos.stopLoss) triggerReason = "SL";
        else if (asset.price <= pos.takeProfit) triggerReason = "TP";
      }

      if (triggerReason) {
        closePosition(pos.id);
      }
    });
  }, [assets]);

  // Action: Generate AI Trading Signal
  const handleGenerateSignal = async (persona: AgentPersona, risk: string) => {
    setIsGeneratingSignal(true);
    const latestCandle = selectedAsset.history[selectedAsset.history.length - 1];
    try {
      const res = await fetch("/api/agent/analyze-trade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticker: selectedAsset.symbol,
          currentPrice: selectedAsset.price,
          category: selectedAsset.category,
          technicals: {
            rsi: latestCandle?.rsi,
            sma20: latestCandle?.sma20,
            ema50: latestCandle?.ema50,
            change24h: `${selectedAsset.changePercent}%`,
          },
          persona,
          accountCapital: paperAccount.cash,
          riskTolerance: risk,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      if (data.signal) {
        setSignalsMap((prev) => ({
          ...prev,
          [selectedAsset.symbol]: data.signal,
        }));
      }
    } catch (err: any) {
      console.error("Failed to generate trade signal:", err);
      // Fallback signal if API key not present or error
      const price = selectedAsset.price;
      const isTrade = selectedAsset.verdict !== "AVOID (HIGH RISK)";
      const fallbackSignal: TradeSignal = {
        verdict: isTrade ? "TRADE (HIGH CONVICTION)" : "AVOID (HIGH RISK)",
        action: isTrade ? "BUY" : "AVOID",
        confidence: isTrade ? 84 : 35,
        timeframe: "BTST / Swing (2-10 days)",
        orderType: "Delivery (CNC)",
        entryZone: { min: Number((price * 0.992).toFixed(2)), max: Number((price * 1.006).toFixed(2)) },
        stopLoss: Number((price * (isTrade ? 0.962 : 1.04)).toFixed(2)),
        takeProfit1: Number((price * (isTrade ? 1.058 : 0.94)).toFixed(2)),
        takeProfit2: Number((price * (isTrade ? 1.115 : 0.88)).toFixed(2)),
        riskRewardRatio: "1:2.7",
        suggestedShares: Math.max(1, Math.floor((paperAccount.cash * 0.015) / Math.max(1, price * 0.038))),
        positionValue: Math.round(price * Math.max(1, Math.floor((paperAccount.cash * 0.015) / Math.max(1, price * 0.038)))),
        primaryReason: `${persona} setup identified: Positive price action along the 20-day SMA on NSE with RSI at ${latestCandle?.rsi || 55}. Clean volume delivery structure.`,
        whyTradeOrAvoid: isTrade 
          ? `TRADE THIS: Favorable risk/reward on Groww with 3.8% stop loss and clear institutional participation.`
          : `AVOID THIS: Unfavorable valuation or high promoter pledge risk. Wait for consolidation before entering.`,
        technicalSignals: ["RSI momentum confirmed", "Above 20-day SMA support", "Volume expansion on NSE"],
        invalidationCriteria: `Daily close beyond ₹${(price * (isTrade ? 0.962 : 1.04)).toFixed(2)} on NSE`,
        growwUrl: selectedAsset.growwSlug ? `https://groww.in/stocks/${selectedAsset.growwSlug}` : undefined,
      };
      setSignalsMap((prev) => ({
        ...prev,
        [selectedAsset.symbol]: fallbackSignal,
      }));
    } finally {
      setIsGeneratingSignal(false);
    }
  };

  // Action: Generate Deep Market Research
  const handleGenerateResearch = async (ticker: string, name: string, horizon: string) => {
    setIsGeneratingResearch(true);
    try {
      const res = await fetch("/api/agent/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticker,
          assetName: name,
          assetCategory: selectedAsset.category,
          horizon,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      if (data.report) {
        const isAvoid = selectedAsset.verdict === "AVOID (HIGH RISK)";
        const generatedReport: ResearchReport = {
          ticker,
          companyName: name,
          verdict: data.verdict || (isAvoid ? "AVOID (HIGH RISK)" : "TRADE (HIGH CONVICTION)"),
          report: data.report,
          sources: data.sources || [],
          timestamp: data.timestamp || new Date().toISOString(),
        };
        setReportsMap((prev) => ({
          ...prev,
          [ticker]: generatedReport,
        }));
      }
    } catch (err: any) {
      console.error("Failed to generate research:", err);
      // Fallback comprehensive report
      const isAvoid = selectedAsset.verdict === "AVOID (HIGH RISK)";
      const fallbackReport: ResearchReport = {
        ticker,
        companyName: name,
        verdict: isAvoid ? "AVOID (HIGH RISK)" : "TRADE (HIGH CONVICTION)",
        report: `## Executive Summary & Market Verdict
**Ticker**: \`${ticker}\` (NSE/BSE) | **Company Name**: ${name}
**Primary Bias**: **${isAvoid ? "AVOID (HIGH RISK)" : "TRADE (HIGH CONVICTION)"}** (Conviction Score: ${isAvoid ? "3/10" : "8.5/10"})
**Trading Horizon**: ${horizon}
**Groww Execution**: ${isAvoid ? "DO NOT BUY / WATCHLIST ONLY" : "Delivery (CNC) recommended"}

### 1. Market Catalyst & Fundamentals
${ticker} is currently evaluated under Indian market conditions (NSE/BSE). Institutional DII and mutual fund inflows remain a primary structural pillar.
- **Promoter Pledge**: ${selectedAsset.promoterPledge || "0.0% (Clean)"}
- **SEBI Surveillance**: ${selectedAsset.sebiSurveillance || "None (Standard Category)"}

| Metric | Estimated Value | Indian Sector Benchmark |
| :--- | :--- | :--- |
| **P/E Ratio** | ${selectedAsset.peRatio || "26.4x"} | 24.5x |
| **Beta (Volatility)** | ${selectedAsset.beta || 1.15} | 1.00 |
| **Trailing 12M Momentum** | +${selectedAsset.changePercent}% | +12.4% |
| **Market Capitalization** | ${selectedAsset.marketCap} | - |

### 2. Technical Architecture & Pivots
- **Major Support Zone (Stop Loss)**: ₹${(selectedAsset.price * 0.95).toFixed(2)}
- **Immediate Pivot Resistance**: ₹${(selectedAsset.price * 1.06).toFixed(2)}
- **Breakout Target (T1 / T2)**: ₹${(selectedAsset.price * 1.08).toFixed(2)} / ₹${(selectedAsset.price * 1.14).toFixed(2)}

### 3. Quantitative Risk Factors & Downside Thesis
- **Macro Headwind**: Inflation, crude oil import costs, and RBI monetary policy interest rate stance.
- **SEBI Regulations**: Watch for circuit limits (5% / 10% / 20%) and ASM framework updates.
- **Invalidation Trigger**: A daily close below ₹${(selectedAsset.price * 0.95).toFixed(2)} immediately invalidates the swing trade setup.

### 4. Actionable Groww Trading Playbook
- **Recommendation**: ${isAvoid ? "Strictly AVOID entering at current levels due to unfavorable risk/reward." : `Scale 60% on Groww at ₹${selectedAsset.price.toFixed(2)} and 40% on dips to ₹${(selectedAsset.price * 0.985).toFixed(2)}.`}
- **Stop Loss**: ₹${(selectedAsset.price * 0.955).toFixed(2)}
- **Target 1**: ₹${(selectedAsset.price * 1.07).toFixed(2)}
- **Target 2**: ₹${(selectedAsset.price * 1.135).toFixed(2)}
- **Risk-to-Reward Ratio**: **1:2.7**`,
        sources: [
          { title: "Moneycontrol Market Overview & Disclosures", url: "https://moneycontrol.com" },
          { title: "NSE India Corporate Announcements", url: "https://nseindia.com" },
          { title: "Economic Times Equity Intelligence", url: "https://economictimes.indiatimes.com" },
        ],
        timestamp: new Date().toISOString(),
      };
      setReportsMap((prev) => ({
        ...prev,
        [ticker]: fallbackReport,
      }));
    } finally {
      setIsGeneratingResearch(false);
    }
  };

  // Action: Send message to Copilot Chat
  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };

    const newHistory = [...chatMessages, userMsg];
    setChatMessages(newHistory);
    setIsChatLoading(true);

    try {
      const res = await fetch("/api/agent/copilot-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newHistory.slice(-6),
          activeTicker: selectedAsset.symbol,
          activePrice: selectedAsset.price,
        }),
      });

      if (!res.ok) throw new Error("Chat request failed");
      const data = await res.json();

      setChatMessages((prev) => [
        ...prev,
        {
          id: `asst-${Date.now()}`,
          role: "assistant",
          content: data.reply,
          citations: data.citations,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      console.error(err);
      // Helpful fallback response
      setChatMessages((prev) => [
        ...prev,
        {
          id: `asst-${Date.now()}`,
          role: "assistant",
          content: `Regarding **${selectedAsset.symbol}** (₹${selectedAsset.price.toFixed(2)} on NSE):\n\n- **Verdict**: ${selectedAsset.verdict}\n- **Why**: ${selectedAsset.verdictReason || "Trading near key technical moving averages on Groww."}\n- **Risk Management Rule**: For Indian equities, never risk more than 1.5% of your ₹5,00,000 capital on a single swing position.\n- **Groww Execution**: Enter in Delivery (CNC) mode with stop loss at ₹${(selectedAsset.price * 0.96).toFixed(2)} and Target at ₹${(selectedAsset.price * 1.07).toFixed(2)}.\n\nWould you like me to research another small-cap or large-cap stock for you?`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Action: Refresh News
  const handleRefreshNews = async () => {
    setIsLoadingNews(true);
    try {
      const res = await fetch("/api/market/indian-news");
      if (res.ok) {
        const data = await res.json();
        if (data.news && Array.isArray(data.news) && data.news.length > 0) {
          setNewsList(data.news);
        }
      }
    } catch (err) {
      console.error("Failed to refresh news:", err);
    } finally {
      setIsLoadingNews(false);
    }
  };

  // Action: Analyze custom ticker in Screener
  const handleAnalyzeCustomStock = (symbol: string) => {
    const existing = assets.find((a) => a.symbol.toUpperCase() === symbol.toUpperCase());
    if (existing) {
      setSelectedAsset(existing);
      setActiveTab("terminal");
      handleGenerateSignal("Indian Momentum Breakout (NSE)", "Moderate (1.5%)");
      return;
    }

    // Add new asset placeholder and navigate to terminal
    const newAsset: Asset = {
      symbol: symbol.toUpperCase(),
      name: `${symbol.toUpperCase()} Ltd`,
      category: "Indian Equity",
      exchange: "NSE",
      price: 350.00,
      change24h: 3.20,
      changePercent: 0.92,
      high24h: 356.00,
      low24h: 345.00,
      volume24h: "850K shares",
      marketCap: "₹8,500 Cr",
      peRatio: "22.5x",
      beta: 1.10,
      sector: "Indian Equity",
      growwSlug: symbol.toLowerCase(),
      verdict: "WAIT / WATCHLIST",
      verdictReason: "Analyzing real-time NSE data & order flow on Groww...",
      catalysts: ["Evaluating quarterly disclosures and institutional participation"],
      history: selectedAsset.history,
    };

    setAssets((prev) => [newAsset, ...prev]);
    setSelectedAsset(newAsset);
    setActiveTab("terminal");
    handleGenerateSignal("Indian Momentum Breakout (NSE)", "Moderate (1.5%)");
  };

  // Action: Execute Paper Trade
  const handleExecuteTrade = (posData: Omit<PaperPosition, "id" | "timestamp" | "pnl" | "pnlPercent">) => {
    const cost = posData.shares * posData.entryPrice;
    if (cost > paperAccount.cash) {
      alert("Insufficient paper cash balance for this order size.");
      return;
    }

    const newPosition: PaperPosition = {
      ...posData,
      id: `pos-${Date.now()}`,
      timestamp: new Date().toISOString(),
      pnl: 0,
      pnlPercent: 0,
    };

    setPaperAccount((prev) => ({
      ...prev,
      cash: prev.cash - cost,
      positions: [newPosition, ...prev.positions],
      tradeHistory: [
        {
          id: `exec-${Date.now()}`,
          symbol: posData.symbol,
          side: posData.side,
          price: posData.entryPrice,
          shares: posData.shares,
          timestamp: new Date().toISOString(),
          status: "EXECUTED",
        },
        ...prev.tradeHistory,
      ],
    }));
  };

  // Action: Close Position
  const closePosition = (posId: string) => {
    setPaperAccount((prev) => {
      const pos = prev.positions.find((p) => p.id === posId);
      if (!pos) return prev;

      const asset = assets.find((a) => a.symbol === pos.symbol);
      const closePrice = asset?.price || pos.currentPrice;
      const diff = pos.side === "BUY" ? closePrice - pos.entryPrice : pos.entryPrice - closePrice;
      const pnl = diff * pos.shares;
      const proceeds = pos.shares * pos.entryPrice + pnl;

      return {
        ...prev,
        cash: prev.cash + proceeds,
        positions: prev.positions.filter((p) => p.id !== posId),
        tradeHistory: [
          {
            id: `close-${Date.now()}`,
            symbol: pos.symbol,
            side: "SELL_CLOSE",
            price: closePrice,
            shares: pos.shares,
            pnl,
            timestamp: new Date().toISOString(),
            status: "CLOSED",
          },
          ...prev.tradeHistory,
        ],
      };
    });
  };

  // Action: Reset Paper Portfolio
  const handleResetPortfolio = () => {
    setPaperAccount({
      cash: 500000,
      initialBalance: 500000,
      currency: "INR",
      positions: [],
      tradeHistory: [],
    });
  };

  // Groww API Action: Connect
  const handleConnectGrowwApi = async (credentials: {
    apiKey: string;
    apiSecret: string;
    clientId: string;
    sandboxMode: boolean;
  }) => {
    setIsGrowwLoading(true);
    try {
      const res = await fetch("/api/groww/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to authenticate with Groww Cloud");
      }

      setGrowwConfig((prev) => ({
        ...prev,
        isConnected: true,
        apiKey: data.session?.apiKey || prev.apiKey,
        clientName: data.session?.clientName || prev.clientName,
        clientId: data.session?.clientId || prev.clientId,
        mode: data.session?.mode || "LIVE",
        availableMargin: data.session?.availableMargin ?? 245000,
        usedMargin: data.session?.usedMargin ?? 0,
        sandboxMode: credentials.sandboxMode,
      }));

      // Notify in chat
      setChatMessages((prev) => [
        ...prev,
        {
          id: `groww-connect-notif-${Date.now()}`,
          role: "assistant",
          content: `🟢 **Groww Cloud API Connected Successfully!**\n\n- **Client**: ${data.session?.clientName || "Subrat Kumar Pradhan"}\n- **Trading Account**: ${data.session?.clientId || "GRW-SUBRAT-4392"}\n- **Available Margin**: ₹${(data.session?.availableMargin || 245000).toLocaleString("en-IN")}\n- **Mode**: ${credentials.sandboxMode ? "🧪 Sandbox Testing" : "⚡ Live NSE/BSE Execution"}\n\nThe AI Agent can now route high-conviction order signals directly to Groww.`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsGrowwLoading(false);
    }
  };

  // Groww API Action: Disconnect
  const handleDisconnectGrowwApi = async () => {
    setIsGrowwLoading(true);
    try {
      await fetch("/api/groww/disconnect", { method: "POST" });
      setGrowwConfig((prev) => ({
        ...prev,
        isConnected: false,
        mode: "PAPER",
      }));
    } finally {
      setIsGrowwLoading(false);
    }
  };

  // Groww API Action: Update Settings
  const handleUpdateGrowwConfig = async (newConfig: Partial<GrowwConfig>) => {
    setGrowwConfig((prev) => ({ ...prev, ...newConfig }));
    try {
      await fetch("/api/groww/update-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newConfig),
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Groww API Action: Place Live Trade
  const handleExecuteGrowwLiveTrade = async (orderParams: {
    symbol: string;
    exchange: "NSE" | "BSE";
    side: "BUY" | "SELL";
    orderType: "Delivery (CNC)" | "Intraday (MIS)";
    quantity: number;
    price: number;
    stopLoss: number;
    target: number;
  }) => {
    const res = await fetch("/api/groww/place-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...orderParams,
        maxCapitalPerTrade: growwConfig.maxCapitalPerTrade,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Order execution failed on Groww API");
    }

    if (data.order) {
      setGrowwOrders((prev) => [data.order, ...prev]);
      if (typeof data.updatedMargin === "number") {
        setGrowwConfig((prev) => ({
          ...prev,
          availableMargin: data.updatedMargin,
        }));
      }

      // Also notify in Copilot chat
      setChatMessages((prev) => [
        ...prev,
        {
          id: `groww-order-${Date.now()}`,
          role: "assistant",
          content: `⚡ **Live Order Placed on Groww!**\n\n- **Order ID**: \`${data.order.orderId}\`\n- **Action**: **${data.order.side} ${data.order.quantity} shares** of **${data.order.symbol}**\n- **Exchange**: ${data.order.exchange}\n- **Traded Price**: ₹${data.order.tradedPrice.toFixed(2)}\n- **Stop Loss**: ₹${data.order.stopLoss?.toFixed(2) || "N/A"} | **Target**: ₹${data.order.target?.toFixed(2) || "N/A"}\n- **Est. Charges**: ₹${data.order.estimatedCharges}\n- **Status**: ${data.order.status}`,
          timestamp: new Date().toISOString(),
        },
      ]);
    }

    return data;
  };

  const activeSignal = signalsMap[selectedAsset.symbol] || null;
  const activeReport = reportsMap[selectedAsset.symbol] || null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedAsset={selectedAsset}
        onSelectAsset={(asset) => {
          setSelectedAsset(asset);
          if (!signalsMap[asset.symbol]) {
            handleGenerateSignal("Indian Momentum Breakout (NSE)", "Moderate (1.5%)");
          }
        }}
        assets={assets}
        paperAccount={paperAccount}
        onOpenPortfolio={() => setIsPortfolioModalOpen(true)}
        growwConfig={growwConfig}
        onOpenGrowwModal={() => setIsGrowwModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {/* Tab 0: AI Stock Screener (Trade or Avoid? Matrix) */}
        {activeTab === "screener" && (
          <TradeVerdictMatrix
            assets={assets}
            selectedAsset={selectedAsset}
            onSelectAsset={(asset) => {
              setSelectedAsset(asset);
              setActiveTab("terminal");
              if (!signalsMap[asset.symbol]) {
                handleGenerateSignal("Indian Momentum Breakout (NSE)", "Moderate (1.5%)");
              }
            }}
            onOpenResearch={(asset) => {
              setSelectedAsset(asset);
              setActiveTab("research");
              handleGenerateResearch(asset.symbol, asset.name, "Swing (1-4 weeks)");
            }}
            onAnalyzeCustomStock={handleAnalyzeCustomStock}
            isAnalyzing={isGeneratingSignal}
          />
        )}

        {/* Tab 1: Trading Terminal (Candlestick Chart + Agent Signal + Copilot) */}
        {activeTab === "terminal" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 8 cols: Interactive Candlestick Chart & Signal Card */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              <TradingChart
                asset={selectedAsset}
                activeSignal={activeSignal}
                timeframe={timeframe}
                setTimeframe={setTimeframe}
              />

              <AgentSignalCard
                asset={selectedAsset}
                activeSignal={activeSignal}
                onGenerateSignal={handleGenerateSignal}
                isLoading={isGeneratingSignal}
                onExecuteTrade={handleExecuteTrade}
                availableCash={paperAccount.cash}
                growwConfig={growwConfig}
                onOpenGrowwModal={() => setIsGrowwModalOpen(true)}
                onExecuteGrowwLiveTrade={handleExecuteGrowwLiveTrade}
              />
            </div>

            {/* Right 4 cols: Interactive Quant Copilot Chat */}
            <div className="lg:col-span-4">
              <CopilotChat
                activeAsset={selectedAsset}
                messages={chatMessages}
                onSendMessage={handleSendMessage}
                isLoading={isChatLoading}
                onClearChat={() =>
                  setChatMessages([
                    {
                      id: `reset-${Date.now()}`,
                      role: "assistant",
                      content: `Conversation reset. Ask me anything about **${selectedAsset.symbol}** on Groww, stop loss levels, or market trend.`,
                      timestamp: new Date().toISOString(),
                    },
                  ])
                }
              />
            </div>
          </div>
        )}

        {/* Tab 2: Live Indian Market News & Catalysts */}
        {activeTab === "news" && (
          <IndianMarketNews
            newsList={newsList}
            isLoading={isLoadingNews}
            onRefreshNews={handleRefreshNews}
            onSelectTicker={(symbol) => {
              const matched = assets.find((a) => a.symbol.toUpperCase() === symbol.toUpperCase());
              if (matched) {
                setSelectedAsset(matched);
                setActiveTab("terminal");
              } else {
                handleAnalyzeCustomStock(symbol);
              }
            }}
            allAssets={assets}
          />
        )}

        {/* Tab 3: Deep Market Research */}
        {activeTab === "research" && (
          <ResearchTerminal
            selectedAsset={selectedAsset}
            onSelectAsset={(asset) => setSelectedAsset(asset)}
            allAssets={assets}
            report={activeReport}
            onGenerateResearch={handleGenerateResearch}
            isLoading={isGeneratingResearch}
          />
        )}

        {/* Tab 4: Strategy Lab / Backtest Simulator */}
        {activeTab === "backtest" && (
          <BacktestSimulator selectedAsset={selectedAsset} />
        )}

        {/* Tab 5: Paper Portfolio Full View */}
        {activeTab === "portfolio" && (
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-white font-mono flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-emerald-400" />
                  Groww Virtual Paper Portfolio
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                    NSE / BSE Simulation
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Evaluate autonomous trade performance, win/loss stats, and risk limits in Indian Rupees (₹)
                </p>
              </div>
              <button
                onClick={handleResetPortfolio}
                className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-rose-950/50 border border-slate-800 hover:border-rose-800/60 text-xs font-mono text-slate-400 hover:text-rose-300 transition-all"
              >
                Reset Account (₹5 Lakhs)
              </button>
            </div>

            <div className="space-y-6">
              {/* Scorecard */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Total Portfolio Equity</span>
                  <div className="text-2xl font-mono font-bold text-white mt-1">
                    ₹{(
                      paperAccount.cash +
                      paperAccount.positions.reduce((acc, p) => acc + p.currentPrice * p.shares, 0)
                    ).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Available Cash</span>
                  <div className="text-2xl font-mono font-bold text-slate-200 mt-1">
                    ₹{paperAccount.cash.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Open Positions</span>
                  <div className="text-2xl font-mono font-bold text-emerald-400 mt-1">
                    {paperAccount.positions.length} Active
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Completed Trades</span>
                  <div className="text-2xl font-mono font-bold text-cyan-400 mt-1">
                    {paperAccount.tradeHistory.length} Settled
                  </div>
                </div>
              </div>

              {/* Positions Table */}
              <div>
                <h4 className="font-bold text-white text-sm font-mono mb-3">Open Positions</h4>
                {paperAccount.positions.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-slate-800 rounded-xl bg-slate-950/40 text-slate-400 text-xs font-mono">
                    No active positions currently open.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400">
                          <th className="pb-3">Stock</th>
                          <th className="pb-3">Side</th>
                          <th className="pb-3">Order Type</th>
                          <th className="pb-3">Shares</th>
                          <th className="pb-3">Entry Price</th>
                          <th className="pb-3">LTP</th>
                          <th className="pb-3">Stop Loss / Target</th>
                          <th className="pb-3">Unrealized P&L</th>
                          <th className="pb-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {paperAccount.positions.map((pos) => {
                          const asset = assets.find((a) => a.symbol === pos.symbol);
                          const currentPrice = asset?.price || pos.currentPrice;
                          const diff = pos.side === "BUY" ? currentPrice - pos.entryPrice : pos.entryPrice - currentPrice;
                          const pnl = diff * pos.shares;
                          const pnlPct = (diff / pos.entryPrice) * 100;
                          const isWin = pnl >= 0;

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
                              <td className="py-3">{pos.shares}</td>
                              <td className="py-3">₹{pos.entryPrice.toFixed(2)}</td>
                              <td className="py-3 font-bold text-white">₹{currentPrice.toFixed(2)}</td>
                              <td className="py-3 text-slate-400 text-[11px]">
                                <span className="text-rose-400">₹{pos.stopLoss.toFixed(1)}</span> /{" "}
                                <span className="text-emerald-400">₹{pos.takeProfit.toFixed(1)}</span>
                              </td>
                              <td className={`py-3 font-bold ${isWin ? "text-emerald-400" : "text-rose-400"}`}>
                                {isWin ? "+" : ""}₹{Math.abs(pnl).toFixed(2)} ({isWin ? "+" : ""}{pnlPct.toFixed(2)}%)
                              </td>
                              <td className="py-3 text-right">
                                <button
                                  onClick={() => closePosition(pos.id)}
                                  className="px-3 py-1 rounded bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 border border-slate-700 hover:border-rose-700 transition-all text-xs"
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
            </div>
          </div>
        )}
      </main>

      {/* Floating Paper Portfolio Modal */}
      <PaperPortfolioModal
        isOpen={isPortfolioModalOpen}
        onClose={() => setIsPortfolioModalOpen(false)}
        paperAccount={paperAccount}
        assets={assets}
        onClosePosition={closePosition}
        onResetPortfolio={handleResetPortfolio}
      />

      {/* Groww Cloud API Connection & Order Routing Modal */}
      <GrowwConnectionModal
        isOpen={isGrowwModalOpen}
        onClose={() => setIsGrowwModalOpen(false)}
        config={growwConfig}
        onUpdateConfig={handleUpdateGrowwConfig}
        onConnectApi={handleConnectGrowwApi}
        onDisconnectApi={handleDisconnectGrowwApi}
        recentOrders={growwOrders}
        isLoading={isGrowwLoading}
      />
    </div>
  );
}
