# TradeSense India AI — Dual-Direction (Bull & Bear) Trading, Custom Price & Wallet-Based Quantity Plan

## 1. Product Overview & Goals
- **Dual-Direction Trading (Bullish & Bearish + Stop-Loss)**: Support both **Bullish (Long / BUY — Upper-Side)** and **Bearish (Short / SELL — Down-Market)** trade setups and executions, complete with configurable **Stop-Loss (`SL`)** and **Target (`TP1` / `TP2`)** levels for both directions.
- **Custom Trade Price & User Trade Idea Inputs (No Forced Defaults)**: Allow users to input their own custom entry/trade price (`₹`), custom Stop-Loss (`₹`), and custom Target (`₹`) without locking them into a pre-filled default price, while also providing a 1-click option to sync from the live market price or AI suggestion.
- **Custom Wallet Budget & Quantity Range (No High-Budget Fixed Lots)**: Replace the high-budget default lot/share sizing with a **User Wallet / Trade Budget (`₹`)** input and **Custom Quantity Range (`1` share up to max wallet capacity)**. Users can type their own budget (e.g., `₹500`, `₹2,000`, `₹10,000`) or custom share count, and the chart + setup dynamically compute the exact affordable share range, required margin, risk at Stop-Loss, and reward at Target.

## 2. Aesthetic Direction & Domain Exemplars
- **Primary Category**: `data_analytics_apps` / `trading_terminal_saas`
- **Design Paradigm**: P4 Atmospheric Minimalism & High-Craft Dark UI blended with P2 Neo-Brutalist Swiss Grids for dense financial precision.
- **Domain Exemplars**: TradingView Long/Short Position Tool, Groww Intraday & Delivery Order Terminal, and Koyfin Analytics.

## 3. Color Palette & Typography
- **Surface Palette**:
  - Primary Canvas: `#020617` (Slate 950)
  - Elevated Terminal & Order Setup Panel: `#0F172A` (Slate 900) with `#1E293B` (Slate 800) 1px borders
- **Text Hierarchy**:
  - Primary Text & Input Numerals: `#F8FAFC` (Slate 50)
  - Secondary Labels: `#94A3B8` (Slate 400)
- **Accent & Semantic Tokens**:
  - Bullish (Long / BUY) Accent: `#10B981` (Emerald 500)
  - Bearish (Short / SELL Down-Market) Accent: `#F43F5E` (Rose 500)
  - Custom Entry / Wallet Budget Focus Ring: `#06B6D4` (Cyan 500)
  - Stop-Loss Protection Token: `#FB7185` (Rose 400)
- **Typography & Scannability**:
  - All currency inputs (`₹`), share quantities, Stop-Loss levels, and target P&L metrics strictly use `font-mono tabular-nums`.

## 4. Layout, Spatial Architecture & Focal Point Design
- **Interactive Trade Builder & Wallet Sizer Panel (Inside Terminal & Chart Setup)**:
  - **Direction Toggle**: Prominent **Bullish (BUY / Upside)** vs **Bearish (SELL / Down-Market Short)** selector so users can trade either market direction or let the AI detect bullish/bearish setups.
  - **Custom Wallet Budget & Quantity Range Controls**:
    - **My Trade Budget / Wallet (`₹`)**: Blank by default so users enter their exact budget (e.g. `₹1,000`, `₹5,000`, `₹20,000`) instead of a massive ₹5 Lakh default lot.
    - **Custom Share Quantity & Range Slider**: Shows the affordable range (`1 share` to `Max Wallet Shares = floor(Budget ÷ Effective Price)`), allowing the user to type any exact quantity or slide across their budget range.
  - **Custom Price, Stop-Loss & Target Idea Inputs**:
    - **Custom Entry Price (`₹`)**: Blank by default (`placeholder="Enter custom price (₹)..."`) with a quick `Use LTP` button.
    - **Custom Stop-Loss (`₹`) & Target (`₹`)**: Editable inputs that automatically flip geometry based on direction:
      - *Bullish (BUY)*: `Stop-Loss < Entry Price < Target 1 < Target 2`
      - *Bearish (SELL / Short)*: `Stop-Loss > Entry Price > Target 1 > Target 2`
