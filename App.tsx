import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { SplashScreen } from './components/SplashScreen';
import { AuthDashboard } from './components/AuthDashboard';
import { ProxyContactsDashboard } from './components/ProxyContactsDashboard';
import { RegistrationDashboard } from './components/RegistrationDashboard';
import { EmergencyDashboard } from './components/EmergencyDashboard';
import { DailyCareDashboard } from './components/DailyCareDashboard';
import { AashaCareChatbot, FloatingChatWidget } from './components/AashaCareChatbot';
import {
  Language,
  DashboardTab,
  SeniorProfile,
  Medication,
  SOSStatus,
  LocationCoordinates,
  AuthState,
  EmergencyProxy,
} from './types';
import { translations } from './translations';
import { AashaShieldLogo } from './components/AashaShieldLogo';

const INITIAL_PROFILE: SeniorProfile = {
  name: 'Smt. Lakshmi Varma',
  age: 72,
  gender: 'Female',
  phone: '9849012345',
  aadhaar: '452189327714',
  address: 'Plot 42, Road No. 12, Banjara Hills, Hyderabad, Telangana - 500034',
  bloodGroup: 'O+',
  cardiacHistory: 'Post-PCI Drug-Eluting Stent (DES)',
  stentDate: 'Nov 2024',
  severeAllergies: 'PENICILLIN CONTRAINDICATED (Severe Anaphylactic Risk)',
  chronicConditions: ['Hypertension', 'Type 2 Diabetes', 'Post-PCI Stent'],
  preferredHospital: 'Apollo Hospitals, Jubilee Hills, Hyderabad',
  proxies: [
    {
      id: 'p1',
      name: 'Rajesh Varma',
      relation: 'Son (Primary Caregiver)',
      phone: '9849012345',
      isPrimary: true,
      status: 'verified',
    },
    {
      id: 'p2',
      name: 'Ananya Rao',
      relation: 'Daughter',
      phone: '9848054321',
      status: 'verified',
    },
    {
      id: 'p3',
      name: 'Dr. K. S. Murthy',
      relation: 'Family Physician (Cardiology)',
      phone: '9440011223',
      status: 'verified',
    },
  ],
};

