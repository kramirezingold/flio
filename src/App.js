import { useState, useRef, useEffect } from 'react';
import Anthropic from '@anthropic-ai/sdk';
import { getSystemPrompt } from './systemPrompt';

// ── Icons ──────────────────────────────────────────────────────────────────

function PlaneIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
    </svg>
  );
}

function SendIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
  );
}

function ChevronRightIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
    </svg>
  );
}

function ArrowLeftIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 5l-7 7 7 7" />
    </svg>
  );
}

// ── Landing Page ───────────────────────────────────────────────────────────

function LandingPage({ onGetStarted, onOpenChat }) {
  return (
    <div className="min-h-screen bg-[#060d1f] font-['Inter',sans-serif] flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <PlaneIcon className="w-5 h-5 text-[#c9a84c]" />
          <span className="text-white font-semibold tracking-widest text-sm uppercase">Flio</span>
        </div>
        <button
          onClick={onOpenChat}
          className="text-sm text-white/60 hover:text-white transition-colors"
        >
          Open Chat
        </button>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#c9a84c]" />
          <span className="text-xs text-white/60 tracking-wide">AI-Powered Travel Concierge</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-light text-white leading-tight tracking-tight mb-4">
          Your points. Your perks.<br />
          <span className="text-[#c9a84c]">Finally working for you.</span>
        </h1>

        <p className="text-white/50 text-lg md:text-xl max-w-md leading-relaxed mb-12">
          Your personal AI concierge that knows your preferences, maximizes your points, and gets more out of every trip.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={onGetStarted}
            className="flex items-center gap-2 bg-[#c9a84c] hover:bg-[#b8973d] text-[#060d1f] font-semibold px-8 py-3.5 rounded-full transition-colors text-sm tracking-wide"
          >
            Get started
            <ChevronRightIcon className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenChat}
            className="text-sm text-white/50 hover:text-white transition-colors px-8 py-3.5"
          >
            Try the chat →
          </button>
        </div>
      </div>

      {/* Feature pills */}
      <div className="flex flex-wrap justify-center gap-3 px-6 pb-12">
        {['Points optimization', 'Flight alerts', 'Hotel upgrades', 'Itinerary planning'].map((f) => (
          <span
            key={f}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-white/40"
          >
            {f}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Profile Setup ──────────────────────────────────────────────────────────

function ProfileSetup({ onBack, onComplete }) {
  const [form, setForm] = useState({
    homeAirport: '',
    loyaltyPrograms: '',
    creditCards: '',
    travelPreferences: '',
  });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const fields = [
    {
      key: 'homeAirport',
      label: 'Home airport',
      placeholder: 'e.g. JFK, LAX, ORD',
      hint: 'Your primary departure airport',
    },
    {
      key: 'loyaltyPrograms',
      label: 'Loyalty programs',
      placeholder: 'e.g. United MileagePlus, Marriott Bonvoy',
      hint: 'Airlines, hotels, and other programs',
    },
    {
      key: 'creditCards',
      label: 'Travel credit cards',
      placeholder: 'e.g. Chase Sapphire, Amex Platinum',
      hint: 'Cards you use for travel rewards',
    },
    {
      key: 'travelPreferences',
      label: 'Travel preferences',
      placeholder: 'e.g. window seat, business class, boutique hotels',
      hint: 'How you like to travel',
    },
  ];

  return (
    <div className="min-h-screen bg-[#060d1f] font-['Inter',sans-serif] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-5 border-b border-white/5">
        <button onClick={onBack} className="text-white/40 hover:text-white transition-colors">
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <div>
          <p className="text-xs text-white/40 uppercase tracking-widest mb-0.5">Setup</p>
          <h2 className="text-white font-medium">Your travel profile</h2>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto px-6 py-8 max-w-lg mx-auto w-full">
        <p className="text-white/40 text-sm mb-8 leading-relaxed">
          Tell Flio about your preferences so it can personalize every recommendation.
        </p>

        <div className="space-y-6">
          {fields.map(({ key, label, placeholder, hint }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-white/60 uppercase tracking-widest mb-2">
                {label}
              </label>
              <input
                type="text"
                value={form[key]}
                onChange={set(key)}
                placeholder={placeholder}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#c9a84c]/50 focus:bg-white/[0.07] transition-all"
              />
              <p className="text-xs text-white/25 mt-1.5 pl-1">{hint}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => onComplete(form)}
          className="mt-10 w-full flex items-center justify-center gap-2 bg-[#c9a84c] hover:bg-[#b8973d] text-[#060d1f] font-semibold py-3.5 rounded-full transition-colors text-sm tracking-wide"
        >
          Save profile & continue
          <ChevronRightIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ── Chat Interface ─────────────────────────────────────────────────────────

const GREETING = "Hi! I'm Flio, your AI travel concierge. Where are you thinking of going next?";

function TypingIndicator() {
  return (
    <div className="flex justify-start mb-3">
      <div className="w-7 h-7 rounded-full bg-[#c9a84c]/20 border border-[#c9a84c]/30 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
        <PlaneIcon className="w-3.5 h-3.5 text-[#c9a84c]" />
      </div>
      <div className="bg-[#0f1e3d] rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}

function ChatBubble({ message }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-[#c9a84c]/20 border border-[#c9a84c]/30 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
          <PlaneIcon className="w-3.5 h-3.5 text-[#c9a84c]" />
        </div>
      )}
      <div className="max-w-[72%]">
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
            isUser
              ? 'bg-[#c9a84c] text-[#060d1f] font-medium rounded-br-sm'
              : 'bg-[#0f1e3d] text-white/90 rounded-bl-sm'
          }`}
        >
          {message.text}
        </div>
        <p className={`text-[10px] text-white/20 mt-1 ${isUser ? 'text-right' : 'text-left'} px-1`}>
          {message.time}
        </p>
      </div>
    </div>
  );
}

function ChatInterface({ onBack, profile }) {
  const [messages, setMessages] = useState([
    { id: 1, role: 'assistant', text: GREETING, time: now() },
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const bottomRef = useRef(null);
  const clientRef = useRef(
    new Anthropic({
      apiKey: process.env.REACT_APP_ANTHROPIC_API_KEY,
      dangerouslyAllowBrowser: true,
    })
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const send = async () => {
    if (!input.trim() || isStreaming) return;

    const userText = input.trim();
    const userTime = now();
    setInput('');

    // Add user message
    const userMsg = { id: Date.now(), role: 'user', text: userText, time: userTime };
    setMessages((prev) => [...prev, userMsg]);
    setIsStreaming(true);

    // Build API history from all messages + new user message
    const history = [
      ...messages.map((m) => ({ role: m.role, content: m.text })),
      { role: 'user', content: userText },
    ];

    // Create placeholder for streaming response
    const assistantId = Date.now() + 1;
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: 'assistant', text: '', time: now() },
    ]);

    try {
      const stream = await clientRef.current.messages.stream({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: getSystemPrompt(profile),
        messages: history,
      });

      for await (const chunk of stream) {
        if (
          chunk.type === 'content_block_delta' &&
          chunk.delta.type === 'text_delta'
        ) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, text: m.text + chunk.delta.text } : m
            )
          );
        }
      }
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, text: 'Sorry, something went wrong. Please try again.' }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="min-h-screen bg-[#060d1f] font-['Inter',sans-serif] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-white/5 bg-[#060d1f]">
        <button onClick={onBack} className="text-white/40 hover:text-white transition-colors">
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <div className="w-8 h-8 rounded-full bg-[#c9a84c]/20 border border-[#c9a84c]/30 flex items-center justify-center">
          <PlaneIcon className="w-4 h-4 text-[#c9a84c]" />
        </div>
        <div>
          <h2 className="text-white text-sm font-medium">Flio</h2>
          <p className="text-[10px] text-white/30">AI Travel Concierge</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {messages.map((m) => (
          <ChatBubble key={m.id} message={m} />
        ))}
        {isStreaming && messages[messages.length - 1]?.text === '' && (
          <TypingIndicator />
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-4 border-t border-white/5 bg-[#060d1f]">
        <div className="flex items-center gap-3 bg-[#0f1e3d] border border-white/10 rounded-full px-4 py-2.5">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask Flio anything..."
            disabled={isStreaming}
            className="flex-1 bg-transparent text-white text-sm placeholder-white/25 focus:outline-none disabled:opacity-50"
          />
          <button
            onClick={send}
            disabled={!input.trim() || isStreaming}
            className="w-7 h-7 rounded-full bg-[#c9a84c] disabled:bg-white/10 flex items-center justify-center transition-colors flex-shrink-0"
          >
            <SendIcon className="w-3.5 h-3.5 text-[#060d1f]" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────

function now() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ── App Shell ──────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState('landing');
  const [profile, setProfile] = useState({});

  return (
    <>
      {screen === 'landing' && (
        <LandingPage
          onGetStarted={() => setScreen('profile')}
          onOpenChat={() => setScreen('chat')}
        />
      )}
      {screen === 'profile' && (
        <ProfileSetup
          onBack={() => setScreen('landing')}
          onComplete={(savedProfile) => {
            setProfile(savedProfile);
            setScreen('chat');
          }}
        />
      )}
      {screen === 'chat' && (
        <ChatInterface onBack={() => setScreen('landing')} profile={profile} />
      )}
    </>
  );
}
