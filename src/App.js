import { useState, useRef, useEffect, useCallback } from 'react';
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

// ── Demo Chat ──────────────────────────────────────────────────────────────

const DEMO = [
  {
    role: 'user',
    text: 'I want to fly business class from Chicago to Tokyo in May. I have 180,000 Chase Ultimate Rewards points and a Chase Sapphire Reserve.',
  },
  {
    role: 'assistant',
    text: "Great setup for this route. Here's exactly what I'd do:\n\nTransfer 80,000 Chase points to Air France Flying Blue and book ANA business class — best value on this corridor at roughly 1.8¢ per point. That's ~$1,440 in value vs. ~$4,200 cash price.\n\nUse your Chase Sapphire Reserve for the taxes (~$200) — you'll get primary rental car coverage in Tokyo and Priority Pass lounge access at ORD before departure.\n\nBooking order: Check Flying Blue availability first → transfer points immediately → book within 24hrs (transfers are instant but irreversible).\n\nYou'll have 100,000 Chase points left for the return or future trips.",
  },
  {
    role: 'user',
    text: 'What about the hotel in Tokyo?',
  },
  {
    role: 'assistant',
    text: "With your remaining 100,000 Chase points, transfer 60,000 to Hyatt for 3 nights at Park Hyatt Tokyo — that's the Lost in Translation hotel, and Hyatt points are worth ~1.8¢ each there. Cash rate would be $800+/night. You'd save ~$2,400.",
  },
];

// Timing (ms from intersection):
// 400  → user1 appears
// 900  → typing indicator
// 2800 → assistant1 appears
// 3600 → user2 appears
// 4100 → typing indicator
// 5400 → assistant2 appears
const SCHEDULE = [400, 900, 2800, 3600, 4100, 5400];

