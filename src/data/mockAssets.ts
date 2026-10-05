import { Asset, Candle, MarketNewsItem } from "../types";

// Helper to generate realistic historical OHLCV candlestick data for Indian equities
function generateHistoricalCandles(basePrice: number, volatility: number, trendBias: number, count: number = 42): Candle[] {
  const candles: Candle[] = [];
  let currentClose = basePrice * (1 - trendBias * count * 0.0035);
  const now = new Date();

  const prices: number[] = [];

  for (let i = count; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });

    // Random walk with trend
    const change = (Math.random() - 0.48 + trendBias * 0.16) * volatility * currentClose;
    const open = currentClose;
    currentClose = Math.max(1, open + change);
    const high = Math.max(open, currentClose) + Math.random() * volatility * currentClose * 0.65;
    const low = Math.min(open, currentClose) - Math.random() * volatility * currentClose * 0.65;
    const volume = Math.floor((Math.random() * 1.8 + 0.5) * 1500000);

    prices.push(currentClose);

    // Calculate SMA 20
    let sma20: number | undefined = undefined;
    if (prices.length >= 20) {
      const slice = prices.slice(prices.length - 20);
      sma20 = Number((slice.reduce((a, b) => a + b, 0) / 20).toFixed(2));
    }

    // Calculate EMA 50
    let ema50: number | undefined = undefined;
    if (prices.length >= 10) {
      const k = 2 / (Math.min(prices.length, 50) + 1);
      ema50 = Number((currentClose * k + (candles[candles.length - 1]?.ema50 ?? currentClose) * (1 - k)).toFixed(2));
    }

    // Calculate RSI 14
    let rsi: number | undefined = undefined;
    if (prices.length >= 15) {
      let gains = 0;
      let losses = 0;
      for (let j = prices.length - 14; j < prices.length; j++) {
        const diff = prices[j] - prices[j - 1];
        if (diff >= 0) gains += diff;
        else losses += Math.abs(diff);
      }
      const avgGain = gains / 14;
      const avgLoss = Math.max(0.0001, losses / 14);
      const rs = avgGain / avgLoss;
      rsi = Number((100 - (100 / (1 + rs))).toFixed(1));
    }

    candles.push({
      time: dateStr,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(currentClose.toFixed(2)),
      volume,
      sma20,
      ema50,
      rsi: rsi || 54,
    });
  }

  return candles;
}

