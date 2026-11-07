'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  ArrowUp,
  Key,
  Palette,
  ExternalLink,
  Trash2,
  RefreshCw,
  Eye,
  EyeOff,
  Zap,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Plus,
  Image as ImageIcon,
  Sparkles,
  ChevronDown,
  Layers,
  Settings2,
  Download,
  Wand2,
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
  const [baseUrl, setBaseUrl] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [model, setModel] = useState('gpt-6.1-sol');
  const [imageModel, setImageModel] = useState('gpt-image-2.6-sunburst');
  const [mode, setMode] = useState<'instant' | 'preview'>('instant');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Dedicated Image Mode toggle
  const [isImageMode, setIsImageMode] = useState(false);
  const [imageSize, setImageSize] = useState<'1792x1024' | '1024x1024' | '1024x1792'>('1792x1024');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load saved credentials from localStorage
  useEffect(() => {
    try {
      const storedProvider = localStorage.getItem('nutri_ai_provider') as 'openai' | 'anthropic' | null;
      const storedKey = localStorage.getItem('nutri_ai_key');
      const storedBaseUrl = localStorage.getItem('nutri_ai_base_url');
      const storedModel = localStorage.getItem('nutri_ai_model');
      const storedImageModel = localStorage.getItem('nutri_ai_image_model');
      const storedMode = localStorage.getItem('nutri_ai_mode') as 'instant' | 'preview' | null;

      if (storedProvider) setProvider(storedProvider);
      if (storedKey) {
        setApiKey(storedKey);
        setSavedApiKey(storedKey);
      }
      if (storedBaseUrl) setBaseUrl(storedBaseUrl);
      if (storedModel) setModel(storedModel);
      if (storedImageModel) setImageModel(storedImageModel);
      if (storedMode) setMode(storedMode);
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [inputPrompt]);

  const handleSaveSettings = () => {
    try {
      localStorage.setItem('nutri_ai_provider', provider);
      localStorage.setItem('nutri_ai_key', apiKey.trim());
      localStorage.setItem('nutri_ai_base_url', baseUrl.trim());
      localStorage.setItem('nutri_ai_model', model);
      localStorage.setItem('nutri_ai_image_model', imageModel);
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
      localStorage.removeItem('nutri_ai_base_url');
      setApiKey('');
      setSavedApiKey('');
      setBaseUrl('');
    } catch (e) {
      console.warn(e);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setInputPrompt('');
    setErrorMsg(null);
  };

  const handleSendMessage = async (textToSend?: string, forceImage = false) => {
    const text = (textToSend || inputPrompt).trim();
    if (!text) return;

    if (!savedApiKey && !apiKey.trim() && !forceImage) {
      setErrorMsg('Please configure your OpenAI or Claude API key in API Settings first.');
      setIsSettingsOpen(true);
      return;
    }

    const currentKey = savedApiKey || apiKey.trim();
    const shouldGenerateImage = forceImage || isImageMode || /\b(image|picture|photo|banner|dessine|creer une image|crée une image|create image|generate image)\b/i.test(text);

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      role: 'user',
      content: shouldGenerateImage && !text.startsWith('🎨') ? `🎨 [Image Request]: ${text}` : text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);
    setErrorMsg(null);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      // Direct Image Generation (GPT Image 2.6 / DALL-E 3 / Flux 4K)
      if (shouldGenerateImage) {
        const res = await fetch('/api/admin/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider,
            apiKey: currentKey,
            baseUrl: baseUrl.trim() || undefined,
            imageModel,
            generateImageDirect: {
              prompt: text.replace(/^🎨\s*\[Image Request\]:\s*/i, ''),
              size: imageSize,
              model: imageModel,
            },
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to generate image.');
        }

        const botMsg: ChatMessage = {
          id: String(Date.now() + 1),
          role: 'assistant',
          content: data.reply || 'Your image has been generated in high resolution!',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          visualCard: data.visualCard,
        };

        setMessages(prev => [...prev, botMsg]);
        setIsImageMode(false);
        return;
      }

      // Standard Conversation & Autonomous Store Tools
      const historyToSend = messages
        .concat(userMsg)
        .slice(-10)
        .map(m => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/admin/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          apiKey: currentKey,
          baseUrl: baseUrl.trim() || undefined,
          model,
          imageModel,
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
          baseUrl: baseUrl.trim() || undefined,
          imageModel,
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

  const handleSetAsBanner = async (imageUrl: string, title?: string) => {
    await handleSendMessage(`Update the homepage hero banner to use this image URL: "${imageUrl}" with title "${title || 'Marvelous Nutrition'}" and button "Shop Now" linking to "/boutique"`);
  };

  const QUICK_IMAGE_PRESETS = [
    { 
      label: '⚡ Lean AF Whey Poster (16:9)', 
      prompt: 'Commercial advertising poster for Marvelous Lean AF 100% CFM Whey Isolate 2kg black protein jar, gym weights, studio lighting, high resolution product advertisement' 
    },
    { 
      label: '💥 Pure Creatine Poster (16:9)', 
      prompt: 'High impact sports nutrition poster for Marvelous Line Pure Creatine Monohydrate 300g bottle on dark stone podium with neon yellow lighting, gym billboard' 
    },
    { 
      label: '🌙 Magnesium Recovery (16:9)', 
      prompt: 'Luxury health supplement advertisement for Marvelous Magnesium Bisglycinate 90 capsules bottle with gold recovery aura, Swiss wellness studio lighting' 
    },
    { 
      label: '🔥 Hardcore Pre-Workout (16:9)', 
      prompt: 'Extreme energy sports billboard for Marvelous POWER M.F Pre-Workout powder explosion, neon yellow energy streaks, dark adrenaline gym background' 
    },
  ];

  const QUICK_STORE_ACTIONS = [
    { label: '💰 Set L-Glutamin to 42 CHF', prompt: 'change price of L-Glutamin to 42 chf 300g' },
    { label: '🏷️ Set Pure Creatine to 35 CHF', prompt: 'change price of Marvelous Pure Creatine 300g to 35 CHF' },
    { label: '📦 Check Whey Isolate Stock', prompt: 'check stock of Lean AF Whey Isolate in Geneva and Portugal' },
    { label: '🎟️ Create 10% Discount Coupon', prompt: 'create promo code NUTRI10 with 10% discount for 30 days' },
  ];

  const getModelDisplayName = (m: string, p: string) => {
    if (p === 'anthropic') {
      if (m.includes('haiku')) return 'Claude 3.5 Haiku';
      return 'Claude 3.5 Sonnet';
    }
    switch (m) {
      case 'gpt-6.1-sol': return 'GPT-6.1 Sol';
      case 'gpt-6-astra': return 'GPT-6 Astra';
      case 'gpt-6.1-terra': return 'GPT-6.1 Terra';
      case 'gpt-6-sol': return 'GPT-6 Sol';
      case 'gpt-6-luna': return 'GPT-6 Luna';
      case 'o3-mini': return 'o3-mini';
      case 'o1': return 'o1';
      case 'gpt-4o': return 'GPT-4o';
      default: return m;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-white antialiased font-sans select-none">
      {/* 1. ChatGPT Top Minimalist Bar */}
      <div className="border-b border-slate-100 px-4 py-2.5 flex items-center justify-between gap-4 sticky top-0 bg-white/95 backdrop-blur-md z-20">
        {/* Model Selector Pill */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-slate-100 text-slate-800 text-xs font-bold transition-all border border-slate-200 shadow-2xs"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{getModelDisplayName(model, provider)}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <span className="hidden sm:inline-block text-[11px] font-semibold text-slate-400">
            {savedApiKey ? 'Connected & Ready' : 'API Key required'}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Quick Create Image Button */}
          <button
            type="button"
            onClick={() => setIsImageMode(!isImageMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-2xs ${
              isImageMode
                ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-sm ring-2 ring-rose-200'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <Palette className="w-3.5 h-3.5 text-rose-500" />
            <span>{isImageMode ? 'Image Mode Active' : '🎨 Create Image'}</span>
          </button>

          {/* New Chat */}
          {messages.length > 0 && (
            <button
              type="button"
              onClick={handleNewChat}
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
              title="New Chat"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}

          {/* Settings Toggle */}
          <button
            type="button"
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
            title="Settings"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Slide-Down Settings Drawer */}
      {isSettingsOpen && (
        <div className="border-b border-slate-200 bg-slate-50/95 backdrop-blur-md px-6 py-4 animate-in slide-in-from-top-2 duration-150 shadow-sm z-20">
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-slate-700" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">AI Intelligence & Model Settings</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-700 font-bold"
              >
                Close ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Provider & Text Model */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-700 block">AI Provider</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setProvider('openai');
                      setModel('gpt-6.1-sol');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      provider === 'openai'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    OpenAI
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProvider('anthropic');
                      setModel('claude-3-5-sonnet-20241022');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      provider === 'anthropic'
                        ? 'bg-amber-700 text-white border-amber-800'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Claude
                  </button>
                </div>

                <div className="pt-1">
                  <label className="text-[10px] font-semibold text-slate-500 block mb-1">Text & Reasoning Model</label>
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full text-xs font-bold px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                  >
                    {provider === 'openai' ? (
                      <>
                        <optgroup label="🌟 GPT-6 Models">
                          <option value="gpt-6.1-sol">GPT-6.1 Sol (Advanced coding & automation - Recommended)</option>
                          <option value="gpt-6-astra">GPT-6 Astra (Most demanding reasoning & coding)</option>
                          <option value="gpt-6.1-terra">GPT-6.1 Terra (Fast reasoning & visual understanding)</option>
                          <option value="gpt-6-sol">GPT-6 Sol (Complex coding & agent workflows)</option>
                          <option value="gpt-6-luna">GPT-6 Luna (Affordable, high-volume AI)</option>
                        </optgroup>
                        <optgroup label="⚡ OpenAI Standard">
                          <option value="gpt-4o">GPT-4o (Smart & Fast Multimodal)</option>
                          <option value="o3-mini">o3-mini (High Reasoning Effort)</option>
                          <option value="o1">o1 (Deep Flagship Reasoning)</option>
                          <option value="gpt-4o-mini">GPT-4o Mini (Cost Efficient)</option>
                        </optgroup>
                      </>
                    ) : (
                      <>
                        <option value="claude-3-5-sonnet-20241022">🧠 Claude 3.5 Sonnet (Flagship Intelligence)</option>
                        <option value="claude-3-5-haiku-20241022">🚀 Claude 3.5 Haiku (Fast)</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="pt-1">
                  <label className="text-[10px] font-semibold text-slate-500 block mb-1">Image Model</label>
                  <select
                    value={imageModel}
                    onChange={(e) => setImageModel(e.target.value)}
                    className="w-full text-xs font-bold px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                  >
                    <optgroup label="🎨 Posters, Ads & Designs">
                      <option value="gpt-image-2.6-sunburst">GPT Image 2.6 Sunburst (Detailed image generation & editing)</option>
                      <option value="gpt-image-2.6-flare">GPT Image 2.6 Flare (Fast image generation)</option>
                      <option value="gpt-image-2.5-sunburst">GPT Image 2.5 Sunburst (High-quality image generation)</option>
                      <option value="gpt-image-2.5-flare">GPT Image 2.5 Flare (Everyday image generation)</option>
                      <option value="gpt-image-2">GPT Image 2 (Image generation & editing)</option>
                    </optgroup>
                    <optgroup label="✨ OpenAI Standard">
                      <option value="dall-e-3">DALL-E 3 (OpenAI Standard)</option>
                    </optgroup>
                  </select>
                </div>
              </div>

              {/* API Key & Gateway */}
              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-700 block">
                    {provider === 'openai' ? 'API Key (OpenAI / Gateway sk-...)' : 'Anthropic Claude API Key (sk-ant-...)'}
                  </label>
                  {savedApiKey && (
                    <button
                      type="button"
                      onClick={handleClearSettings}
                      className="text-[10px] font-semibold text-red-600 hover:text-red-700 flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Clear Key</span>
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={provider === 'openai' ? 'sk-proj-... or gateway key' : 'sk-ant-api03-...'}
                    className="w-full px-3 py-1.5 pr-10 text-xs font-mono bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-2 text-slate-400 hover:text-slate-600"
                  >
                    {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Optional Custom Base URL */}
                <div className="pt-0.5">
                  <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                    API Base URL / Gateway <span className="font-normal text-slate-400">(Optional: default is https://api.openai.com/v1)</span>
                  </label>
                  <input
                    type="text"
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    placeholder="https://api.openai.com/v1"
                    className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </div>

                {/* Mode & Save */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-slate-500">Execution Mode:</span>
                    <button
                      type="button"
                      onClick={() => setMode('instant')}
                      className={`px-2 py-0.5 rounded-lg text-[11px] font-bold ${
                        mode === 'instant' ? 'bg-black text-white' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      ⚡ Instant Apply
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode('preview')}
                      className={`px-2 py-0.5 rounded-lg text-[11px] font-bold ${
                        mode === 'preview' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      🛡️ Preview First
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveSettings}
                    className="px-4 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow-2xs"
                  >
                    Save Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Error Alert */}
      {errorMsg && (
        <div className="max-w-3xl mx-auto w-full px-4 pt-2">
          <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-2.5 rounded-xl text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button type="button" onClick={() => setErrorMsg(null)} className="text-rose-600 font-bold">
              ✕
            </button>
          </div>
        </div>
      )}

      {/* 4. Chat Feed (Centered ChatGPT Layout) */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto w-full space-y-6">
          {/* Empty State / Welcome Screen */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-5 pt-6">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-black via-slate-800 to-red-600 flex items-center justify-center text-white shadow-md">
                <Sparkles className="w-7 h-7" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  What can I help you change today?
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Autonomous AI Copilot connected live to NutriFitness.ch products & banners
                </p>
              </div>

              {/* Quick Image Creation Presets Banner */}
              <div className="w-full max-w-2xl bg-gradient-to-r from-amber-50/70 via-rose-50/50 to-orange-50/70 border border-amber-200/80 rounded-2xl p-4 text-left shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                    <Palette className="w-4 h-4 text-rose-600" />
                    <span>🎨 1-Click Banner Image Generator (16:9 Posters & Ads)</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{imageModel}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {QUICK_IMAGE_PRESETS.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(item.prompt, true)}
                      className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-xl text-left text-xs font-semibold text-slate-800 transition-all hover:border-slate-300 shadow-2xs"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Store Operations Shortcuts */}
              <div className="w-full max-w-2xl bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 text-left shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                    <Zap className="w-4 h-4 text-emerald-600" />
                    <span>⚡ Quick Store Actions</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Live</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {QUICK_STORE_ACTIONS.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(item.prompt)}
                      className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-xl text-left text-xs font-semibold text-slate-800 transition-all hover:border-slate-300 shadow-2xs"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Active Message History */}
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center shrink-0 text-xs shadow-2xs mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`space-y-2 ${
                    isUser
                      ? 'bg-slate-100 text-slate-900 rounded-[22px] px-5 py-3 text-sm leading-relaxed max-w-[82%] shadow-2xs'
                      : 'text-slate-900 text-sm leading-relaxed max-w-[90%] font-normal pt-1'
                  }`}
                >
                  <div className="whitespace-pre-line select-text">{msg.content}</div>

                  {/* Visual Card (Results / Image Display) */}
                  {msg.visualCard && (
                    <div className="mt-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl shadow-xs space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Action Result</span>
                        </span>
                        {msg.visualCard.link && (
                          <a
                            href={msg.visualCard.link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
                          >
                            <span>Open Link</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>

                      <div className="font-bold text-xs text-slate-900">{msg.visualCard.title}</div>
                      <div className="text-xs text-slate-600">{msg.visualCard.details}</div>

                      {/* Generated Image Preview & Controls */}
                      {msg.visualCard.imageUrl && (
                        <div className="mt-2 space-y-2">
                          <div className="rounded-xl overflow-hidden border border-slate-200 bg-black/5 shadow-inner">
                            <img
                              src={msg.visualCard.imageUrl}
                              alt="Generated Visual"
                              className="w-full h-auto max-h-80 object-cover"
                            />
                          </div>
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <a
                              href={msg.visualCard.imageUrl}
                              target="_blank"
                              rel="noreferrer"
                              download
                              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download High-Res</span>
                            </a>
                            <button
                              type="button"
                              onClick={() => handleSetAsBanner(msg.visualCard!.imageUrl!, msg.visualCard!.title)}
                              className="px-3 py-1.5 bg-[#F80404] hover:bg-[#FF3D00] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
                            >
                              <ImageIcon className="w-3.5 h-3.5" />
                              <span>Set as Homepage Banner</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Pending Action Confirmation */}
                  {msg.pendingAction && (
                    <div className="mt-3 p-4 bg-amber-50/80 border border-amber-200 rounded-2xl text-slate-800 space-y-2.5">
                      <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        <span>Confirmation Required: {msg.pendingAction.tool}</span>
                      </div>
                      <pre className="text-[11px] bg-white p-2.5 rounded-xl border border-amber-200 overflow-x-auto text-slate-700 font-mono">
                        {JSON.stringify(msg.pendingAction.args, null, 2)}
                      </pre>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleConfirmPendingAction(msg.id, msg.pendingAction!)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                        >
                          Apply Changes Now
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center text-xs">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {isImageMode ? 'AI is creating your image in 4K...' : 'Copilot is analyzing & executing store actions...'}
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 5. Signature ChatGPT Floating Input Capsule */}
      <div className="px-4 pb-4 pt-2 bg-gradient-to-t from-white via-white to-transparent sticky bottom-0">
        <div className="max-w-3xl mx-auto w-full">
          {/* Active Image Mode Indicator Toolbar */}
          {isImageMode && (
            <div className="mb-2 px-3 py-1.5 bg-gradient-to-r from-amber-50 to-rose-50 border border-amber-200 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs animate-in fade-in duration-150">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-rose-600" />
                <span className="font-bold text-slate-800">Image Generation Mode</span>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={imageModel}
                  onChange={(e) => setImageModel(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg text-xs font-bold px-2 py-1 text-slate-800"
                >
                  <option value="gpt-image-2.6-sunburst">GPT Image 2.6 Sunburst</option>
                  <option value="gpt-image-2.6-flare">GPT Image 2.6 Flare</option>
                  <option value="gpt-image-2.5-sunburst">GPT Image 2.5 Sunburst</option>
                  <option value="gpt-image-2.5-flare">GPT Image 2.5 Flare</option>
                  <option value="gpt-image-2">GPT Image 2</option>
                  <option value="dall-e-3">DALL-E 3</option>
                </select>
                <select
                  value={imageSize}
                  onChange={(e) => setImageSize(e.target.value as any)}
                  className="bg-white border border-slate-200 rounded-lg text-xs font-bold px-2 py-1 text-slate-800"
                >
                  <option value="1792x1024">Wide (16:9)</option>
                  <option value="1024x1024">Square (1:1)</option>
                  <option value="1024x1792">Mobile (9:16)</option>
                </select>
                <button
                  type="button"
                  onClick={() => setIsImageMode(false)}
                  className="text-slate-400 hover:text-slate-700 font-bold ml-1"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Capsule Container */}
          <div className="bg-white border border-slate-300 rounded-[28px] shadow-sm hover:shadow-md focus-within:shadow-md focus-within:border-slate-400 transition-all p-2 flex items-end gap-2">
            {/* Create Image Trigger inside capsule */}
            <button
              type="button"
              onClick={() => {
                setIsImageMode(!isImageMode);
                if (!isImageMode && provider !== 'openai') setProvider('openai');
              }}
              className={`p-2 rounded-full transition-all ${
                isImageMode
                  ? 'bg-rose-100 text-rose-700'
                  : 'hover:bg-slate-100 text-slate-500 hover:text-slate-800'
              }`}
              title={isImageMode ? 'Cancel Image Mode' : 'Create Image (16:9 Banner, 1:1 Square, 9:16)'}
            >
              <Palette className="w-5 h-5" />
            </button>

            {/* Input Textarea */}
            <textarea
              ref={textareaRef}
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={
                isImageMode
                  ? 'Describe the image to create (e.g. "Modern fitness banner for Creatine with dark gym background")...'
                  : 'Message NutriFitness Copilot (e.g. "change price of L-Glutamin to 42 chf 300g" or "create image")...'
              }
              rows={1}
              disabled={isLoading}
              className="flex-1 resize-none bg-transparent px-2 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none min-h-[38px] max-h-36"
            />

            {/* ChatGPT Send Button (Circular with ArrowUp) */}
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputPrompt.trim()}
              className="w-9 h-9 rounded-full bg-black text-white hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 flex items-center justify-center transition-all shrink-0 active:scale-95 shadow-2xs"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              )}
            </button>
          </div>

          <div className="text-[11px] text-slate-400 text-center mt-2">
            AI Copilot has direct access to store tools. Verify important price and banner updates.
          </div>
        </div>
      </div>
    </div>
  );
}
