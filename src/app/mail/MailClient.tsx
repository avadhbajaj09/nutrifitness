'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  Inbox,
  Send,
  Trash2,
  Paperclip,
  Search,
  RefreshCw,
  Reply,
  Star,
  CheckCircle,
  AlertCircle,
  X,
  FileText,
  Download,
  LogOut,
  ExternalLink,
  ShieldCheck,
  Eye,
  EyeOff,
  Plus,
  ArrowLeft,
  Mail as MailIcon,
  Clock,
  User,
  ChevronRight,
  Maximize2,
  Minimize2
} from 'lucide-react';

const ADMIN_PASSWORD = 'Geneva@03564';

interface Attachment {
  filename: string;
  size?: number;
  contentType?: string;
  url?: string;
  path?: string;
  base64?: string;
}

interface EmailItem {
  id: string;
  resend_id?: string;
  folder: 'inbox' | 'sent' | 'trash';
  from_name?: string;
  from_email: string;
  to_emails: string[];
  cc_emails?: string[];
  bcc_emails?: string[];
  reply_to?: string;
  subject: string;
  snippet?: string;
  body_text?: string;
  body_html?: string;
  attachments?: Attachment[];
  is_read: boolean;
  is_starred: boolean;
  created_at: string;
}

interface MailCounts {
  inbox: number;
  inboxUnread: number;
  sent: number;
  trash: number;
}