const INITIAL_MEDICATIONS: Medication[] = [
  {
    id: 'med-1',
    name: 'Telmisartan 40mg + Metformin 500mg',
    dosage: '40mg / 500mg',
    timeSlot: '08:30 AM',
    category: 'Morning',
    instructions: 'Take 20-30 minutes after breakfast with a full glass of water.',
    instructionsTe: 'అల్పాహారం తిన్న 20-30 నిమిషాల తర్వాత ఒక గ్లాసు నీటితో వేసుకోండి.',
    purpose: 'Hypertension (BP) & Blood Sugar Regulation',
    purposeTe: 'రక్తపోటు (బిపి) మరియు షుగర్ సమతుల్యత',
    takenToday: true,
    takenAt: '08:32 AM',
    isCritical: true,
  },
  {
    id: 'med-2',
    name: 'Multivitamin & Calcium D3',
    dosage: '1 Tablet',
    timeSlot: '01:30 PM',
    category: 'Afternoon',
    instructions: 'Take after lunch to support bone health and senior vitality.',
    instructionsTe: 'మధ్యాహ్న భోజనం తర్వాత ఎముకల బలానికి వేసుకోండి.',
    purpose: 'Bone Density & General Wellness',
    purposeTe: 'శరీర దారుఢ్యం & ఎముకల పుష్టి',
    takenToday: true,
    takenAt: '01:35 PM',
  },
  {
    id: 'med-3',
    name: 'Atorvastatin 10mg',
    dosage: '10mg',
    timeSlot: '08:30 PM',
    category: 'Night',
    instructions: 'Take at bedtime after light dinner to protect cardiac stent.',
    instructionsTe: 'రాత్రి భోజనం తర్వాత నిద్రపోయే ముందు వేసుకోండి.',
    purpose: 'Cholesterol & Post-Stent Arterial Protection',
    purposeTe: 'కొలెస్ట్రాల్ మరియు స్టెంట్ రక్షణ',
    takenToday: false,
    isCritical: true,
  },
];

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [language, setLanguage] = useState<Language>('en');
  const [activeTab, setActiveTab] = useState<DashboardTab>('auth');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [profile, setProfile] = useState<SeniorProfile>(INITIAL_PROFILE);
  const [medications, setMedications] = useState<Medication[]>(INITIAL_MEDICATIONS);
  const [sosStatus, setSosStatus] = useState<SOSStatus>('idle');

  // Authentication State
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: true,
    userName: INITIAL_PROFILE.name,
    userPhone: INITIAL_PROFILE.phone,
    userAadhaar: INITIAL_PROFILE.aadhaar,
    method: 'phone',
  });

  // GPS Coordinates (Banjara Hills, Hyderabad)
  const [location, setLocation] = useState<LocationCoordinates>({
    lat: 17.4156,
    lng: 78.435,
    address: 'Road No. 12, Banjara Hills, Hyderabad, Telangana',
    accuracyMeters: 4.5,
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  });

  const refreshLocation = useCallback(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            address: 'Road No. 12, Banjara Hills, Hyderabad, Telangana (Active Device Fix)',
            accuracyMeters: Math.round(pos.coords.accuracy) || 3.8,
            lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          });
        },
        () => {
          setLocation((prev) => ({
            ...prev,
            lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          }));
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []);

  useEffect(() => {
    refreshLocation();
  }, [refreshLocation]);

  const handleLanguageToggle = () => {
    setLanguage((prev) => (prev === 'en' ? 'te' : 'en'));
  };

  const handleToggleMedication = (id: string) => {
    setMedications((prev) =>
      prev.map((med) => {
        if (med.id === id) {
          const newStatus = !med.takenToday;
          return {
            ...med,
            takenToday: newStatus,
            takenAt: newStatus
              ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : undefined,
          };
        }
        return med;
      })
    );
  };

  const handleAuthenticate = (info: { name: string; phone?: string; aadhaar?: string; method: 'phone' | 'aadhaar' }) => {
    setAuthState({
      isAuthenticated: true,
      userName: info.name,
      userPhone: info.phone || profile.phone,
      userAadhaar: info.aadhaar || profile.aadhaar,
      method: info.method,
    });
    setProfile((prev) => ({
      ...prev,
      name: info.name,
      phone: info.phone || prev.phone,
      aadhaar: info.aadhaar || prev.aadhaar,
    }));
  };

  const handleSignOut = () => {
    setAuthState({ isAuthenticated: false });
    setActiveTab('auth');
  };

  const handleUpdateProxies = (updatedProxies: EmergencyProxy[]) => {
    setProfile((prev) => ({ ...prev, proxies: updatedProxies }));
  };

  const [quotaExceeded, setQuotaExceeded] = useState(false);

  useEffect(() => {
    const handleQuotaExceeded = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
  }, []);

  return (
    <div className="min-h-screen bg-[#fcfaf6] flex flex-col font-sans text-stone-800 antialiased selection:bg-amber-200 selection:text-amber-950">
      {/* Google Maps Quota Exceeded Defense Banner */}
      {quotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* 3.5s Animated Startup Splash Screen with Logo Zoom-in & Tagline Pop */}
      {showSplash && (
        <SplashScreen
          language={language}
          onFinish={() => setShowSplash(false)}
        />
      )}

      {/* Main Navbar */}
      <Navbar
        language={language}
        onLanguageToggle={handleLanguageToggle}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onOpenChat={() => setIsChatOpen(true)}
        onReplayIntro={() => setShowSplash(true)}
        sosActive={sosStatus === 'triggered'}
        authState={authState}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* NEW FRONT DASHBOARD: Sign Up / Sign In with OTP & Strict 10/12-digit Triggers */}
        {activeTab === 'auth' && (
          <AuthDashboard
            language={language}
            authState={authState}
            onAuthenticate={handleAuthenticate}
            onSignOut={handleSignOut}
            profile={profile}
            onNavigateToDashboard={() => setActiveTab('emergency')}
          />
        )}

        {/* IMMEDIATE SOS DASHBOARD */}
        {activeTab === 'emergency' && (
          <EmergencyDashboard
            language={language}
            profile={profile}
            sosStatus={sosStatus}
            setSosStatus={setSosStatus}
            location={location}
            onRefreshLocation={refreshLocation}
            onNavigateToContacts={() => setActiveTab('contacts')}
          />
        )}

        {/* DEDICATED DASHBOARD FOR 3 PHONE NUMBERS */}
        {activeTab === 'contacts' && (
          <ProxyContactsDashboard
            language={language}
            profile={profile}
            onUpdateProxies={handleUpdateProxies}
          />
        )}

        {/* DAILY CARE & MEDICATION ADHERENCE */}
        {activeTab === 'dailyCare' && (
          <DailyCareDashboard
            language={language}
            profile={profile}
            medications={medications}
            onToggleMedication={handleToggleMedication}
          />
        )}

        {/* GOLDEN HOUR MEDICAL ID & PROFILE */}
        {activeTab === 'registration' && (
          <RegistrationDashboard
            language={language}
            profile={profile}
            onUpdateProfile={(updated) => setProfile(updated)}
            onNavigateToContacts={() => setActiveTab('contacts')}
          />
        )}
      </main>

      {/* Warm Footer */}
      <footer className="w-full bg-amber-50/70 border-t border-amber-200/60 py-6 mt-12 text-center text-xs text-stone-600">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-bold text-stone-900">
            <AashaShieldLogo size="sm" withContainer={false} className="w-5 h-5" />
            <span>AASHA • ఆశా సీనియర్ కేర్</span>
            <span className="text-amber-400 font-normal">|</span>
            <span className="text-stone-600 font-medium text-[11px]">
              &ldquo;{translations[language].appTagline}&rdquo;
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-semibold text-stone-700">
            <span>108 Central: <strong>+91 7981158373</strong></span>
            <span>•</span>
            <span>Caregiver Welfare: <strong>+91 9515862914</strong></span>
          </div>
        </div>
      </footer>

      {/* Floating Aasha Care AI Widget */}
      <FloatingChatWidget
        language={language}
        onOpen={() => setIsChatOpen(true)}
      />

      {/* Integrated Aasha Care AI Modal Companion */}
      <AashaCareChatbot
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        language={language}
        onLanguageToggle={handleLanguageToggle}
        profile={profile}
        onOpenSOS={() => setActiveTab('emergency')}
      />
    </div>
  );
}