export const INDIAN_MARKET_ASSETS: Asset[] = [
  // Large Caps (Nifty 50)
  {
    symbol: "RELIANCE",
    name: "Reliance Industries Ltd",
    category: "Large Cap (Nifty 50)",
    exchange: "NSE",
    price: 2984.50,
    change24h: 38.20,
    changePercent: 1.30,
    high24h: 3012.00,
    low24h: 2955.10,
    volume24h: "6.8M shares",
    marketCap: "₹20.19 Lakh Cr",
    peRatio: "28.4x",
    beta: 0.88,
    sector: "Energy, Jio Telecom & Retail",
    growwSlug: "reliance-industries-ltd",
    verdict: "TRADE (HIGH CONVICTION)",
    verdictReason: "Jio tariff hike translating to strong ARPU growth + retail EBITDA expansion. Holding firmly above 20-day SMA.",
    catalysts: [
      "Telecom ARPU rising from ₹181 to ₹205+ across FY25",
      "Green energy giga-factory commercialization on track",
      "DII net buying in large cap index heavyweights"
    ],
    riskFlags: ["Global crude refining crack spreads volatility"],
    history: generateHistoricalCandles(2984.50, 0.016, 0.12, 40),
  },
  {
    symbol: "TATAMOTORS",
    name: "Tata Motors Ltd",
    category: "Large Cap (Nifty 50)",
    exchange: "NSE",
    price: 986.75,
    change24h: 18.40,
    changePercent: 1.90,
    high24h: 998.50,
    low24h: 971.00,
    volume24h: "14.2M shares",
    marketCap: "₹3.62 Lakh Cr",
    peRatio: "11.2x",
    beta: 1.45,
    sector: "Automotive, EV & JLR",
    growwSlug: "tata-motors-ltd",
    verdict: "TRADE (HIGH CONVICTION)",
    verdictReason: "JLR debt-free milestone in sight + India EV leadership (>70% passenger EV market share). Clean breakout setup.",
    catalysts: [
      "Strong order backlog for Range Rover and Defender",
      "Demerger into Commercial Vehicles & Passenger Vehicles unlocking value",
      "Robust free cash flow generation"
    ],
    riskFlags: ["European macro softness impacting luxury auto shipments"],
    history: generateHistoricalCandles(986.75, 0.025, 0.15, 40),
  },
  {
    symbol: "HDFCBANK",
    name: "HDFC Bank Ltd",
    category: "Large Cap (Nifty 50)",
    exchange: "NSE",
    price: 1648.20,
    change24h: 12.60,
    changePercent: 0.77,
    high24h: 1658.00,
    low24h: 1634.50,
    volume24h: "18.5M shares",
    marketCap: "₹12.54 Lakh Cr",
    peRatio: "18.9x",
    beta: 0.95,
    sector: "Private Banking & Financials",
    growwSlug: "hdfc-bank-ltd",
    verdict: "WAIT / WATCHLIST",
    verdictReason: "Post-merger loan-to-deposit ratio (LDR) normalization ongoing. Good long-term value, but wait for volume breakout above ₹1,680.",
    catalysts: [
      "MSCI weight increase driving foreign portfolio inflows",
      "Deposit growth outpacing credit growth to restore liquidity buffers"
    ],
    riskFlags: ["Net Interest Margin (NIM) compression in high interest rate environment"],
    history: generateHistoricalCandles(1648.20, 0.014, 0.04, 40),
  },
  {
    symbol: "INFY",
    name: "Infosys Ltd",
    category: "Large Cap (Nifty 50)",
    exchange: "NSE",
    price: 1912.40,
    change24h: -14.20,
    changePercent: -0.74,
    high24h: 1938.00,
    low24h: 1902.00,
    volume24h: "5.4M shares",
    marketCap: "₹7.94 Lakh Cr",
    peRatio: "29.8x",
    beta: 0.92,
    sector: "IT Services & Cloud Consulting",
    growwSlug: "infosys-ltd",
    verdict: "WAIT / WATCHLIST",
    verdictReason: "Consolidating in a tight ₹1,880 - ₹1,950 range. US Federal Reserve rate decisions will dictate discretionary tech spend.",
    catalysts: ["Large enterprise generative AI deal wins", "BFSI sector tech spend recovery"],
    riskFlags: ["Stretched valuation multiples compared to historical 5-year average"],
    history: generateHistoricalCandles(1912.40, 0.016, 0.03, 40),
  },

  // Mid Cap Growth
  {
    symbol: "TRENT",
    name: "Trent Ltd (Tata Retail)",
    category: "Mid Cap Growth",
    exchange: "NSE",
    price: 7240.00,
    change24h: 215.00,
    changePercent: 3.06,
    high24h: 7320.00,
    low24h: 7080.00,
    volume24h: "1.2M shares",
    marketCap: "₹2.57 Lakh Cr",
    peRatio: "142.5x",
    beta: 1.32,
    sector: "Fashion Retail (Zudio & Westside)",
    growwSlug: "trent-ltd",
    verdict: "TRADE (HIGH CONVICTION)",
    verdictReason: "Phenomenal Zudio store expansion delivering 45%+ revenue growth. Pure momentum market darling with zero promoter pledge.",
    catalysts: [
      "Zudio international expansion (Dubai pilot) + 200 new stores annually",
      "Star Bazaar grocery business turning EBITDA positive"
    ],
    riskFlags: ["High valuation multiple (140x+ P/E) requires flawless quarterly execution"],
    history: generateHistoricalCandles(7240.00, 0.032, 0.22, 40),
  },
  {
    symbol: "DIXON",
    name: "Dixon Technologies Ltd",
    category: "Mid Cap Growth",
    exchange: "NSE",
    price: 13420.00,
    change24h: 340.00,
    changePercent: 2.60,
    high24h: 13580.00,
    low24h: 13150.00,
    volume24h: "680K shares",
    marketCap: "₹80.4K Cr",
    peRatio: "98.2x",
    beta: 1.55,
    sector: "Electronics Manufacturing Services (EMS)",
    growwSlug: "dixon-technologies-india-ltd",
    verdict: "TRADE (HIGH CONVICTION)",
    verdictReason: "Huge beneficiary of Indian Government PLI scheme + smartphone contract wins (Xiaomi, Motorola, Transsion). Strong uptrend.",
    catalysts: [
      "IT hardware and display module assembly ramp-up",
      "Component localization boosting operating margins"
    ],
    riskFlags: ["Working capital intensity and client concentration risks"],
    history: generateHistoricalCandles(13420.00, 0.036, 0.20, 40),
  },
  {
    symbol: "POLYCAB",
    name: "Polycab India Ltd",
    category: "Mid Cap Growth",
    exchange: "NSE",
    price: 6890.00,
    change24h: -85.00,
    changePercent: -1.22,
    high24h: 7040.00,
    low24h: 6850.00,
    volume24h: "890K shares",
    marketCap: "₹1.03 Lakh Cr",
    peRatio: "52.4x",
    beta: 1.10,
    sector: "Wires, Cables & Fast Moving Electrical Goods",
    growwSlug: "polycab-india-ltd",
    verdict: "WAIT / WATCHLIST",
    verdictReason: "Strong infra tailwind, but currently consolidating near ₹7,000 psychological resistance. Look for dip to 50 EMA (₹6,750).",
    catalysts: ["Real estate and renewable grid infra demand surge", "Export revenue scaling in US & Europe"],
    riskFlags: ["Fluctuations in global copper and aluminum commodity prices"],
    history: generateHistoricalCandles(6890.00, 0.022, 0.06, 40),
  },

  // Small Cap Momentum & Turnarounds
  {
    symbol: "SUZLON",
    name: "Suzlon Energy Ltd",
    category: "Small Cap Momentum",
    exchange: "NSE",
    price: 76.85,
    change24h: 3.65,
    changePercent: 4.99,
    high24h: 76.85,
    low24h: 73.50,
    volume24h: "85.4M shares",
    marketCap: "₹1.04 Lakh Cr",
    peRatio: "68.5x",
    beta: 2.15,
    sector: "Wind Energy & Renewable Infrastructure",
    growwSlug: "suzlon-energy-ltd",
    verdict: "TRADE (HIGH CONVICTION)",
    verdictReason: "Complete turnaround from debt-laden to net-cash balance sheet. Massive order book (>5.0 GW) under India's 500GW clean energy mandate.",
    catalysts: [
      "Over 5 GW confirmed order book spanning NTPC, Adani, and private C&I players",
      "Net debt reduced to zero; credit rating upgraded to A+",
      "High retail & HNI liquidity on Groww"
    ],
    riskFlags: ["High retail float can cause sharp intraday swings and circuit locks"],
    history: generateHistoricalCandles(76.85, 0.048, 0.28, 40),
  },
  {
    symbol: "CDSL",
    name: "Central Depository Services Ltd",
    category: "Small Cap Momentum",
    exchange: "NSE",
    price: 1485.00,
    change24h: 28.50,
    changePercent: 1.96,
    high24h: 1510.00,
    low24h: 1462.00,
    volume24h: "4.8M shares",
    marketCap: "₹31.0K Cr",
    peRatio: "58.4x",
    beta: 1.28,
    sector: "Capital Markets Infrastructure",
    growwSlug: "central-depository-services-india-ltd",
    verdict: "TRADE (HIGH CONVICTION)",
    verdictReason: "Direct play on financialization of Indian household savings. >13 Crore active demat accounts with 65%+ market share. Debt-free monopoly moat.",
    catalysts: [
      "IPO frenzy in Indian market boosting transaction charges and corporate fees",
      "Monthly SIP inflows touching record ₹23,000+ Crore",
      "Recent 1:1 bonus share issue enhancing retail liquidity"
    ],
    riskFlags: ["SEBI regulatory changes regarding transaction charges and unbundling"],
    history: generateHistoricalCandles(1485.00, 0.028, 0.16, 40),
  },
  {
    symbol: "PENNY-TRAP",
    name: "Vikas Hyper-Growth Ltd (Speculative Example)",
    category: "Small Cap Momentum",
    exchange: "BSE",
    price: 18.40,
    change24h: -0.95,
    changePercent: -4.91,
    high24h: 19.30,
    low24h: 18.40,
    volume24h: "1.2M shares",
    marketCap: "₹340 Cr",
    peRatio: "185.0x",
    beta: 2.85,
    sector: "Speculative Micro-cap",
    growwSlug: "vikas-hyper",
    verdict: "AVOID (HIGH RISK)",
    verdictReason: "AVOID THIS STOCK! High promoter pledge (68%), frequent lower circuit freezes, negative free cash flow, and regulatory scrutiny on social media pump-and-dump.",
    catalysts: ["Social media hype without verified order book or audited cash flow"],
    riskFlags: [
      "Promoter pledge at alarming 68%",
      "Under SEBI Short-Term ASM surveillance list",
      "Liquidity risk: Potential to get locked in daily lower circuits (no exit possible)"
    ],
    history: generateHistoricalCandles(18.40, 0.052, -0.22, 40),
  },

  // Indian Indices
  {
    symbol: "NIFTY 50",
    name: "Nifty 50 Index (NSE)",
    category: "Indian Indices",
    exchange: "NSE",
    price: 25145.00,
    change24h: 185.00,
    changePercent: 0.74,
    high24h: 25210.00,
    low24h: 24980.00,
    volume24h: "320M total",
    marketCap: "₹450 Lakh Cr",
    peRatio: "22.8x",
    beta: 1.00,
    sector: "Indian Macro Benchmark",
    growwSlug: "indices/nifty",
    verdict: "TRADE (HIGH CONVICTION)",
    verdictReason: "Sustaining firmly above the 25,000 psychological threshold. India's 7%+ GDP growth trajectory continues to attract domestic SIP liquidity.",
    catalysts: [
      "Robust DII SIP inflows cushioning any foreign FII outflows",
      "Corporate earnings growth running at 14-16% CAGR"
    ],
    riskFlags: ["Crude oil price shocks and US Dollar Index (DXY) spikes"],
    history: generateHistoricalCandles(25145.00, 0.009, 0.10, 40),
  },
  {
    symbol: "BANK NIFTY",
    name: "Nifty Bank Index (NSE)",
    category: "Indian Indices",
    exchange: "NSE",
    price: 51820.00,
    change24h: 420.00,
    changePercent: 0.82,
    high24h: 52100.00,
    low24h: 51450.00,
    volume24h: "140M total",
    marketCap: "₹180 Lakh Cr",
    peRatio: "16.4x",
    beta: 1.25,
    sector: "Indian Banking & Credit",
    growwSlug: "indices/bank-nifty",
    verdict: "TRADE (HIGH CONVICTION)",
    verdictReason: "Attractive valuation (16.4x P/E) vs historical average of 18.5x. Lowest NPA levels in a decade across public and private Indian lenders.",
    catalysts: [
      "Strong credit growth (~14% YoY) driven by retail loans and corporate capex",
      "Gross NPAs at historic lows under 3%"
    ],
    riskFlags: ["High interest rates constraining credit off-take in SME sectors"],
    history: generateHistoricalCandles(51820.00, 0.013, 0.08, 40),
  }
];

