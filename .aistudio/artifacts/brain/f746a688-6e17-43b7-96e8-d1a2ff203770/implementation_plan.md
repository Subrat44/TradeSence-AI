# TradeSense India AI — Browser History & Navigation Implementation Plan

## 1. Product Overview & Goals
- **Core Objective**: Prevent the browser **Back** button from exiting TradeSense India AI to the browser's home/new-tab page after searching for or selecting a stock, and instead seamlessly restore the user's previous tab and stock selection within the application.
- **Target Experience**: Synchronize application view state (active tab and selected NSE/BSE stock symbol) with the browser's native `History API` (`pushState`, `replaceState`, and `popstate`), paired with an intuitive on-screen **Back** navigation control inside secondary views.

## 2. Aesthetic Direction & Domain Exemplars
- **Primary Category**: `data_analytics_apps` / `trading_terminal_saas`
- **Design Paradigm**: P4 Atmospheric Minimalism & High-Craft Dark UI blended with P2 Kinetic Typography & Neo-Brutalist Swiss Grids for dense financial data clarity.
- **Domain Exemplars**: TradingView, Groww Web Terminal, and Koyfin — characterized by instantaneous keyboard/history navigation, contextual breadcrumb bars, and zero-latency view transitions.

## 3. Color Palette & Typography
- **Surface Palette**:
  - Primary Canvas: `#020617` (Slate 950)
  - Elevated Navigation / Breadcrumb Bar: `#0F172A` (Slate 900) with subtle `1px solid #1E293B` (Slate 800) Hairline dividers
- **Text Hierarchy**:
  - Primary Text: `#F8FAFC` (Slate 50)
  - Secondary / Breadcrumb Context: `#94A3B8` (Slate 400)
  - Muted Metadata: `#64748B` (Slate 500)
- **Accent & Semantic Tokens**:
  - Brand / Bullish Accent: `#10B981` (Emerald 500)
  - Interactive Navigation Highlight: `#34D399` (Emerald 400)
- **Typography & Scannability**:
  - Sans UI & Navigation: Clean geometric sans-serif for tab labels and breadcrumb trails.
  - Financial Tickers & Prices: Monospace with `tabular-nums` (`font-mono tabular-nums`) for stock symbols and live ₹ quotes inside the navigation bar.

## 4. Layout, Spatial Architecture & Focal Point Design
- **Contextual Sub-Header Navigation Bar**:
  - Positioned directly beneath the main application header whenever the user is viewing a specific workspace (`terminal`, `research`, `news`, `backtester`, `playbook`) or after navigating away from a previous stock.
  - Displays a compact **Back** button (`← Back to Screener` or `← Previous: [SYMBOL]`) on the left, alongside a live breadcrumb trail (`TradeSense Home / [Current Tab] / [Selected Stock Symbol & Live ₹ Price]`) and a quick **Home (Screener)** shortcut.
- **Viewport Budget**:
  - Compact single-row bar (`36px` height) with `1px` bottom border so chart and terminal workspaces retain over 85% of vertical viewport height.

## 5. Core Functional Flows & State Completeness
1. **Initial Entry & Deep-Link Hydration**:
   - On initial page load, inspect URL query parameters (`?tab=<tab>&symbol=<SYMBOL>`).
   - Seed the initial `window.history.replaceState` entry with `{ tab: activeTab, symbol: selectedAsset.symbol }` so the root state is always anchored inside the application.
2. **Stock Search & Selection History Push**:
   - When the user searches a stock (e.g., in the Screener or Header search bar) or clicks **"Chart & AI Setup"** / **"Research"** on any stock row, push a new browser history state (`window.history.pushState`) recording `{ tab: nextTab, symbol: nextAsset.symbol }` and updating the URL query string (`?tab=terminal&symbol=RELIANCE`).
3. **Tab Switching History Push**:
   - Switching between tabs (`screener`, `terminal`, `news`, `research`, `backtester`, `playbook`) pushes a history entry if the tab or symbol changed, allowing multi-step backward and forward navigation.
4. **Browser Back / Forward (`popstate`) Restoration**:
   - Listening to `window.addEventListener("popstate", ...)` intercepts the browser Back/Forward actions:
     - If a modal (Paper Portfolio or Groww API Connection) is currently open, pressing Back closes the modal first or restores the prior view state cleanly.
     - Restores both the previous `activeTab` and the previous `selectedAsset` from the history state (or URL query parameters) without pushing a duplicate state entry.
     - Fallback safety: if the user lands on a deep link directly and clicks the in-app Back button with no prior in-app history, it smoothly transitions to the default `screener` home view instead of exiting the browser tab.

## 6. Technical Architecture & System Diagram

```
+-----------------------------------------------------------------------+
|                        User Navigation Actions                        |
|  • Stock Search ("RELIANCE")   • Select Stock Row   • Switch App Tab  |
+-----------------------------------+-----------------------------------+
                                    |
                                    v
+-----------------------------------------------------------------------+
|                    History Sync Controller (App)                      |
|  1. Updates React State: activeTab + selectedAsset                    |
|  2. Calls window.history.pushState({ tab, symbol }, "", "?tab=...&")  |
+-----------------------------------+-----------------------------------+
                                    |
          +-------------------------+-------------------------+
          | Browser Back / Forward                            | In-App Back Button
          v (window "popstate" event)                         v
+-----------------------------------+   +-------------------------------+
|       Popstate Listener           |   |    handleNavigateBack()       |
|  • Suppresses duplicate pushState |   |  • If in-app history > 0:     |
|  • Reads { tab, symbol } state    |   |      window.history.back()    |
|  • Restores previous Tab & Stock  |   |  • Else fallback to:          |
|  • Closes open modals if active   |   |      activeTab = "screener"   |
+-----------------------------------+   +-------------------------------+
```

## 7. Resolved Decisions & Defaults
- **Browser Back Behavior** *(Confirmed by User)*: Pressing the browser Back button returns step-by-step to the **previous tab and previous stock selection** rather than exiting to the browser's home page.
- **In-App Back Navigation Control** *(Default Applied)*: Include a sleek contextual Back & Breadcrumb bar at the top of secondary views (`terminal`, `research`, `news`, `backtester`, `playbook`) so users can also navigate back with a single click on desktop or mobile.
