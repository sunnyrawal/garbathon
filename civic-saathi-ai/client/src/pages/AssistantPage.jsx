// src/pages/AssistantPage.jsx
import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { askAssistant } from '../services/api.js';
import DemoAlert from '../components/DemoAlert.jsx';

const QUICK_QUESTIONS = [
  'How does CivicSaathi AI work?',
  'What departments handle potholes?',
  'How do I check my complaint status?',
  'What types of issues can I report?',
];

function parseMarkdown(text) {
  // Basic markdown: bold, newlines
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br />');
}

export default function AssistantPage() {
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm CivicSaathi AI. I can help you understand complaints, check status, or explain how the system works. Ask me anything!",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Pre-fill from URL
  useEffect(() => {
    const ticket = searchParams.get('ticket');
    if (ticket) {
      setInput(`What is the status of complaint ${ticket}?`);
      inputRef.current?.focus();
    }
  }, [searchParams]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text = input) => {
    const q = text.trim();
    if (!q || isLoading) return;

    const ticketMatch = q.match(/CS-DEMO-[A-Z0-9]+/i);
    const ticketId = ticketMatch ? ticketMatch[0].toUpperCase() : null;

    setMessages((prev) => [...prev, { role: 'user', content: q }]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await askAssistant(q, ticketId);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: res.data?.answer || 'Sorry, I could not generate a response.',
          toolEvents: res.data?.toolEvents || [],
          ticketData: res.data?.ticketData || null,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `I encountered an error: ${err.userMessage || 'Please try again.'}`,
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 flex flex-col h-[calc(100vh-80px)]">
      <DemoAlert className="mb-4 shrink-0" />

      <div className="mb-4 shrink-0">
        <h1 className="font-display font-bold text-xl text-slate-800 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          AI Assistant
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Ask about complaints, status, or how the system works.
        </p>
      </div>

      {/* Quick questions */}
      <div className="flex flex-wrap gap-2 mb-4 shrink-0">
        {QUICK_QUESTIONS.map((q) => (
          <button
            key={q}
            onClick={() => sendMessage(q)}
            disabled={isLoading}
            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs rounded-full hover:border-amber-400 hover:text-amber-700 transition-colors disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-0">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 animate-fade-in ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              msg.role === 'user' ? 'bg-amber-500' : 'bg-gradient-to-br from-[#0f172a] to-[#334155]'
            }`}>
              {msg.role === 'user' ? (
                <User className="w-4 h-4 text-white" />
              ) : (
                <Bot className="w-4 h-4 text-amber-400" />
              )}
            </div>

            {/* Bubble */}
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
              msg.role === 'user'
                ? 'bg-amber-500 text-white rounded-tr-sm'
                : msg.isError
                ? 'bg-rose-50 border border-rose-200 text-rose-800 rounded-tl-sm'
                : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm'
            }`}>
              {msg.role === 'assistant' ? (
                <div
                  dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.content) }}
                  className="leading-relaxed"
                />
              ) : (
                <p>{msg.content}</p>
              )}

              {/* Tool events */}
              {msg.toolEvents && msg.toolEvents.length > 0 && (
                <div className="mt-2 pt-2 border-t border-slate-100 space-y-0.5">
                  <p className="text-xs text-slate-400 font-medium">Tools used:</p>
                  {msg.toolEvents.map((e, j) => (
                    <p key={j} className="text-xs text-slate-400">
                      ✓ <span className="font-mono">{e.tool}</span>
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 animate-fade-in">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0f172a] to-[#334155] flex items-center justify-center">
              <Bot className="w-4 h-4 text-amber-400" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2 text-slate-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span className="text-sm">Thinking…</span>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="mt-4 shrink-0 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-end gap-3 p-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Ask me anything… e.g. 'What is the status of CS-DEMO-SAMPLE01?'"
            rows={2}
            className="flex-1 resize-none text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          <button
            id="btn-send"
            onClick={() => sendMessage()}
            disabled={isLoading || !input.trim()}
            className="w-10 h-10 flex items-center justify-center bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl disabled:opacity-50 hover:shadow-md transition-all"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
        <p className="px-4 pb-2 text-xs text-slate-400">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
