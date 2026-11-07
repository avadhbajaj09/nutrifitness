'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Key,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Trash2,
  RefreshCw,
  Eye,
  EyeOff,
  Zap,
  ShieldCheck,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  visualCard?: {
    type: 'banner' | 'price' | 'stock' | 'coupon' | 'generic';
    title: string;
    details: string;
    link?: string;
    imageUrl?: string;
  };
  pendingAction?: {
    tool: string;
    args: any;
  };
}

export default function AICopilotTab() {
  const [provider, setProvider] = useState<'openai' | 'anthropic'>('openai');
  const [apiKey, setApiKey] = useState('');
  const [savedApiKey, setSavedApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [model, setModel] = useState('gpt-4o');
  const [mode, setMode] = useState<'instant' | 'preview'>('instant');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load saved credentials from localStorage
  useEffect(() => {
    try {
      const storedProvider = localStorage.getItem('nutri_ai_provider') as 'openai' | 'anthropic' | null;
      const storedKey = localStorage.getItem('nutri_ai_key');
      const storedModel = localStorage.getItem('nutri_ai_model');
      const storedMode = localStorage.getItem('nutri_ai_mode') as 'instant' | 'preview' | null;

      if (storedProvider) setProvider(storedProvider);
      if (storedKey) {
        setApiKey(storedKey);
        setSavedApiKey(storedKey);
      }
      if (storedModel) setModel(storedModel);
      if (storedMode) setMode(storedMode);

      // Default welcome message in English
      if (messages.length === 0) {
        setMessages([
          {
            id: 'welcome',
            role: 'assistant',
            content: `Hello! I am your **NutriFitness AI Store Copilot**. 🇨🇭\n\nI can execute your instructions directly on the live website in real-time:\n- **Banners & Sliders**: Update images, buttons, product links, and titles on the homepage.\n- **Pricing & Products**: Lower or increase prices, update Geneva and Portugal warehouse stock.\n- **Promo Codes**: Create discount coupons immediately active at checkout.\n\n*To get started, make sure your OpenAI or Claude API key is configured in the settings above, then simply give me an instruction!*`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSaveSettings = () => {
    try {
      localStorage.setItem('nutri_ai_provider', provider);
      localStorage.setItem('nutri_ai_key', apiKey.trim());
      localStorage.setItem('nutri_ai_model', model);
      localStorage.setItem('nutri_ai_mode', mode);
      setSavedApiKey(apiKey.trim());
      setErrorMsg(null);
      setIsSettingsOpen(false);
    } catch (e) {
      console.warn(e);
    }
  };

  const handleClearSettings = () => {
    try {
      localStorage.removeItem('nutri_ai_key');
      setApiKey('');
      setSavedApiKey('');
    } catch (e) {
      console.warn(e);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputPrompt).trim();
    if (!text) return;

    if (!savedApiKey && !apiKey.trim()) {
      setErrorMsg('Please enter your OpenAI or Claude API key in API Settings before sending an instruction.');
      setIsSettingsOpen(true);
      return;
    }

    const currentKey = savedApiKey || apiKey.trim();

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const historyToSend = messages
        .filter(m => m.id !== 'welcome')
        .concat(userMsg)
        .slice(-10)
        .map(m => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/admin/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          apiKey: currentKey,
          model,
          mode,
          messages: historyToSend,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || `Server error (${res.status})`);
      }

      const botMsg: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: data.reply || 'Action executed successfully.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        visualCard: data.visualCard,
        pendingAction: data.pendingAction,
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while communicating with the AI.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmPendingAction = async (msgId: string, pendingAction: { tool: string; args: any }) => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/admin/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          apiKey: savedApiKey || apiKey.trim(),
          confirmedAction: pendingAction,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to confirm action.');
      }

      setMessages(prev =>
        prev.map(m => {
          if (m.id === msgId) {
            return {
              ...m,
              pendingAction: undefined,
              content: `${m.content}\n\n✅ **Action confirmed and executed live on NutriFitness!**`,
              visualCard: data.visualCard,
            };
          }
          return m;
        })
      );
    } catch (err: any) {
      setErrorMsg(err.message || 'Error executing action.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-6xl mx-auto px-4 py-4 space-y-4">
      {/* 1. Header & Credentials Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#F80404] to-red-600 flex items-center justify-center text-white shadow-md">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight">AI Store Copilot</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-700 border border-red-200">
                  Live Control
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Manage banners, pricing, stock, and promotions using natural language prompts with your own API key
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Status Indicator */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${
              savedApiKey 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}>
              <span className={`w-2 h-2 rounded-full ${savedApiKey ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span>{savedApiKey ? `${provider === 'openai' ? 'OpenAI' : 'Claude'} Ready` : 'API Key Missing'}</span>
            </div>

            <button
              type="button"
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all"
            >
              <Key className="w-3.5 h-3.5 text-slate-500" />
              <span>{isSettingsOpen ? 'Close Settings' : 'API Settings'}</span>
            </button>
          </div>
        </div>

        {/* Expandable Settings Drawer */}
        {isSettingsOpen && (
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in duration-150">
            {/* Provider & Model */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">AI Provider</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setProvider('openai');
                    setModel('gpt-4o');
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-black border text-center transition-all ${
                    provider === 'openai'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  OpenAI (ChatGPT)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProvider('anthropic');
                    setModel('claude-3-5-sonnet-20241022');
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-black border text-center transition-all ${
                    provider === 'anthropic'
                      ? 'bg-amber-700 text-white border-amber-800 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Anthropic (Claude)
                </button>
              </div>

              <div className="pt-1">
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">Model</label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full text-xs font-semibold px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {provider === 'openai' ? (
                    <>
                      <option value="gpt-4o">GPT-4o (Recommended - Fast & Powerful)</option>
                      <option value="gpt-4o-mini">GPT-4o Mini (Cost-efficient)</option>
                      <option value="o1-mini">o1 Mini (Advanced Reasoning)</option>
                    </>
                  ) : (
                    <>
                      <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet (Recommended)</option>
                      <option value="claude-3-5-haiku-20241022">Claude 3.5 Haiku (Fast)</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            {/* API Key Input */}
            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 block">
                  {provider === 'openai' ? 'OpenAI API Key (sk-...)' : 'Anthropic Claude API Key (sk-ant-...)'}
                </label>
                {savedApiKey && (
                  <button
                    type="button"
                    onClick={handleClearSettings}
                    className="text-[11px] font-semibold text-red-600 hover:text-red-700 flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear key</span>
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={provider === 'openai' ? 'sk-proj-...' : 'sk-ant-api03-...'}
                  className="w-full px-3 py-2 pr-10 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  aria-label="Toggle API key visibility"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Mode & Save Button */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600">Execution Mode:</span>
                  <button
                    type="button"
                    onClick={() => setMode('instant')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${
                      mode === 'instant' ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Zap className="w-3 h-3" />
                    <span>Instant Apply</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('preview')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${
                      mode === 'preview' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <ShieldCheck className="w-3 h-3" />
                    <span>Preview Before Applying</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleSaveSettings}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                >
                  Save API Key
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Error Notice */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-2.5 rounded-xl text-xs flex items-center justify-between gap-2 animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span className="font-medium">{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="text-red-600 hover:text-red-900 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* 3. Messages Chat Area */}
      <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 overflow-y-auto space-y-4 shadow-sm">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold ${
                  isUser ? 'bg-slate-800' : 'bg-gradient-to-tr from-[#F80404] to-red-600'
                }`}
              >
                {isUser ? 'YOU' : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-xs leading-relaxed space-y-2 ${
                  isUser
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-50 border border-slate-200/80 text-slate-800'
                }`}
              >
                <div className="whitespace-pre-line font-normal">{msg.content}</div>

                {/* Visual Action Card (When AI changed something) */}
                {msg.visualCard && (
                  <div className="mt-3 p-3 bg-white border border-slate-200 rounded-xl shadow-xs space-y-1.5 text-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Live Action Successful</span>
                      </span>
                      {msg.visualCard.link && (
                        <a
                          href={msg.visualCard.link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
                        >
                          <span>View on website</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <div className="font-bold text-xs text-slate-900">{msg.visualCard.title}</div>
                    <div className="text-[11px] text-slate-600">{msg.visualCard.details}</div>
                    {msg.visualCard.imageUrl && (
                      <div className="mt-2 rounded-lg overflow-hidden border border-slate-200 max-h-32">
                        <img
                          src={msg.visualCard.imageUrl}
                          alt="Banner preview"
                          className="w-full h-auto object-cover"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Pending Action Confirmation (In Preview Mode) */}
                {msg.pendingAction && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-slate-800 space-y-2">
                    <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <span>Confirmation required for action: {msg.pendingAction.tool}</span>
                    </div>
                    <pre className="text-[10px] bg-white p-2 rounded border border-amber-200 overflow-x-auto text-slate-700">
                      {JSON.stringify(msg.pendingAction.args, null, 2)}
                    </pre>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleConfirmPendingAction(msg.id, msg.pendingAction!)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                      >
                        Apply Changes Now
                      </button>
                    </div>
                  </div>
                )}

                <div className={`text-[10px] ${isUser ? 'text-slate-400 text-right' : 'text-slate-400'}`}>
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#F80404] to-red-600 flex items-center justify-center text-white text-xs shrink-0">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-600 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-red-600" />
              <span>Copilot is analyzing your instruction and executing store tools...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 4. Input Bar (Suggestions row removed as requested) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-2.5 shadow-sm flex items-end gap-2">
        <textarea
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder="Type an instruction (e.g. 'Set Creatine price to 29.90 CHF' or 'Change the hero banner button...')..."
          rows={1}
          disabled={isLoading}
          className="flex-1 resize-none bg-transparent px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none min-h-[42px] max-h-28"
        />

        <button
          type="button"
          onClick={() => handleSendMessage()}
          disabled={isLoading || !inputPrompt.trim()}
          className="h-10 px-4 bg-[#F80404] hover:bg-[#FF3D00] disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm shrink-0 active:scale-95"
        >
          {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          <span className="hidden sm:inline">Send</span>
        </button>
      </div>
    </div>
  );
}
