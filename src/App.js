import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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

function ChevronDownIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
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

function CheckIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function UserIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  );
}

function PlusIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
    </svg>
  );
}

function TrashIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

function HistoryIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function XIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function PanelRightIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="15" y1="3" x2="15" y2="21" />
    </svg>
  );
}

// ── Onboarding Data ────────────────────────────────────────────────────────

const AIRPORTS = [
  { code: 'ATL', name: 'Hartsfield-Jackson Atlanta International', city: 'Atlanta' },
  { code: 'LAX', name: 'Los Angeles International', city: 'Los Angeles' },
  { code: 'ORD', name: "Chicago O'Hare International", city: 'Chicago' },
  { code: 'DFW', name: 'Dallas/Fort Worth International', city: 'Dallas' },
  { code: 'DEN', name: 'Denver International', city: 'Denver' },
  { code: 'JFK', name: 'John F. Kennedy International', city: 'New York' },
  { code: 'SFO', name: 'San Francisco International', city: 'San Francisco' },
  { code: 'SEA', name: 'Seattle-Tacoma International', city: 'Seattle' },
  { code: 'LAS', name: 'Harry Reid International', city: 'Las Vegas' },
  { code: 'MCO', name: 'Orlando International', city: 'Orlando' },
  { code: 'EWR', name: 'Newark Liberty International', city: 'Newark' },
  { code: 'CLT', name: 'Charlotte Douglas International', city: 'Charlotte' },
  { code: 'PHX', name: 'Phoenix Sky Harbor International', city: 'Phoenix' },
  { code: 'MIA', name: 'Miami International', city: 'Miami' },
  { code: 'IAH', name: 'George Bush Intercontinental', city: 'Houston' },
  { code: 'BOS', name: 'Logan International', city: 'Boston' },
  { code: 'MSP', name: 'Minneapolis-Saint Paul International', city: 'Minneapolis' },
  { code: 'DTW', name: 'Detroit Metropolitan Wayne County', city: 'Detroit' },
  { code: 'FLL', name: 'Fort Lauderdale-Hollywood International', city: 'Fort Lauderdale' },
  { code: 'PHL', name: 'Philadelphia International', city: 'Philadelphia' },
  { code: 'LGA', name: 'LaGuardia Airport', city: 'New York' },
  { code: 'BWI', name: 'Baltimore/Washington International', city: 'Baltimore' },
  { code: 'DCA', name: 'Ronald Reagan Washington National', city: 'Washington DC' },
  { code: 'SLC', name: 'Salt Lake City International', city: 'Salt Lake City' },
  { code: 'SAN', name: 'San Diego International', city: 'San Diego' },
  { code: 'IAD', name: 'Washington Dulles International', city: 'Washington DC' },
  { code: 'TPA', name: 'Tampa International', city: 'Tampa' },
  { code: 'MDW', name: 'Chicago Midway International', city: 'Chicago' },
  { code: 'PDX', name: 'Portland International', city: 'Portland' },
  { code: 'HNL', name: 'Daniel K. Inouye International', city: 'Honolulu' },
  { code: 'BNA', name: 'Nashville International', city: 'Nashville' },
  { code: 'AUS', name: 'Austin-Bergstrom International', city: 'Austin' },
  { code: 'STL', name: 'St. Louis Lambert International', city: 'St. Louis' },
  { code: 'MCI', name: 'Kansas City International', city: 'Kansas City' },
  { code: 'RDU', name: 'Raleigh-Durham International', city: 'Raleigh' },
  { code: 'SMF', name: 'Sacramento International', city: 'Sacramento' },
  { code: 'SJC', name: 'San Jose International', city: 'San Jose' },
  { code: 'OAK', name: 'Oakland International', city: 'Oakland' },
  { code: 'CLE', name: 'Cleveland Hopkins International', city: 'Cleveland' },
  { code: 'PIT', name: 'Pittsburgh International', city: 'Pittsburgh' },
  { code: 'IND', name: 'Indianapolis International', city: 'Indianapolis' },
  { code: 'CMH', name: 'John Glenn Columbus International', city: 'Columbus' },
  { code: 'SAT', name: 'San Antonio International', city: 'San Antonio' },
  { code: 'MSY', name: 'Louis Armstrong New Orleans International', city: 'New Orleans' },
  { code: 'MKE', name: 'Milwaukee Mitchell International', city: 'Milwaukee' },
  { code: 'OGG', name: 'Kahului Airport', city: 'Maui' },
  { code: 'BDL', name: 'Bradley International', city: 'Hartford' },
  { code: 'ABQ', name: 'Albuquerque International Sunport', city: 'Albuquerque' },
  { code: 'OMA', name: 'Eppley Airfield', city: 'Omaha' },
  { code: 'MEM', name: 'Memphis International', city: 'Memphis' },
];

const LOYALTY_PROGRAMS = [
  { id: 'united', name: 'United MileagePlus', shortName: 'MileagePlus', color: '#1e3a8a', initials: 'UA', currency: 'miles' },
  { id: 'delta', name: 'Delta SkyMiles', shortName: 'SkyMiles', color: '#c8102e', initials: 'DL', currency: 'miles' },
  { id: 'american', name: 'American AAdvantage', shortName: 'AAdvantage', color: '#0d2340', initials: 'AA', currency: 'miles' },
  { id: 'alaska', name: 'Alaska Mileage Plan', shortName: 'Mileage Plan', color: '#01426a', initials: 'AS', currency: 'miles' },
  { id: 'southwest', name: 'Southwest Rapid Rewards', shortName: 'Rapid Rewards', color: '#304cb2', initials: 'WN', currency: 'points' },
  { id: 'marriott', name: 'Marriott Bonvoy', shortName: 'Bonvoy', color: '#7a1220', initials: 'MB', currency: 'points' },
  { id: 'hilton', name: 'Hilton Honors', shortName: 'Hilton Honors', color: '#153c6e', initials: 'HH', currency: 'points' },
  { id: 'hyatt', name: 'World of Hyatt', shortName: 'World of Hyatt', color: '#1a1a1a', initials: 'WH', currency: 'points' },
  { id: 'ihg', name: 'IHG One Rewards', shortName: 'IHG One', color: '#005f5f', initials: 'IHG', currency: 'points' },
];

const CREDIT_CARDS = [
  {
    id: 'csr', name: 'Chase Sapphire Reserve', shortName: 'Sapphire Reserve', issuer: 'CHASE',
    bg: 'linear-gradient(135deg, #1c1c1e 0%, #2e2e30 100%)', accentColor: '#c9a84c', currency: 'points',
  },
  {
    id: 'csp', name: 'Chase Sapphire Preferred', shortName: 'Sapphire Preferred', issuer: 'CHASE',
    bg: 'linear-gradient(135deg, #0d2340 0%, #1a3a6e 100%)', accentColor: '#7eb3e8', currency: 'points',
  },
  {
    id: 'amex-plat', name: 'Amex Platinum', shortName: 'Platinum Card', issuer: 'AMEX',
    bg: 'linear-gradient(135deg, #a0a8b8 0%, #c8ceda 50%, #8a9099 100%)', accentColor: '#3a3a3a', currency: 'points',
  },
  {
    id: 'amex-gold', name: 'Amex Gold', shortName: 'Gold Card', issuer: 'AMEX',
    bg: 'linear-gradient(135deg, #c9a84c 0%, #e8c96a 50%, #a07d30 100%)', accentColor: '#3a2800', currency: 'points',
  },
  {
    id: 'venture-x', name: 'Capital One Venture X', shortName: 'Venture X', issuer: 'CAPITAL ONE',
    bg: 'linear-gradient(135deg, #080820 0%, #141440 100%)', accentColor: '#6c9ed4', currency: 'miles',
  },
  {
    id: 'citi-premier', name: 'Citi Premier', shortName: 'Citi Premier', issuer: 'CITI',
    bg: 'linear-gradient(135deg, #001a6e 0%, #0033aa 100%)', accentColor: '#7eb3e8', currency: 'points',
  },
  {
    id: 'boa-premium', name: 'BofA Premium Rewards', shortName: 'Premium Rewards', issuer: 'BANK OF AMERICA',
    bg: 'linear-gradient(135deg, #6b0000 0%, #a00000 100%)', accentColor: '#ffaa88', currency: 'points',
  },
];

const PREFERENCE_OPTIONS = {
  seat:  { label: 'Seat preference',   choices: ['Window', 'Aisle', 'No preference'] },
  cabin: { label: 'Cabin preference',  choices: ['Economy', 'Premium Economy', 'Business', 'First'] },
  hotel: { label: 'Hotel preference',  choices: ['Points hotels only', 'Mix of both', 'Any accommodation'] },
  style: { label: 'Travel style',      choices: ['Maximize comfort', 'Maximize value', 'Balance both'] },
};

// Cents-per-point valuations (user-specified)
const POINTS_CPP = {
  united: 1.4, delta: 1.2, american: 1.5, alaska: 1.6,
  southwest: 1.5, marriott: 0.7, hilton: 0.5, hyatt: 1.8, ihg: 0.5,
};

const CARDS_CPP = {
  csr: 2.05, csp: 2.05, 'amex-plat': 2.0, 'amex-gold': 2.0,
  'venture-x': 1.85, 'citi-premier': 1.8, 'boa-premium': 1.5,
};

const CARD_CREDITS_DATA = {
  csr: [
    { id: 'csr-travel',   label: 'Travel Credit',  value: 300, note: 'Any travel purchase' },
    { id: 'csr-dining',   label: 'Dining Credit',  value: 300, note: 'Sapphire Exclusive Tables' },
    { id: 'csr-stubhub',  label: 'StubHub Credit', value: 300, note: 'Events & concerts' },
  ],
  'amex-plat': [
    { id: 'plat-hotel',   label: 'Hotel Credit',    value: 200, note: 'Fine Hotels + Resorts' },
    { id: 'plat-airline', label: 'Airline Credit',  value: 200, note: 'Checked bags & seat upgrades' },
    { id: 'plat-clear',   label: 'CLEAR Plus',      value: 189, note: 'Skip ID checks at 50+ airports' },
    { id: 'plat-walmart', label: 'Walmart+',        value: 155, note: 'Includes Paramount+ streaming' },
  ],
  'amex-gold': [
    { id: 'gold-dining',  label: 'Dining Credit',   value: 120, note: '$10/month at select restaurants' },
    { id: 'gold-uber',    label: 'Uber Cash',       value: 120, note: '$10/month for rides or Eats' },
  ],
  'venture-x': [
    { id: 'vx-travel',    label: 'Travel Credit',   value: 300, note: 'Capital One Travel bookings' },
    { id: 'vx-ge',        label: 'Global Entry',    value: 100, note: 'Every 4 years' },
  ],
};