export const INITIAL_INDIAN_NEWS: MarketNewsItem[] = [
  {
    id: "news-1",
    title: "RBI Monetary Policy Committee Maintains Repo Rate at 6.50%; Stance Retained on Inflation Vigil",
    source: "Moneycontrol",
    timeAgo: "2 hours ago",
    category: "Macro / RBI",
    sentiment: "Bullish",
    relatedSymbol: "BANK NIFTY",
    summary: "Governor highlights resilient domestic economic momentum with FY25 GDP projected at 7.2%. Banks well-capitalized with sound asset quality.",
  },
  {
    id: "news-2",
    title: "Suzlon Energy Bags 1,166 MW Order From NTPC Green Energy; Largest Wind Order in Indian History",
    source: "Economic Times",
    timeAgo: "3 hours ago",
    category: "Order Win",
    sentiment: "Bullish",
    relatedSymbol: "SUZLON",
    summary: "Suzlon will install 370 wind turbine generators with hybrid lattice tubular towers in Gujarat, taking active order book past 5.0 GW.",
  },
  {
    id: "news-3",
    title: "Tata Motors Commercial Vehicle Demerger Receives NCLT Clearance; Stock Up 2%",
    source: "Livemint",
    timeAgo: "4 hours ago",
    category: "Corporate",
    sentiment: "Bullish",
    relatedSymbol: "TATAMOTORS",
    summary: "Scheme of arrangement separates commercial vehicles and passenger electric vehicle units, unlocking standalone peer valuations on Groww.",
  },
  {
    id: "news-4",
    title: "CDSL Crosses 13.5 Crore Active Demat Accounts as Retail Participation on Groww & Zerodha Explodes",
    source: "CNBC-TV18",
    timeAgo: "6 hours ago",
    category: "Earnings",
    sentiment: "Bullish",
    relatedSymbol: "CDSL",
    summary: "Monthly demat additions averaged over 35 lakh accounts in recent months, providing structural annuity revenues to the depository.",
  },
  {
    id: "news-5",
    title: "SEBI Tightens Equity F&O Surveillance: Increases Minimum Contract Size to ₹15 Lakh to Curb Retail Losses",
    source: "Economic Times",
    timeAgo: "8 hours ago",
    category: "Regulatory",
    sentiment: "Neutral",
    relatedSymbol: "NIFTY 50",
    summary: "New framework emphasizes cash delivery equity investments over leveraged weekly options, boosting retail stock holding on brokerages like Groww.",
  },
  {
    id: "news-6",
    title: "Warning on Micro-cap Speculative Traps: SEBI Places 24 Penny Counters on Stage-2 Surveillance",
    source: "Business Standard",
    timeAgo: "10 hours ago",
    category: "Regulatory",
    sentiment: "Bearish",
    relatedSymbol: "PENNY-TRAP",
    summary: "Investors advised to avoid unverified micro-caps with high promoter pledge or continuous 5% lower circuit locks where exits are impossible.",
  }
];

export const INITIAL_ASSETS: Asset[] = INDIAN_MARKET_ASSETS;