export default function MailClient() {
  // 1. Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // 2. Mail State
  const [activeFolder, setActiveFolder] = useState<'inbox' | 'sent' | 'trash'>('inbox');
  const [emails, setEmails] = useState<EmailItem[]>([]);
  const [counts, setCounts] = useState<MailCounts>({ inbox: 0, inboxUnread: 0, sent: 0, trash: 0 });
  const [selectedEmail, setSelectedEmail] = useState<EmailItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');

  // 3. Compose Modal State
  const [isComposeOpen, setIsComposeOpen] = useState<boolean>(false);
  const [composeTo, setComposeTo] = useState<string>('');
  const [composeCc, setComposeCc] = useState<string>('');
  const [composeBcc, setComposeBcc] = useState<string>('');
  const [showCcBcc, setShowCcBcc] = useState<boolean>(false);
  const [composeSubject, setComposeSubject] = useState<string>('');
  const [composeBody, setComposeBody] = useState<string>('');
  const [composeAttachments, setComposeAttachments] = useState<Attachment[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [composeError, setComposeError] = useState<string | null>(null);
  const [composeSuccess, setComposeSuccess] = useState<string | null>(null);

  // Mobile navigation state
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check stored auth
  useEffect(() => {
    try {
      const stored = localStorage.getItem('nf_admin_auth');
      if (stored === ADMIN_PASSWORD) {
        setIsAuthenticated(true);
      }
    } catch {
      // ignore
    } finally {
      setAuthChecking(false);
    }
  }, []);

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load emails
  const fetchEmails = useCallback(async (folder = activeFolder, search = debouncedSearch) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ folder });
      if (search) params.set('search', search);

      const res = await fetch(`/api/mail?${params.toString()}`);
      if (!res.ok) throw new Error('Erreur de chargement');
      const data = await res.json();

      setEmails(data.emails || []);
      if (data.counts) {
        setCounts(data.counts);
      }

      // If selected email is not in current list, keep or clear
      if (selectedEmail) {
        const found = (data.emails || []).find((e: EmailItem) => e.id === selectedEmail.id);
        if (found) {
          setSelectedEmail(found);
        }
      }
    } catch (err: any) {
      console.error('Fetch emails error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeFolder, debouncedSearch, selectedEmail]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchEmails(activeFolder, debouncedSearch);
    }
  }, [isAuthenticated, activeFolder, debouncedSearch]);

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setAuthError(null);
      try {
        localStorage.setItem('nf_admin_auth', ADMIN_PASSWORD);
      } catch {
        // ignore
      }
    } else {
      setAuthError('Mot de passe administrateur incorrect.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem('nf_admin_auth');
    } catch {
      // ignore
    }
  };

  // Select an email and load full details
  const handleSelectEmail = async (email: EmailItem) => {
    setSelectedEmail(email);
    setMobileView('detail');

    if (!email.is_read) {
      // Optimistic update
      setEmails(prev => prev.map(e => e.id === email.id ? { ...e, is_read: true } : e));
      setCounts(prev => ({ ...prev, inboxUnread: Math.max(0, prev.inboxUnread - 1) }));

      try {
        const res = await fetch(`/api/mail/${email.id}`);
        const data = await res.json();
        if (data.email) {
          setSelectedEmail(data.email);
        }
      } catch (err) {
        console.error('Fetch detail error:', err);
      }
    } else {
      try {
        const res = await fetch(`/api/mail/${email.id}`);
        const data = await res.json();
        if (data.email) {
          setSelectedEmail(data.email);
        }
      } catch (err) {
        console.error('Fetch detail error:', err);
      }
    }
  };

  // Toggle Star
  const handleToggleStar = async (e: React.MouseEvent, email: EmailItem) => {
    e.stopPropagation();
    const newStar = !email.is_starred;
    setEmails(prev => prev.map(item => item.id === email.id ? { ...item, is_starred: newStar } : item));
    if (selectedEmail?.id === email.id) {
      setSelectedEmail(prev => prev ? { ...prev, is_starred: newStar } : null);
    }

    try {
      await fetch(`/api/mail/${email.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_starred: newStar }),
      });
    } catch (err) {
      console.error('Toggle star error:', err);
    }
  };

  // Toggle Read / Unread
  const handleToggleRead = async (email: EmailItem) => {
    const newRead = !email.is_read;
    setEmails(prev => prev.map(item => item.id === email.id ? { ...item, is_read: newRead } : item));
    if (selectedEmail?.id === email.id) {
      setSelectedEmail(prev => prev ? { ...prev, is_read: newRead } : null);
    }
    setCounts(prev => ({
      ...prev,
      inboxUnread: newRead ? Math.max(0, prev.inboxUnread - 1) : prev.inboxUnread + 1,
    }));

    try {
      await fetch(`/api/mail/${email.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_read: newRead }),
      });
    } catch (err) {
      console.error('Toggle read error:', err);
    }
  };

  // Delete Email
  const handleDeleteEmail = async (email: EmailItem) => {
    const isHardDelete = activeFolder === 'trash' || email.folder === 'trash';
    const confirmMsg = isHardDelete
      ? 'Supprimer définitivement cet e-mail ? Cette action est irréversible.'
      : 'Déplacer cet e-mail vers la corbeille ?';

    if (!window.confirm(confirmMsg)) return;

    // Remove from UI immediately
    setEmails(prev => prev.filter(e => e.id !== email.id));
    if (selectedEmail?.id === email.id) {
      setSelectedEmail(null);
      setMobileView('list');
    }

    try {
      await fetch(`/api/mail/${email.id}`, { method: 'DELETE' });
      fetchEmails();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // Open Compose
  const handleOpenCompose = (replyToEmail?: EmailItem) => {
    if (replyToEmail) {
      setComposeTo(replyToEmail.reply_to || replyToEmail.from_email);
      setComposeSubject(replyToEmail.subject.startsWith('Re:') ? replyToEmail.subject : `Re: ${replyToEmail.subject}`);
      const quoteHeader = `\n\n\n--- Message d'origine ---\nDe : ${replyToEmail.from_name || replyToEmail.from_email} <${replyToEmail.from_email}>\nDate : ${new Date(replyToEmail.created_at).toLocaleString('fr-CH')}\nObjet : ${replyToEmail.subject}\n\n`;
      setComposeBody(quoteHeader + (replyToEmail.body_text || ''));
    } else {
      setComposeTo('');
      setComposeCc('');
      setComposeBcc('');
      setComposeSubject('');
      setComposeBody('');
      setComposeAttachments([]);
    }
    setComposeError(null);
    setComposeSuccess(null);
    setIsComposeOpen(true);
  };

  // File Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setComposeError(null);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/mail/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erreur lors du téléchargement');

        if (data.attachment) {
          setComposeAttachments(prev => [...prev, data.attachment]);
        }
      }
    } catch (err: any) {
      setComposeError(err.message || 'Erreur d\'upload');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setComposeAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Send Email
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTo.trim()) {
      setComposeError('Veuillez renseigner au moins un destinataire.');
      return;
    }

    setIsSending(true);
    setComposeError(null);

    try {
      const res = await fetch('/api/mail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: composeTo,
          cc: composeCc,
          bcc: composeBcc,
          subject: composeSubject,
          bodyText: composeBody,
          attachments: composeAttachments,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de l\'envoi');

      setComposeSuccess('E-mail envoyé avec succès !');
      setTimeout(() => {
        setIsComposeOpen(false);
        setComposeSuccess(null);
        fetchEmails();
      }, 1200);
    } catch (err: any) {
      setComposeError(err.message || 'Erreur lors de l\'envoi de l\'e-mail');
    } finally {
      setIsSending(false);
    }
  };

  // Helper date formatter
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const isToday = d.toDateString() === now.toDateString();
      if (isToday) {
        return d.toLocaleTimeString('fr-CH', { hour: '2-digit', minute: '2-digit' });
      }
      const yesterday = new Date();
      yesterday.setDate(now.getDate() - 1);
      if (d.toDateString() === yesterday.toDateString()) {
        return 'Hier';
      }
      return d.toLocaleDateString('fr-CH', { day: 'numeric', month: 'short' });
    } catch {
      return '';
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // -------------------------------------------------------------
  // RENDER: Auth Gate
  // -------------------------------------------------------------
  if (authChecking) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-slate-500 font-sans">
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 font-sans text-slate-900">
        <div className="w-full max-w-md p-8 border border-slate-200 rounded-2xl shadow-sm bg-white">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white font-bold">
              <MailIcon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">NutriFitness Mail</h1>
              <div className="text-xs text-slate-500">info@nutrifitness.ch</div>
            </div>
          </div>

          <p className="text-sm text-slate-600 mb-6">
            Accès sécurisé réservé à l&apos;administrateur de la boutique pour la gestion des e-mails.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Mot de passe Administrateur
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Entrez votre mot de passe"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent text-sm bg-slate-50"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {authError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {authError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-colors shadow-sm"
            >
              Accéder à la messagerie
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <Link href="/wp-admin" className="hover:text-slate-700 flex items-center gap-1">
              ← Panneau d&apos;administration
            </Link>
            <span>NutriFitness Suisse</span>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: Full Mail Application (White background, Simple UX)
  // -------------------------------------------------------------
  return (
    <div className="h-screen w-full bg-white text-slate-900 flex flex-col font-sans overflow-hidden">
      
      {/* Top Application Bar */}
      <header className="h-14 border-b border-slate-200 px-4 flex items-center justify-between bg-white shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white">
            <MailIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
              NutriFitness Mail
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                info@nutrifitness.ch
              </span>
            </div>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par expéditeur, sujet ou contenu..."
              className="w-full pl-9 pr-8 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-red-600 focus:border-red-600 bg-slate-50 focus:bg-white transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Top Right Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchEmails()}
            disabled={isLoading}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="Rafraîchir les e-mails"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-red-600' : ''}`} />
          </button>

          <Link
            href="/wp-admin"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
          >
            Admin Store
            <ExternalLink className="w-3 h-3" />
          </Link>

          <button
            onClick={handleLogout}
            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Déconnexion"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Split Interface */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* PANE 1: Left Navigation Sidebar */}
        <aside className="w-56 border-r border-slate-200 flex flex-col justify-between p-3 bg-slate-50/70 shrink-0">
          <div className="space-y-4">
            {/* Primary Action Button: Compose */}
            <button
              onClick={() => handleOpenCompose()}
              className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs tracking-wide flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              Nouveau message
            </button>

            {/* Folder Navigation List */}
            <nav className="space-y-1 text-xs font-medium">
              <button
                onClick={() => { setActiveFolder('inbox'); setSelectedEmail(null); }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                  activeFolder === 'inbox'
                    ? 'bg-red-50 text-red-700 font-bold'
                    : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Inbox className="w-4 h-4" />
                  <span>Boîte de réception</span>
                </div>
                {counts.inboxUnread > 0 ? (
                  <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold">
                    {counts.inboxUnread}
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400">{counts.inbox}</span>
                )}
              </button>

              <button
                onClick={() => { setActiveFolder('sent'); setSelectedEmail(null); }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                  activeFolder === 'sent'
                    ? 'bg-red-50 text-red-700 font-bold'
                    : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Send className="w-4 h-4" />
                  <span>Envoyés</span>
                </div>
                <span className="text-[11px] text-slate-400">{counts.sent}</span>
              </button>

              <button
                onClick={() => { setActiveFolder('trash'); setSelectedEmail(null); }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                  activeFolder === 'trash'
                    ? 'bg-red-50 text-red-700 font-bold'
                    : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Trash2 className="w-4 h-4" />
                  <span>Corbeille</span>
                </div>
                <span className="text-[11px] text-slate-400">{counts.trash}</span>
              </button>
            </nav>
          </div>

          {/* Sidebar Footer Info */}
          <div className="p-3 bg-white rounded-xl border border-slate-200 text-[11px] space-y-2">
            <div className="flex items-center justify-between font-semibold text-slate-700">
              <span>Statut Services</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="space-y-1 text-slate-500">
              <div className="flex items-center justify-between">
                <span>Resend API</span>
                <span className="text-emerald-600 font-medium">Connecté</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Supabase DB</span>
                <span className="text-emerald-600 font-medium">Connecté</span>
              </div>
            </div>
          </div>
        </aside>

        {/* PANE 2: Email List View */}
        <section className={`w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col bg-white shrink-0 ${
          mobileView === 'detail' ? 'hidden md:flex' : 'flex'
        }`}>
          {/* Header of List */}
          <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/40">
            <div className="font-bold text-xs uppercase tracking-wider text-slate-700">
              {activeFolder === 'inbox' && 'Boîte de réception'}
              {activeFolder === 'sent' && 'Messages envoyés'}
              {activeFolder === 'trash' && 'Corbeille'}
            </div>
            <div className="text-[11px] text-slate-400 font-medium">
              {emails.length} message{emails.length > 1 ? 's' : ''}
            </div>
          </div>

          {/* Email Items Scrollable */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {emails.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <MailIcon className="w-8 h-8 mx-auto text-slate-300" />
                <div className="text-xs font-semibold text-slate-600">Aucun message</div>
                <p className="text-[11px]">Ce dossier ne contient aucun e-mail pour le moment.</p>
              </div>
            ) : (
              emails.map((email) => {
                const isSelected = selectedEmail?.id === email.id;
                const recipientOrSender = activeFolder === 'sent'
                  ? `À: ${(email.to_emails || []).join(', ')}`
                  : (email.from_name || email.from_email);

                return (
                  <div
                    key={email.id}
                    onClick={() => handleSelectEmail(email)}
                    className={`p-3 cursor-pointer transition-colors text-left relative ${
                      isSelected
                        ? 'bg-red-50/60 border-l-4 border-red-600'
                        : !email.is_read
                        ? 'bg-slate-50/70 hover:bg-slate-100/70 font-semibold'
                        : 'hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 min-w-0 pr-2">
                        {!email.is_read && (
                          <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
                        )}
                        <span className={`text-xs truncate ${!email.is_read ? 'font-bold text-slate-900' : 'text-slate-800'}`}>
                          {recipientOrSender}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {formatDate(email.created_at)}
                      </span>
                    </div>

                    <div className={`text-xs mb-1 line-clamp-1 ${!email.is_read ? 'font-bold text-slate-900' : 'text-slate-700'}`}>
                      {email.subject}
                    </div>

                    <div className="text-[11px] text-slate-500 line-clamp-2">
                      {email.snippet || '(Aucun extrait)'}
                    </div>

                    {/* Metadata indicators */}
                    <div className="flex items-center justify-between mt-2 pt-1">
                      <div className="flex items-center gap-2">
                        {email.attachments && email.attachments.length > 0 && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-slate-500">
                            <Paperclip className="w-3 h-3 text-slate-400" />
                            {email.attachments.length}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => handleToggleStar(e, email)}
                          className={`p-1 rounded hover:bg-slate-200/50 ${email.is_starred ? 'text-amber-500' : 'text-slate-300'}`}
                          title="Favori"
                        >
                          <Star className={`w-3.5 h-3.5 ${email.is_starred ? 'fill-amber-500' : ''}`} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleDeleteEmail(email); }}
                          className="p-1 text-slate-300 hover:text-red-600 rounded hover:bg-slate-200/50"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* PANE 3: Reading Pane (Right) */}
        <main className={`flex-1 flex flex-col bg-white overflow-y-auto ${
          mobileView === 'detail' ? 'flex' : 'hidden md:flex'
        }`}>
          {selectedEmail ? (
            <div className="flex-1 flex flex-col h-full">
              {/* Reading Pane Toolbar */}
              <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setMobileView('list')}
                    className="md:hidden p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleOpenCompose(selectedEmail)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm"
                  >
                    <Reply className="w-3.5 h-3.5" />
                    Répondre
                  </button>

                  <button
                    onClick={() => handleToggleRead(selectedEmail)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    {selectedEmail.is_read ? 'Marquer non lu' : 'Marquer lu'}
                  </button>

                  <button
                    onClick={() => handleDeleteEmail(selectedEmail)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Supprimer
                  </button>
                </div>

                <div className="text-[11px] text-slate-400">
                  {new Date(selectedEmail.created_at).toLocaleString('fr-CH', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>

              {/* Message Header */}
              <div className="p-6 border-b border-slate-100 space-y-4">
                <h2 className="text-xl font-bold text-slate-900 leading-snug">
                  {selectedEmail.subject}
                </h2>

                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-sm text-slate-700">
                      {(selectedEmail.from_name || selectedEmail.from_email).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">
                        {selectedEmail.from_name || selectedEmail.from_email}
                      </div>
                      <div className="text-xs text-slate-500">
                        De : <span className="text-slate-800">{selectedEmail.from_email}</span>
                      </div>
                      <div className="text-xs text-slate-500">
                        À : <span className="text-slate-800">{(selectedEmail.to_emails || []).join(', ')}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleToggleStar(e, selectedEmail)}
                    className="p-1.5 text-slate-300 hover:text-amber-500"
                  >
                    <Star className={`w-5 h-5 ${selectedEmail.is_starred ? 'text-amber-500 fill-amber-500' : ''}`} />
                  </button>
                </div>

                {/* Attachments list if any */}
                {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                  <div className="pt-2">
                    <div className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                      <Paperclip className="w-3.5 h-3.5" />
                      {selectedEmail.attachments.length} Pièce{selectedEmail.attachments.length > 1 ? 's' : ''} jointe{selectedEmail.attachments.length > 1 ? 's' : ''}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedEmail.attachments.map((att, idx) => (
                        <a
                          key={idx}
                          href={att.url || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs text-slate-800 font-medium transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5 text-red-600" />
                          <span>{att.filename}</span>
                          {att.size && (
                            <span className="text-[10px] text-slate-400">({formatFileSize(att.size)})</span>
                          )}
                          <Download className="w-3 h-3 text-slate-400" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Message Body Content */}
              <div className="flex-1 p-6 overflow-y-auto">
                {selectedEmail.body_html ? (
                  <div className="max-w-3xl">
                    <iframe
                      srcDoc={`
                        <!DOCTYPE html>
                        <html>
                          <head>
                            <meta charset="utf-8">
                            <style>
                              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #1e293b; margin: 0; padding: 0; }
                              a { color: #e11d1d; }
                              img { max-width: 100%; height: auto; }
                            </style>
                          </head>
                          <body>${selectedEmail.body_html}</body>
                        </html>
                      `}
                      sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin"
                      className="w-full border-0 min-h-[450px]"
                      title="Contenu de l'e-mail"
                    />
                  </div>
                ) : (
                  <div className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed font-sans max-w-3xl">
                    {selectedEmail.body_text || '(Aucun contenu textuel)'}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-300 mb-4">
                <MailIcon className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-bold text-slate-700 mb-1">
                Aucun e-mail sélectionné
              </h3>
              <p className="text-xs text-slate-500 max-w-xs">
                Sélectionnez un e-mail dans la liste de gauche pour afficher son contenu ou cliquez sur &quot;Nouveau message&quot; pour écrire.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* --------------------------------------------------------- */}
      {/* COMPOSE EMAIL MODAL                                       */}
      {/* --------------------------------------------------------- */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-red-600 flex items-center justify-center text-white text-xs">
                  <Send className="w-3.5 h-3.5" />
                </div>
                <div className="font-bold text-sm text-slate-900">
                  Nouveau message — info@nutrifitness.ch
                </div>
              </div>
              <button
                onClick={() => setIsComposeOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSendEmail} className="flex-1 flex flex-col overflow-hidden">
              <div className="p-5 space-y-3 overflow-y-auto flex-1">
                
                {/* De: */}
                <div className="flex items-center text-xs pb-2 border-b border-slate-100">
                  <span className="w-16 font-semibold text-slate-500">De :</span>
                  <span className="font-semibold text-slate-800">
                    NutriFitness &lt;info@nutrifitness.ch&gt;
                  </span>
                </div>

                {/* À: */}
                <div className="flex items-center text-xs pb-2 border-b border-slate-100">
                  <span className="w-16 font-semibold text-slate-500">À :</span>
                  <input
                    type="text"
                    value={composeTo}
                    onChange={(e) => setComposeTo(e.target.value)}
                    placeholder="client@domaine.ch, autre@example.com"
                    className="flex-1 text-xs text-slate-900 focus:outline-none bg-transparent"
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowCcBcc(!showCcBcc)}
                    className="text-[11px] font-semibold text-red-600 hover:underline px-2"
                  >
                    {showCcBcc ? 'Masquer Cc/Cci' : 'Cc / Cci'}
                  </button>
                </div>

                {/* Cc / Bcc */}
                {showCcBcc && (
                  <>
                    <div className="flex items-center text-xs pb-2 border-b border-slate-100">
                      <span className="w-16 font-semibold text-slate-500">Cc :</span>
                      <input
                        type="text"
                        value={composeCc}
                        onChange={(e) => setComposeCc(e.target.value)}
                        placeholder="copie@domaine.ch"
                        className="flex-1 text-xs text-slate-900 focus:outline-none bg-transparent"
                      />
                    </div>
                    <div className="flex items-center text-xs pb-2 border-b border-slate-100">
                      <span className="w-16 font-semibold text-slate-500">Cci :</span>
                      <input
                        type="text"
                        value={composeBcc}
                        onChange={(e) => setComposeBcc(e.target.value)}
                        placeholder="copie.cachee@domaine.ch"
                        className="flex-1 text-xs text-slate-900 focus:outline-none bg-transparent"
                      />
                    </div>
                  </>
                )}

                {/* Objet */}
                <div className="flex items-center text-xs pb-2 border-b border-slate-100">
                  <span className="w-16 font-semibold text-slate-500">Objet :</span>
                  <input
                    type="text"
                    value={composeSubject}
                    onChange={(e) => setComposeSubject(e.target.value)}
                    placeholder="Sujet de votre message"
                    className="flex-1 text-xs font-medium text-slate-900 focus:outline-none bg-transparent"
                  />
                </div>

                {/* Attachments preview */}
                {composeAttachments.length > 0 && (
                  <div className="py-2 space-y-1.5">
                    <div className="text-[11px] font-semibold text-slate-500">Pièces jointes :</div>
                    <div className="flex flex-wrap gap-2">
                      {composeAttachments.map((att, index) => (
                        <div
                          key={index}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-700"
                        >
                          <FileText className="w-3.5 h-3.5 text-red-600" />
                          <span className="max-w-[140px] truncate">{att.filename}</span>
                          {att.size && <span className="text-[10px] text-slate-400">({formatFileSize(att.size)})</span>}
                          <button
                            type="button"
                            onClick={() => handleRemoveAttachment(index)}
                            className="p-0.5 hover:text-red-600 text-slate-400"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Message Body Textarea */}
                <div className="pt-2">
                  <textarea
                    rows={10}
                    value={composeBody}
                    onChange={(e) => setComposeBody(e.target.value)}
                    placeholder="Écrivez votre message ici..."
                    className="w-full text-xs text-slate-900 focus:outline-none bg-slate-50/50 p-3 rounded-xl border border-slate-200 focus:border-red-600 focus:bg-white resize-y font-sans leading-relaxed"
                    required
                  />
                </div>

                {/* Feedback Alerts */}
                {composeError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {composeError}
                  </div>
                )}

                {composeSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-medium flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    {composeSuccess}
                  </div>
                )}
              </div>

              {/* Modal Footer Controls */}
              <div className="px-5 py-3.5 border-t border-slate-200 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-xs font-medium text-slate-700 transition-colors"
                  >
                    <Paperclip className={`w-3.5 h-3.5 text-slate-500 ${isUploading ? 'animate-spin' : ''}`} />
                    {isUploading ? 'Téléchargement...' : 'Joindre un fichier'}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsComposeOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 transition-colors"
                  >
                    Annuler
                  </button>

                  <button
                    type="submit"
                    disabled={isSending || isUploading}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition-colors shadow-sm disabled:opacity-50"
                  >
                    <Send className={`w-3.5 h-3.5 ${isSending ? 'animate-spin' : ''}`} />
                    {isSending ? 'Envoi en cours...' : 'Envoyer'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
