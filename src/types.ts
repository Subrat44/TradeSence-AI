export type AssetClass = 
  | "Large Cap (Nifty 50)" 
  | "Mid Cap Growth" 
  | "Small Cap Momentum" 
  | "Indian Indices"
  | "Indian Equity";

export type MarketCapTier = "Large Cap" | "Mid Cap" | "Small Cap" | "Micro Cap" | "Indices";

export type TradeVerdict = "TRADE (HIGH CONVICTION)" | "AVOID (HIGH RISK)" | "WAIT / WATCHLIST";

export interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  sma20?: number;
  ema50?: number;
  rsi?: number;
}

export interface Asset {
  symbol: string;
  name: string;
  category: AssetClass;
  marketCapTier?: MarketCapTier;
  price: number;
  change24h: number;
  changePercent: number;
  high24h: number;
  low24h: number;
  volume24h: string;
  marketCap: string;
  peRatio?: string;
  beta?: number;
  sector?: string;
  exchange: "NSE" | "BSE";
  growwSlug?: string;
  verdict: TradeVerdict;
  verdictReason: string;
  promoterPledgePercent?: number;
  sebiSurveillanceStage?: string;
  promoterPledge?: string;
  sebiSurveillance?: string;
  catalysts?: string[];
  riskFlags?: string[];
  history: Candle[];
}

export type AgentPersona = 
  | "Indian Momentum Breakout (NSE)"
  | "Mean Reversion Quantitative"
  | "FII/DII Flow & Swing"
  | "Value & Fundamentals (Groww)";

export interface TradeSignal {
  action: "BUY" | "STRONG BUY" | "HOLD" | "SELL" | "SHORT" | "AVOID";
  verdict: TradeVerdict;
  confidence: number;
  timeframe: string;
  entryZone: { min: number; max: number };
  stopLoss: number;
  takeProfit1: number;
  takeProfit2: number;
  riskRewardRatio: string;
  suggestedShares: number;
  positionValue: number;
  orderType: "Delivery (CNC)" | "Intraday (MIS)";
  primaryReason: string;
  whyTradeOrAvoid: string;
  technicalSignals: string[];
  invalidationCriteria: string;
  growwUrl?: string;
}

export interface ResearchReport {
  ticker: string;
  companyName: string;
  verdict: TradeVerdict;
  report: string;
  sources: { title: string; url: string }[];
  timestamp: string;
}

export interface MarketNewsItem {
  id: string;
  title: string;
  source: string;
  timeAgo: string;
  category: "Earnings" | "Macro / RBI" | "Order Win" | "FII/DII" | "Regulatory" | "Corporate";
  sentiment: "Bullish" | "Bearish" | "Neutral";
  relatedSymbol?: string;
  summary: string;
  url?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  citations?: { title: string; url: string }[];
}

export interface PaperPosition {
  id: string;
  symbol: string;
  assetName: string;
  side: "BUY" | "SHORT";
  orderType: "Delivery (CNC)" | "Intraday (MIS)";
  entryPrice: number;
  currentPrice: number;
  shares: number;
  stopLoss: number;
  takeProfit: number;
  timestamp: string;
  pnl: number;
  pnlPercent: number;
  growwSlug?: string;
}

export interface PaperAccount {
  cash: number;
  initialBalance: number;
  currency?: "INR" | "USD";
  positions: PaperPosition[];
  tradeHistory: {
    id: string;
    symbol: string;
    side: "BUY" | "SHORT" | "SELL_CLOSE";
    price: number;
    shares: number;
    pnl?: number;
    timestamp: string;
    status: "CLOSED" | "EXECUTED";
  }[];
}

export interface BacktestResult {
  strategyName: string;
  totalTrades: number;
  winRate: number;
  profitFactor: number;
  netReturnPercent: number;
  maxDrawdown: number;
  sharpeRatio: number;
  avgWinPercent: number;
  avgLossPercent: number;
  equityCurve: { date: string; equity: number }[];
}

export interface GrowwConfig {
  isConnected: boolean;
  apiKey?: string;
  apiSecret?: string;
  clientId?: string;
  clientName?: string;
  mode: "PAPER" | "LIVE";
  executionMode: "SEMI_AUTO" | "FULL_AUTO";
  maxCapitalPerTrade: number;
  dailyLossLimitPercent: number;
  availableMargin: number;
  usedMargin: number;
  lastConnectedAt?: string;
  sandboxMode?: boolean;
}

export interface GrowwOrder {
  orderId: string;
  symbol: string;
  side: "BUY" | "SELL";
  orderType: "Delivery (CNC)" | "Intraday (MIS)";
  quantity: number;
  price: number;
  status: "SUBMITTED" | "PENDING" | "EXECUTED" | "REJECTED" | "CANCELLED";
  stopLoss?: number;
  target?: number;
  timestamp: string;
  exchange: "NSE" | "BSE";
  growwResponse?: string;
}
