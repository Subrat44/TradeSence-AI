import React, { useState, useRef, useEffect } from "react";
import Markdown from "react-markdown";
import { ChatMessage, Asset } from "../../types";
import { 
  Bot, 
  Send, 
  Sparkles, 
  User, 
  ExternalLink, 
  RefreshCcw, 
  Terminal,
  HelpCircle,
  Calculator,
  Compass
} from "lucide-react";

interface CopilotChatProps {
  activeAsset: Asset;
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
  onClearChat: () => void;
}

export const CopilotChat: React.FC<CopilotChatProps> = ({
  activeAsset,
  messages,
  onSendMessage,
  isLoading,
  onClearChat,
}) => {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const msg = inputText.trim();
    setInputText("");
    onSendMessage(msg);
  };

  const samplePrompts = [
    `Analyze risk-reward entry levels for ${activeAsset.symbol}`,
    `How does the current RSI and 20 SMA trend affect ${activeAsset.symbol}?`,
    `What are the major upcoming macro/earnings catalysts?`,
    `Calculate Kelly Criterion sizing for a 60% win-rate setup`,
  ];

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 sm:p-5 shadow-xl flex flex-col h-[650px]">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-800/80 flex items-center justify-center text-indigo-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
              Indian Equity Copilot
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                NSE / Groww
              </span>
            </h3>
            <p className="text-xs text-slate-400">Context: {activeAsset.symbol} (₹{activeAsset.price.toFixed(2)})</p>
          </div>
        </div>

        <button
          onClick={onClearChat}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 p-1.5 rounded-lg hover:bg-slate-800 transition-all font-mono"
          title="Reset conversation"
        >
          <RefreshCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-emerald-400 mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-200">TradeSense Indian Market Copilot</h4>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              Ask about small to large cap stocks, whether to trade or avoid on Groww, promoter pledge risk, or delivery vs intraday order levels.
            </p>

            <div className="mt-6 flex flex-col gap-2 w-full max-w-md">
              <span className="text-[10px] uppercase font-mono text-slate-400 text-left">Suggested Questions:</span>
              {[
                `Should I trade or avoid ${activeAsset.symbol} on Groww right now?`,
                `What is the stop loss and target levels in ₹ for ${activeAsset.symbol}?`,
                `Audit promoter pledge, FII/DII holding & ASM list for ${activeAsset.symbol}`,
                `How is small-cap / penny stock risk managed in this setup?`,
              ].map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => onSendMessage(prompt)}
                  className="text-left p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800/80 hover:border-emerald-800/60 text-xs text-slate-300 hover:text-white transition-all font-mono flex items-center justify-between"
                >
                  <span>{prompt}</span>
                  <span className="text-emerald-400 text-xs font-sans">→</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-800/80 flex items-center justify-center text-cyan-400 flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm ${
                  msg.role === "user"
                    ? "bg-gradient-to-br from-cyan-600 to-indigo-600 text-white font-medium rounded-tr-none shadow-md shadow-cyan-600/10"
                    : "bg-slate-950 border border-slate-800/90 text-slate-200 rounded-tl-none shadow-md"
                }`}
              >
                {msg.role === "assistant" ? (
                  <div className="prose prose-invert max-w-none text-xs sm:text-sm prose-p:leading-relaxed prose-headings:font-bold prose-headings:text-slate-100 prose-code:text-cyan-300 prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800">
                    <Markdown>{msg.content}</Markdown>

                    {/* Citations if available */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                        <span className="text-[10px] font-mono text-slate-400 block w-full">Verified Web References:</span>
                        {msg.citations.map((c, idx) => (
                          <a
                            key={idx}
                            href={c.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300 hover:text-cyan-200"
                          >
                            <ExternalLink className="w-2.5 h-2.5" />
                            <span className="truncate max-w-[140px]">{c.title}</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}

                <div className={`text-[10px] mt-1 font-mono ${msg.role === "user" ? "text-cyan-100/70 text-right" : "text-slate-400"}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>

              {msg.role === "user" && (
                <div className="w-7 h-7 rounded-lg bg-indigo-950 border border-indigo-800/80 flex items-center justify-center text-indigo-300 flex-shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex gap-3 justify-start items-center">
            <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-800/80 flex items-center justify-center text-cyan-400 flex-shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-2xl rounded-tl-none p-3.5 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce"></div>
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]"></div>
              <span className="text-xs font-mono text-slate-400 ml-1">Copilot reasoning...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form onSubmit={handleSubmit} className="mt-3 pt-3 border-t border-slate-800">
        <div className="relative flex items-center">
          <input
            id="input-copilot-chat"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Ask copilot about ${activeAsset.symbol}, risk sizing, trade setups...`}
            disabled={isLoading}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-4 pr-12 py-3 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono disabled:opacity-50"
          />
          <button
            id="btn-send-copilot-message"
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="absolute right-2 p-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
