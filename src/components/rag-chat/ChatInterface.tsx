import React, { useState, useEffect, useRef } from 'react';
import { KnowledgeItem, ChatConversation, ChatMessage, Citation } from '../../types';
import { api } from '../../services/api';
import { VoiceService } from '../../services/voice';
import {
  MessageSquare,
  Send,
  Plus,
  Trash2,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Copy,
  Check,
  BookOpen,
  Sparkles,
  ExternalLink,
  Layers,
  ChevronDown,
} from 'lucide-react';

interface ChatInterfaceProps {
  documents: KnowledgeItem[];
  preselectedDocId?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  documents,
  preselectedDocId,
}) => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string>('');
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  // Query modes
  const [mode, setMode] = useState<'document' | 'all-documents' | 'video' | 'knowledge-base'>('knowledge-base');
  const [selectedSourceId, setSelectedSourceId] = useState<string>(preselectedDocId || '');

  // Citations Modal
  const [activeCitationMessage, setActiveCitationMessage] = useState<ChatMessage | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const speechRecognizerRef = useRef<any>(null);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (preselectedDocId) {
      setSelectedSourceId(preselectedDocId);
      const targetDoc = documents.find((d) => d.id === preselectedDocId);
      if (targetDoc?.sourceType === 'youtube') setMode('video');
      else setMode('document');
    }
  }, [preselectedDocId, documents]);

  const loadConversations = async () => {
    try {
      const list = await api.getConversations();
      setConversations(list);
      if (list.length > 0 && !activeConvId) {
        setActiveConvId(list[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const activeConversation = conversations.find((c) => c.id === activeConvId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages, loading]);

  const handleNewConversation = async () => {
    try {
      const newConv = await api.createConversation('New Research Session');
      setConversations((prev) => [newConv, ...prev]);
      setActiveConvId(newConv.id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.sendMessage(id, '', ''); // remove
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConvId === id) {
        const remaining = conversations.filter((c) => c.id !== id);
        setActiveConvId(remaining.length > 0 ? remaining[0].id : '');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const textToSend = inputMessage.trim();
    setInputMessage('');
    setLoading(true);

    let targetConvId = activeConvId;
    if (!targetConvId) {
      const created = await api.createConversation(textToSend.slice(0, 30) + '...');
      targetConvId = created.id;
      setConversations((prev) => [created, ...prev]);
      setActiveConvId(created.id);
    }

    try {
      const res = await api.sendMessage(
        targetConvId,
        textToSend,
        mode,
        selectedSourceId || undefined
      );

      // Update state with new message
      setConversations((prev) =>
        prev.map((c) => (c.id === targetConvId ? res.conversation : c))
      );
    } catch (err: any) {
      console.error('Send message error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleSpeak = (text: string, id: string) => {
    if (speakingId === id) {
      VoiceService.stopSpeaking();
      setSpeakingId(null);
    } else {
      VoiceService.speak(text, () => setSpeakingId(null));
      setSpeakingId(id);
    }
  };

  const handleToggleSpeechInput = () => {
    if (!VoiceService.isSpeechRecognitionSupported()) {
      setSpeechError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      setTimeout(() => setSpeechError(null), 4000);
      return;
    }

    if (isListening) {
      speechRecognizerRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        const recognizer = VoiceService.createSpeechRecognizer(
          (transcript) => {
            setInputMessage((prev) => (prev ? `${prev} ${transcript}` : transcript));
            setIsListening(false);
          },
          (err) => {
            console.error('Speech recognition error:', err);
            setIsListening(false);
          }
        );
        if (recognizer) {
          speechRecognizerRef.current = recognizer;
          recognizer.start();
          setIsListening(true);
        }
      } catch (err) {
        console.error(err);
        setIsListening(false);
      }
    }
  };

  return (
    <div className="flex h-[calc(100vh-6.5rem)] rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
      {/* Left Sidebar: Conversations List */}
      <div className="w-64 border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col justify-between shrink-0">
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Conversations
          </span>
          <button
            onClick={handleNewConversation}
            className="p-1 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors"
            title="New Conversation"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400">
              No conversations yet. Start asking a question.
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setActiveConvId(conv.id)}
                className={`w-full group p-2.5 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-colors ${
                  activeConvId === conv.id
                    ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2 truncate min-w-0">
                  <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-70" />
                  <span className="truncate">{conv.title || 'Research Session'}</span>
                </div>
                <button
                  onClick={(e) => handleDeleteConversation(conv.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 rounded transition-opacity"
                  title="Delete chat"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Selected Context Indicator */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
          <div>Mode: <span className="font-semibold text-indigo-600 dark:text-indigo-400 capitalize">{mode.replace('-', ' ')}</span></div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Control Bar: Mode & Source Selector */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/40 dark:bg-slate-900/40">
          {/* Query Mode Switcher */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-200/70 dark:bg-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setMode('knowledge-base')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                mode === 'knowledge-base'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              All Knowledge
            </button>
            <button
              onClick={() => setMode('all-documents')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                mode === 'all-documents'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              All PDFs
            </button>
            <button
              onClick={() => setMode('document')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                mode === 'document'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Specific Document
            </button>
            <button
              onClick={() => setMode('video')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                mode === 'video'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Specific Video
            </button>
          </div>

          {/* Source Dropdown if mode is specific */}
          {(mode === 'document' || mode === 'video') && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Source:</span>
              <select
                value={selectedSourceId}
                onChange={(e) => setSelectedSourceId(e.target.value)}
                className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1 text-slate-900 dark:text-white max-w-xs truncate"
              >
                <option value="">Select a source...</option>
                {documents
                  .filter((d) => (mode === 'video' ? d.sourceType === 'youtube' : d.sourceType !== 'youtube'))
                  .map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.title}
                    </option>
                  ))}
              </select>
            </div>
          )}
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {(!activeConversation || activeConversation.messages.length === 0) && (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  RAG Semantic Conversation
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Query your uploaded PDFs, lecture transcripts, and notes with real-time vector citations.
                </p>
              </div>

              {/* Sample Questions */}
              <div className="w-full space-y-2 pt-2">
                {[
                  'Why does Scaled Dot-Product Attention divide by sqrt(d_k)?',
                  'What is the difference between supervised and unsupervised learning?',
                  'What are common time complexity classes in Big-O analysis?',
                ].map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setInputMessage(prompt);
                    }}
                    className="w-full text-left p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeConversation?.messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-2xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-xl p-4 text-xs leading-relaxed ${
                    isUser
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700/60'
                  }`}
                >
                  {/* Message Content */}
                  <div className="whitespace-pre-wrap font-sans">{msg.content}</div>

                  {/* Assistant Message Actions & Citations */}
                  {!isUser && (
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        {msg.citations && msg.citations.length > 0 && (
                          <button
                            onClick={() => setActiveCitationMessage(msg)}
                            className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 rounded hover:bg-indigo-100 transition-colors"
                          >
                            <BookOpen className="w-3 h-3" />
                            <span>{msg.citations.length} Source Citations</span>
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggleSpeak(msg.content, msg.id)}
                          className="p-1 hover:text-slate-900 dark:hover:text-white rounded"
                          title={speakingId === msg.id ? 'Stop reading' : 'Read aloud with browser speech'}
                        >
                          {speakingId === msg.id ? (
                            <VolumeX className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleCopy(msg.content, msg.id)}
                          className="p-1 hover:text-slate-900 dark:hover:text-white rounded"
                          title="Copy text"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                <span>Retrieving semantic vectors & synthesizing answer...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          {speechError && (
            <div className="mb-2 text-xs text-red-500">{speechError}</div>
          )}
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleSpeechInput}
              className={`p-2.5 rounded-lg border transition-colors ${
                isListening
                  ? 'bg-red-500 text-white border-red-500 animate-pulse'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
              title={isListening ? 'Listening (Click to stop)' : 'Speak question (Browser Voice API)'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={
                isListening
                  ? 'Listening to your voice...'
                  : mode === 'knowledge-base'
                  ? 'Ask anything across your entire indexed knowledge base...'
                  : `Ask about selected ${mode}...`
              }
              className="flex-1 px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              disabled={loading}
            />

            <button
              type="submit"
              disabled={!inputMessage.trim() || loading}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg transition-colors shadow-2xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Citations Modal */}
      {activeCitationMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  <span>Grounding Source Citations</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Exact text passages retrieved via cosine similarity to formulate the model's answer.
                </p>
              </div>
              <button
                onClick={() => setActiveCitationMessage(null)}
                className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded"
              >
                Close
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              {activeCitationMessage.citations?.map((c, i) => (
                <div
                  key={c.chunkId}
                  className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50"
                >
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      [Source {i + 1}] {c.documentTitle}
                    </span>
                    <span className="tabular-nums font-mono text-indigo-600 dark:text-indigo-400">
                      Score: {c.relevanceScore} · {c.pageOrTime || 'Section'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-mono bg-white dark:bg-slate-900 p-2.5 rounded border border-slate-200 dark:border-slate-800 leading-relaxed whitespace-pre-wrap">
                    "{c.snippet}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