function DemoChat({ onGetStarted }) {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0); // 0=hidden, 1=u1, 2=typing, 3=a1, 4=u2, 5=typing, 6=a2
  const sectionRef = useRef(null);
  const firedRef = useRef(false);

  const startSequence = useCallback(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    setVisible(true);
    SCHEDULE.forEach((delay, i) => {
      // Offset each message by the fade-in duration (600ms) so animation starts after section appears
      setTimeout(() => setStep(i + 1), 600 + delay);
    });
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) startSequence(); },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [startSequence]);

  const showTyping = step === 2 || step === 5;
  const visibleMessages = DEMO.slice(
    0,
    step === 0 ? 0
    : step === 1 ? 1
    : step === 2 ? 1
    : step === 3 ? 2
    : step === 4 ? 3
    : step === 5 ? 3
    : 4
  );

  return (
    <section
      ref={sectionRef}
      className="px-6 pb-16 max-w-2xl mx-auto w-full"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: 'opacity 0.7s ease, transform 0.7s ease',
      }}
    >
      {/* Section title */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-light text-white">See Flio in action</h2>
      </div>

      {/* Chat window */}
      <div className="rounded-2xl border border-white/10 bg-[#0a1328] overflow-hidden">
        {/* Window chrome */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-[#060d1f]">
          <div className="w-7 h-7 rounded-full bg-[#c9a84c]/20 border border-[#c9a84c]/30 flex items-center justify-center">
            <PlaneIcon className="w-3.5 h-3.5 text-[#c9a84c]" />
          </div>
          <div>
            <p className="text-white text-xs font-medium">Flio</p>
            <p className="text-[10px] text-white/30">AI Travel Concierge</p>
          </div>
        </div>

        {/* Messages */}
        <div className="px-4 py-5 space-y-3 min-h-[200px]">
          {visibleMessages.map((msg, i) => {
            const isUser = msg.role === 'user';
            return (
              <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                {!isUser && (
                  <div className="w-6 h-6 rounded-full bg-[#c9a84c]/20 border border-[#c9a84c]/30 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                    <PlaneIcon className="w-3 h-3 text-[#c9a84c]" />
                  </div>
                )}
                <div className="max-w-[78%]">
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      isUser
                        ? 'bg-[#c9a84c] text-[#060d1f] font-medium rounded-br-sm'
                        : 'bg-[#0f1e3d] text-white/90 rounded-bl-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {showTyping && (
            <div className="flex justify-start animate-fade-in-up">
              <div className="w-6 h-6 rounded-full bg-[#c9a84c]/20 border border-[#c9a84c]/30 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                <PlaneIcon className="w-3 h-3 text-[#c9a84c]" />
              </div>
              <div className="bg-[#0f1e3d] rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center mt-6">
        <button
          onClick={onGetStarted}
          className="text-sm text-[#c9a84c] hover:text-white transition-colors"
        >
          Try it with your own profile →
        </button>
      </div>
    </section>
  );
}

// ── Landing Page ───────────────────────────────────────────────────────────

function LandingPage({ onGetStarted, onOpenChat }) {
  return (
    <div className="bg-[#060d1f] font-['Inter',sans-serif] flex flex-col">
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
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
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
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-10">
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

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-3">
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

      {/* Demo chat */}
      <div className="pt-20 pb-16">
        <DemoChat onGetStarted={onGetStarted} />
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

// ── Trip Summary Card ──────────────────────────────────────────────────────

async function getSummaryData(client, history, assistantText) {
  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      messages: [
        ...history,
        { role: 'assistant', content: assistantText },
        {
          role: 'user',
          content:
            'Based on this travel conversation, return ONLY a raw JSON object — no markdown, no code blocks, no explanation. Use exactly these fields: bestCard (string), pointsToRedeem (number), pointValue (number), pointsRemaining (number), cashSavings (number), bookingSteps (array of strings). If the conversation does not contain a specific booking recommendation with enough numerical detail to populate these fields, return exactly: null',
        },
      ],
    });
    const text = response.content[0].text.trim();
    if (text === 'null') return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function MetricCell({ label, value, sub, highlight }) {
  return (
    <div className="bg-[#060d1f] px-4 py-3">
      <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-sm font-medium leading-snug ${highlight ? 'text-[#c9a84c]' : 'text-white'}`}>
        {value}
      </p>
      {sub && <p className="text-[10px] text-white/40 mt-0.5">{sub}</p>}
    </div>
  );
}

function TripSummaryCard({ summary }) {
  if (!summary) return null;
  return (
    <div className="ml-9 mb-4 rounded-xl border border-[#c9a84c]/30 bg-[#0a1328] overflow-hidden animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#c9a84c]/15">
        <span className="text-[#c9a84c] text-xs leading-none">✦</span>
        <span className="text-[10px] font-semibold text-[#c9a84c] uppercase tracking-widest">
          Trip Summary
        </span>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-px bg-white/[0.04]">
        <MetricCell label="Best Card" value={summary.bestCard ?? '—'} />
        <MetricCell
          label="Points to Redeem"
          value={summary.pointsToRedeem != null ? summary.pointsToRedeem.toLocaleString() + ' pts' : '—'}
          sub={summary.pointValue != null ? `~$${summary.pointValue.toLocaleString()} value` : undefined}
        />
        <MetricCell
          label="Points Remaining"
          value={summary.pointsRemaining != null ? summary.pointsRemaining.toLocaleString() + ' pts' : '—'}
        />
        <MetricCell
          label="Est. Cash Savings"
          value={summary.cashSavings != null ? `~$${summary.cashSavings.toLocaleString()}` : '—'}
          highlight
        />
      </div>

      {/* Booking steps */}
      {summary.bookingSteps?.length > 0 && (
        <div className="px-4 py-3 border-t border-white/[0.04]">
          <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2.5">Booking Order</p>
          <ol className="space-y-2">
            {summary.bookingSteps.map((step, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-white/70 leading-relaxed">
                <span className="flex-shrink-0 w-4 h-4 rounded-full bg-[#c9a84c]/20 border border-[#c9a84c]/30 text-[#c9a84c] text-[9px] flex items-center justify-center font-semibold mt-0.5">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}
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
      { id: assistantId, role: 'assistant', text: '', time: now(), summary: undefined },
    ]);

    try {
      const stream = await clientRef.current.messages.stream({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: getSystemPrompt(profile),
        messages: history,
      });

      let fullText = '';
      for await (const chunk of stream) {
        if (
          chunk.type === 'content_block_delta' &&
          chunk.delta.type === 'text_delta'
        ) {
          fullText += chunk.delta.text;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, text: m.text + chunk.delta.text } : m
            )
          );
        }
      }

      // Fire summary extraction after streaming completes
      setIsStreaming(false);
      const summary = await getSummaryData(clientRef.current, history, fullText);
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, summary } : m))
      );
      return; // skip finally setIsStreaming
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
          <div key={m.id}>
            <ChatBubble message={m} />
            {m.role === 'assistant' && m.summary && (
              <TripSummaryCard summary={m.summary} />
            )}
          </div>
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
