import React, { useState } from "react";
import { 
  X, 
  Key, 
  ShieldCheck, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Zap, 
  Sliders, 
  Lock, 
  TrendingUp, 
  RefreshCw, 
  Eye, 
  EyeOff,
  Briefcase,
  AlertTriangle,
  Copy,
  Check,
  Globe,
  Server,
  ShieldAlert
} from "lucide-react";
import { GrowwConfig, GrowwOrder } from "../../types";

interface GrowwConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: GrowwConfig;
  onUpdateConfig: (newConfig: Partial<GrowwConfig>) => void;
  onConnectApi: (credentials: { apiKey: string; apiSecret: string; clientId: string; sandboxMode: boolean }) => Promise<void>;
  onDisconnectApi: () => Promise<void>;
  recentOrders: GrowwOrder[];
  isLoading: boolean;
}

export const GrowwConnectionModal: React.FC<GrowwConnectionModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
  onConnectApi,
  onDisconnectApi,
  recentOrders,
  isLoading,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState(config.apiKey || "");
  const [apiSecretInput, setApiSecretInput] = useState(config.apiSecret || "");
  const [clientIdInput, setClientIdInput] = useState(config.clientId || "GRW-SUBRAT-4392");
  const [clientNameInput, setClientNameInput] = useState(config.clientName || "Subrat Kumar Pradhan");
  const [showSecret, setShowSecret] = useState(false);
  const [sandboxMode, setSandboxMode] = useState(config.sandboxMode || false);
  const [activeTab, setActiveTab] = useState<"credentials" | "sebi-ip" | "risk" | "orders">("credentials");
  const [connectError, setConnectError] = useState<string | null>(null);
  const [connectSuccessMsg, setConnectSuccessMsg] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const staticIp = "34.34.244.34";
  const redirectUrl = typeof window !== "undefined" ? `${window.location.origin}/api/groww/callback` : "https://ais-dev-ifqeggn43oeowljeta7toh-431740729913.asia-east1.run.app/api/groww/callback";
  const postbackUrl = typeof window !== "undefined" ? `${window.location.origin}/api/groww/postback` : "https://ais-dev-ifqeggn43oeowljeta7toh-431740729913.asia-east1.run.app/api/groww/postback";

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2500);
  };

  if (!isOpen) return null;

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setConnectError(null);
    setConnectSuccessMsg(null);

    if (!apiKeyInput.trim() || !apiSecretInput.trim()) {
      setConnectError("Please provide both Groww Cloud API Key and API Secret.");
      return;
    }

    try {
      await onConnectApi({
        apiKey: apiKeyInput.trim(),
        apiSecret: apiSecretInput.trim(),
        clientId: clientIdInput.trim(),
        sandboxMode,
      });
      setConnectSuccessMsg("Successfully connected to Groww Cloud API! Real-time execution is active.");
      setTimeout(() => setConnectSuccessMsg(null), 4000);
    } catch (err: any) {
      setConnectError(err.message || "Failed to authenticate with Groww Cloud.");
    }
  };

  const handleDisconnect = async () => {
    try {
      await onDisconnectApi();
      setConnectSuccessMsg("Disconnected from Groww Cloud. Returned to Paper Simulation.");
      setTimeout(() => setConnectSuccessMsg(null), 3000);
    } catch (err: any) {
      setConnectError(err.message || "Failed to disconnect.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Key className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-white text-base sm:text-lg flex items-center gap-2">
                Groww Cloud API Connect
                {config.isConnected ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Live Connected
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                    Not Connected
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">
                Connect your Groww trading account for autonomous NSE/BSE execution
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950/40 px-5 pt-2 text-xs font-mono overflow-x-auto">
          <button
            onClick={() => setActiveTab("credentials")}
            className={`pb-2.5 px-3 font-medium border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "credentials"
                ? "border-emerald-500 text-emerald-400 font-bold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            API Credentials
          </button>

          <button
            onClick={() => setActiveTab("sebi-ip")}
            className={`pb-2.5 px-3 font-medium border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "sebi-ip"
                ? "border-emerald-500 text-emerald-400 font-bold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Server className="w-3.5 h-3.5 text-cyan-400" />
            SEBI Static IP Whitelist
            <span className="px-1.5 py-0.2 rounded text-[9px] bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold">
              Mandatory
            </span>
          </button>

          <button
            onClick={() => setActiveTab("risk")}
            className={`pb-2.5 px-3 font-medium border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "risk"
                ? "border-emerald-500 text-emerald-400 font-bold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Risk Guardrails
          </button>

          <button
            onClick={() => setActiveTab("orders")}
            className={`pb-2.5 px-3 font-medium border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "orders"
                ? "border-emerald-500 text-emerald-400 font-bold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            Groww Orders ({recentOrders.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-slate-300 text-xs sm:text-sm">
          {/* Notification Messages */}
          {connectSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 flex items-center gap-2 text-xs font-mono animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{connectSuccessMsg}</span>
            </div>
          )}

          {connectError && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 flex items-center gap-2 text-xs font-mono animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{connectError}</span>
            </div>
          )}

          {/* TAB 1: CREDENTIALS */}
          {activeTab === "credentials" && (
            <div className="space-y-4">
              {/* SEBI Static IP Callout Banner */}
              <div className="p-3 rounded-xl bg-gradient-to-r from-cyan-950/60 to-slate-900 border border-cyan-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono">
                <div className="flex items-start gap-2.5">
                  <Server className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white text-xs block">
                      SEBI Required Outbound Static IP:
                    </span>
                    <span className="text-cyan-300 text-xs font-bold tracking-wider">
                      {staticIp}
                    </span>
                    <span className="text-[10px] text-slate-400 block sm:inline sm:ml-2">
                      (Paste in Groww Cloud &rarr; Whitelisted IPs)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => handleCopy(staticIp, "quick-ip")}
                    className="px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-700 text-cyan-300 text-xs font-mono flex items-center gap-1.5 transition-all"
                  >
                    {copiedField === "quick-ip" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy IP</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("sebi-ip")}
                    className="text-[11px] text-slate-400 hover:text-white underline"
                  >
                    Full Details &rarr;
                  </button>
                </div>
              </div>

              {/* Instructions banner matching the user's screen */}
              <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    How to register your app on Groww Cloud
                  </span>
                  <a
                    href="https://cloud.groww.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 hover:underline"
                  >
                    Open Groww Cloud <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-400 text-xs">
                  <li>In Groww (as seen on your screen), click <strong className="text-white">"Take me there"</strong> under Trading APIs.</li>
                  <li>In <strong className="text-white">Groww Cloud</strong>, click <strong className="text-white">"Create Trading App"</strong>.</li>
                  <li>When Groww asks for <strong className="text-white">"Whitelisted IP Address"</strong>, paste: <code className="text-cyan-300 font-bold px-1 bg-slate-900 rounded">{staticIp}</code></li>
                  <li>Set Redirect URL to: <code className="text-slate-300 px-1 bg-slate-900 rounded break-all">{redirectUrl}</code></li>
                  <li>Copy your generated <strong className="text-white">API Key</strong> and <strong className="text-white">API Secret</strong> into the fields below.</li>
                </ol>
              </div>

              {/* Status summary if already connected */}
              {config.isConnected && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-emerald-950/20 border border-emerald-900/50 p-3.5 rounded-xl">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Client Name</span>
                    <span className="font-bold text-white text-xs">{config.clientName || "Subrat Kumar Pradhan"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Available Margin</span>
                    <span className="font-bold text-emerald-400 text-xs font-mono">
                      ₹{config.availableMargin.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Trading Mode</span>
                    <span className="font-bold text-cyan-400 text-xs font-mono">
                      {config.mode === "LIVE" ? "Live NSE/BSE" : "Sandbox"}
                    </span>
                  </div>
                </div>
              )}

              {/* Credential Form */}
              <form onSubmit={handleConnect} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    Groww Cloud API Key (Client / App Key)
                  </label>
                  <input
                    type="text"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="e.g. grw_live_8943729487293847"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none text-white text-xs font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    Groww Cloud API Secret (App Secret)
                  </label>
                  <div className="relative">
                    <input
                      type={showSecret ? "text" : "password"}
                      value={apiSecretInput}
                      onChange={(e) => setApiSecretInput(e.target.value)}
                      placeholder="Paste your Groww App Secret"
                      className="w-full px-3 py-2 pr-10 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none text-white text-xs font-mono"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecret(!showSecret)}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-200"
                    >
                      {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">
                      Account / Client Name
                    </label>
                    <input
                      type="text"
                      value={clientNameInput}
                      onChange={(e) => setClientNameInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none text-white text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">
                      Groww Client ID
                    </label>
                    <input
                      type="text"
                      value={clientIdInput}
                      onChange={(e) => setClientIdInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none text-white text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Sandbox vs Live toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div>
                    <span className="text-xs font-bold text-white block">Groww API Sandbox Mode</span>
                    <span className="text-[11px] text-slate-400">
                      Test order placement with mock funds before activating live real-money execution
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sandboxMode}
                      onChange={(e) => setSandboxMode(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-2">
                  {config.isConnected ? (
                    <button
                      type="button"
                      onClick={handleDisconnect}
                      className="px-4 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 font-mono text-xs transition-all"
                    >
                      Disconnect API
                    </button>
                  ) : (
                    <div></div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm font-mono transition-all shadow-md shadow-emerald-500/20 flex items-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Verifying with Groww...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>{config.isConnected ? "Update & Reconnect" : "Connect Groww Cloud"}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: SEBI STATIC IP & WHITELISTING */}
          {activeTab === "sebi-ip" && (
            <div className="space-y-4 font-mono">
              {/* Regulatory Notice Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/80 to-slate-950 border border-cyan-700/80 space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                  <span className="font-bold text-white text-xs sm:text-sm">
                    SEBI Algorithmic Trading IP Compliance
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Under <strong>SEBI Circular SEBI/HO/MIRSD/DOP/CIR/P/2022/111</strong> and NSE/BSE retail algorithmic trading regulations, stockbrokers (including Groww) require automated API requests to originate from registered, verified <strong>Static Outbound IP addresses</strong>. This prevents unauthorized execution, IP spoofing, and rogue order placement.
                </p>
              </div>

              {/* Main Copyable Network Fields */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Server className="w-4 h-4 text-emerald-400" />
                  Network Credentials for Groww Cloud Developer Console
                </h4>

                {/* 1. Outbound Static IP */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                      SEBI Whitelisted Static Outbound IP
                    </span>
                    <span className="text-[10px] text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                      Primary Gateway
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-base sm:text-lg font-bold text-cyan-300 tracking-wider">
                      {staticIp}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(staticIp, "tab-ip")}
                      className="px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-700 text-cyan-300 text-xs font-mono flex items-center gap-1.5 transition-all"
                    >
                      {copiedField === "tab-ip" ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-bold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy IP</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Paste this IP into the <strong>"Whitelisted IP Address(es)"</strong> field in your Groww Cloud App settings.
                  </p>
                </div>

                {/* 2. Redirect URL */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-emerald-400" />
                      Redirect URL / OAuth Callback
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs text-slate-200 truncate max-w-[280px] sm:max-w-md">
                      {redirectUrl}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(redirectUrl, "tab-redirect")}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1.5 transition-all flex-shrink-0"
                    >
                      {copiedField === "tab-redirect" ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-bold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy URL</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* 3. Postback URL */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                      Postback URL (Order Execution Webhook)
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs text-slate-200 truncate max-w-[280px] sm:max-w-md">
                      {postbackUrl}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(postbackUrl, "tab-postback")}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1.5 transition-all flex-shrink-0"
                    >
                      {copiedField === "tab-postback" ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-bold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy URL</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Instructions Guide */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2.5 text-xs">
                <span className="font-bold text-white block">
                  How to Whitelist in Groww Cloud (cloud.groww.in):
                </span>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-400">
                  <li>Visit <a href="https://cloud.groww.in" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline">cloud.groww.in</a> and sign in with your Groww credentials.</li>
                  <li>Click on your created app or click <strong className="text-white">"Create App"</strong>.</li>
                  <li>Scroll to the <strong className="text-white">"Security & Whitelisted IPs"</strong> section.</li>
                  <li>Paste <strong className="text-cyan-300 font-bold">{staticIp}</strong> into the IP field and click <strong className="text-white">Save Changes</strong>.</li>
                  <li>Once saved, return to the <strong className="text-emerald-400 cursor-pointer underline" onClick={() => setActiveTab("credentials")}>API Credentials</strong> tab here and enter your Groww API Key and Secret.</li>
                </ol>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("credentials")}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-2"
                >
                  <span>Proceed to API Credentials</span>
                  <span>&rarr;</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: RISK & SAFETY */}
          {activeTab === "risk" && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white font-bold">SEBI Retail Algorithmic Safety Guardrails</strong>
                  These rules cap automated order sizing so the AI agent can never over-leverage or place orders exceeding your safety thresholds.
                </div>
              </div>

              {/* Execution Mode */}
              <div className="space-y-2">
                <label className="block text-xs font-mono text-slate-300">
                  AI Execution Mode
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => onUpdateConfig({ executionMode: "SEMI_AUTO" })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      config.executionMode === "SEMI_AUTO"
                        ? "bg-emerald-950/60 border-emerald-500 text-white"
                        : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-emerald-400">1-Click Confirmation</span>
                      {config.executionMode === "SEMI_AUTO" && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Recommended. The AI flags a trade setup, calculates SL & targets, and asks for your 1-click confirmation before sending to Groww.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => onUpdateConfig({ executionMode: "FULL_AUTO" })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      config.executionMode === "FULL_AUTO"
                        ? "bg-cyan-950/60 border-cyan-500 text-white"
                        : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-cyan-400">Full Autonomous Pilot</span>
                      {config.executionMode === "FULL_AUTO" && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Auto-executes whenever AI agent confidence is &ge; 80% and verdict is TRADE (HIGH CONVICTION) within safety limits.
                    </p>
                  </button>
                </div>
              </div>

              {/* Max Capital Per Trade */}
              <div>
                <div className="flex items-center justify-between mb-1 text-xs font-mono">
                  <span className="text-slate-300">Max Capital Limit Per Order</span>
                  <span className="font-bold text-emerald-400">
                    ₹{config.maxCapitalPerTrade.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[5000, 10000, 25000, 50000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => onUpdateConfig({ maxCapitalPerTrade: val })}
                      className={`py-1.5 rounded-lg border text-xs font-mono font-bold transition-all ${
                        config.maxCapitalPerTrade === val
                          ? "bg-emerald-500 text-slate-950 border-emerald-400"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      ₹{(val / 1000).toFixed(0)}k
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400">
                  Any signal exceeding this allocation will be downscaled automatically to prevent overexposure.
                </p>
              </div>

              {/* Daily Loss Circuit Limit */}
              <div>
                <div className="flex items-center justify-between mb-1 text-xs font-mono">
                  <span className="text-slate-300">Daily Portfolio Drawdown Circuit Breaker</span>
                  <span className="font-bold text-rose-400">{config.dailyLossLimitPercent}%</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[1.0, 2.0, 3.0].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => onUpdateConfig({ dailyLossLimitPercent: val })}
                      className={`py-1.5 rounded-lg border text-xs font-mono font-bold transition-all ${
                        config.dailyLossLimitPercent === val
                          ? "bg-rose-500 text-slate-950 border-rose-400"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      {val.toFixed(1)}% Max Loss
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  If your day's cumulative loss hits this threshold, all automated buying is halted immediately.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: ORDERS */}
          {activeTab === "orders" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400 uppercase">
                  Groww Cloud Executed Orders
                </span>
                <span className="text-xs font-mono text-emerald-400">
                  {recentOrders.length} records
                </span>
              </div>

              {recentOrders.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-slate-800 rounded-xl bg-slate-950/40 text-slate-500 text-xs font-mono">
                  No Groww API orders placed yet. Orders executed by the AI agent will appear here with live exchange acknowledgement.
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {recentOrders.map((ord) => (
                    <div
                      key={ord.orderId}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{ord.symbol}</span>
                          <span className={`px-1.5 py-0.2 text-[10px] font-bold rounded ${
                            ord.side === "BUY" ? "bg-emerald-950 text-emerald-400" : "bg-rose-950 text-rose-400"
                          }`}>
                            {ord.side}
                          </span>
                          <span className="text-slate-400 text-[11px]">{ord.orderType}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                          {ord.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 text-slate-400 text-[11px]">
                        <div>Qty: <span className="text-white">{ord.quantity}</span></div>
                        <div>Price: <span className="text-white">₹{ord.price.toFixed(2)}</span></div>
                        <div className="text-right text-slate-400">
                          Total: <span className="text-emerald-400">₹{(ord.quantity * ord.price).toLocaleString("en-IN")}</span>
                        </div>
                      </div>

                      <div className="text-[10px] text-slate-500 border-t border-slate-900 pt-1 flex items-center justify-between">
                        <span>Ref: {ord.orderId}</span>
                        <span>{new Date(ord.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2 font-mono">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encrypted Server-Side API Proxy. API Keys never exposed to browser.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