// ── Onboarding Components ──────────────────────────────────────────────────

function BalanceModal({ item, type, onConfirm, onClose }) {
  const [value, setValue] = useState('');
  const label = type === 'loyalty' ? `How many ${item.currency} do you have?` : "What's your points balance?";
  return (
    <div className="fixed inset-0 bg-black/60 glass-panel flex items-end sm:items-center justify-center z-50 px-4 pb-4 sm:pb-0">
      <div className="bg-[#0d1526] border border-[#c9a84c]/15 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <p className="text-xs text-white/40 uppercase tracking-widest mb-1">{item.name}</p>
        <h3 className="text-white font-medium mb-5">{label}</h3>
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="e.g. 50000"
          autoFocus
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 input-gold focus:outline-none transition-all mb-4"
        />
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-full border border-white/10 text-white/50 text-sm hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(parseInt(value.replace(/,/g, '')) || 0)}
            className="btn-gold flex-1 py-3 rounded-full bg-[#c9a84c] hover:bg-[#d4af37] text-[#060d1f] font-semibold text-sm"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

function AirportStep({ query, onChange, filtered, selected, onSelect }) {
  return (
    <div>
      <h2 className="text-white text-2xl font-light mb-1">Where do you fly from?</h2>
      <p className="text-white/40 text-sm mb-8">Your primary home airport</p>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search by city or airport code…"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 input-gold focus:outline-none transition-all"
        />
        {filtered.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-[#111d35] border border-white/10 rounded-xl overflow-hidden z-10 shadow-2xl">
            {filtered.map((a) => (
              <button
                key={a.code}
                onClick={() => onSelect(a)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left border-b border-white/5 last:border-0"
              >
                <span className="text-[#c9a84c] text-xs font-mono font-bold w-8 flex-shrink-0">{a.code}</span>
                <div>
                  <p className="text-white text-sm">{a.city}</p>
                  <p className="text-white/40 text-xs">{a.name}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      {selected && (
        <div className="mt-4 flex items-center gap-2.5 bg-[#c9a84c]/10 border border-[#c9a84c]/30 rounded-xl px-4 py-3">
          <CheckIcon className="w-4 h-4 text-[#c9a84c] flex-shrink-0" />
          <div>
            <p className="text-white text-sm font-medium">{selected.city} ({selected.code})</p>
            <p className="text-white/40 text-xs">{selected.name}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function SelectionGrid({ items, selected, onToggle, renderCard }) {
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {items.map((item) => {
        const sel = selected.find((s) => s.id === item.id);
        return (
          <button
            key={item.id}
            onClick={() => onToggle(item)}
            className={`relative p-3 rounded-xl border text-left transition-all ${
              sel
                ? 'border-[#c9a84c]/50 bg-[#c9a84c]/10'
                : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.08]'
            }`}
          >
            {sel && (
              <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#c9a84c] flex items-center justify-center">
                <CheckIcon className="w-2.5 h-2.5 text-[#060d1f]" />
              </div>
            )}
            {renderCard(item, sel)}
            <p className={`text-xs font-medium mt-2 leading-tight pr-4 ${sel ? 'text-white' : 'text-white/60'}`}>
              {item.shortName}
            </p>
            {sel && (
              <p className="text-[10px] text-[#c9a84c] mt-0.5">
                {sel.balance > 0 ? sel.balance.toLocaleString() + ' ' + item.currency : 'Added'}
              </p>
            )}
          </button>
        );
      })}
    </div>
  );
}

function LoyaltyStep({ selected, onToggle }) {
  return (
    <div>
      <h2 className="text-white text-2xl font-light mb-1">Loyalty programs</h2>
      <p className="text-white/40 text-sm mb-8">Select your frequent flyer and hotel programs</p>
      <SelectionGrid
        items={LOYALTY_PROGRAMS}
        selected={selected}
        onToggle={onToggle}
        renderCard={(item) => (
          <div
            style={{ backgroundColor: item.color }}
            className="w-10 h-10 rounded-full flex items-center justify-center"
          >
            <span className="text-white text-[10px] font-bold">{item.initials}</span>
          </div>
        )}
      />
    </div>
  );
}

function CardsStep({ selected, onToggle }) {
  return (
    <div>
      <h2 className="text-white text-2xl font-light mb-1">Credit cards</h2>
      <p className="text-white/40 text-sm mb-8">Select your travel credit cards</p>
      <SelectionGrid
        items={CREDIT_CARDS}
        selected={selected}
        onToggle={onToggle}
        renderCard={(item) => (
          <div
            style={{ background: item.bg }}
            className="w-full h-10 rounded-lg flex items-center px-2.5"
          >
            <span style={{ color: item.accentColor }} className="text-[9px] font-bold tracking-wider opacity-80">
              {item.issuer}
            </span>
          </div>
        )}
      />
    </div>
  );
}

function PreferencesStep({ preferences, onSet }) {
  return (
    <div>
      <h2 className="text-white text-2xl font-light mb-1">Travel preferences</h2>
      <p className="text-white/40 text-sm mb-8">How do you like to travel?</p>
      <div className="space-y-7">
        {Object.entries(PREFERENCE_OPTIONS).map(([key, { label, choices }]) => (
          <div key={key}>
            <p className="text-[10px] text-white/40 uppercase tracking-widest mb-3">{label}</p>
            <div className="flex flex-wrap gap-2">
              {choices.map((choice) => (
                <button
                  key={choice}
                  onClick={() => onSet(key, choice)}
                  className={`px-4 py-2 rounded-full text-sm transition-all ${
                    preferences[key] === choice
                      ? 'bg-[#c9a84c] text-[#060d1f] font-semibold'
                      : 'border border-white/15 text-white/60 hover:border-white/30 hover:text-white'
                  }`}
                >
                  {choice}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
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
      <div className="text-center mb-10">
        <p className="text-[10px] text-[#c9a84c] uppercase tracking-widest mb-3">See Flio in action</p>
        <h2 className="text-3xl md:text-4xl text-white font-['Playfair_Display',serif] font-normal">What smarter travel sounds like.</h2>
      </div>

      {/* Chat window */}
      <div className="rounded-2xl border border-white/10 bg-[#0d1526] overflow-hidden">
        {/* Window chrome */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-[#0a0f1e]">
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
                        : 'bg-[#111d35] text-white/90 rounded-bl-sm'
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
              <div className="bg-[#111d35] rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div
        className="pointer-events-none -mt-16 h-16"
        style={{ background: 'linear-gradient(to bottom, transparent, #0a0f1e)' }}
      />

      {/* CTA */}
      <div className="text-center mt-2">
        <button
          onClick={onGetStarted}
          className="btn-ghost text-sm text-[#c9a84c] hover:text-white border border-[#c9a84c]/20 hover:border-[#c9a84c]/40 rounded-full px-5 py-2 transition-all"
        >
          Try it with your own profile →
        </button>
      </div>
    </section>
  );
}

// ── Fade-in on scroll ──────────────────────────────────────────────────────

function FadeInSection({ children }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect(); // stays visible once triggered
        }
      },
      { threshold: 0.08 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(28px)',
        transition: 'opacity 0.65s ease, transform 0.65s ease',
      }}
    >
      {children}
    </div>
  );
}

// ── Landing Page ───────────────────────────────────────────────────────────

function LandingPage({ onGetStarted, onOpenChat, onOpenDashboard, hasProfile, onEditProfile }) {
  return (
    <div className="bg-[#0a0f1e] font-['DM_Sans',sans-serif] flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 sticky top-0 z-40 bg-[#0a0f1e]/80 backdrop-blur-md border-b border-white/[0.04]">
        <div className="flex items-center gap-2">
          <PlaneIcon className="w-5 h-5 text-[#c9a84c]" />
          <span className="text-white font-semibold tracking-widest text-sm uppercase">Flio</span>
        </div>
        <div className="flex items-center gap-5">
          {hasProfile && (
            <button onClick={onEditProfile} className="text-sm text-white/60 hover:text-white transition-colors">
              Edit profile
            </button>
          )}
          <button onClick={onOpenChat} className="text-sm text-white/60 hover:text-white transition-colors">
            Open Chat
          </button>
          <button onClick={onOpenDashboard} className="text-white/40 hover:text-white transition-colors" aria-label="Profile">
            <UserIcon className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center overflow-hidden">

        {/* Background: central gold radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 90% 70% at 50% 45%, rgba(201,168,76,0.11) 0%, rgba(201,168,76,0.03) 50%, transparent 72%)' }}
        />
        {/* Background: dot grid fading at edges */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px)',
            backgroundSize: '36px 36px',
            maskImage: 'radial-gradient(ellipse 75% 75% at 50% 50%, black 0%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 75% 75% at 50% 50%, black 0%, transparent 100%)',
          }}
        />
        {/* Background: soft off-center accent orbs */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(circle 700px at 10% 15%, rgba(201,168,76,0.045) 0%, transparent 70%)' }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(circle 600px at 90% 85%, rgba(201,168,76,0.04) 0%, transparent 70%)' }}
        />

        {/* Badge */}
        <div className="relative mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#c9a84c]" />
          <span className="text-xs text-white/60 tracking-wide">AI-Powered Travel Concierge</span>
        </div>

        {/* Headline */}
        <h1 className="relative text-5xl md:text-7xl text-white leading-tight tracking-tight mb-4 font-['Playfair_Display',serif] font-normal">
          <span className="block animate-word" style={{ animationDelay: '80ms' }}>Your points. Your perks.</span>
          <span className="block animate-word" style={{ animationDelay: '280ms' }}>
            <span className="text-[#c9a84c] italic">Finally working for you.</span>
          </span>
        </h1>

        <p className="relative animate-word text-white/45 text-lg md:text-xl max-w-md leading-relaxed mb-12" style={{ animationDelay: '500ms' }}>
          Your personal AI concierge that knows your preferences, maximizes your points, and gets more out of every trip.
        </p>

        {/* CTAs */}
        <div className="relative flex flex-col sm:flex-row items-center gap-4 mb-10">
          <button
            onClick={onGetStarted}
            className="btn-gold flex items-center gap-2 bg-[#c9a84c] hover:bg-[#d4af37] text-[#060d1f] font-semibold px-8 py-3.5 rounded-full text-sm tracking-wide"
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
        <div className="relative flex flex-wrap justify-center gap-3">
          {['Points optimization', 'Flight alerts', 'Hotel upgrades', 'Itinerary planning'].map((f) => (
            <span
              key={f}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-white/40"
            >
              {f}
            </span>
          ))}
        </div>

        {/* Bottom fade — blends hero glow into the next section */}
        <div
          className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent 0%, #0a0f1e 100%)' }}
        />

        {/* Scroll indicator */}
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5 animate-bounce">
          <span className="text-white/20 text-[9px] uppercase tracking-[0.18em]">Scroll</span>
          <ChevronDownIcon className="w-4 h-4 text-[#c9a84c]/40" />
        </div>
      </div>

      <FadeInSection>
        {/* Demo chat */}
        <div className="pt-20 pb-16">
          <DemoChat onGetStarted={onGetStarted} />
        </div>
      </FadeInSection>

      <FadeInSection>
        {/* How It Works */}
        <div className="px-6 pb-32 max-w-5xl mx-auto w-full">
        <div className="text-center mb-14">
          <p className="text-[10px] text-[#c9a84c] uppercase tracking-widest mb-3">How it works</p>
          <h2 className="text-3xl md:text-4xl text-white font-['Playfair_Display',serif] font-normal">Smart travel advice in seconds.</h2>
        </div>
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-0">
          {/* Connecting line — sits at vertical center of the step number */}
          <div className="hidden md:block absolute top-10 left-[calc(16.67%+1.5rem)] right-[calc(16.67%+1.5rem)] h-px bg-gradient-to-r from-[#c9a84c]/20 via-[#c9a84c]/40 to-[#c9a84c]/20 z-0" />
          {[
            { num: '01', title: 'Build your profile', desc: 'Add your home airport, loyalty programs with balances, and travel credit cards. Takes 2 minutes.' },
            { num: '02', title: 'Describe your trip', desc: 'Tell Flio where you want to go in plain English. No forms, no dropdowns, just talk.' },
            { num: '03', title: 'Get your plan', desc: 'Flio tells you exactly which points to use, which card to pay with, and in what order to book.' },
          ].map((step, i) => (
            <div key={step.num} className="relative z-10 md:px-6">
              {/* Arrow centered exactly on the connecting line */}
              {i < 2 && (
                <div className="hidden md:flex absolute -right-3 top-10 -translate-y-1/2 z-20 items-center justify-center w-6 h-6">
                  <ChevronRightIcon className="w-4 h-4 text-[#c9a84c]/60" />
                </div>
              )}
              <div className="card-hover h-full bg-[#0d1526] border border-[#c9a84c]/10 rounded-2xl p-6 cursor-default">
                <p className="text-[#c9a84c] text-3xl font-light tracking-tight mb-4">{step.num}</p>
                <p className="text-white font-semibold text-base mb-2">{step.title}</p>
                <p className="text-white/45 text-sm leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      </FadeInSection>

      <FadeInSection>
        {/* Points Portfolio Preview */}
        <div className="px-6 pb-32 max-w-2xl mx-auto w-full">
        {/* Section header */}
        <div className="text-center mb-10">
          <p className="text-[10px] text-[#c9a84c] uppercase tracking-widest mb-3">Your Travel Wallet</p>
          <h2 className="text-3xl md:text-4xl text-white font-['Playfair_Display',serif] font-normal">See exactly what your points are worth.</h2>
        </div>

        {/* Preview card */}
        <div
          className="relative rounded-2xl border border-[#c9a84c]/12 bg-[#0d1526] overflow-hidden"
          style={{ boxShadow: '0 0 0 1px rgba(201,168,76,0.08), 0 0 80px rgba(201,168,76,0.09), 0 0 160px rgba(201,168,76,0.05)' }}
        >
          {/* Card header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#c9a84c]/15 border border-[#c9a84c]/30 flex items-center justify-center">
                <PlaneIcon className="w-3.5 h-3.5 text-[#c9a84c]" />
              </div>
              <span className="text-white font-medium text-sm">Your Travel Wallet</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#c9a84c]/10 border border-[#c9a84c]/25 rounded-full px-3 py-1">
              <span className="text-[#c9a84c] text-xs font-semibold">$4,847 in travel value</span>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pt-5 pb-6 space-y-6">
            {/* Loyalty programs */}
            <div>
              <p className="text-[10px] text-white/30 uppercase tracking-widest mb-3">Loyalty Programs</p>
              <div className="space-y-3.5">
                {[
                  { initials: 'WH', bg: '#111111', name: 'World of Hyatt', pts: '42,000', val: '$756' },
                  { initials: 'UR', bg: '#003087', name: 'Chase Ultimate Rewards', pts: '180,000', val: '$3,690' },
                  { initials: 'UA', bg: '#1e3a8a', name: 'United MileagePlus', pts: '28,000', val: '$392' },
                ].map((p) => (
                  <div key={p.name} className="flex items-center gap-3">
                    <div
                      style={{ backgroundColor: p.bg }}
                      className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center flex-shrink-0"
                    >
                      <span className="text-white text-[9px] font-bold">{p.initials}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white/80 text-sm leading-tight">{p.name}</p>
                      <p className="text-white/30 text-xs mt-0.5">{p.pts} pts</p>
                    </div>
                    <p className="text-[#c9a84c] text-sm font-semibold flex-shrink-0">{p.val}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Credit card perks */}
            <div>
              <p className="text-[10px] text-white/30 uppercase tracking-widest mb-3">Annual Credits Remaining</p>
              <div className="space-y-2">
                {[
                  {
                    name: 'Chase Sapphire Reserve',
                    credit: '$300 travel credit',
                    cardBg: 'linear-gradient(135deg, #1c1c1e 0%, #2e2e30 100%)',
                    accent: '#c9a84c',
                    issuer: 'CHASE',
                  },
                  {
                    name: 'Amex Platinum',
                    credit: '$200 hotel credit',
                    cardBg: 'linear-gradient(135deg, #a0a8b8 0%, #c8ceda 50%, #8a9099 100%)',
                    accent: '#3a3a3a',
                    issuer: 'AMEX',
                  },
                ].map((c) => (
                  <div key={c.name} className="flex items-center gap-3 bg-[#0a0f1e] rounded-xl px-4 py-3">
                    <div
                      style={{ background: c.cardBg }}
                      className="w-10 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                    >
                      <span style={{ color: c.accent }} className="text-[7px] font-bold tracking-wider opacity-80">{c.issuer}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white/70 text-xs leading-tight">{c.name}</p>
                      <p className="text-white/35 text-[11px] mt-0.5">{c.credit}</p>
                    </div>
                    <span className="text-emerald-400 text-[10px] font-medium bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full flex-shrink-0">
                      Available
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Frosted unlock overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-56 flex flex-col items-center justify-end pb-8 gap-2.5"
            style={{ background: 'linear-gradient(to bottom, transparent 0%, rgba(13,21,38,0.85) 35%, rgba(13,21,38,0.97) 60%, #0d1526 100%)' }}
          >
            <p className="text-white/35 text-xs tracking-wide">Your real balances. Your actual credits.</p>
            <button
              onClick={onGetStarted}
              className="btn-gold flex items-center gap-2 bg-[#c9a84c] hover:bg-[#d4af37] text-[#060d1f] font-semibold px-6 py-2.5 rounded-full text-sm tracking-wide"
            >
              Build your profile to see yours
              <ChevronRightIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
      </FadeInSection>

      <FadeInSection>
        {/* What Flio Knows */}
        <div className="px-6 pb-32 max-w-4xl mx-auto w-full">
          {/* Section header */}
          <div className="text-center mb-4">
          <p className="text-[10px] text-[#c9a84c] uppercase tracking-widest mb-3">Works With</p>
          <h2 className="text-3xl md:text-4xl text-white mb-3 font-['Playfair_Display',serif] font-normal">Built around your actual wallet.</h2>
          <p className="text-white/40 text-sm max-w-lg mx-auto leading-relaxed">
            Flio knows the earning rates, transfer partners, redemption sweet spots, and annual credits for every program listed.
          </p>
        </div>

        <div className="space-y-8 mt-10">
          {/* Loyalty Programs */}
          <div>
            <p className="text-[10px] text-white/30 uppercase tracking-widest mb-4">Loyalty Programs</p>
            <div className="flex flex-wrap gap-2.5">
              {[
                { name: 'United MileagePlus',        emoji: '✈️' },
                { name: 'Delta SkyMiles',             emoji: '✈️' },
                { name: 'American AAdvantage',        emoji: '✈️' },
                { name: 'Alaska Mileage Plan',        emoji: '✈️' },
                { name: 'Southwest Rapid Rewards',    emoji: '✈️' },
                { name: 'World of Hyatt',             emoji: '🏨' },
                { name: 'Marriott Bonvoy',            emoji: '🏨' },
                { name: 'Hilton Honors',              emoji: '🏨' },
              ].map((item) => (
                <div
                  key={item.name}
                  className="group flex items-center gap-2 bg-[#0d1526] border border-white/8 hover:border-[#c9a84c]/35 hover:bg-[#c9a84c]/[0.04] rounded-full px-4 py-2 transition-all duration-200 cursor-default"
                  style={{ '--tw-shadow': '0 0 0 0 transparent' }}
                >
                  <span className="text-sm leading-none">{item.emoji}</span>
                  <span className="text-white/65 group-hover:text-white/90 text-sm transition-colors">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Credit Cards */}
          <div>
            <p className="text-[10px] text-white/30 uppercase tracking-widest mb-4">Credit Cards</p>
            <div className="flex flex-wrap gap-2.5">
              {[
                { name: 'Chase Sapphire Reserve',     emoji: '💳' },
                { name: 'Chase Sapphire Preferred',   emoji: '💳' },
                { name: 'Amex Platinum',              emoji: '💳' },
                { name: 'Amex Gold',                  emoji: '💳' },
                { name: 'Capital One Venture X',      emoji: '💳' },
                { name: 'Citi Premier',               emoji: '💳' },
              ].map((item) => (
                <div
                  key={item.name}
                  className="group flex items-center gap-2 bg-[#0d1526] border border-white/8 hover:border-[#c9a84c]/35 hover:bg-[#c9a84c]/[0.04] rounded-full px-4 py-2 transition-all duration-200 cursor-default"
                >
                  <span className="text-sm leading-none">{item.emoji}</span>
                  <span className="text-white/65 group-hover:text-white/90 text-sm transition-colors">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      </FadeInSection>

      <FadeInSection>
        {/* The Problem */}
        <div className="px-6 pb-16 max-w-4xl mx-auto w-full">
        {/* Section header */}
        <div className="text-center mb-12">
          <p className="text-[10px] text-[#c9a84c] uppercase tracking-widest mb-3">The Difference</p>
          <h2 className="text-3xl md:text-4xl text-white mb-3 font-['Playfair_Display',serif] font-normal">Stop leaving money on the table.</h2>
          <p className="text-white/40 text-sm max-w-md mx-auto leading-relaxed">
            The average traveler with premium cards leaves $1,200+ in unused value on the table every year.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Without Flio */}
          <div className="bg-red-950/20 border border-red-900/25 rounded-2xl p-6">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-5 h-5 rounded-full bg-red-900/50 border border-red-700/40 flex items-center justify-center flex-shrink-0">
                <span className="text-red-400 text-[10px] font-bold leading-none">✕</span>
              </div>
              <span className="text-red-400/80 text-sm font-medium tracking-wide">Without Flio</span>
            </div>
            <div className="space-y-4">
              {[
                'Booking through Expedia and losing all your miles',
                'Using the wrong credit card and missing 3x points',
                'Letting $300 in annual travel credits expire unused',
                'Transferring points before checking award availability',
                'Paying cash for a hotel your card covers for free',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="text-red-700/60 mt-0.5 flex-shrink-0 text-xs leading-5">✕</span>
                  <p className="text-white/45 text-sm leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* With Flio */}
          <div className="bg-[#c9a84c]/[0.06] border border-[#c9a84c]/20 rounded-2xl p-6">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-5 h-5 rounded-full bg-[#c9a84c]/20 border border-[#c9a84c]/35 flex items-center justify-center flex-shrink-0">
                <span className="text-[#c9a84c] text-[10px] font-bold leading-none">✓</span>
              </div>
              <span className="text-[#c9a84c]/80 text-sm font-medium tracking-wide">With Flio</span>
            </div>
            <div className="space-y-4">
              {[
                'Book direct, earn elite miles, and hit status faster',
                'Always know which card earns the most for each purchase',
                'Track every credit across every card automatically',
                'Check award space first, then transfer instantly',
                'Know exactly which perks apply before you book',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="text-[#c9a84c]/60 mt-0.5 flex-shrink-0 text-xs leading-5">✓</span>
                  <p className="text-white/75 text-sm leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      </FadeInSection>

      <FadeInSection>
        {/* CTA Banner */}
        <div className="relative w-full px-6 py-32 flex flex-col items-center text-center overflow-hidden">
        {/* Radial gold glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(201,168,76,0.09) 0%, transparent 70%)' }}
        />
        <h2 className="relative text-4xl md:text-6xl text-white leading-tight tracking-tight max-w-2xl mb-5 font-['Playfair_Display',serif] font-normal">
          Your points are worth<br />more than you think.
        </h2>
        <p className="relative text-white/45 text-base md:text-lg max-w-sm mb-10 leading-relaxed">
          Most travelers leave $1,200+ on the table every year. Flio helps you claim it.
        </p>
        <button
          onClick={onGetStarted}
          className="btn-gold relative flex items-center gap-2 bg-[#c9a84c] hover:bg-[#d4af37] text-[#060d1f] font-semibold px-9 py-4 rounded-full text-base tracking-wide mb-5"
        >
          Build your profile — it's free
          <ChevronRightIcon className="w-4 h-4" />
        </button>
        <p className="relative text-white/20 text-xs tracking-wide">
          No account required. Your data stays on your device.
        </p>
        </div>
      </FadeInSection>

      <FadeInSection>
        {/* Page footer */}
        <footer className="border-t border-white/5 px-6 py-10 flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-2 mb-1">
            <PlaneIcon className="w-4 h-4 text-[#c9a84c]" />
            <span className="text-white font-semibold tracking-widest text-sm uppercase">Flio</span>
          </div>
          <p className="text-white/30 text-xs">Your personal AI travel concierge</p>
          <p className="text-white/40 text-xs">Built for travelers who want more from every trip.</p>
        </footer>
      </FadeInSection>

    </div>
  );
}

// ── Profile Setup ──────────────────────────────────────────────────────────

const STEP_LABELS = ['Home Airport', 'Loyalty Programs', 'Credit Cards', 'Preferences'];

function ProfileSetup({ onBack, onComplete, initialProfile }) {
  const [step, setStep] = useState(1);
  const [airportQuery, setAirportQuery] = useState(
    initialProfile?.homeAirport ? `${initialProfile.homeAirport.city} (${initialProfile.homeAirport.code})` : ''
  );
  const [selectedAirport, setSelectedAirport] = useState(initialProfile?.homeAirport ?? null);
  const [selectedPrograms, setSelectedPrograms] = useState(initialProfile?.loyaltyPrograms ?? []);
  const [selectedCards, setSelectedCards] = useState(initialProfile?.creditCards ?? []);
  const [preferences, setPreferences] = useState(initialProfile?.preferences ?? { seat: null, cabin: null, hotel: null, style: null });
  const [balanceModal, setBalanceModal] = useState(null);

  const filteredAirports = useMemo(() => {
    if (!airportQuery.trim() || selectedAirport) return [];
    const q = airportQuery.toLowerCase();
    return AIRPORTS.filter(
      (a) =>
        a.code.toLowerCase().includes(q) ||
        a.city.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [airportQuery, selectedAirport]);

  const handleAirportChange = (q) => {
    setAirportQuery(q);
    setSelectedAirport(null);
  };

  const handleAirportSelect = (airport) => {
    setSelectedAirport(airport);
    setAirportQuery(`${airport.city} (${airport.code})`);
  };

  const handleProgramToggle = (program) => {
    if (selectedPrograms.find((s) => s.id === program.id)) {
      setSelectedPrograms((prev) => prev.filter((s) => s.id !== program.id));
    } else {
      setBalanceModal({ item: program, type: 'loyalty' });
    }
  };

  const handleCardToggle = (card) => {
    if (selectedCards.find((s) => s.id === card.id)) {
      setSelectedCards((prev) => prev.filter((s) => s.id !== card.id));
    } else {
      setBalanceModal({ item: card, type: 'card' });
    }
  };

  const handleBalanceConfirm = (balance) => {
    const { item, type } = balanceModal;
    if (type === 'loyalty') {
      setSelectedPrograms((prev) => [...prev, { ...item, balance }]);
    } else {
      setSelectedCards((prev) => [...prev, { ...item, balance }]);
    }
    setBalanceModal(null);
  };

  const handleNext = () => {
    if (step < 4) {
      setStep((s) => s + 1);
    } else {
      onComplete({ homeAirport: selectedAirport, loyaltyPrograms: selectedPrograms, creditCards: selectedCards, preferences });
    }
  };

  const canProceed = step === 1 ? !!selectedAirport : true;

  return (
    <div className="min-h-screen bg-[#0a0f1e] font-['DM_Sans',sans-serif] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-5 border-b border-white/5">
        <button
          onClick={step === 1 ? onBack : () => setStep((s) => s - 1)}
          className="text-white/40 hover:text-white transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <p className="text-[10px] text-white/30 uppercase tracking-widest mb-0.5">Step {step} of 4</p>
          <h2 className="text-white text-sm font-medium">{STEP_LABELS[step - 1]}</h2>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex gap-1 px-6 pt-3 pb-1">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className="h-0.5 flex-1 rounded-full transition-all duration-500"
            style={{ backgroundColor: n <= step ? '#c9a84c' : 'rgba(255,255,255,0.1)' }}
          />
        ))}
      </div>

      {/* Step content */}
      <div className="flex-1 flex flex-col overflow-y-auto px-6">
      <div className="my-auto py-10 max-w-lg mx-auto w-full">
        {step === 1 && (
          <AirportStep
            query={airportQuery}
            onChange={handleAirportChange}
            filtered={filteredAirports}
            selected={selectedAirport}
            onSelect={handleAirportSelect}
          />
        )}
        {step === 2 && (
          <LoyaltyStep selected={selectedPrograms} onToggle={handleProgramToggle} />
        )}
        {step === 3 && (
          <CardsStep selected={selectedCards} onToggle={handleCardToggle} />
        )}
        {step === 4 && (
          <PreferencesStep
            preferences={preferences}
            onSet={(key, val) => setPreferences((p) => ({ ...p, [key]: val }))}
          />
        )}
      </div>
      </div>

      {/* Footer nav */}
      <div className="px-6 pb-8 pt-4 border-t border-white/5">
        <button
          onClick={handleNext}
          disabled={!canProceed}
          className="btn-gold w-full flex items-center justify-center gap-2 bg-[#c9a84c] disabled:bg-white/10 disabled:text-white/30 disabled:shadow-none disabled:transform-none text-[#060d1f] font-semibold py-3.5 rounded-full text-sm"
        >
          {step === 4 ? 'Finish & Start chatting' : 'Continue'}
          <ChevronRightIcon className="w-4 h-4" />
        </button>
        {step > 1 && (
          <button
            onClick={handleNext}
            className="w-full text-center text-white/25 text-xs mt-4 hover:text-white/50 transition-colors"
          >
            Skip this step
          </button>
        )}
      </div>

      {/* Balance modal */}
      {balanceModal && (
        <BalanceModal
          item={balanceModal.item}
          type={balanceModal.type}
          onConfirm={handleBalanceConfirm}
          onClose={() => setBalanceModal(null)}
        />
      )}
    </div>
  );
}

// ── Trip Intelligence ───────────────────────────────────────────────────────

async function getIntelligenceData(client, history, assistantText, profileCtx) {
  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 3000,
      messages: [
        ...history,
        { role: 'assistant', content: assistantText },
        {
          role: 'user',
          content: `Traveler profile: ${profileCtx}. Based on this travel planning conversation, return ONLY a raw JSON object — no markdown, no code blocks. Use exactly this structure (set overview or strategy to null if insufficient travel details yet):

{"overview":{"destination":"City, Country","dates":"Month Year","cabinClass":"Business","totalSavings":0,"pointsUsed":[{"program":"Program Name","amount":0,"dollarValue":0}],"bestCard":{"name":"Card Name","reason":"Why this card"},"recommendation":"One-line booking recommendation"},"strategy":{"transferPartners":["..."],"pointsToUse":{"amount":0,"reasoning":"..."},"pointsToSave":{"amount":0,"reasoning":"..."},"perks":["..."],"warnings":["..."]},"checklist":{"sections":[{"title":"2 Weeks Before","items":[{"id":"w2-1","text":"...","checked":false}]},{"title":"1 Week Before","items":[{"id":"w1-1","text":"...","checked":false}]},{"title":"Day Before","items":[{"id":"db-1","text":"...","checked":false}]},{"title":"At The Airport","items":[{"id":"ap-1","text":"...","checked":false}]}]}}Checklist requirements: reference the traveler's actual card and program names throughout; include specific transfer partner actions, lounge names based on home airport and cards held, credit enrollment reminders, and status perks; 3-5 specific actionable items per section. Always return a checklist if any travel planning has occurred in the conversation.`,
        },
      ],
    });
    const raw = response.content[0].text.trim()
      .replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    if (raw === 'null') return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error('[Flio intelligence error]', err);
    return null;
  }
}

// ── Trip Intelligence Panel ─────────────────────────────────────────────────

function OverviewTab({ overview }) {
  if (!overview) {
    return (
      <div className="flex flex-col items-center justify-center h-32 text-center">
        <p className="text-white/25 text-sm">Trip details will appear here</p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <div className="card-hover bg-[#0d1526] border border-[#c9a84c]/10 rounded-xl p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Destination</p>
            <p className="text-white text-base font-light leading-snug">{overview.destination}</p>
            {overview.dates && <p className="text-white/40 text-xs mt-1">{overview.dates}</p>}
          </div>
          {overview.cabinClass && (
            <span className="flex-shrink-0 bg-[#c9a84c]/10 border border-[#c9a84c]/20 text-[#c9a84c] text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wide">
              {overview.cabinClass}
            </span>
          )}
        </div>
      </div>

      {overview.totalSavings > 0 && (
        <div className="bg-[#c9a84c]/[0.06] border border-[#c9a84c]/20 rounded-xl p-4">
          <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Est. Total Savings</p>
          <p className="text-[#c9a84c] text-2xl font-semibold leading-none">~${overview.totalSavings.toLocaleString()}</p>
          <p className="text-white/30 text-xs mt-1">vs. paying cash</p>
        </div>
      )}

      {overview.pointsUsed?.length > 0 && (
        <div className="card-hover bg-[#0d1526] border border-[#c9a84c]/10 rounded-xl p-4">
          <p className="text-[10px] text-white/30 uppercase tracking-widest mb-3">Points Being Used</p>
          <div className="space-y-2.5">
            {overview.pointsUsed.map((p, i) => (
              <div key={i} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-white/80 text-sm truncate">{p.program}</p>
                  <p className="text-white/30 text-xs">{p.amount?.toLocaleString()} pts</p>
                </div>
                <p className="text-[#c9a84c] text-sm font-medium flex-shrink-0">~${p.dollarValue?.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {overview.bestCard && (
        <div className="card-hover bg-[#0d1526] border border-[#c9a84c]/10 rounded-xl p-4">
          <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2">Best Card for Taxes/Fees</p>
          <p className="text-white text-sm font-medium">{overview.bestCard.name}</p>
          {overview.bestCard.reason && (
            <p className="text-white/40 text-xs mt-1 leading-relaxed">{overview.bestCard.reason}</p>
          )}
        </div>
      )}

      {overview.recommendation && (
        <div className="bg-[#0d1526] border border-[#c9a84c]/20 rounded-xl p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-[#c9a84c] text-xs leading-none">✦</span>
            <p className="text-[10px] text-[#c9a84c] uppercase tracking-widest font-semibold">Recommendation</p>
          </div>
          <p className="text-white/75 text-sm leading-relaxed">{overview.recommendation}</p>
        </div>
      )}
    </div>
  );
}

function ChecklistTab({ checklist, onToggleItem }) {
  if (!checklist) {
    return (
      <div className="flex flex-col items-center justify-center h-32 text-center">
        <p className="text-white/25 text-sm">Checklist will appear after planning</p>
      </div>
    );
  }
  const allItems = checklist.sections?.flatMap((s) => s.items) ?? [];
  const completed = allItems.filter((i) => i.checked).length;
  const total = allItems.length;
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#c9a84c] rounded-full transition-all duration-500"
            style={{ width: total > 0 ? `${(completed / total) * 100}%` : '0%' }}
          />
        </div>
        <span className="text-xs text-white/35 flex-shrink-0 min-w-[60px] text-right">
          {completed === total && total > 0 ? 'All done ✓' : `${completed} of ${total}`}
        </span>
      </div>
      <div className="space-y-3">
        {checklist.sections?.map((section) => (
          <div key={section.title} className="card-hover bg-[#0d1526] border border-[#c9a84c]/10 rounded-xl p-4">
            <p className="text-[9px] text-white/30 uppercase tracking-widest mb-3">{section.title}</p>
            <div className="space-y-2.5">
              {section.items.map((item) => (
                <label key={item.id} className="flex items-start gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => onToggleItem(section.title, item.id)}
                    className="mt-0.5 flex-shrink-0 w-3.5 h-3.5 accent-[#c9a84c] cursor-pointer"
                  />
                  <span className={`text-sm leading-relaxed transition-all duration-200 select-none ${
                    item.checked ? 'line-through text-white/20' : 'text-white/70 group-hover:text-white/90'
                  }`}>
                    {item.text}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StrategyTab({ strategy }) {
  if (!strategy) {
    return (
      <div className="flex flex-col items-center justify-center h-32 text-center">
        <p className="text-white/25 text-sm">Strategy will appear after planning</p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {strategy.transferPartners?.length > 0 && (
        <div className="card-hover bg-[#0d1526] border border-[#c9a84c]/10 rounded-xl p-4">
          <p className="text-[10px] text-white/30 uppercase tracking-widest mb-3">Transfer Partners</p>
          <div className="space-y-1.5">
            {strategy.transferPartners.map((p, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-[#c9a84c]/60 flex-shrink-0 mt-1.5" />
                <p className="text-white/70 text-sm leading-relaxed">{p}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {(strategy.pointsToUse || strategy.pointsToSave) && (
        <div className="card-hover bg-[#0d1526] border border-[#c9a84c]/10 rounded-xl p-4">
          <p className="text-[10px] text-white/30 uppercase tracking-widest mb-3">Points Allocation</p>
          {strategy.pointsToUse && (
            <div className="mb-3">
              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="text-[10px] text-[#c9a84c] uppercase tracking-wide font-medium">Use</span>
                <span className="text-white text-sm font-medium">
                  {strategy.pointsToUse.amount != null ? strategy.pointsToUse.amount.toLocaleString() + ' pts' : '—'}
                </span>
              </div>
              <p className="text-white/40 text-xs leading-relaxed">{strategy.pointsToUse.reasoning}</p>
            </div>
          )}
          {strategy.pointsToSave && (
            <div className={strategy.pointsToUse ? 'border-t border-white/5 pt-3' : ''}>
              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="text-[10px] text-white/40 uppercase tracking-wide font-medium">Keep</span>
                <span className="text-white/70 text-sm font-medium">
                  {strategy.pointsToSave.amount != null ? strategy.pointsToSave.amount.toLocaleString() + ' pts' : '—'}
                </span>
              </div>
              <p className="text-white/40 text-xs leading-relaxed">{strategy.pointsToSave.reasoning}</p>
            </div>
          )}
        </div>
      )}

      {strategy.perks?.length > 0 && (
        <div className="card-hover bg-[#0d1526] border border-[#c9a84c]/10 rounded-xl p-4">
          <p className="text-[10px] text-white/30 uppercase tracking-widest mb-3">Applicable Perks</p>
          <div className="space-y-1.5">
            {strategy.perks.map((p, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-[#c9a84c]/60 text-xs flex-shrink-0 mt-0.5">✓</span>
                <p className="text-white/70 text-sm leading-relaxed">{p}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {strategy.warnings?.length > 0 && (
        <div className="bg-red-950/15 border border-red-900/20 rounded-xl p-4">
          <p className="text-[10px] text-red-400/60 uppercase tracking-widest mb-3">What NOT to Do</p>
          <div className="space-y-1.5">
            {strategy.warnings.map((w, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-red-700/60 text-xs flex-shrink-0 mt-0.5">✕</span>
                <p className="text-white/55 text-sm leading-relaxed">{w}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TripIntelligencePanel({ intelligence, loading, activeTab, onTabChange, newIndicators, onClearIndicator, onToggleChecklistItem }) {
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'checklist', label: 'Checklist' },
    { id: 'strategy', label: 'Strategy' },
  ];
  const isEmpty = !intelligence;
  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div className="flex items-center border-b border-white/8 px-4 flex-shrink-0">
        <div className="flex flex-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { onTabChange(tab.id); onClearIndicator(tab.id); }}
              className={`tab-btn relative py-3 mr-5 text-sm border-b-2 border-transparent ${
                activeTab === tab.id
                  ? 'tab-active text-white'
                  : 'text-white/35 hover:text-white/65'
              }`}
            >
              {tab.label}
              {newIndicators?.[tab.id] && activeTab !== tab.id && (
                <span className="absolute -top-0.5 -right-2 w-1.5 h-1.5 rounded-full bg-[#c9a84c] animate-pulse" />
              )}
            </button>
          ))}
        </div>
        {loading && (
          <div className="flex items-center gap-1 py-3">
            <span className="w-1 h-1 rounded-full bg-[#c9a84c]/60 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1 h-1 rounded-full bg-[#c9a84c]/60 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1 h-1 rounded-full bg-[#c9a84c]/60 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {isEmpty && !loading ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-8 min-h-[260px] gap-4">
            <div className="w-12 h-12 rounded-full bg-[#c9a84c]/8 border border-[#c9a84c]/15 flex items-center justify-center">
              <PlaneIcon className="w-6 h-6 text-[#c9a84c]/25" />
            </div>
            <div>
              <p className="text-white/30 text-sm font-['Playfair_Display',serif] mb-1.5">Your trip intelligence</p>
              <p className="text-white/30 text-xs leading-relaxed max-w-[160px] mx-auto">
                Start a conversation and Flio will build your strategy here in real time.
              </p>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && <OverviewTab overview={intelligence?.overview} />}
            {activeTab === 'checklist' && (
              <ChecklistTab checklist={intelligence?.checklist} onToggleItem={onToggleChecklistItem} />
            )}
            {activeTab === 'strategy' && <StrategyTab strategy={intelligence?.strategy} />}
          </>
        )}
      </div>
    </div>
  );
}

// ── Trip History ────────────────────────────────────────────────────────────

const TRIPS_KEY = 'flio-trips';
const MAX_TRIPS = 20;

function formatTripDate(isoString) {
  const d = new Date(isoString);
  const diffDays = Math.floor((Date.now() - d) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function TripHistoryItem({ trip, isActive, onLoad, onDelete }) {
  return (
    <div
      className={`group flex items-center gap-2 px-3 py-2 mx-2 rounded-lg cursor-pointer transition-colors ${
        isActive ? 'bg-[#c9a84c]/10' : 'hover:bg-white/5'
      }`}
      onClick={() => onLoad(trip)}
    >
      <div className="flex-1 min-w-0">
        <p className={`text-sm truncate leading-snug ${isActive ? 'text-white' : 'text-white/65 group-hover:text-white/90'}`}>
          {trip.title}
        </p>
        <p className="text-[10px] text-white/25 mt-0.5">{formatTripDate(trip.date)}</p>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(trip.id); }}
        className="opacity-0 group-hover:opacity-100 text-white/25 hover:text-red-400 transition-all flex-shrink-0"
        aria-label="Delete trip"
      >
        <TrashIcon className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ── Chat Interface ─────────────────────────────────────────────────────────

const GREETING = "Hi! I'm Flio, your AI travel concierge. Where are you thinking of going next?";

function TypingIndicator() {
  return (
    <div className="flex justify-start mb-3 animate-msg-in">
      <div className="w-7 h-7 rounded-full bg-[#c9a84c]/20 border border-[#c9a84c]/30 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
        <PlaneIcon className="w-3.5 h-3.5 text-[#c9a84c]" />
      </div>
      <div className="bg-[#111d35] rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
        <span className="typing-dot w-1.5 h-1.5 rounded-full bg-[#c9a84c]/60" />
        <span className="typing-dot w-1.5 h-1.5 rounded-full bg-[#c9a84c]/60" />
        <span className="typing-dot w-1.5 h-1.5 rounded-full bg-[#c9a84c]/60" />
      </div>
    </div>
  );
}

function ChatBubble({ message }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3 animate-msg-in`}>
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
              : 'bg-[#111d35] text-white/90 rounded-bl-sm border border-white/[0.06]'
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

function ChatInterface({ onBack, onOpenDashboard, onEditProfile, profile, trips, onSaveTrip, onDeleteTrip }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTripId, setCurrentTripId] = useState(null);
  const currentTripIdRef = useRef(null);
  const [messages, setMessages] = useState([
    { id: 1, role: 'assistant', text: GREETING, time: now() },
  ]);
  const messagesRef = useRef(messages);
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const bottomRef = useRef(null);

  // Trip Intelligence panel state
  const [intelligence, setIntelligence] = useState(null);
  const intelligenceRef = useRef(null);
  useEffect(() => { intelligenceRef.current = intelligence; }, [intelligence]);
  const [intelligenceLoading, setIntelligenceLoading] = useState(false);
  const [activeIntelTab, setActiveIntelTab] = useState('overview');
  const [newTabIndicators, setNewTabIndicators] = useState({ overview: false, checklist: false, strategy: false });
  const [mobileIntelOpen, setMobileIntelOpen] = useState(false);

  const clientRef = useRef(
    new Anthropic({
      apiKey: process.env.REACT_APP_ANTHROPIC_API_KEY,
      dangerouslyAllowBrowser: true,
    })
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const startNewTrip = () => {
    setMessages([{ id: Date.now(), role: 'assistant', text: GREETING, time: now() }]);
    currentTripIdRef.current = null;
    setCurrentTripId(null);
    setSidebarOpen(false);
    setIntelligence(null);
    setNewTabIndicators({ overview: false, checklist: false, strategy: false });
  };

  const loadTrip = (trip) => {
    setMessages(trip.messages);
    currentTripIdRef.current = trip.id;
    setCurrentTripId(trip.id);
    setSidebarOpen(false);
    setIntelligence(trip.intelligence ?? null);
    setNewTabIndicators({ overview: false, checklist: false, strategy: false });
  };

  const handleDeleteTrip = (id) => {
    if (id === currentTripIdRef.current) {
      currentTripIdRef.current = null;
      setCurrentTripId(null);
    }
    onDeleteTrip(id);
  };

  const saveTripSnapshot = (msgs, intel) => {
    if (!currentTripIdRef.current) return;
    const title = (msgs.find((m) => m.role === 'user')?.text ?? 'Trip').slice(0, 60);
    onSaveTrip({ id: currentTripIdRef.current, title, date: new Date().toISOString(), messages: msgs, intelligence: intel });
  };

  const toggleIntelligenceChecklistItem = (sectionTitle, itemId) => {
    setIntelligence((prev) => {
      if (!prev?.checklist?.sections) return prev;
      const updated = {
        ...prev,
        checklist: {
          ...prev.checklist,
          sections: prev.checklist.sections.map((s) =>
            s.title !== sectionTitle ? s : {
              ...s,
              items: s.items.map((item) =>
                item.id !== itemId ? item : { ...item, checked: !item.checked }
              ),
            }
          ),
        },
      };
      if (currentTripIdRef.current) {
        const msgs = messagesRef.current;
        const title = (msgs.find((m) => m.role === 'user')?.text ?? 'Trip').slice(0, 60);
        onSaveTrip({ id: currentTripIdRef.current, title, date: new Date().toISOString(), messages: msgs, intelligence: updated });
      }
      return updated;
    });
  };

  const send = async () => {
    if (!input.trim() || isStreaming) return;

    const userText = input.trim();
    const userTime = now();
    setInput('');

    const userMsg = { id: Date.now(), role: 'user', text: userText, time: userTime };
    const prevMessages = messages;
    setMessages((prev) => [...prev, userMsg]);
    setIsStreaming(true);

    const history = [
      ...prevMessages.map((m) => ({ role: m.role, content: m.text })),
      { role: 'user', content: userText },
    ];

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

      let fullText = '';
      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          fullText += chunk.delta.text;
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, text: m.text + chunk.delta.text } : m))
          );
        }
      }

      setIsStreaming(false);

      // Auto-save trip (without new intelligence yet)
      const finalMessages = [
        ...prevMessages,
        userMsg,
        { id: assistantId, role: 'assistant', text: fullText, time: now() },
      ];
      if (!currentTripIdRef.current) {
        currentTripIdRef.current = String(Date.now());
        setCurrentTripId(currentTripIdRef.current);
      }
      saveTripSnapshot(finalMessages, intelligenceRef.current);

      // Update Trip Intelligence Panel
      setIntelligenceLoading(true);
      const profileCtx = [
        profile.homeAirport ? `Home airport: ${profile.homeAirport.city} (${profile.homeAirport.code})` : '',
        profile.creditCards?.length ? `Credit cards: ${profile.creditCards.map((c) => c.name).join(', ')}` : '',
        profile.loyaltyPrograms?.length ? `Loyalty programs: ${profile.loyaltyPrograms.map((p) => p.name).join(', ')}` : '',
        profile.preferences?.cabin ? `Preferred cabin: ${profile.preferences.cabin}` : '',
      ].filter(Boolean).join('. ');

      const intel = await getIntelligenceData(clientRef.current, history, fullText, profileCtx);
      if (intel) {
        setIntelligence(intel);
        setNewTabIndicators({ overview: true, checklist: true, strategy: true });
        saveTripSnapshot(finalMessages, intel);
      }

      return;
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
      setIntelligenceLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const intelligencePanelProps = {
    intelligence,
    loading: intelligenceLoading,
    activeTab: activeIntelTab,
    onTabChange: setActiveIntelTab,
    newIndicators: newTabIndicators,
    onClearIndicator: (tab) => setNewTabIndicators((prev) => ({ ...prev, [tab]: false })),
    onToggleChecklistItem: toggleIntelligenceChecklistItem,
  };

  return (
    <div className="h-screen bg-[#0a0f1e] font-['DM_Sans',sans-serif] flex flex-col relative overflow-hidden">

      {/* Sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="absolute inset-0 bg-black/50 glass-panel z-20"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar panel */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-72 bg-[#070d1c] border-r border-white/8 z-30 flex flex-col transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/5 flex-shrink-0">
          <span className="text-white text-sm font-medium">Trip History</span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-white/30 hover:text-white transition-colors"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="px-3 py-3 border-b border-white/5 flex-shrink-0">
          <button
            onClick={startNewTrip}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#c9a84c]/10 border border-[#c9a84c]/20 text-[#c9a84c] text-sm hover:bg-[#c9a84c]/20 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            New Trip
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {trips.length === 0 ? (
            <div className="flex flex-col items-center mt-10 px-4 text-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#c9a84c]/8 border border-[#c9a84c]/12 flex items-center justify-center">
                <PlaneIcon className="w-4 h-4 text-[#c9a84c]/30" />
              </div>
              <p className="text-white/25 text-xs leading-relaxed">
                No trips saved yet.<br />Your conversations auto-save here.
              </p>
            </div>
          ) : (
            trips.map((trip) => (
              <TripHistoryItem
                key={trip.id}
                trip={trip}
                isActive={trip.id === currentTripId}
                onLoad={loadTrip}
                onDelete={handleDeleteTrip}
              />
            ))
          )}
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-white/5 bg-[#0a0f1e] flex-shrink-0 z-10">
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
        <div className="ml-auto flex items-center gap-4">
          <button onClick={onEditProfile} className="text-sm text-white/40 hover:text-white transition-colors">
            Edit profile
          </button>
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-white/40 hover:text-white transition-colors"
            aria-label="Trip history"
          >
            <HistoryIcon className="w-5 h-5" />
          </button>
          {/* Mobile: toggle intelligence drawer */}
          <button
            onClick={() => setMobileIntelOpen(true)}
            className="relative md:hidden text-white/40 hover:text-white transition-colors"
            aria-label="Trip intelligence"
          >
            <PanelRightIcon className="w-5 h-5" />
            {(newTabIndicators.overview || newTabIndicators.checklist || newTabIndicators.strategy) && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#c9a84c]" />
            )}
          </button>
          <button onClick={onOpenDashboard} className="text-white/40 hover:text-white transition-colors" aria-label="Profile">
            <UserIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main: split panel */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left: Chat (full width on mobile, 60% on desktop) */}
        <div className="flex flex-col overflow-hidden w-full md:w-[60%]">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-6">
            {messages.map((m) => (
              <div key={m.id}>
                <ChatBubble message={m} />
              </div>
            ))}
            {isStreaming && messages[messages.length - 1]?.text === '' && (
              <TypingIndicator />
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-4 border-t border-white/5 bg-[#0a0f1e] flex-shrink-0">
            <div className="flex items-center gap-3 bg-[#111d35] border border-white/10 rounded-full px-4 py-2.5">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Ask Flio anything..."
                disabled={isStreaming}
                className="flex-1 bg-transparent text-white text-sm placeholder-white/25 outline-none disabled:opacity-50"
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

        {/* Divider */}
        <div className="hidden md:block w-px bg-white/[0.06] flex-shrink-0" />

        {/* Right: Trip Intelligence Panel (desktop only) */}
        <div className="hidden md:flex flex-col overflow-hidden md:w-[40%] bg-[#0a0f1e]">
          <TripIntelligencePanel {...intelligencePanelProps} />
        </div>
      </div>

      {/* Mobile: intelligence drawer */}
      {mobileIntelOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/50 glass-panel" onClick={() => setMobileIntelOpen(false)} />
          <div className="relative bg-[#0a0f1e] border-t border-white/8 rounded-t-2xl flex flex-col" style={{ maxHeight: '80vh' }}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/8 flex-shrink-0">
              <span className="text-white text-sm font-medium">Trip Intelligence</span>
              <button onClick={() => setMobileIntelOpen(false)} className="text-white/40 hover:text-white transition-colors">
                <XIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0">
              <TripIntelligencePanel {...intelligencePanelProps} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Ready Screen ───────────────────────────────────────────────────────────

function ReadyScreen({ profile }) {
  const programs = profile.loyaltyPrograms ?? [];
  const cards = profile.creditCards ?? [];
  const prefs = profile.preferences ?? {};
  const activePrefs = Object.values(prefs).filter(Boolean);

  return (
    <div className="min-h-screen bg-[#0a0f1e] font-['DM_Sans',sans-serif] flex flex-col items-center justify-center px-6 text-center animate-fade-in-up">
      {/* Icon */}
      <div className="w-16 h-16 rounded-full bg-[#c9a84c]/15 border border-[#c9a84c]/30 flex items-center justify-center mb-8">
        <PlaneIcon className="w-7 h-7 text-[#c9a84c]" />
      </div>

      <h2 className="text-3xl text-white mb-2 font-['Playfair_Display',serif] font-normal">You're all set.</h2>
      <p className="text-white/40 text-sm mb-10 max-w-xs leading-relaxed">
        Flio is ready with your profile. Ask anything about flights, hotels, or points.
      </p>

      {/* Profile summary card */}
      <div className="bg-[#0d1526] border border-[#c9a84c]/12 rounded-2xl p-5 w-full max-w-sm text-left space-y-3 mb-10">
        {profile.homeAirport && (
          <div className="flex items-center gap-3">
            <span className="text-[#c9a84c] text-xs font-mono font-bold w-10 flex-shrink-0">{profile.homeAirport.code}</span>
            <span className="text-white/70 text-sm">{profile.homeAirport.city}</span>
          </div>
        )}
        {programs.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-white/25 text-xs w-10 flex-shrink-0">✈</span>
            <span className="text-white/60 text-sm">
              {programs.map((p) => p.shortName).join(', ')}
            </span>
          </div>
        )}
        {cards.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-white/25 text-xs w-10 flex-shrink-0">◈</span>
            <span className="text-white/60 text-sm">
              {cards.map((c) => c.shortName).join(', ')}
            </span>
          </div>
        )}
        {activePrefs.length > 0 && (
          <div className="flex items-start gap-3">
            <span className="text-white/25 text-xs w-10 flex-shrink-0 mt-0.5">◎</span>
            <span className="text-white/60 text-sm leading-relaxed">
              {activePrefs.join(' · ')}
            </span>
          </div>
        )}
      </div>

      {/* Loading dots */}
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[#c9a84c]/60 animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 rounded-full bg-[#c9a84c]/60 animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1.5 h-1.5 rounded-full bg-[#c9a84c]/60 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}

// ── Profile Dashboard ──────────────────────────────────────────────────────

function cppDollar(balance, cpp) {
  return Math.round((balance * cpp) / 100);
}

function WalletTile({ name, balance, currency, cpp, icon }) {
  const val = cppDollar(balance, cpp);
  return (
    <div className="bg-[#0d1526] border border-[#c9a84c]/10 rounded-xl p-4 card-hover">
      <div className="flex items-center gap-2.5 mb-3">
        {icon}
        <span className="text-white/60 text-xs leading-tight">{name}</span>
      </div>
      <p className="text-white text-xl font-light leading-none mb-0.5">
        <AnimatedNumber value={balance} />
      </p>
      <p className="text-white/25 text-[10px] mb-1.5">{currency}</p>
      {balance > 0 && (
        <p className="text-[#c9a84c] text-xs font-medium">~$<AnimatedNumber value={val} /></p>
      )}
    </div>
  );
}

function WalletSection({ profile }) {
  const programs = profile.loyaltyPrograms ?? [];
  const cards = profile.creditCards ?? [];

  const total = [
    ...programs.map((p) => cppDollar(p.balance, POINTS_CPP[p.id] ?? 1.0)),
    ...cards.map((c) => cppDollar(c.balance, CARDS_CPP[c.id] ?? 1.5)),
  ].reduce((a, b) => a + b, 0);

  if (programs.length === 0 && cards.length === 0) {
    return (
      <section>
        <h3 className="text-white font-medium mb-3">Travel Wallet</h3>
        <p className="text-white/30 text-sm">No programs or cards added yet.</p>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-white font-medium">Travel Wallet</h3>
        <div className="text-right">
          <p className="text-[10px] text-white/30 uppercase tracking-widest">Total Est. Value</p>
          <p className="text-[#c9a84c] text-xl font-semibold">${total.toLocaleString()}</p>
        </div>
      </div>

      {programs.length > 0 && (
        <>
          <p className="text-[10px] text-white/30 uppercase tracking-widest mb-3">Loyalty Programs</p>
          <div className="grid grid-cols-2 gap-2.5 mb-6">
            {programs.map((p) => (
              <WalletTile
                key={p.id}
                name={p.shortName}
                balance={p.balance}
                currency={p.currency}
                cpp={POINTS_CPP[p.id] ?? 1.0}
                icon={
                  <div style={{ backgroundColor: p.color }} className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-[9px] font-bold">{p.initials}</span>
                  </div>
                }
              />
            ))}
          </div>
        </>
      )}

      {cards.length > 0 && (
        <>
          <p className="text-[10px] text-white/30 uppercase tracking-widest mb-3">Credit Cards</p>
          <div className="grid grid-cols-2 gap-2.5">
            {cards.map((c) => (
              <WalletTile
                key={c.id}
                name={c.shortName}
                balance={c.balance}
                currency={c.currency}
                cpp={CARDS_CPP[c.id] ?? 1.5}
                icon={
                  <div style={{ background: c.bg }} className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span style={{ color: c.accentColor }} className="text-[7px] font-bold leading-none">{c.issuer?.split(' ')[0]}</span>
                  </div>
                }
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function CreditsSection({ profile, usedCredits, onToggle }) {
  const cards = profile.creditCards ?? [];
  const eligible = cards.filter((c) => CARD_CREDITS_DATA[c.id]);

  const totalAvailable = eligible
    .flatMap((c) => CARD_CREDITS_DATA[c.id])
    .filter((cr) => !usedCredits[cr.id])
    .reduce((a, cr) => a + cr.value, 0);

  if (eligible.length === 0) {
    return (
      <section>
        <h3 className="text-white font-medium mb-3">Annual Credits</h3>
        <p className="text-white/30 text-sm">Add eligible cards to see your credits here.</p>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-white font-medium">Annual Credits</h3>
        <div className="text-right">
          <p className="text-[10px] text-white/30 uppercase tracking-widest">Available</p>
          <p className="text-emerald-400 text-xl font-semibold">${totalAvailable.toLocaleString()}</p>
        </div>
      </div>

      <div className="space-y-5">
        {eligible.map((card) => (
          <div key={card.id}>
            <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2">{card.shortName}</p>
            <div className="space-y-2">
              {CARD_CREDITS_DATA[card.id].map((credit) => {
                const used = !!usedCredits[credit.id];
                return (
                  <div
                    key={credit.id}
                    className={`flex items-center justify-between bg-[#0d1526] border rounded-xl px-4 py-3 transition-all ${
                      used ? 'border-white/5 opacity-40' : 'border-white/10'
                    }`}
                  >
                    <div>
                      <p className={`text-sm leading-snug ${used ? 'line-through text-white/30' : 'text-white/80'}`}>
                        {credit.label}
                      </p>
                      <p className={`text-xs mt-0.5 ${used ? 'text-white/20' : 'text-[#c9a84c]'}`}>
                        ${credit.value} · {credit.note}
                      </p>
                    </div>
                    <button
                      onClick={() => onToggle(credit.id)}
                      className={`ml-4 flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition-all ${
                        used
                          ? 'border-white/10 text-white/25'
                          : 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                      }`}
                    >
                      {used ? 'Used' : 'Available'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SettingsSection({ profile, onSave }) {
  const [editing, setEditing] = useState(null);
  const [airportQuery, setAirportQuery] = useState('');
  const [draftAirport, setDraftAirport] = useState(null);

  const filteredAirports = useMemo(() => {
    if (!airportQuery.trim() || draftAirport) return [];
    const q = airportQuery.toLowerCase();
    return AIRPORTS.filter(
      (a) => a.code.toLowerCase().includes(q) || a.city.toLowerCase().includes(q) || a.name.toLowerCase().includes(q)
    ).slice(0, 5);
  }, [airportQuery, draftAirport]);

  const prefs = profile.preferences ?? {};

  const startEditAirport = () => {
    const a = profile.homeAirport;
    setAirportQuery(a ? `${a.city} (${a.code})` : '');
    setDraftAirport(a ?? null);
    setEditing('airport');
  };

  const saveAirport = () => {
    if (draftAirport) onSave({ ...profile, homeAirport: draftAirport });
    setEditing(null);
  };

  const savePref = (key, val) => {
    onSave({ ...profile, preferences: { ...prefs, [key]: val } });
  };

  return (
    <section>
      <h3 className="text-white font-medium mb-4">Profile Settings</h3>
      <div className="space-y-3">

        {/* Home airport */}
        <div className="card-hover bg-[#0d1526] border border-[#c9a84c]/12 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] text-white/30 uppercase tracking-widest">Home Airport</p>
            {editing !== 'airport'
              ? <button onClick={startEditAirport} className="text-xs text-[#c9a84c] hover:text-white transition-colors">Edit</button>
              : <button onClick={() => setEditing(null)} className="text-xs text-white/30 hover:text-white transition-colors">Cancel</button>}
          </div>
          {editing === 'airport' ? (
            <div>
              <div className="relative">
                <input
                  autoFocus
                  type="text"
                  value={airportQuery}
                  onChange={(e) => { setAirportQuery(e.target.value); setDraftAirport(null); }}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/20 input-gold focus:outline-none transition-all"
                  placeholder="Search city or code…"
                />
                {filteredAirports.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[#111d35] border border-white/10 rounded-xl overflow-hidden z-10 shadow-2xl">
                    {filteredAirports.map((a) => (
                      <button key={a.code} onClick={() => { setDraftAirport(a); setAirportQuery(`${a.city} (${a.code})`); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors text-left border-b border-white/5 last:border-0">
                        <span className="text-[#c9a84c] text-xs font-mono font-bold w-8">{a.code}</span>
                        <span className="text-white text-sm">{a.city}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={saveAirport} disabled={!draftAirport}
                className="mt-2 w-full py-2 rounded-full bg-[#c9a84c] disabled:bg-white/10 text-[#060d1f] disabled:text-white/30 text-xs font-semibold transition-colors">
                Save
              </button>
            </div>
          ) : (
            <p className="text-white text-sm">
              {profile.homeAirport ? `${profile.homeAirport.city} (${profile.homeAirport.code})` : <span className="text-white/30">Not set</span>}
            </p>
          )}
        </div>

        {/* Cabin preference */}
        <div className="card-hover bg-[#0d1526] border border-[#c9a84c]/12 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] text-white/30 uppercase tracking-widest">Cabin Preference</p>
            {editing !== 'cabin'
              ? <button onClick={() => setEditing('cabin')} className="text-xs text-[#c9a84c] hover:text-white transition-colors">Edit</button>
              : <button onClick={() => setEditing(null)} className="text-xs text-white/30 hover:text-white transition-colors">Done</button>}
          </div>
          {editing === 'cabin' ? (
            <div className="flex flex-wrap gap-2 mt-1">
              {['Economy', 'Premium Economy', 'Business', 'First'].map((c) => (
                <button key={c} onClick={() => { savePref('cabin', c); setEditing(null); }}
                  className={`px-3 py-1.5 rounded-full text-xs transition-all ${prefs.cabin === c ? 'bg-[#c9a84c] text-[#060d1f] font-semibold' : 'border border-white/15 text-white/60 hover:text-white'}`}>
                  {c}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-white text-sm">{prefs.cabin ?? <span className="text-white/30">Not set</span>}</p>
          )}
        </div>

        {/* Travel style */}
        <div className="card-hover bg-[#0d1526] border border-[#c9a84c]/12 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] text-white/30 uppercase tracking-widest">Travel Style</p>
            {editing !== 'style'
              ? <button onClick={() => setEditing('style')} className="text-xs text-[#c9a84c] hover:text-white transition-colors">Edit</button>
              : <button onClick={() => setEditing(null)} className="text-xs text-white/30 hover:text-white transition-colors">Done</button>}
          </div>
          {editing === 'style' ? (
            <div className="flex flex-wrap gap-2 mt-1">
              {['Maximize comfort', 'Maximize value', 'Balance both'].map((s) => (
                <button key={s} onClick={() => { savePref('style', s); setEditing(null); }}
                  className={`px-3 py-1.5 rounded-full text-xs transition-all ${prefs.style === s ? 'bg-[#c9a84c] text-[#060d1f] font-semibold' : 'border border-white/15 text-white/60 hover:text-white'}`}>
                  {s}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-white text-sm">{prefs.style ?? <span className="text-white/30">Not set</span>}</p>
          )}
        </div>

      </div>
    </section>
  );
}

function ProfileDashboard({ profile, usedCredits, onToggleCredit, onSave, onBack }) {
  const [tab, setTab] = useState('wallet'); // 'wallet' | 'credits' | 'settings'

  const tabs = [
    { id: 'wallet',   label: 'Wallet' },
    { id: 'credits',  label: 'Credits' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0f1e] font-['DM_Sans',sans-serif] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-5 border-b border-white/5">
        <button onClick={onBack} className="text-white/40 hover:text-white transition-colors">
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <div className="w-8 h-8 rounded-full bg-[#c9a84c]/20 border border-[#c9a84c]/30 flex items-center justify-center">
          <UserIcon className="w-4 h-4 text-[#c9a84c]" />
        </div>
        <h1 className="text-white font-medium text-sm">My Profile</h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 px-6">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`tab-btn py-3 mr-6 text-sm border-b-2 border-transparent ${
              tab === t.id ? 'tab-active text-white' : 'text-white/35 hover:text-white/65'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-5 py-7 max-w-2xl mx-auto w-full">
          {tab === 'wallet'   && <WalletSection  profile={profile} />}
          {tab === 'credits'  && <CreditsSection profile={profile} usedCredits={usedCredits} onToggle={onToggleCredit} />}
          {tab === 'settings' && <SettingsSection profile={profile} onSave={onSave} />}
        </div>
      </div>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────

function AnimatedNumber({ value, duration = 1100 }) {
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    if (!value || value === 0) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value, duration]);
  return <>{value > 0 ? displayed.toLocaleString() : '—'}</>;
}

function now() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ── App Shell ──────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState(() => {
    try {
      const p = JSON.parse(localStorage.getItem('flio-profile'));
      if (p && p.homeAirport) return 'chat';
    } catch {}
    return 'landing';
  });
  const prevScreenRef = useRef('landing');
  const [isEditing, setIsEditing] = useState(false);
  const [editReturnScreen, setEditReturnScreen] = useState('landing');

  const [profile, setProfile] = useState(() => {
    try { return JSON.parse(localStorage.getItem('flio-profile')) || {}; } catch { return {}; }
  });
  const [usedCredits, setUsedCredits] = useState(() => {
    try { return JSON.parse(localStorage.getItem('flio-credits')) || {}; } catch { return {}; }
  });
  const [trips, setTrips] = useState(() => {
    try { return JSON.parse(localStorage.getItem(TRIPS_KEY)) || []; } catch { return []; }
  });

  const saveProfile = (p) => {
    setProfile(p);
    localStorage.setItem('flio-profile', JSON.stringify(p));
  };

  const toggleCredit = (id) => {
    setUsedCredits((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem('flio-credits', JSON.stringify(next));
      return next;
    });
  };

  const saveTrip = (trip) => {
    setTrips((prev) => {
      const next = [trip, ...prev.filter((t) => t.id !== trip.id)].slice(0, MAX_TRIPS);
      localStorage.setItem(TRIPS_KEY, JSON.stringify(next));
      return next;
    });
  };

  const deleteTrip = (id) => {
    setTrips((prev) => {
      const next = prev.filter((t) => t.id !== id);
      localStorage.setItem(TRIPS_KEY, JSON.stringify(next));
      return next;
    });
  };

  const openDashboard = (from) => {
    prevScreenRef.current = from;
    setScreen('dashboard');
  };

  const handleEditProfile = (from) => {
    setIsEditing(true);
    setEditReturnScreen(from);
    setScreen('profile');
  };

  const handleProfileComplete = (savedProfile) => {
    saveProfile(savedProfile);
    if (isEditing) {
      setIsEditing(false);
      setScreen(editReturnScreen);
    } else {
      setScreen('ready');
      setTimeout(() => setScreen('chat'), 2800);
    }
  };

  return (
    <>
      {/* Noise texture overlay — sits above everything, pointer-events-none */}
      <div className="noise-overlay" aria-hidden="true" />
      {screen === 'landing' && (
        <LandingPage
          onGetStarted={() => setScreen('profile')}
          onOpenChat={() => setScreen('chat')}
          onOpenDashboard={() => openDashboard('landing')}
          hasProfile={!!profile.homeAirport}
          onEditProfile={() => handleEditProfile('landing')}
        />
      )}
      {screen === 'profile' && (
        <ProfileSetup
          onBack={() => setScreen(isEditing ? editReturnScreen : 'landing')}
          onComplete={handleProfileComplete}
          initialProfile={profile}
        />
      )}
      {screen === 'ready' && <ReadyScreen profile={profile} />}
      {screen === 'chat' && (
        <ChatInterface
          onBack={() => setScreen('landing')}
          onOpenDashboard={() => openDashboard('chat')}
          onEditProfile={() => handleEditProfile('chat')}
          profile={profile}
          trips={trips}
          onSaveTrip={saveTrip}
          onDeleteTrip={deleteTrip}
        />
      )}
      {screen === 'dashboard' && (
        <ProfileDashboard
          profile={profile}
          usedCredits={usedCredits}
          onToggleCredit={toggleCredit}
          onSave={saveProfile}
          onBack={() => setScreen(prevScreenRef.current)}
        />
      )}
    </>
  );
}
