import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
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

function SunIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="4" />
      <path strokeLinecap="round" d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

function MoonIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function MenuIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
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

  // Each message has a fixed visibility threshold — never add/remove DOM nodes
  const msgVisible = [
    step >= 1, // user1
    step >= 3, // assistant1
    step >= 4, // user2
    step >= 6, // assistant2
  ];
  const showTyping = step === 2 || step === 5;

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

        {/* Messages — all pre-rendered; opacity+transform only, never layout-affecting props */}
        <div className="px-4 py-5 space-y-3 min-h-[420px]">
          {DEMO.map((msg, i) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={i}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                style={{
                  opacity: msgVisible[i] ? 1 : 0,
                  transform: msgVisible[i] ? 'translateY(0)' : 'translateY(10px)',
                  transition: 'opacity 0.38s cubic-bezier(0.16, 1, 0.3, 1), transform 0.38s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
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

          {/* Typing indicator — pre-rendered, opacity+transform only */}
          <div
            aria-hidden={!showTyping}
            className="flex justify-start"
            style={{
              opacity: showTyping ? 1 : 0,
              transform: showTyping ? 'translateY(0)' : 'translateY(10px)',
              transition: 'opacity 0.3s ease, transform 0.3s ease',
              pointerEvents: 'none',
            }}
          >
            <div className="w-6 h-6 rounded-full bg-[#c9a84c]/20 border border-[#c9a84c]/30 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
              <PlaneIcon className="w-3 h-3 text-[#c9a84c]" />
            </div>
            <div className="bg-[#111d35] rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
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

// ── Theme ───────────────────────────────────────────────────────────────────

function useTheme() {
  const [isLight, setIsLight] = useState(() => {
    try { return localStorage.getItem('flio-theme') === 'light'; } catch { return false; }
  });
  const toggle = () => setIsLight((prev) => {
    const next = !prev;
    try { localStorage.setItem('flio-theme', next ? 'light' : 'dark'); } catch {}
    return next;
  });
  return { isLight, toggle };
}

function ThemeToggle({ isLight, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-11 h-6 rounded-full flex items-center px-0.5 transition-colors duration-300 flex-shrink-0 ${
        isLight ? 'bg-[#0d1526]/12' : 'bg-white/10'
      }`}
      aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      <span
        className={`flex items-center justify-center w-5 h-5 rounded-full shadow-sm transition-all duration-300 ${
          isLight ? 'translate-x-5 bg-[#c9a84c]' : 'translate-x-0 bg-white/60'
        }`}
      >
        {isLight
          ? <SunIcon className="w-3 h-3 text-[#0d1526]" />
          : <MoonIcon className="w-3 h-3 text-[#0a0f1e]" />
        }
      </span>
    </button>
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

// ── Reviews carousel ───────────────────────────────────────────────────────

const REVIEWS = [
  { name: 'Sarah M.',  status: 'Chase Sapphire Reserve holder', text: 'Flio found me $2,400 in Hyatt value I was about to leave on the table. Took 5 minutes to set up.' },
  { name: 'James K.',  status: 'Delta Platinum Medallion',      text: "I've been booking flights wrong for years. Flio showed me where to transfer to and saved me 40,000 miles." },
  { name: 'Priya L.',  status: 'Amex Platinum holder',          text: "The annual credits tracker alone is worth it. I had $600 in Amex credits I didn't even know I had." },
  { name: 'Marcus T.', status: 'United Global Services',        text: 'Finally an app that actually knows the difference between a good and bad redemption. My go-to before every trip.' },
  { name: 'Rachel W.', status: 'Marriott Titanium',             text: 'Planned my entire Europe trip in one conversation. Flio knew my exact point balances and gave me a step-by-step booking plan.' },
  { name: 'David C.',  status: 'Chase UR + Hyatt',              text: 'Transferred to the wrong partner twice before Flio. Never again. The strategy tab is incredibly clear.' },
  { name: 'Aisha N.',  status: 'Amex Gold holder',              text: 'The pre-departure checklist caught three things I would have forgotten. The lounge tip alone saved me $60.' },
  { name: 'Tom R.',    status: 'Alaska MVP Gold 75k',           text: "Skeptical at first but the Rome trip plan it gave me was better than anything I'd have figured out myself." },
];

function ReviewsCarousel() {
  const cards = [...REVIEWS, ...REVIEWS]; // duplicate for seamless loop
  return (
    <div className="relative overflow-hidden carousel-fade">
      <div className="carousel-track flex gap-5 w-max">
        {cards.map((r, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-[320px] md:w-[360px] bg-white/[0.03] border border-[#c9a84c]/[0.14] rounded-2xl p-6 flex flex-col gap-4"
          >
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, s) => (
                <span key={s} className="text-[#c9a84c] text-sm leading-none">★</span>
              ))}
            </div>
            <p className="text-white/65 text-sm leading-relaxed flex-1">"{r.text}"</p>
            <div>
              <p className="text-white/85 text-sm font-medium">{r.name}</p>
              <p className="text-white/35 text-xs mt-0.5">{r.status}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Landing Page ───────────────────────────────────────────────────────────

function LandingPage({ onGetStarted, onOpenChat, onOpenDashboard, hasProfile, onEditProfile, isLight, onToggleTheme }) {
  const navigate = useNavigate();
  const [scrolled, setScrolled]       = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [menuOpen, setMenuOpen]       = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const ids = ['home', 'demo', 'how-it-works', 'wallet', 'works-with', 'reviews'];
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActiveSection(e.target.id); }),
      { threshold: 0.25, rootMargin: '-80px 0px -40% 0px' }
    );
    ids.forEach((id) => { const el = document.getElementById(id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id, route) => {
    setMenuOpen(false);
    if (route) { navigate(route); return; }
    setActiveSection(id); // immediate highlight on click — observer handles natural scroll
    if (id === 'home') { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    const el = document.getElementById(id);
    if (!el) return;
    const offset = 64 + 20; // nav height + breathing room
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  const NAV_LINKS = [
    { label: 'Home',         id: 'home' },
    { label: 'Demo',         id: 'demo' },
    { label: 'How It Works', id: 'how-it-works' },
    { label: 'Your Wallet',  id: 'wallet' },
    { label: 'Works With',   id: 'works-with' },
    { label: 'Reviews',      id: 'reviews' },
    { label: 'Pricing',      id: 'pricing', route: '/pricing' },
  ];
  const tBase = isLight ? '#0d1526'              : '#ffffff';
  const tDim  = isLight ? 'rgba(13,21,38,0.52)'  : 'rgba(255,255,255,0.45)';

  return (
    <div
      className={`font-['DM_Sans',sans-serif] flex flex-col transition-colors duration-300 ${isLight ? 'bg-[#f2ede3] lm' : 'bg-[#0a0f1e]'}`}
    >
      {/* ── Sticky nav ── */}
      <nav
        className={`sticky top-0 z-50 flex items-center justify-between px-6 h-16 backdrop-blur-md transition-shadow duration-300 ${
          scrolled ? (isLight ? 'shadow-[0_4px_24px_rgba(0,0,0,0.08)]' : 'shadow-[0_4px_32px_rgba(0,0,0,0.45)]') : ''
        }`}
        style={{
          backgroundColor: isLight ? 'rgba(242,237,227,0.93)' : 'rgba(10,15,30,0.88)',
          borderBottom: `1px solid ${isLight ? 'rgba(13,21,38,0.08)' : 'rgba(255,255,255,0.04)'}`,
          transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <PlaneIcon className="w-4 h-4 text-[#c9a84c]" />
          <span className="font-semibold tracking-widest text-sm uppercase" style={{ color: tBase, transition: 'color 0.3s ease' }}>Flio</span>
        </div>

        {/* Center links — desktop */}
        <div className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id, link.route)}
                className="text-sm pb-0.5"
                style={{
                  color: isActive ? '#c9a84c' : tDim,
                  borderBottom: isActive ? '1px solid rgba(201,168,76,0.55)' : '1px solid transparent',
                  transition: 'color 0.2s ease, border-color 0.2s ease',
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = tBase; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = isActive ? '#c9a84c' : tDim; }}
              >
                {link.label}
              </button>
            );
          })}
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          <ThemeToggle isLight={isLight} onToggle={onToggleTheme} />
          <button
            onClick={onGetStarted}
            className="hidden md:flex btn-gold items-center gap-1.5 bg-[#c9a84c] hover:bg-[#d4af37] text-[#060d1f] font-semibold px-5 py-2 rounded-full text-sm"
          >
            Get Started
          </button>
          <button
            className="md:hidden transition-colors duration-200"
            style={{ color: tDim }}
            onClick={() => setMenuOpen((p) => !p)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <XIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="sticky top-16 z-40 md:hidden px-6 py-4 flex flex-col gap-4 border-b"
          style={{
            backgroundColor: isLight ? '#f2ede3' : '#0a0f1e',
            borderColor: isLight ? 'rgba(13,21,38,0.08)' : 'rgba(255,255,255,0.05)',
            transition: 'background-color 0.3s ease',
          }}
        >
          {NAV_LINKS.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id, link.route)}
                className="text-sm text-left pb-0.5 w-fit"
                style={{
                  color: isActive ? '#c9a84c' : tDim,
                  borderBottom: isActive ? '1px solid rgba(201,168,76,0.55)' : '1px solid transparent',
                }}
              >
                {link.label}
              </button>
            );
          })}
          <button
            onClick={onGetStarted}
            className="btn-gold flex items-center justify-center gap-1.5 bg-[#c9a84c] hover:bg-[#d4af37] text-[#060d1f] font-semibold px-5 py-2.5 rounded-full text-sm mt-1"
          >
            Get Started
          </button>
        </div>
      )}

      {/* Hero */}
      <div id="home" className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center overflow-hidden">

        {/* Background: central gold radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 90% 70% at 50% 45%, rgba(201,168,76,0.11) 0%, rgba(201,168,76,0.03) 50%, transparent 72%)' }}
        />
        {/* Background: dot grid fading at edges */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, ${isLight ? 'rgba(13,21,38,0.055)' : 'rgba(255,255,255,0.055)'} 1px, transparent 1px)`,
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
        <h1 className="relative text-5xl md:text-7xl leading-tight tracking-tight mb-4 font-['Playfair_Display',serif] font-normal" style={{ color: tBase }}>
          <span className="block animate-word" style={{ animationDelay: '80ms' }}>Your points. Your perks.</span>
          <span className="block animate-word" style={{ animationDelay: '280ms' }}>
            <span className="text-[#c9a84c] italic">Finally working for you.</span>
          </span>
        </h1>

        <p className="relative animate-word text-white/45 text-lg md:text-xl max-w-md leading-relaxed mb-12" style={{ animationDelay: '500ms' }}>
          Your personal AI concierge that knows your preferences, maximizes your points, and gets more out of every trip.
        </p>

        {/* CTAs */}
        <div className="relative flex flex-col sm:flex-row items-center gap-4 mb-6">
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

        {/* Credibility bar */}
        <div className="relative flex items-center justify-center gap-3 mb-8">
          <div className="flex -space-x-2">
            {[
              'from-sky-400 to-blue-500',
              'from-violet-400 to-purple-500',
              'from-amber-400 to-orange-500',
            ].map((g, i) => (
              <div
                key={i}
                className={`w-7 h-7 rounded-full bg-gradient-to-br ${g} border-2 flex-shrink-0`}
                style={{ borderColor: 'rgba(10,15,30,1)' }}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#c9a84c] text-sm tracking-tight leading-none">★★★★★</span>
            <span className="text-white/35 text-xs">Trusted by 2,400+ frequent travelers</span>
          </div>
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
          style={{ background: `linear-gradient(to bottom, transparent 0%, ${isLight ? '#f2ede3' : '#0a0f1e'} 100%)` }}
        />

        {/* Scroll indicator */}
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5 animate-bounce">
          <span className="text-white/20 text-[9px] uppercase tracking-[0.18em]">Scroll</span>
          <ChevronDownIcon className="w-4 h-4 text-[#c9a84c]/40" />
        </div>
      </div>

      <FadeInSection>
        {/* Demo chat */}
        <div id="demo" className="pt-20 pb-16">
          <DemoChat onGetStarted={onGetStarted} />
        </div>
      </FadeInSection>

      <FadeInSection>
        {/* How It Works */}
        <div id="how-it-works" className="px-6 pb-32 max-w-5xl mx-auto w-full">
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
        <div id="wallet" className="px-6 pb-32 max-w-2xl mx-auto w-full">
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
            style={{ background: isLight
              ? 'linear-gradient(to bottom, transparent 0%, rgba(232,226,212,0.85) 35%, rgba(232,226,212,0.97) 60%, #e8e2d4 100%)'
              : 'linear-gradient(to bottom, transparent 0%, rgba(13,21,38,0.85) 35%, rgba(13,21,38,0.97) 60%, #0d1526 100%)' }}
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
        <div id="works-with" className="px-6 pb-32 max-w-4xl mx-auto w-full">
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
        {/* Reviews carousel */}
        <div id="reviews" className="pb-32 w-full">
          <div className="text-center mb-12 px-6">
            <p className="text-[10px] text-[#c9a84c] uppercase tracking-widest mb-3">What Travelers Say</p>
            <h2 className="text-3xl md:text-4xl text-white font-['Playfair_Display',serif] font-normal">
              Real results from real trips.
            </h2>
          </div>
          <ReviewsCarousel />
        </div>
      </FadeInSection>

      <FadeInSection>
        {/* CTA Banner */}
        <div id="pricing" className="relative w-full px-6 py-32 flex flex-col items-center text-center overflow-hidden">
        {/* Radial gold glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(201,168,76,0.09) 0%, transparent 70%)' }}
        />
        <h2 className="relative text-4xl md:text-6xl leading-tight tracking-tight max-w-2xl mb-5 font-['Playfair_Display',serif] font-normal" style={{ color: tBase }}>
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

function buildTripPlanText(intelligence) {
  const { overview, strategy } = intelligence ?? {};
  const lines = [];

  lines.push('FLIO TRIP PLAN');
  lines.push('──────────────');
  if (overview) {
    const header = [overview.destination, overview.dates, overview.cabinClass].filter(Boolean).join(' · ');
    if (header) lines.push(header);
  }

  if (overview?.pointsUsed?.length) {
    lines.push('');
    lines.push('POINTS STRATEGY');
    overview.pointsUsed.forEach((p) => {
      lines.push(`${p.program}: ${p.amount?.toLocaleString() ?? '—'} points → $${p.dollarValue?.toLocaleString() ?? '—'}`);
    });
    if (strategy?.pointsToSave?.amount != null) {
      lines.push(`Points remaining: ${strategy.pointsToSave.amount.toLocaleString()}`);
    }
  }

  if (strategy?.transferPartners?.length) {
    lines.push('');
    lines.push('BOOKING SEQUENCE');
    strategy.transferPartners.forEach((step, i) => lines.push(`${i + 1}. ${step}`));
  }

  if (strategy?.perks?.length) {
    lines.push('');
    lines.push('PERKS THAT APPLY');
    strategy.perks.forEach((p) => lines.push(`✓ ${p}`));
  }

  if (strategy?.warnings?.length) {
    lines.push('');
    lines.push('WATCH OUT FOR');
    strategy.warnings.forEach((w) => lines.push(`! ${w}`));
  }

  lines.push('');
  lines.push('Generated by Flio · flio-six.vercel.app');
  return lines.join('\n');
}

async function loadJsPDF() {
  if (window.jspdf?.jsPDF) return window.jspdf.jsPDF;
  await new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return window.jspdf.jsPDF;
}

async function downloadTripPDF(intelligence) {
  const JsPDF = await loadJsPDF();
  const { overview, strategy } = intelligence ?? {};
  const doc = new JsPDF({ unit: 'pt', format: 'letter' });

  const gold = [201, 168, 76];
  const dark = [15, 21, 38];
  const white = [255, 255, 255];
  const dim = [140, 155, 180];

  const W = doc.internal.pageSize.getWidth();
  let y = 0;

  // Dark background
  doc.setFillColor(...dark);
  doc.rect(0, 0, W, doc.internal.pageSize.getHeight(), 'F');

  // Gold header bar
  doc.setFillColor(...gold);
  doc.rect(0, 0, W, 54, 'F');

  // FLIO wordmark
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...dark);
  doc.text('FLIO', 40, 35);

  // Tagline
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('AI Travel Concierge', 92, 35);

  y = 86;

  // Trip header
  if (overview?.destination) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(...white);
    doc.text(overview.destination, 40, y);
    y += 22;

    const sub = [overview.dates, overview.cabinClass].filter(Boolean).join('  ·  ');
    if (sub) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...dim);
      doc.text(sub, 40, y);
      y += 18;
    }
  }

  // Gold rule
  y += 10;
  doc.setDrawColor(...gold);
  doc.setLineWidth(0.5);
  doc.line(40, y, W - 40, y);
  y += 20;

  const sectionHeader = (label) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...gold);
    doc.text(label, 40, y);
    y += 16;
  };

  const bodyLine = (text, indent = 40) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...white);
    const lines = doc.splitTextToSize(text, W - indent - 40);
    doc.text(lines, indent, y);
    y += lines.length * 14 + 2;
  };

  // Points Strategy
  if (overview?.pointsUsed?.length) {
    sectionHeader('POINTS STRATEGY');
    overview.pointsUsed.forEach((p) => {
      bodyLine(`${p.program}: ${p.amount?.toLocaleString() ?? '—'} pts → $${p.dollarValue?.toLocaleString() ?? '—'}`);
    });
    if (strategy?.pointsToSave?.amount != null) {
      doc.setTextColor(...dim);
      doc.setFontSize(9);
      doc.text(`Points remaining: ${strategy.pointsToSave.amount.toLocaleString()}`, 40, y);
      y += 14;
      doc.setTextColor(...white);
    }
    y += 8;
  }

  // Booking Sequence
  if (strategy?.transferPartners?.length) {
    sectionHeader('BOOKING SEQUENCE');
    strategy.transferPartners.forEach((step, i) => bodyLine(`${i + 1}.  ${step}`, 48));
    y += 8;
  }

  // Perks
  if (strategy?.perks?.length) {
    sectionHeader('PERKS THAT APPLY');
    strategy.perks.forEach((p) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...gold);
      doc.text('✓', 40, y);
      doc.setTextColor(...white);
      const lines = doc.splitTextToSize(p, W - 100);
      doc.text(lines, 58, y);
      y += lines.length * 14 + 2;
    });
    y += 8;
  }

  // Warnings
  if (strategy?.warnings?.length) {
    sectionHeader('WATCH OUT FOR');
    strategy.warnings.forEach((w) => bodyLine(`! ${w}`, 48));
    y += 8;
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 30;
  doc.setDrawColor(...gold);
  doc.setLineWidth(0.3);
  doc.line(40, footerY - 10, W - 40, footerY - 10);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...dim);
  doc.text('Generated by Flio  ·  flio-six.vercel.app', 40, footerY);

  // Filename
  const dest = (overview?.destination ?? 'trip').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const date = (overview?.dates ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const filename = `flio-${dest}${date ? '-' + date : ''}.pdf`;
  doc.save(filename);
}

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
  const [copied, setCopied] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const handleCopy = () => {
    const text = buildTripPlanText(intelligence);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    try {
      await downloadTripPDF(intelligence);
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div className="flex items-center border-b border-white/8 px-4 flex-shrink-0">
        <div className="flex flex-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { onTabChange(tab.id); onClearIndicator(tab.id); }}
              className={`tab-btn inline-flex items-center gap-1.5 py-3 mr-5 text-sm border-b-2 border-transparent ${
                activeTab === tab.id
                  ? 'tab-active text-white'
                  : 'text-white/35 hover:text-white/65'
              }`}
            >
              {tab.label}
              {newIndicators?.[tab.id] && activeTab !== tab.id && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#c9a84c] animate-pulse flex-shrink-0 self-start mt-1" />
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

      {/* Export buttons — only when panel has data */}
      {!isEmpty && (
        <div className="flex-shrink-0 px-4 py-3 border-t border-white/5 flex gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs text-white/50 border border-[#c9a84c]/18 hover:border-[#c9a84c]/40 hover:text-white/75 rounded-lg px-3 py-2 bg-[#c9a84c]/[0.04] hover:bg-[#c9a84c]/[0.08] transition-all duration-200"
          >
            {copied ? '✓ Copied!' : '📋 Copy Trip Plan'}
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={pdfLoading}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs text-white/50 border border-[#c9a84c]/18 hover:border-[#c9a84c]/40 hover:text-white/75 rounded-lg px-3 py-2 bg-[#c9a84c]/[0.04] hover:bg-[#c9a84c]/[0.08] transition-all duration-200 disabled:opacity-40"
          >
            {pdfLoading ? '⏳ Generating…' : '⬇ Download PDF'}
          </button>
        </div>
      )}
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

function buildGreeting(profile) {
  const programs = profile?.loyaltyPrograms ?? [];
  const cards = profile?.creditCards ?? [];
  const hasData = programs.length > 0 || cards.length > 0;

  if (!hasData) {
    return "Welcome to Flio. Set up your profile to get personalized travel advice.";
  }

  // Total portfolio value
  let totalValue = 0;
  programs.forEach((p) => {
    const cpp = POINTS_CPP[p.id];
    if (cpp && p.balance > 0) totalValue += Math.round((p.balance * cpp) / 100);
  });
  cards.forEach((c) => {
    const cpp = CARDS_CPP[c.id];
    if (cpp && c.balance > 0) totalValue += Math.round((c.balance * cpp) / 100);
  });

  // Unused credits (read from localStorage so this stays in sync)
  let usedCredits = {};
  try { usedCredits = JSON.parse(localStorage.getItem('flio-credits')) || {}; } catch {}
  const unusedCredits = [];
  cards.forEach((card) => {
    (CARD_CREDITS_DATA[card.id] ?? []).forEach((credit) => {
      if (!usedCredits[credit.id]) unusedCredits.push({ label: credit.label, value: credit.value });
    });
  });
  const topCredits = unusedCredits.sort((a, b) => b.value - a.value).slice(0, 2);

  // Build message
  let msg = 'Welcome back';
  if (totalValue > 0) msg += `. Your travel wallet is worth $${totalValue.toLocaleString()}`;
  if (topCredits.length > 0) {
    const parts = topCredits.map((c) => `$${c.value} ${c.label.toLowerCase()}`);
    msg += ` and you have ${parts.join(' and ')} available`;
  }
  msg += '. Where are you headed?';
  return msg;
}

function buildChips(profile) {
  const programs = profile?.loyaltyPrograms ?? [];
  const cards = profile?.creditCards ?? [];
  if (!programs.length && !cards.length) {
    return [
      "Best use of my points for Europe",
      "Which card should I use for flights?",
      "Plan a business class trip under 80k miles",
    ];
  }

  const chips = [];
  const hyatt = programs.find((p) => p.id === 'hyatt');
  if (hyatt?.balance > 0) chips.push(`Best use of my ${hyatt.balance.toLocaleString()} Hyatt points`);

  const chaseCard = cards.find((c) => c.id === 'csr' || c.id === 'csp');
  if (chaseCard?.balance > 0) chips.push(`Best use of my ${chaseCard.balance.toLocaleString()} Chase UR points`);

  const csr = cards.find((c) => c.id === 'csr');
  const csp = cards.find((c) => c.id === 'csp');
  if (csr) chips.push("Is my Chase Sapphire Reserve worth keeping?");
  else if (csp) chips.push("Is my Chase Sapphire Preferred worth upgrading?");

  const amex = cards.find((c) => c.id === 'amex-plat' || c.id === 'amex-gold');
  if (amex) chips.push("What Amex credits should I use this month?");

  if (profile?.homeAirport?.code) chips.push(`Plan a trip from ${profile.homeAirport.code} under 100k miles`);

  chips.push("Which card should I use for flights?");
  chips.push("Plan a business class trip under 80k miles");

  return [...new Set(chips)].slice(0, 3);
}

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

// ── Trip Brief Modal ────────────────────────────────────────────────────────

function TripBriefModal({ onSubmit, onSkip, travelers = [] }) {
  const [destination, setDestination] = useState('');
  const [dates, setDates]             = useState('');
  const [travelerCount, setTravelerCount] = useState(1);
  const [priority, setPriority]       = useState('Balance both');
  const [selectedTravelerIds, setSelectedTravelerIds] = useState(
    () => ['primary', ...travelers.map((t) => t.id)]
  );

  const toggleTraveler = (id) => {
    setSelectedTravelerIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    if (!destination.trim()) return;
    const hasNamedTravelers = travelers.length > 0;
    onSubmit({
      destination: destination.trim(),
      dates: dates.trim(),
      travelers: hasNamedTravelers ? selectedTravelerIds.length : travelerCount,
      priority,
      selectedTravelerIds: hasNamedTravelers ? selectedTravelerIds : null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-[#0d1526] border border-white/[0.08] rounded-2xl p-8 max-w-md w-full shadow-[0_24px_64px_rgba(0,0,0,0.6)] animate-fade-in-up"
        style={{ animationDuration: '0.25s' }}
      >
        {/* Skip */}
        <button
          onClick={onSkip}
          className="absolute top-4 right-5 text-white/25 hover:text-white/55 text-xs transition-colors"
        >
          Skip →
        </button>

        {/* Header */}
        <div className="mb-7">
          <p className="text-[10px] text-[#c9a84c] uppercase tracking-widest mb-2">New Trip</p>
          <h2 className="text-xl font-semibold text-white">Where are we headed?</h2>
          <p className="text-white/35 text-sm mt-1">Quick details give Flio a head start.</p>
        </div>

        <div className="space-y-5">
          {/* Destination */}
          <div>
            <label className="text-xs text-white/40 mb-1.5 block">Destination</label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="Rome, Italy"
              autoFocus
              className="input-gold w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/20"
            />
          </div>

          {/* Dates */}
          <div>
            <label className="text-xs text-white/40 mb-1.5 block">When?</label>
            <input
              type="text"
              value={dates}
              onChange={(e) => setDates(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="July 20–27"
              className="input-gold w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/20"
            />
          </div>

          {/* Travelers */}
          {travelers.length > 0 ? (
            <div>
              <label className="text-xs text-white/40 mb-2 block">Who's traveling?</label>
              <div className="space-y-2">
                {[{ id: 'primary', nickname: 'Primary Traveler (You)' }, ...travelers].map((t) => {
                  const checked = selectedTravelerIds.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      onClick={() => toggleTraveler(t.id)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl border text-left transition-all duration-150 ${
                        checked
                          ? 'bg-[#c9a84c]/10 border-[#c9a84c]/40'
                          : 'bg-white/[0.03] border-white/[0.08] hover:border-white/20'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all ${
                        checked ? 'bg-[#c9a84c] border-[#c9a84c]' : 'border-white/20 bg-transparent'
                      }`}>
                        {checked && <CheckIcon className="w-2.5 h-2.5 text-[#060d1f]" />}
                      </div>
                      <div className="w-6 h-6 rounded-full bg-[#c9a84c]/15 border border-[#c9a84c]/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-[#c9a84c] text-[9px] font-semibold">
                          {t.id === 'primary' ? 'P' : (t.nickname[0] ?? '?').toUpperCase()}
                        </span>
                      </div>
                      <span className={`text-sm ${checked ? 'text-white/85' : 'text-white/45'}`}>
                        {t.nickname}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div>
              <label className="text-xs text-white/40 mb-2 block">Travelers</label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setTravelerCount((t) => Math.max(1, t - 1))}
                  className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/[0.08] text-white/60 hover:text-white hover:bg-white/10 flex items-center justify-center text-xl font-light leading-none transition-colors"
                >
                  −
                </button>
                <span className="text-white font-semibold text-base w-4 text-center tabular-nums">{travelerCount}</span>
                <button
                  onClick={() => setTravelerCount((t) => Math.min(6, t + 1))}
                  className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/[0.08] text-white/60 hover:text-white hover:bg-white/10 flex items-center justify-center text-xl font-light leading-none transition-colors"
                >
                  +
                </button>
                <span className="text-white/30 text-xs ml-1">{travelerCount === 1 ? 'Just me' : `${travelerCount} people`}</span>
              </div>
            </div>
          )}

          {/* Priority */}
          <div>
            <label className="text-xs text-white/40 mb-2 block">Priority</label>
            <div className="flex gap-2 flex-wrap">
              {['Maximize comfort', 'Maximize value', 'Balance both'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`text-xs px-3.5 py-2 rounded-full border transition-all duration-150 ${
                    priority === p
                      ? 'bg-[#c9a84c]/15 border-[#c9a84c]/50 text-[#c9a84c]'
                      : 'bg-white/[0.04] border-white/[0.08] text-white/45 hover:text-white/70 hover:border-white/20'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!destination.trim()}
          className="mt-7 w-full btn-gold bg-[#c9a84c] hover:bg-[#d4af37] disabled:opacity-35 disabled:cursor-not-allowed text-[#060d1f] font-semibold py-3 rounded-xl text-sm transition-all duration-200"
        >
          Start planning →
        </button>
      </div>
    </div>
  );
}

// ── Deal Checker ────────────────────────────────────────────────────────────

function buildDealProfileCtx(profile) {
  const programs = profile?.loyaltyPrograms ?? [];
  const cards    = profile?.creditCards ?? [];
  const lines = [];
  if (profile?.homeAirport) lines.push(`Home airport: ${profile.homeAirport.city} (${profile.homeAirport.code})`);
  if (programs.length) lines.push(`Loyalty programs: ${programs.map((p) => `${p.name}${p.balance > 0 ? ` (${p.balance.toLocaleString()} ${p.currency})` : ''}`).join(', ')}`);
  if (cards.length) lines.push(`Credit cards: ${cards.map((c) => c.name).join(', ')}`);
  return lines.join('\n') || 'No profile set up yet.';
}

const VERDICT_CONFIG = {
  GREAT: { label: '✅  GREAT DEAL', color: '#22c55e', bg: 'rgba(34,197,94,0.09)',  border: 'rgba(34,197,94,0.25)' },
  GOOD:  { label: '⚡  GOOD DEAL',  color: '#c9a84c', bg: 'rgba(201,168,76,0.09)', border: 'rgba(201,168,76,0.30)' },
  BAD:   { label: '❌  BAD DEAL',   color: '#ef4444', bg: 'rgba(239,68,68,0.09)',  border: 'rgba(239,68,68,0.25)' },
};

function VerdictCard({ result }) {
  const cfg = VERDICT_CONFIG[result.verdict] ?? VERDICT_CONFIG.BAD;
  return (
    <div className="bg-[#0d1526] border border-white/[0.08] rounded-2xl overflow-hidden mb-5 animate-fade-in-up">
      {/* Badge row */}
      <div className="px-5 py-4 border-b border-white/[0.05]" style={{ backgroundColor: cfg.bg }}>
        <div className="flex items-start justify-between gap-3 mb-1">
          <span className="text-base font-bold leading-tight" style={{ color: cfg.color }}>
            {cfg.label}
          </span>
          <span className="text-2xl font-bold flex-shrink-0 tabular-nums" style={{ color: cfg.color }}>
            {result.centsPerPoint}¢
          </span>
        </div>
        <p className="text-white/35 text-xs leading-snug">{result.query}</p>
      </div>

      {/* Metrics */}
      <div className="px-5 py-4 space-y-3 border-b border-white/[0.05]">
        {[
          { label: "Value you're getting", value: `${result.centsPerPoint}¢ per point` },
          { label: 'Benchmark',            value: result.benchmark },
          { label: 'Dollar value',         value: result.dollarValue },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-start justify-between gap-4">
            <span className="text-white/35 text-xs flex-shrink-0">{label}</span>
            <span className="text-white/75 text-xs text-right">{value}</span>
          </div>
        ))}
      </div>

      {/* Better Option */}
      {result.betterOption && result.verdict !== 'GREAT' && (
        <div className="mx-4 my-4 p-4 rounded-xl border border-[#c9a84c]/25 bg-[#c9a84c]/[0.05]">
          <p className="text-[10px] text-[#c9a84c] uppercase tracking-widest mb-1.5 font-semibold">Better Option</p>
          <p className="text-white/70 text-sm leading-relaxed">{result.betterOption}</p>
        </div>
      )}

      {/* Bottom line */}
      <div className="px-5 pb-5">
        <p className="text-white/45 text-sm leading-relaxed">
          <span className="text-white/25 text-xs uppercase tracking-wider mr-1.5">Bottom line</span>
          {result.bottomLine}
        </p>
      </div>
    </div>
  );
}

function DealHistoryItem({ result, onSelect }) {
  const cfg = VERDICT_CONFIG[result.verdict] ?? VERDICT_CONFIG.BAD;
  return (
    <button
      onClick={() => onSelect(result)}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-colors text-left"
    >
      <span className="text-sm flex-shrink-0" style={{ color: cfg.color }}>
        {result.verdict === 'GREAT' ? '✅' : result.verdict === 'GOOD' ? '⚡' : '❌'}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-white/65 text-xs truncate">{result.query}</p>
      </div>
      <span className="text-xs font-semibold flex-shrink-0 tabular-nums" style={{ color: cfg.color }}>
        {result.centsPerPoint}¢
      </span>
    </button>
  );
}

function DealChecker({ profile, client }) {
  const [dealInput, setDealInput] = useState('');
  const [loading, setLoading]     = useState(false);
  const [current, setCurrent]     = useState(null);
  const [history, setHistory]     = useState([]);

  const checkDeal = useCallback(async () => {
    const query = dealInput.trim();
    if (!query || loading) return;
    setDealInput('');
    setLoading(true);
    setCurrent(null);

    const profileCtx = buildDealProfileCtx(profile);

    try {
      const response = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 512,
        system: `You are a travel points valuation expert. Return ONLY a valid JSON object — no prose, no markdown — with exactly these fields:
{
  "verdict": "GREAT" | "GOOD" | "BAD",
  "centsPerPoint": number,
  "benchmark": string,
  "dollarValue": string,
  "betterOption": string,
  "bottomLine": string
}
Rules: GREAT = above 1.5¢/pt, GOOD = 0.8–1.5¢/pt, BAD = below 0.8¢/pt.`,
        messages: [{
          role: 'user',
          content: `Redemption to evaluate: ${query}\n\nUser travel profile:\n${profileCtx}\n\nCalculate the cents-per-point value, compare to this program's benchmark, give a verdict, and suggest one specific better alternative if it's not GREAT. Respond only in JSON.`,
        }],
      });

      const text = response.content[0]?.text ?? '';
      const match = text.match(/\{[\s\S]*\}/);
      const json  = match ? JSON.parse(match[0]) : {};

      const result = {
        query,
        verdict:       String(json.verdict ?? 'BAD').toUpperCase(),
        centsPerPoint: Number(json.centsPerPoint ?? 0).toFixed(2),
        benchmark:     json.benchmark   ?? '',
        dollarValue:   json.dollarValue ?? '',
        betterOption:  json.betterOption ?? '',
        bottomLine:    json.bottomLine  ?? '',
      };

      setCurrent(result);
      setHistory((prev) => [result, ...prev]);
    } catch {
      setCurrent({ error: true, query });
    } finally {
      setLoading(false);
    }
  }, [dealInput, loading, profile, client]);

  return (
    <div className="flex flex-col h-full">
      {/* Input bar */}
      <div className="px-4 pt-4 pb-3 flex-shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={dealInput}
            onChange={(e) => setDealInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && checkDeal()}
            placeholder='e.g. "24,000 Marriott points for a night in NYC"'
            className="input-gold flex-1 bg-[#111d35] border border-white/[0.08] rounded-full px-4 py-2.5 text-white text-sm placeholder-white/20 outline-none"
          />
          <button
            onClick={checkDeal}
            disabled={!dealInput.trim() || loading}
            className="btn-gold flex-shrink-0 bg-[#c9a84c] hover:bg-[#d4af37] disabled:bg-white/[0.08] text-[#060d1f] disabled:text-white/20 font-semibold px-5 py-2.5 rounded-full text-sm transition-all"
          >
            {loading ? '…' : 'Check'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-2 h-2 rounded-full bg-[#c9a84c]/60 typing-dot"
                  style={{ animationDelay: `${i * 0.22}s` }}
                />
              ))}
            </div>
            <p className="text-white/30 text-xs">Evaluating this redemption…</p>
          </div>
        )}

        {/* Error */}
        {!loading && current?.error && (
          <div className="bg-red-950/20 border border-red-900/25 rounded-2xl px-5 py-4 mb-5">
            <p className="text-red-400/80 text-sm">Something went wrong evaluating "{current.query}". Please try again.</p>
          </div>
        )}

        {/* Current result */}
        {!loading && current && !current.error && (
          <VerdictCard result={current} />
        )}

        {/* Empty state */}
        {!loading && !current && history.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center px-4">
            <div className="w-12 h-12 rounded-full bg-[#c9a84c]/10 border border-[#c9a84c]/20 flex items-center justify-center mb-1">
              <span className="text-xl">⚡</span>
            </div>
            <p className="text-white/45 text-sm font-medium">Is this redemption worth it?</p>
            <p className="text-white/25 text-xs max-w-xs leading-relaxed">
              Paste any redemption above and find out instantly — cents per point, benchmarks, and a better alternative if one exists.
            </p>
          </div>
        )}

        {/* Previous checks */}
        {history.length > (current && !current.error ? 1 : 0) && (
          <div className="mt-2">
            <p className="text-[10px] text-white/20 uppercase tracking-widest mb-2 px-1">Previous checks</p>
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl overflow-hidden">
              {history
                .slice(current && !current.error ? 1 : 0)
                .map((r, i) => (
                  <div key={i} className="border-b border-white/[0.04] last:border-none">
                    <DealHistoryItem result={r} onSelect={setCurrent} />
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Chat Interface ──────────────────────────────────────────────────────────

function ChatInterface({ onBack, onOpenDashboard, onEditProfile, profile, trips, onSaveTrip, onDeleteTrip, travelers = [] }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTripId, setCurrentTripId] = useState(null);
  const currentTripIdRef = useRef(null);
  const [messages, setMessages] = useState([
    { id: 1, role: 'assistant', text: buildGreeting(profile), time: now() },
  ]);
  const messagesRef = useRef(messages);
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  const [chatTab, setChatTab] = useState('planner'); // 'planner' | 'deals'

  const [tripBrief, setTripBrief] = useState(null);
  const tripBriefRef = useRef(null);
  useEffect(() => { tripBriefRef.current = tripBrief; }, [tripBrief]);
  const [showTripBrief, setShowTripBrief] = useState(true);

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
    setTripBrief(null);
    setMessages([{ id: Date.now(), role: 'assistant', text: buildGreeting(profile), time: now() }]);
    currentTripIdRef.current = null;
    setCurrentTripId(null);
    setSidebarOpen(false);
    setIntelligence(null);
    setNewTabIndicators({ overview: false, checklist: false, strategy: false });
    setShowTripBrief(true);
  };

  const loadTrip = (trip) => {
    setShowTripBrief(false);
    setTripBrief(null);
    setMessages(trip.messages);
    currentTripIdRef.current = trip.id;
    setCurrentTripId(trip.id);
    setSidebarOpen(false);
    setIntelligence(trip.intelligence ?? null);
    setNewTabIndicators({ overview: false, checklist: false, strategy: false });
  };

  const submitBrief = async (brief) => {
    setShowTripBrief(false);

    // Resolve selected additional traveler objects for system prompt injection
    const additionalTravelers = brief.selectedTravelerIds
      ? travelers.filter((t) => brief.selectedTravelerIds.includes(t.id))
      : [];
    const enrichedBrief = { ...brief, selectedTravelers: additionalTravelers.length > 0 ? additionalTravelers : null };

    setTripBrief(enrichedBrief);

    const assistantId = Date.now();
    setMessages([{ id: assistantId, role: 'assistant', text: '', time: now() }]);
    setIsStreaming(true);

    // Build travelers description for hidden prompt
    let travelersStr;
    if (brief.selectedTravelerIds && brief.selectedTravelerIds.length > 1) {
      const extraNames = travelers.filter((t) => brief.selectedTravelerIds.includes(t.id)).map((t) => t.nickname);
      travelersStr = extraNames.length > 0 ? `me and ${extraNames.join(' and ')}` : 'just me';
    } else {
      travelersStr = brief.travelers === 1 ? 'just me' : `${brief.travelers} travelers`;
    }

    const hiddenPrompt = `My trip brief: going to ${brief.destination}${brief.dates ? `, ${brief.dates}` : ''}, ${travelersStr}, priority is ${brief.priority.toLowerCase()}. Please give me a quick, punchy opening — acknowledge the trip details in one line (like "Got it — ${brief.destination}${brief.dates ? `, ${brief.dates}` : ''}, ${travelersStr}, ${brief.priority.toLowerCase()}."), then immediately give me 2-3 concrete, specific initial thoughts based on my actual cards and points for this trip. Be direct and specific — no fluff.`;

    try {
      const stream = await clientRef.current.messages.stream({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 600,
        system: getSystemPrompt(profile, enrichedBrief),
        messages: [{ role: 'user', content: hiddenPrompt }],
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
    } catch {
      setMessages([{ id: assistantId, role: 'assistant', text: buildGreeting(profile), time: now() }]);
    } finally {
      setIsStreaming(false);
    }
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

  const send = async (overrideText) => {
    const userText = (overrideText ?? input).trim();
    if (!userText || isStreaming) return;

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
        system: getSystemPrompt(profile, tripBriefRef.current),
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

      {/* Trip Brief Modal — planner tab only */}
      {showTripBrief && chatTab === 'planner' && (
        <TripBriefModal
          onSubmit={submitBrief}
          onSkip={() => setShowTripBrief(false)}
          travelers={travelers}
        />
      )}

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

      {/* Mode tabs */}
      <div className="flex items-center px-4 border-b border-white/5 bg-[#0a0f1e] flex-shrink-0">
        {[
          { id: 'planner', label: 'Trip Planner' },
          { id: 'deals',   label: 'Deal Checker' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setChatTab(t.id)}
            className={`tab-btn py-3 mr-5 text-sm ${chatTab === t.id ? 'tab-active text-white' : 'text-white/35 hover:text-white/60'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Deal Checker screen */}
      {chatTab === 'deals' && (
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-col overflow-hidden w-full md:max-w-2xl md:mx-auto flex">
            <DealChecker profile={profile} client={clientRef.current} />
          </div>
        </div>
      )}

      {/* Main: split panel (planner tab) */}
      {chatTab === 'planner' && (
      <div className="flex-1 flex overflow-hidden">

        {/* Left: Chat (full width on mobile, 60% on desktop) */}
        <div className="flex flex-col overflow-hidden w-full md:w-[60%]">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-6">
            {messages.map((m) => (
              // Don't render empty assistant messages — TypingIndicator covers that state
              m.role === 'assistant' && !m.text ? null : (
                <div key={m.id}>
                  <ChatBubble message={m} />
                </div>
              )
            ))}
            {isStreaming && messages[messages.length - 1]?.text === '' && (
              <TypingIndicator />
            )}
            <div ref={bottomRef} />
          </div>

          {/* Prompt chips — only show on fresh conversation */}
          {messages.length === 1 && !isStreaming && (
            <div className="px-4 pb-2 flex gap-2 flex-wrap flex-shrink-0">
              {buildChips(profile).map((chip) => (
                <button
                  key={chip}
                  onClick={() => send(chip)}
                  className="text-xs text-white/55 border border-[#c9a84c]/20 hover:border-[#c9a84c]/45 hover:text-white/80 rounded-full px-3 py-1.5 bg-[#c9a84c]/4 hover:bg-[#c9a84c]/8 transition-all duration-200"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

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
      )} {/* end chatTab === 'planner' */}

      {/* Mobile: intelligence drawer */}
      {chatTab === 'planner' && mobileIntelOpen && (
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

// ── Card Quiz ───────────────────────────────────────────────────────────────

const QUIZ_QUESTIONS = [
  {
    id: 'spend',
    q: 'Where do you spend the most?',
    options: ['Dining out', 'Travel & flights', 'Groceries & everyday', 'Spread evenly'],
  },
  {
    id: 'flight_freq',
    q: 'How often do you fly?',
    options: ['Every week', 'A few times a month', 'A few times a year', 'Rarely'],
  },
  {
    id: 'priority',
    q: 'What matters most to you?',
    options: ['Lounge access', 'Hotel status & upgrades', 'Maximum point accumulation', 'Simple cash back'],
  },
  {
    id: 'annual_fee',
    q: 'How do you feel about annual fees?',
    options: ['Fine if it pays off', 'Keep it under $100', 'No annual fee only'],
  },
  {
    id: 'existing',
    q: 'Do you already have a Chase or Amex card?',
    options: ['Have Chase', 'Have Amex', 'Have both', 'Neither'],
  },
];

const CARD_REC_DB = {
  'amex-gold': {
    name: 'Amex Gold Card',
    fee: '$325/year',
    url: 'https://www.americanexpress.com/us/credit-cards/card/gold-card/',
    benefits: [
      '4x points on dining worldwide',
      '4x points on U.S. supermarkets',
      '$120/year dining credit + $120 Uber Cash',
      'Transfer 1:1 to Hyatt, Delta, and 20+ partners',
    ],
  },
  'amex-plat': {
    name: 'Amex Platinum Card',
    fee: '$895/year',
    url: 'https://www.americanexpress.com/us/credit-cards/card/platinum-card/',
    benefits: [
      'Centurion Lounges + 10 Delta Sky Club visits/year',
      '5x points on flights booked direct with airlines',
      '$600/year hotel credit (Fine Hotels + Resorts)',
      'Complimentary Marriott Gold + Hilton Gold status',
    ],
  },
  'csr': {
    name: 'Chase Sapphire Reserve',
    fee: '$795/year',
    url: 'https://creditcards.chase.com/rewards-credit-cards/sapphire/reserve',
    benefits: [
      'Priority Pass + Chase Sapphire Lounge access',
      '4x points on travel and dining',
      '$300/year travel credit',
      'Transfer 1:1 to Hyatt, United, and 12 more partners',
    ],
  },
  'csp': {
    name: 'Chase Sapphire Preferred',
    fee: '$95/year',
    url: 'https://creditcards.chase.com/rewards-credit-cards/sapphire/preferred',
    benefits: [
      'Same 14 transfer partners as Sapphire Reserve',
      '3x on dining, streaming & online groceries',
      '2x on all other travel',
      '$50/year hotel credit via Chase Travel',
    ],
  },
  'venture-x': {
    name: 'Capital One Venture X',
    fee: '$395/year',
    url: 'https://creditcards.capitalone.com/venture-x-credit-card/',
    benefits: [
      '2x miles on every purchase — no categories',
      'Priority Pass + Capital One Lounges',
      '$300/year travel credit (makes effective fee $95)',
      '10,000 bonus miles every anniversary',
    ],
  },
  'citi-premier': {
    name: 'Citi Premier Card',
    fee: '$95/year',
    url: 'https://www.citi.com/credit-cards/citi-premier-credit-card',
    benefits: [
      '3x on dining, groceries, hotels, gas & flights',
      'Transfer to 18 airline partners',
      'No foreign transaction fees',
    ],
  },
};

function getCardHeadline(cardId, answers) {
  const { spend, flight_freq, priority, annual_fee } = answers;
  const map = {
    'amex-gold': () => {
      if (spend === 'Dining out') return 'The best dining card alive — 4x on every restaurant meal worldwide';
      if (spend === 'Groceries & everyday') return '4x on dining + U.S. supermarkets covers your two biggest spend categories';
      return 'The strongest everyday earner if dining and groceries drive your spend';
    },
    'amex-plat': () => {
      if (priority === 'Lounge access') return 'Centurion + Delta Sky Club access — the gold standard for airport lounges';
      if (flight_freq === 'Every week') return 'Purpose-built for road warriors: every major lounge network in one card';
      return '5x on flights and best-in-class lounge access for frequent travelers';
    },
    'csr': () => {
      if (priority === 'Hotel status & upgrades') return 'The fastest path to World of Hyatt — the best hotel redemptions available';
      if (flight_freq === 'Every week' || flight_freq === 'A few times a month') return 'Priority Pass access + 4x on travel and the strongest transfer lineup';
      return 'Top lounge access, 4x on travel, and Hyatt transfers in one card';
    },
    'csp': () => {
      if (annual_fee === 'Keep it under $100') return 'The best $95/year travel card — same Hyatt and United transfers as the Reserve';
      return 'The ideal first travel card: 14 transfer partners for just $95/year';
    },
    'venture-x': () => {
      if (priority === 'Simple cash back') return '2x on everything, no categories to track — plus lounges and $300 travel credit';
      return 'Flat 2x on all spending + lounge access + $300 credit effectively makes it free';
    },
    'citi-premier': () => {
      if (annual_fee !== 'Fine if it pays off') return 'Just $95/year with 3x on five major spend categories — unmatched coverage';
      return '3x on dining, groceries, hotels, gas, and flights for a single $95 fee';
    },
  };
  return map[cardId]?.() ?? 'A strong match for your travel profile';
}

function getCardRecommendations(answers, existingCardIds) {
  const { spend, flight_freq, priority, annual_fee, existing } = answers;
  const feeOk          = annual_fee === 'Fine if it pays off';
  const lowFee         = annual_fee === 'Keep it under $100';
  const frequentFlyer  = flight_freq === 'Every week' || flight_freq === 'A few times a month';
  const occasionalFlyer = flight_freq === 'A few times a year';
  const rareFlyer      = flight_freq === 'Rarely';
  const hasDining      = spend === 'Dining out';
  const hasTravel      = spend === 'Travel & flights';
  const hasEveryday    = spend === 'Groceries & everyday' || spend === 'Spread evenly';
  const hasChase       = existing === 'Have Chase' || existing === 'Have both';
  const hasAmex        = existing === 'Have Amex' || existing === 'Have both';
  const hasNeither     = existing === 'Neither';
  const wantsLounge    = priority === 'Lounge access';
  const wantsHotel     = priority === 'Hotel status & upgrades';
  const wantsPoints    = priority === 'Maximum point accumulation';
  const wantsSimple    = priority === 'Simple cash back';

  const scored = [
    { id: 'amex-gold',    score: 0 },
    { id: 'amex-plat',    score: 0 },
    { id: 'csr',          score: 0 },
    { id: 'csp',          score: 0 },
    { id: 'venture-x',    score: 0 },
    { id: 'citi-premier', score: 0 },
  ];

  const bump = (id, pts) => {
    const entry = scored.find((s) => s.id === id);
    if (entry) entry.score += pts;
  };

  // Amex Gold
  if (hasDining)      bump('amex-gold', 40);
  if (hasEveryday)    bump('amex-gold', 25);
  if (feeOk)          bump('amex-gold', 15);
  if (wantsPoints)    bump('amex-gold', 20);
  if (!hasAmex)       bump('amex-gold', 10);

  // Amex Platinum
  if (wantsLounge)    bump('amex-plat', 45);
  if (frequentFlyer)  bump('amex-plat', 30);
  if (feeOk)          bump('amex-plat', 20);
  if (hasTravel)      bump('amex-plat', 20);

  // CSR
  if (frequentFlyer && hasAmex) bump('csr', 45);
  if (wantsLounge)    bump('csr', 30);
  if (wantsHotel)     bump('csr', 25);
  if (feeOk)          bump('csr', 20);
  if (hasTravel)      bump('csr', 15);

  // CSP — entry point for non-Chase
  if (hasNeither && (frequentFlyer || occasionalFlyer)) bump('csp', 50);
  if (lowFee)         bump('csp', 35);
  if (wantsPoints)    bump('csp', 20);
  if (!hasChase)      bump('csp', 15);

  // Venture X
  if (wantsSimple)    bump('venture-x', 45);
  if (hasEveryday)    bump('venture-x', 25);
  if (rareFlyer || occasionalFlyer) bump('venture-x', 20);
  if (feeOk || lowFee) bump('venture-x', 15);

  // Citi Premier
  if (lowFee || annual_fee === 'No annual fee only') bump('citi-premier', 40);
  if (rareFlyer)      bump('citi-premier', 30);
  if (wantsPoints)    bump('citi-premier', 20);
  if (hasEveryday)    bump('citi-premier', 15);

  return scored
    .filter((s) => !existingCardIds.includes(s.id) && s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

function QuizQuestion({ question, step, total, selectedOption, onSelect }) {
  return (
    <div className="animate-slide-in px-7 pt-7 pb-6">
      {/* Progress */}
      <div className="mb-7">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[10px] text-white/30 uppercase tracking-widest">
            Question {step + 1} of {total}
          </span>
          <span className="text-[10px] text-white/20">{Math.round(((step + 1) / total) * 100)}%</span>
        </div>
        <div className="h-[3px] bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#c9a84c] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((step + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <h2 className="text-lg font-semibold text-white mb-5 leading-snug">{question.q}</h2>

      {/* Options */}
      <div className="flex flex-col gap-2.5">
        {question.options.map((opt) => (
          <button
            key={opt}
            onClick={() => onSelect(question.id, opt)}
            className={`text-left px-5 py-3.5 rounded-xl border text-sm font-medium transition-all duration-150 ${
              selectedOption === opt
                ? 'bg-[#c9a84c]/15 border-[#c9a84c]/55 text-[#c9a84c]'
                : 'bg-white/[0.03] border-white/[0.08] text-white/60 hover:text-white hover:border-white/20 hover:bg-white/[0.06]'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function QuizResults({ recommendations, answers, onRetake }) {
  return (
    <div className="animate-slide-in px-7 pt-7 pb-6 overflow-y-auto max-h-[85vh]">
      <div className="mb-5">
        <p className="text-[10px] text-[#c9a84c] uppercase tracking-widest mb-1.5">Your Results</p>
        <h2 className="text-lg font-semibold text-white">Cards matched to your profile</h2>
      </div>

      {recommendations.length === 0 ? (
        <p className="text-white/45 text-sm py-4">
          All matched cards are already in your wallet — your setup looks great!
        </p>
      ) : (
        <div className="flex flex-col gap-4 mb-5">
          {recommendations.map((rec, i) => {
            const card = CARD_REC_DB[rec.id];
            if (!card) return null;
            return (
              <div
                key={rec.id}
                className={`relative rounded-2xl border p-5 ${
                  i === 0
                    ? 'border-[#c9a84c]/35 bg-[#0d1526] shadow-[0_0_24px_rgba(201,168,76,0.07)]'
                    : 'border-white/[0.07] bg-white/[0.025]'
                }`}
              >
                {i === 0 && (
                  <div className="absolute -top-3 left-5">
                    <span className="bg-[#c9a84c] text-[#060d1f] text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                      Top Pick
                    </span>
                  </div>
                )}

                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h3 className="text-white font-semibold text-sm">{card.name}</h3>
                  <span className="text-white/30 text-xs flex-shrink-0 mt-0.5">{card.fee}</span>
                </div>

                <p className="text-[#c9a84c]/75 text-xs mb-3 leading-relaxed italic">
                  {getCardHeadline(rec.id, answers)}
                </p>

                <ul className="space-y-1.5 mb-4">
                  {card.benefits.slice(0, 3).map((b) => (
                    <li key={b} className="flex items-start gap-2 text-xs text-white/50">
                      <CheckIcon className="w-3.5 h-3.5 text-[#c9a84c] flex-shrink-0 mt-0.5" />
                      {b}
                    </li>
                  ))}
                </ul>

                <a
                  href={card.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 btn-gold bg-[#c9a84c] hover:bg-[#d4af37] text-[#060d1f] font-semibold px-4 py-2 rounded-lg text-xs"
                >
                  Learn More →
                </a>
              </div>
            );
          })}
        </div>
      )}

      <button
        onClick={onRetake}
        className="w-full text-white/30 hover:text-white/60 text-sm transition-colors py-2"
      >
        ↺ Retake Quiz
      </button>
    </div>
  );
}

function CardQuizModal({ profile, onClose }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);
  const existingCardIds = useMemo(
    () => profile?.creditCards?.map((c) => c.id) ?? [],
    [profile]
  );

  const handleSelect = useCallback((questionId, option) => {
    setSelectedOption(option);
    setTimeout(() => {
      setAnswers((prev) => ({ ...prev, [questionId]: option }));
      setStep((s) => s + 1);
      setSelectedOption(null);
    }, 200);
  }, []);

  const recommendations = useMemo(
    () => step >= QUIZ_QUESTIONS.length ? getCardRecommendations(answers, existingCardIds) : [],
    [step, answers, existingCardIds]
  );

  const retake = () => {
    setStep(0);
    setAnswers({});
    setSelectedOption(null);
  };

  const isResults = step >= QUIZ_QUESTIONS.length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" />
      <div
        className="relative bg-[#080d1f] border border-white/[0.08] rounded-2xl w-full max-w-md shadow-[0_32px_80px_rgba(0,0,0,0.75)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-white/25 hover:text-white/55 transition-colors"
        >
          <XIcon className="w-5 h-5" />
        </button>

        {isResults ? (
          <QuizResults
            key="results"
            recommendations={recommendations}
            answers={answers}
            onRetake={retake}
          />
        ) : (
          <QuizQuestion
            key={step}
            question={QUIZ_QUESTIONS[step]}
            step={step}
            total={QUIZ_QUESTIONS.length}
            selectedOption={selectedOption}
            onSelect={handleSelect}
          />
        )}
      </div>
    </div>
  );
}

// ── Flio Score ──────────────────────────────────────────────────────────────

const TRANSFERABLE_CARD_IDS = ['csr', 'csp', 'amex-plat', 'amex-gold', 'venture-x'];
const HOTEL_PROGRAM_IDS     = ['hyatt', 'marriott', 'hilton', 'ihg'];
const AIRLINE_PROGRAM_IDS   = ['united', 'delta', 'american', 'alaska', 'southwest'];
const LOUNGE_CARD_IDS       = ['csr', 'amex-plat', 'venture-x'];

function computeFlioScore(profile) {
  const programs = profile?.loyaltyPrograms ?? [];
  const cards    = profile?.creditCards ?? [];
  const prefs    = profile?.preferences ?? {};
  const programIds = programs.map((p) => p.id);
  const cardIds    = cards.map((c) => c.id);

  const checks = {
    hasTransferable:  cardIds.some((id) => TRANSFERABLE_CARD_IDS.includes(id)),
    hasHotel:         programIds.some((id) => HOTEL_PROGRAM_IDS.includes(id)),
    hasAirline:       programIds.some((id) => AIRLINE_PROGRAM_IDS.includes(id)),
    hasBigBalance:    [...programs, ...cards].some((p) => (p.balance ?? 0) >= 50000),
    hasMultipleCards: cards.length > 1,
    hasLounge:        cardIds.some((id) => LOUNGE_CARD_IDS.includes(id)),
    hasAirport:       !!profile?.homeAirport,
    hasPreferences:   Object.values(prefs).some((v) => v),
    hasBoth:          programIds.some((id) => HOTEL_PROGRAM_IDS.includes(id)) && programIds.some((id) => AIRLINE_PROGRAM_IDS.includes(id)),
  };

  let score = 0;
  if (checks.hasTransferable)  score += 20;
  if (checks.hasHotel)         score += 15;
  if (checks.hasAirline)       score += 15;
  if (checks.hasBigBalance)    score += 10;
  if (checks.hasMultipleCards) score += 10;
  if (checks.hasLounge)        score += 15;
  if (checks.hasAirport)       score +=  5;
  if (checks.hasPreferences)   score +=  5;
  if (checks.hasBoth)          score +=  5;

  const suggestions = [];
  if (!checks.hasTransferable)  suggestions.push({ text: 'Add a transferable points card like Chase Sapphire Reserve or Amex Platinum', pts: 20 });
  if (!checks.hasLounge)        suggestions.push({ text: 'Add a card with lounge access — Amex Platinum, Chase Sapphire Reserve, or Venture X', pts: 15 });
  if (!checks.hasHotel)         suggestions.push({ text: 'Add a hotel program — World of Hyatt has the best redemption value', pts: 15 });
  if (!checks.hasAirline)       suggestions.push({ text: 'Add an airline loyalty program to unlock award flight redemptions', pts: 15 });
  if (!checks.hasMultipleCards) suggestions.push({ text: 'Add a second credit card to cover more spend categories', pts: 10 });
  if (!checks.hasBigBalance)    suggestions.push({ text: 'Build a single program balance above 50,000 points for premium redemptions', pts: 10 });
  if (!checks.hasBoth && (checks.hasHotel || checks.hasAirline))
    suggestions.push({ text: 'Add both a hotel and airline program for the best travel combinations', pts: 5 });
  if (!checks.hasAirport)       suggestions.push({ text: 'Set your home airport to get tailored routing advice', pts: 5 });
  if (!checks.hasPreferences)   suggestions.push({ text: 'Set your travel preferences to personalize your recommendations', pts: 5 });

  return { score, suggestions: suggestions.slice(0, 3) };
}

function ScoreRing({ score, color }) {
  const r = 54;
  const circumference = 2 * Math.PI * r;
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    setAnimated(0);
    let rafId;
    let start = null;
    const duration = 1400;
    const tick = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimated(Math.round(eased * score));
      if (progress < 1) rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [score]);

  const offset = circumference * (1 - animated / 100);

  return (
    <svg width="148" height="148" viewBox="0 0 148 148" className="overflow-visible">
      {/* Track */}
      <circle cx="74" cy="74" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
      {/* Glow */}
      <circle
        cx="74" cy="74" r={r} fill="none"
        stroke={color} strokeWidth="16" strokeLinecap="round"
        strokeDasharray={circumference} strokeDashoffset={offset}
        transform="rotate(-90 74 74)"
        style={{ opacity: 0.18, filter: 'blur(5px)' }}
      />
      {/* Arc */}
      <circle
        cx="74" cy="74" r={r} fill="none"
        stroke={color} strokeWidth="10" strokeLinecap="round"
        strokeDasharray={circumference} strokeDashoffset={offset}
        transform="rotate(-90 74 74)"
      />
    </svg>
  );
}

function FlioScoreSection({ profile }) {
  const { score, suggestions } = useMemo(() => computeFlioScore(profile), [profile]);
  const [quizOpen, setQuizOpen] = useState(false);

  const color = score <= 40 ? '#ef4444'
    : score <= 70 ? '#f59e0b'
    : score <= 90 ? '#60a5fa'
    : '#c9a84c';

  const label = score <= 40 ? 'Beginner'
    : score <= 70 ? 'Intermediate'
    : score <= 90 ? 'Advanced'
    : 'Elite';

  const labelBg = `${color}18`;
  const labelBorder = `${color}40`;

  return (
    <div className="mb-8 bg-white/[0.025] border border-white/[0.06] rounded-2xl p-6">
      {/* Ring + number */}
      <div className="flex flex-col items-center mb-5">
        <div className="relative">
          <ScoreRing score={score} color={color} />
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[2.6rem] font-bold text-white leading-none tabular-nums">{score}</span>
            <span className="text-[10px] text-white/30 mt-0.5 tracking-wide">/ 100</span>
          </div>
        </div>
        <div className="mt-4 flex flex-col items-center gap-1.5">
          <span
            className="text-xs font-semibold px-3.5 py-1 rounded-full"
            style={{ color, backgroundColor: labelBg, border: `1px solid ${labelBorder}` }}
          >
            {label}
          </span>
          <p className="text-white/30 text-xs tracking-wide">Flio Score · how optimized your setup is</p>
        </div>
      </div>

      <div className="border-t border-white/[0.05] mb-5" />

      {/* Suggestions */}
      {score >= 100 ? (
        <div className="text-center py-1">
          <p className="text-white/65 text-sm">Your setup is fully optimized. 🏆</p>
        </div>
      ) : (
        <>
          <p className="text-[10px] text-white/25 uppercase tracking-widest mb-3">How to improve</p>
          <div className="flex flex-col gap-2.5">
            {suggestions.map((s, i) => (
              <div
                key={i}
                className="flex items-start gap-3 bg-white/[0.03] border border-white/[0.05] rounded-xl px-4 py-3"
              >
                <div
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mt-0.5"
                  style={{ backgroundColor: labelBg, color, border: `1px solid ${labelBorder}` }}
                >
                  +
                </div>
                <p className="flex-1 text-white/60 text-xs leading-relaxed">{s.text}</p>
                <span
                  className="flex-shrink-0 text-xs font-semibold tabular-nums self-center"
                  style={{ color }}
                >
                  +{s.pts}pts
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Quiz CTA */}
      <div className="border-t border-white/[0.05] mt-5 pt-5">
        <button
          onClick={() => setQuizOpen(true)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-[#c9a84c]/25 hover:bg-[#c9a84c]/[0.04] transition-all duration-200 group"
        >
          <div className="text-left">
            <p className="text-white/75 text-sm font-medium group-hover:text-white transition-colors">Find Your Next Card</p>
            <p className="text-white/30 text-xs mt-0.5">5-question quiz · personalized picks</p>
          </div>
          <ChevronRightIcon className="w-4 h-4 text-white/25 group-hover:text-[#c9a84c] transition-colors flex-shrink-0" />
        </button>
      </div>

      {quizOpen && (
        <CardQuizModal profile={profile} onClose={() => setQuizOpen(false)} />
      )}
    </div>
  );
}

// ── Traveler Management ──────────────────────────────────────────────────────

function computeTravelerWalletValue(traveler) {
  const programs = traveler?.loyaltyPrograms ?? [];
  const cards    = traveler?.creditCards ?? [];
  return [
    ...programs.map((p) => cppDollar(p.balance, POINTS_CPP[p.id] ?? 1.0)),
    ...cards.map((c) => cppDollar(c.balance, CARDS_CPP[c.id] ?? 1.5)),
  ].reduce((a, b) => a + b, 0);
}

function TravelerCard({ name, initial, programs, cards, value, isPrimary, isExpanded, onToggleExpand, onEdit, onDelete }) {
  const totalItems = programs.length + cards.length;
  return (
    <div className="flex-1 min-w-0 bg-white/[0.025] border border-white/[0.06] rounded-2xl overflow-hidden">
      <button
        onClick={onToggleExpand}
        className="w-full flex items-center gap-3 p-4 hover:bg-white/[0.02] transition-colors text-left"
      >
        <div className="w-9 h-9 rounded-full bg-[#c9a84c]/15 border border-[#c9a84c]/25 flex items-center justify-center flex-shrink-0">
          <span className="text-[#c9a84c] text-sm font-semibold">{initial}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white/85 text-sm font-medium leading-tight truncate">{name}</p>
          <p className="text-white/30 text-xs mt-0.5">
            {totalItems === 0
              ? 'No programs'
              : `${totalItems} program${totalItems !== 1 ? 's' : ''}${value > 0 ? ` · $${value.toLocaleString()}` : ''}`}
          </p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {!isPrimary && onEdit && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white/25 hover:text-white/60 hover:bg-white/[0.06] transition-all"
              title="Edit"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          {!isPrimary && onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white/25 hover:text-red-400 hover:bg-red-400/[0.08] transition-all"
              title="Delete"
            >
              <TrashIcon className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDownIcon className={`w-4 h-4 text-white/25 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </button>
      {isExpanded && (
        <div className="border-t border-white/[0.05] px-4 pb-4">
          {programs.length > 0 && (
            <div className="pt-3">
              <p className="text-[10px] text-white/25 uppercase tracking-widest mb-2">Programs</p>
              <div className="space-y-1.5">
                {programs.map((p) => (
                  <div key={p.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div style={{ backgroundColor: p.color }} className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-[6px] font-bold">{p.initials}</span>
                      </div>
                      <span className="text-white/55 text-xs">{p.shortName}</span>
                    </div>
                    {p.balance > 0 && (
                      <span className="text-white/35 text-xs tabular-nums">{p.balance.toLocaleString()} {p.currency}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {cards.length > 0 && (
            <div className="pt-3">
              <p className="text-[10px] text-white/25 uppercase tracking-widest mb-2">Cards</p>
              <div className="space-y-1.5">
                {cards.map((c) => (
                  <div key={c.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div style={{ background: c.bg }} className="w-5 h-3.5 rounded flex-shrink-0" />
                      <span className="text-white/55 text-xs">{c.shortName}</span>
                    </div>
                    {c.balance > 0 && (
                      <span className="text-white/35 text-xs tabular-nums">{c.balance.toLocaleString()} {c.currency}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {programs.length === 0 && cards.length === 0 && (
            <p className="pt-3 text-white/25 text-xs">No programs or cards added.</p>
          )}
        </div>
      )}
    </div>
  );
}

function AddTravelerModal({ onSave, onClose, initial = null }) {
  const [step, setStep] = useState(0);
  const [nickname, setNickname] = useState(initial?.nickname ?? '');
  const [selectedPrograms, setSelectedPrograms] = useState(initial?.loyaltyPrograms ?? []);
  const [selectedCards, setSelectedCards] = useState(initial?.creditCards ?? []);
  const [balanceModal, setBalanceModal] = useState(null);

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

  const canNext = step === 0 ? nickname.trim().length > 0 : true;
  const STEP_LABELS_T = ['Name', 'Programs', 'Cards'];

  const handleNext = () => {
    if (step < 2) {
      setStep((s) => s + 1);
    } else {
      onSave({
        id: initial?.id ?? String(Date.now()),
        nickname: nickname.trim(),
        loyaltyPrograms: selectedPrograms,
        creditCards: selectedCards,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative bg-[#0d1526] border border-white/[0.08] rounded-2xl w-full max-w-md shadow-[0_24px_64px_rgba(0,0,0,0.6)] flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.06] flex-shrink-0">
          <button
            onClick={step === 0 ? onClose : () => setStep((s) => s - 1)}
            className="text-white/40 hover:text-white transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
          </button>
          <div className="flex-1">
            <p className="text-[10px] text-white/30 uppercase tracking-widest mb-0.5">Step {step + 1} of 3</p>
            <h2 className="text-white text-sm font-medium">{STEP_LABELS_T[step]}</h2>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/60 transition-colors">
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Progress */}
        <div className="flex gap-1 px-6 pt-3 flex-shrink-0">
          {[0, 1, 2].map((n) => (
            <div
              key={n}
              className="h-0.5 flex-1 rounded-full transition-all duration-500"
              style={{ backgroundColor: n <= step ? '#c9a84c' : 'rgba(255,255,255,0.1)' }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {step === 0 && (
            <div>
              <h2 className="text-white text-2xl font-light mb-1">Who's traveling with you?</h2>
              <p className="text-white/40 text-sm mb-8">Give them a nickname — like "Sarah" or "Dad"</p>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && canNext && handleNext()}
                placeholder="e.g. Sarah"
                autoFocus
                maxLength={24}
                className="input-gold w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none transition-all"
              />
            </div>
          )}
          {step === 1 && (
            <div>
              <h2 className="text-white text-2xl font-light mb-1">{nickname}'s programs</h2>
              <p className="text-white/40 text-sm mb-8">Select their loyalty programs</p>
              <SelectionGrid
                items={LOYALTY_PROGRAMS}
                selected={selectedPrograms}
                onToggle={handleProgramToggle}
                renderCard={(item) => (
                  <div style={{ backgroundColor: item.color }} className="w-10 h-10 rounded-full flex items-center justify-center">
                    <span className="text-white text-[10px] font-bold">{item.initials}</span>
                  </div>
                )}
              />
            </div>
          )}
          {step === 2 && (
            <div>
              <h2 className="text-white text-2xl font-light mb-1">{nickname}'s cards</h2>
              <p className="text-white/40 text-sm mb-8">Select their credit cards</p>
              <SelectionGrid
                items={CREDIT_CARDS}
                selected={selectedCards}
                onToggle={handleCardToggle}
                renderCard={(item) => (
                  <div style={{ background: item.bg }} className="w-full h-10 rounded-lg flex items-center px-2.5">
                    <span style={{ color: item.accentColor }} className="text-[9px] font-bold tracking-wider opacity-80">
                      {item.issuer}
                    </span>
                  </div>
                )}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/[0.06] flex-shrink-0">
          <button
            onClick={handleNext}
            disabled={!canNext}
            className="btn-gold w-full bg-[#c9a84c] hover:bg-[#d4af37] disabled:opacity-35 disabled:cursor-not-allowed text-[#060d1f] font-semibold py-3 rounded-xl text-sm transition-all duration-200"
          >
            {step < 2 ? 'Next →' : (initial ? 'Save Changes' : 'Save Traveler')}
          </button>
        </div>

        {balanceModal && (
          <BalanceModal
            item={balanceModal.item}
            type={balanceModal.type}
            onConfirm={handleBalanceConfirm}
            onClose={() => setBalanceModal(null)}
          />
        )}
      </div>
    </div>
  );
}

function TravelersSection({ profile, travelers, onSaveTravelers }) {
  const [expanded, setExpanded] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTraveler, setEditingTraveler] = useState(null);

  const primaryValue  = computeTravelerWalletValue(profile);
  const totalCombined = [primaryValue, ...travelers.map(computeTravelerWalletValue)].reduce((a, b) => a + b, 0);

  const handleSaveTraveler = (t) => {
    const existing = travelers.find((x) => x.id === t.id);
    const next = existing ? travelers.map((x) => x.id === t.id ? t : x) : [...travelers, t];
    onSaveTravelers(next);
    setShowAddModal(false);
    setEditingTraveler(null);
  };

  const handleDelete = (id) => {
    onSaveTravelers(travelers.filter((t) => t.id !== id));
    if (expanded === id) setExpanded(null);
  };

  const canAdd = travelers.length < 3;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-medium">Travelers</h3>
        {totalCombined > 0 && (
          <div className="text-right">
            <p className="text-[10px] text-white/30 uppercase tracking-widest">Combined Wallet</p>
            <p className="text-[#c9a84c] text-sm font-semibold">${totalCombined.toLocaleString()}</p>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
        <TravelerCard
          name="Primary Traveler"
          initial="P"
          programs={profile?.loyaltyPrograms ?? []}
          cards={profile?.creditCards ?? []}
          value={primaryValue}
          isPrimary
          isExpanded={expanded === 'primary'}
          onToggleExpand={() => setExpanded((p) => p === 'primary' ? null : 'primary')}
        />

        {travelers.map((t) => (
          <TravelerCard
            key={t.id}
            name={t.nickname}
            initial={(t.nickname[0] ?? '?').toUpperCase()}
            programs={t.loyaltyPrograms ?? []}
            cards={t.creditCards ?? []}
            value={computeTravelerWalletValue(t)}
            isPrimary={false}
            isExpanded={expanded === t.id}
            onToggleExpand={() => setExpanded((p) => p === t.id ? null : t.id)}
            onEdit={() => { setEditingTraveler(t); setShowAddModal(true); }}
            onDelete={() => handleDelete(t.id)}
          />
        ))}

        {canAdd && (
          <button
            onClick={() => { setEditingTraveler(null); setShowAddModal(true); }}
            className="flex-1 min-w-[130px] flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border-2 border-dashed border-white/[0.1] hover:border-[#c9a84c]/35 hover:bg-[#c9a84c]/[0.03] transition-all duration-200 min-h-[88px]"
          >
            <div className="w-8 h-8 rounded-full border border-dashed border-white/20 flex items-center justify-center">
              <PlusIcon className="w-3.5 h-3.5 text-white/30" />
            </div>
            <span className="text-white/30 text-xs">Add Traveler</span>
          </button>
        )}
      </div>

      {showAddModal && (
        <AddTravelerModal
          initial={editingTraveler}
          onSave={handleSaveTraveler}
          onClose={() => { setShowAddModal(false); setEditingTraveler(null); }}
        />
      )}
    </div>
  );
}

function ProfileDashboard({ profile, usedCredits, onToggleCredit, onSave, onBack, travelers = [], onSaveTravelers }) {
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
          <FlioScoreSection profile={profile} />
          <TravelersSection profile={profile} travelers={travelers} onSaveTravelers={onSaveTravelers} />
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

// ── Pricing Page ────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  { q: 'Is my data private?', a: 'Yes, all your profile data stays on your device. No account required.' },
  { q: 'Can I cancel anytime?', a: 'Yes, no contracts or commitments.' },
  { q: 'What loyalty programs does Flio support?', a: 'All major US airline and hotel programs including United, Delta, American, Alaska, Southwest, Hyatt, Marriott, and Hilton.' },
  { q: 'Is Flio affiliated with any airline or credit card?', a: 'No. Flio is independent and gives unbiased advice based on your specific situation.' },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/[0.08]">
      <button
        className="w-full text-left py-5 flex items-center justify-between gap-4"
        onClick={() => setOpen((p) => !p)}
      >
        <span className="text-white/85 text-sm font-medium">{q}</span>
        <ChevronDownIcon className={`w-4 h-4 text-white/40 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <p className="text-white/55 text-sm pb-5 leading-relaxed">{a}</p>}
    </div>
  );
}

function WaitlistModal({ tier, onClose }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!email.trim()) return;
    const key = 'flio-waitlist';
    const list = JSON.parse(localStorage.getItem(key) || '[]');
    list.push({ email: email.trim(), tier, date: new Date().toISOString() });
    localStorage.setItem(key, JSON.stringify(list));
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-[#0d1526] border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-[0_24px_64px_rgba(0,0,0,0.6)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/30 hover:text-white/60 transition-colors"
        >
          <XIcon className="w-5 h-5" />
        </button>
        {!submitted ? (
          <>
            <h2 className="text-2xl font-semibold text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              You're early.
            </h2>
            <p className="text-white/50 text-sm mb-6 leading-relaxed">
              Flio Pro is coming soon. Drop your email and we'll notify you when it launches.
            </p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="your@email.com"
              className="input-gold w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm mb-4 placeholder:text-white/25"
            />
            <button
              onClick={handleSubmit}
              className="btn-gold w-full bg-[#c9a84c] hover:bg-[#d4af37] text-[#060d1f] font-semibold py-3 rounded-xl text-sm"
            >
              Notify Me
            </button>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full bg-[#c9a84c]/15 border border-[#c9a84c]/30 flex items-center justify-center mx-auto mb-4">
              <CheckIcon className="w-6 h-6 text-[#c9a84c]" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">You're on the list.</h2>
            <p className="text-white/50 text-sm">We'll be in touch when Flio {tier === 'elite' ? 'Elite' : 'Pro'} launches.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function PricingPage({ isLight, onToggleTheme }) {
  const navigate = useNavigate();
  const [annual, setAnnual] = useState(false);
  const [waitlist, setWaitlist] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const tBase = isLight ? '#0d1526' : '#ffffff';
  const tDim  = isLight ? 'rgba(13,21,38,0.52)' : 'rgba(255,255,255,0.45)';

  const PLANS = [
    {
      id: 'free',
      name: 'Free',
      price: { monthly: 0, annual: 0 },
      desc: 'Perfect for getting started',
      features: [
        '5 trip plans per month',
        'Basic points optimization',
        'Up to 3 loyalty programs',
        'No trip history',
      ],
      cta: 'Get Started →',
      ctaAction: () => navigate('/'),
      popular: false,
    },
    {
      id: 'pro',
      name: 'Pro',
      price: { monthly: 9, annual: 7 },
      desc: 'For the frequent traveler',
      features: [
        'Unlimited trip plans',
        'Full points wallet dashboard',
        'All loyalty programs + credit cards',
        'Trip history + PDF export',
        'Pre-departure checklists',
        'Priority AI responses',
      ],
      cta: 'Join Waitlist →',
      ctaAction: () => setWaitlist('pro'),
      popular: true,
    },
    {
      id: 'elite',
      name: 'Elite',
      price: { monthly: 19, annual: 15 },
      desc: 'For the power traveler',
      features: [
        'Everything in Pro',
        'Multi-traveler trips',
        'Calendar integration',
        'Exclusive transfer partner sweet spots',
        'Dedicated concierge mode',
        'Early access to new features',
      ],
      cta: 'Join Waitlist →',
      ctaAction: () => setWaitlist('elite'),
      popular: false,
    },
  ];

  return (
    <div className={`min-h-screen font-['DM_Sans',sans-serif] ${isLight ? 'bg-[#f2ede3] lm' : 'bg-[#0a0f1e]'}`}>
      <div className="noise-overlay" aria-hidden="true" />

      {/* Nav */}
      <nav
        className={`sticky top-0 z-50 flex items-center justify-between px-6 h-16 backdrop-blur-md transition-shadow duration-300 ${
          scrolled ? (isLight ? 'shadow-[0_4px_24px_rgba(0,0,0,0.08)]' : 'shadow-[0_4px_32px_rgba(0,0,0,0.45)]') : ''
        }`}
        style={{
          backgroundColor: isLight ? 'rgba(242,237,227,0.93)' : 'rgba(10,15,30,0.88)',
          borderBottom: `1px solid ${isLight ? 'rgba(13,21,38,0.08)' : 'rgba(255,255,255,0.04)'}`,
          transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
        }}
      >
        <button onClick={() => navigate('/')} className="flex items-center gap-2 flex-shrink-0">
          <PlaneIcon className="w-4 h-4 text-[#c9a84c]" />
          <span className="font-semibold tracking-widest text-sm uppercase" style={{ color: tBase }}>Flio</span>
        </button>

        <div className="hidden md:flex items-center gap-7">
          <button
            onClick={() => navigate('/')}
            className="text-sm pb-0.5"
            style={{ color: tDim, borderBottom: '1px solid transparent', transition: 'color 0.2s ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = tBase; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = tDim; }}
          >
            Home
          </button>
          <span
            className="text-sm pb-0.5"
            style={{ color: '#c9a84c', borderBottom: '1px solid rgba(201,168,76,0.55)' }}
          >
            Pricing
          </span>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle isLight={isLight} onToggle={onToggleTheme} />
          <button
            onClick={() => navigate('/')}
            className="hidden md:flex btn-gold items-center gap-1.5 bg-[#c9a84c] hover:bg-[#d4af37] text-[#060d1f] font-semibold px-5 py-2 rounded-full text-sm"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Header */}
      <div className="pt-20 pb-14 px-6 text-center">
        <h1
          className="text-4xl md:text-5xl font-semibold text-white mb-4 leading-tight"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Simple, transparent pricing
        </h1>
        <p className="text-white/50 text-lg mb-10">Start free. Upgrade when you're ready.</p>

        {/* Monthly / Annual toggle */}
        <div className="inline-flex items-center gap-1 bg-white/[0.05] rounded-full px-1.5 py-1.5 border border-white/[0.08]">
          <button
            onClick={() => setAnnual(false)}
            className={`px-4 py-1.5 rounded-full text-sm transition-all duration-200 ${
              !annual ? 'bg-white/10 text-white font-medium' : 'text-white/45 hover:text-white/65'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={`px-4 py-1.5 rounded-full text-sm transition-all duration-200 flex items-center gap-2 ${
              annual ? 'bg-white/10 text-white font-medium' : 'text-white/45 hover:text-white/65'
            }`}
          >
            Annual
            <span className="text-xs bg-[#c9a84c]/20 text-[#c9a84c] border border-[#c9a84c]/25 px-2 py-0.5 rounded-full font-medium">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing cards */}
      <div className="px-6 max-w-5xl mx-auto pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl border p-7 flex flex-col transition-all duration-300 ${
                plan.popular
                  ? 'border-[#c9a84c]/40 bg-[#0d1526] shadow-[0_0_48px_rgba(201,168,76,0.14),0_12px_40px_rgba(0,0,0,0.5)] md:scale-[1.04] md:-translate-y-2 z-10'
                  : 'border-white/[0.08] bg-white/[0.03]'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-[#c9a84c] text-[#060d1f] text-xs font-bold px-4 py-1.5 rounded-full tracking-wide uppercase">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-5">
                <h3 className="text-white font-semibold text-lg mb-0.5">{plan.name}</h3>
                <p className="text-white/35 text-xs mb-5">{plan.desc}</p>
                <div className="flex items-end gap-1.5">
                  <span className="text-5xl font-bold text-white leading-none">
                    ${annual ? plan.price.annual : plan.price.monthly}
                  </span>
                  <span className="text-white/35 text-sm mb-1">
                    {plan.price.monthly === 0 ? 'forever' : annual ? '/mo · billed annually' : '/month'}
                  </span>
                </div>
                {annual && plan.price.monthly > 0 && (
                  <p className="text-white/30 text-xs mt-1.5">
                    ${plan.price.monthly}/mo billed monthly
                  </p>
                )}
              </div>

              <ul className="flex flex-col gap-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-white/65">
                    <CheckIcon className="w-4 h-4 text-[#c9a84c] flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={plan.ctaAction}
                className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  plan.popular
                    ? 'btn-gold bg-[#c9a84c] hover:bg-[#d4af37] text-[#060d1f]'
                    : 'border border-white/15 text-white/65 hover:text-white hover:border-white/30 hover:bg-white/[0.05]'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="px-6 max-w-2xl mx-auto pb-24">
        <h2
          className="text-2xl font-semibold text-white mb-8 text-center"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Frequently asked questions
        </h2>
        <div className="border-t border-white/[0.08]">
          {FAQ_ITEMS.map((item) => (
            <FAQItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="px-6 py-20 text-center border-t border-white/[0.05]">
        <p className="text-white/40 text-sm mb-5">Not sure yet? Start free — no account required.</p>
        <button
          onClick={() => navigate('/')}
          className="btn-gold bg-[#c9a84c] hover:bg-[#d4af37] text-[#060d1f] font-semibold px-8 py-3 rounded-full text-sm"
        >
          Try Flio Free →
        </button>
      </div>

      {waitlist && <WaitlistModal tier={waitlist} onClose={() => setWaitlist(null)} />}
    </div>
  );
}

// ── App Shell ──────────────────────────────────────────────────────────────

export default function App() {
  const { isLight, toggle: toggleTheme } = useTheme();

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
  const [travelers, setTravelers] = useState(() => {
    try { return JSON.parse(localStorage.getItem('flio-travelers')) || []; } catch { return []; }
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

  const saveTravelers = (next) => {
    setTravelers(next);
    localStorage.setItem('flio-travelers', JSON.stringify(next));
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
    <Routes>
      <Route
        path="/pricing"
        element={<PricingPage isLight={isLight} onToggleTheme={toggleTheme} />}
      />
      <Route
        path="/*"
        element={
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
                isLight={isLight}
                onToggleTheme={toggleTheme}
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
                travelers={travelers}
              />
            )}
            {screen === 'dashboard' && (
              <ProfileDashboard
                profile={profile}
                usedCredits={usedCredits}
                onToggleCredit={toggleCredit}
                onSave={saveProfile}
                onBack={() => setScreen(prevScreenRef.current)}
                travelers={travelers}
                onSaveTravelers={saveTravelers}
              />
            )}
          </>
        }
      />
    </Routes>
  );
}