- **Dual-Direction TradingChart Overlay**:
  - Plots the active **Entry Price**, **Stop-Loss (`SL`)**, and **Target (`TP1` / `TP2`)** lines on the candlestick chart for both Bullish and Bearish setups, displaying exact `₹ Risk` and `₹ Profit` based on the user's entered budget/quantity.

## 5. Core Functional Flows & State Completeness
1. **Custom Price & Wallet-Driven Setup (No High-Budget Default Quantity)**:
   - Opening **Chart & Setup** does not force a high-budget share lot. Users can input their **Budget (`₹`)** or **Custom Quantity**, and **Custom Entry Price (`₹`)** (or click `Use Live Price` / `Apply AI Levels`).
   - Also allows editing the total **Virtual Wallet Balance (`₹`)** in the Paper Portfolio so users can match their real-world capital (whether ₹2,000 or ₹50,000).
2. **Bullish (Upside) & Bearish (Down-Market) Execution with Stop-Loss**:
   - **Bullish (`BUY`) Mode**: Profits when price rises above Entry toward `Target`; `Stop-Loss` is placed below Entry to cap downside risk.
   - **Bearish (`SHORT / SELL`) Mode**: Profits when price falls below Entry toward a lower `Target`; `Stop-Loss` is placed above Entry to cap upside risk.
   - **AI Signal Generator (`/api/agent/analyze-trade`)**: Evaluates both bullish breakout and bearish breakdown/down-market opportunities based on the user's actual wallet budget and selected direction.
   - **Paper Portfolio & Live Groww Execution**: Supports opening, tracking live P&L, and auto-triggering Stop-Loss (`SL`) or Take-Profit (`TP`) for both `BUY` (Long) and `SHORT / SELL` (Bearish) positions.

## 6. Technical Architecture & System Diagram

```
+-------------------------------------------------------------------------+
|               User Custom Trade & Wallet Idea Workbench                 |
|  • Direction: Bullish (BUY / Upside)  OR  Bearish (SELL / Down-Market)  |
|  • My Trade Budget (₹) [User input]   • Custom Quantity [1 .. Max]      |
|  • Custom Entry Price (₹) [Blank init]• Custom SL (₹) & Target (₹)      |
+------------------------------------+------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|             Dual-Direction Sizing & Payoff Engine                       |
|  • Affordable Range: 1 share .. floor(Budget ÷ Entry Price)             |
|  • If Bullish (BUY):                                                    |
|      SL < Entry < Target  | Profit = Shares × (Target - Entry)          |
|  • If Bearish (SELL / Short):                                           |
|      SL > Entry > Target  | Profit = Shares × (Entry - Target)          |
+------------------+-----------------------------------+------------------+
                   |                                   |
                   v                                   v
+-------------------------------------+ +---------------------------------+
|      TradingChart SVG Overlay       | |  Paper & Groww Order Execution  |
|  • Plots Custom Entry, SL & Targets | |  • Executes BUY or SELL/SHORT   |
|  • Shades Risk (SL) & Reward Zones  | |  • Uses User's Custom Price/Qty |
|  • Shows exact ₹ Risk / ₹ Reward    | |  • Auto-monitors SL & TP hits   |
+-------------------------------------+ +---------------------------------+
```

## 7. Resolved Decisions & Defaults
- **Both Market Directions Enabled**: Full support for both **Bullish (BUY / Upper-Side)** and **Bearish (SELL / Down-Market Short)** trades with active **Stop-Loss (`SL`)** and **Target (`TP`)** management.
- **Custom Budget & Quantity Range**: Eliminates fixed high-budget share lots; users define their own wallet/trade budget (`₹`), custom share quantity within their wallet range, and custom entry/SL/target prices.
