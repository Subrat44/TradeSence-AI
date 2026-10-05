# TradeSense India AI 🇮🇳📈
### Autonomous Trading Agent & Institutional Equity Research Terminal for the Indian Stock Market (NSE / BSE) & Groww

TradeSense India AI is a full-stack algorithmic equity research and execution platform engineered specifically for the Indian financial markets. Built with React 19, TypeScript, Tailwind CSS v4, and Node.js Express, TradeSense pairs institutional multi-factor quantitative modeling with real-time Google Search-grounded Gemini intelligence to deliver definitive **TRADE vs. AVOID** verdicts, technical breakout levels, and direct order execution on **Groww**.

---

## 🚀 Key Features

### 1. 🟢 Trade vs. 🔴 Avoid Decision Engine
- Evaluates NSE/BSE stocks with strict institutional criteria.
- Answers the single most critical trader question: **"Should I trade this stock or avoid it right now?"**
- Generates transparent conviction scores (1–10), entry zones, invalidation criteria, and risk-reward ratios in Indian Rupees (₹).

### 2. 🔍 Grounded Institutional Equity Research
- Deep quarterly earnings analysis (EBITDA margins, PAT growth, forward guidance).
- Corporate actions, bulk/block deals, promoter holding, and promoter pledge audit (SEBI red-flag checks).
- Macro catalysts: PLI schemes, defense procurement, railway capex, and budget tailwinds.
- Real-time institutional flow tracking (FII & DII net cash/derivative activity).

### 3. 📊 Technical & Quant Indicator Suite
- Computes 20-day Simple Moving Average (SMA), 50-day Exponential Moving Average (EMA), and 200-day long-term trend alignment.
- RSI-14 momentum analysis, daily volatility bands, support/resistance clusters.
- Automatic position sizing and risk management based on user portfolio capital in INR (₹).

### 4. 🇮🇳 Groww Cloud API & SEBI Compliance Gateway
- Seamless live and paper trading directly connected to Groww.
- **SEBI-Compliant Static IP Whitelisting**: Outbound routing through authorized static IP addresses (`34.34.244.34`).
- **OAuth Callback Authorization**: Secure automated endpoint (`/api/groww/callback`) for receiving SEBI daily session tokens.
- **RFC 6238 TOTP Engine**: Automated daily two-factor authentication token renewal without manual copy-paste friction.

### 5. ⚡ Live Market Screener & Copilot
- Curated coverage across Nifty 50, Nifty Next 50, Nifty Midcap 150, and high-beta Smallcaps.
- Real-time conversational AI copilot equipped with live market search and technical context.
- Paper trading margin simulator with full order lifecycle (PENDING, EXECUTED, CANCELLED).

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS v4](https://tailwindcss.com/), [Motion](https://motion.dev/), [Lucide React](https://lucide.dev/)
- **Backend**: [Node.js 22](https://nodejs.org/), [Express](https://expressjs.com/), [@google/genai SDK](https://www.npmjs.com/package/@google/genai)
- **Build System**: [Vite 6](https://vitejs.dev/) with Express middleware mode in development and static serving in production
- **AI Engine**: Google Gemini Models (`gemini-2.5-flash`, `gemini-3.8-flash`) with Google Search Grounding for real-time market data

```
tradesense-ai/
├── src/
│   ├── components/
│   │   ├── Agent/         # Autonomous trading agent controls & execution modes
│   │   ├── Chart/         # Technical candlestick charts & overlay indicators
│   │   ├── Copilot/       # Conversational AI assistant for real-time market analysis
│   │   ├── Groww/         # Groww live connection panel & SEBI callback status
│   │   ├── News/          # Live NSE/BSE announcements & sector catalysts
│   │   ├── Portfolio/     # Open positions, order book & P&L tracking (₹)
│   │   ├── Research/      # Grounded institutional equity research reports
│   │   ├── Screener/      # Multi-cap Indian equity screener with signals
│   │   └── Strategy/      # Quantitative parameter builder & backtesting
│   ├── data/              # Indian stock universes (Nifty 50, Midcaps, Smallcaps)
│   ├── App.tsx            # Main application layout & state coordinator
│   ├── main.tsx           # React DOM client entry point
│   └── types.ts           # Strict TypeScript interfaces for Indian equities & orders
├── server.ts              # Full-stack Express server + Gemini proxy + Groww Gateway
├── vite.config.ts         # Vite bundler & Tailwind CSS configuration
├── package.json           # Dependencies, scripts, and build tasks
├── .gitignore             # Hardened security rules (blocks all secrets & keys)
└── .env.example           # Public environment variable template (no credentials)
```

---

## 🔒 Security & Privacy Architecture

Security is paramount when developing trading and financial software:

1. **Zero Secret Leakage**:
   - All Groww API keys, secrets, session tokens, and Gemini API keys reside strictly on the server-side.
   - The React frontend client **never** receives or stores raw secrets.
2. **Hardened Git Ignore**:
   - The `.gitignore` file strictly blocks all `.env`, `.env.*`, `*credentials*.json`, `*secret*`, `*token*.json`, `*.pem`, `*.key`, and `totp_secret*` files.
   - Anyone viewing your GitHub repository will only see source code and `.env.example`.
3. **SEBI IP Gating**:
   - API calls to Groww are routed through dedicated whitelisted static IPs to satisfy broker exchange compliance.

---

## 📦 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v20.x or v22.x recommended)
- [npm](https://www.npmjs.com/) (v9.x or later)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/<YOUR_USERNAME>/<YOUR_REPOSITORY>.git
   cd <YOUR_REPOSITORY>
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy the example environment template:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and fill in your keys:
   ```env
   # Required: Google Gemini API Key
   GEMINI_API_KEY=your_gemini_api_key_here

   # Application Host URL (e.g., http://localhost:3000)
   APP_URL=http://localhost:3000

   # Optional: Groww Cloud API Credentials (from cloud.groww.in)
   GROWW_API_KEY=your_groww_api_key
   GROWW_API_SECRET=your_groww_api_secret
   ```

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:3000`.

5. **Build for Production**:
   ```bash
   npm run build
   npm start
   ```

---

## ⚙️ Groww Cloud API Setup Guide

To connect TradeSense to your Groww trading account:
1. Log in to [Groww Cloud Developer Console](https://cloud.groww.in).
2. Create an App and configure:
   - **Allowed Static IP**: Add your server's static IP (e.g. `34.34.244.34`).
   - **Redirect / Callback URL**: Set to `https://<YOUR_APP_URL>/api/groww/callback`.
3. Copy your **API Key** and **API Secret** into the TradeSense Groww Connection modal or your server `.env`.
4. Initiate authorization to receive the daily SEBI trading token.

---

## ⚖️ Disclaimer

*TradeSense India AI is an algorithmic research and execution interface designed for educational and decision-support purposes. It does not provide SEBI-registered investment advice. Stock and derivative trading in the Indian market involves financial risk. Users are advised to conduct independent research and consult a SEBI-registered financial advisor before placing capital at risk.*

---

## 📄 License
MIT License. Free for personal and commercial development.
