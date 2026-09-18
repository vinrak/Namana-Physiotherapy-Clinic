import React from 'react';
import { Users, Calendar, IndianRupee, FileSpreadsheet, UserCheck } from 'lucide-react';
import { ClinicLogo } from './ClinicLogo';
import { WaterBackupNavButton } from './WaterBackupNavButton';

export type MainView = 'patients' | 'monthly' | 'fees' | 'itreturn' | 'backup' | 'locum';

interface HeaderProps {
  currentView: MainView;
  onSelectView: (view: MainView) => void;
  clinicName?: string;
  totalPatientsCount?: number;
  activePatientsCount?: number;
  deletedPatientsCount?: number;
  onSelectPatientStatus?: (status: 'all' | 'active' | 'deleted') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onSelectView,
  clinicName = "Namana Physiotherapy Clinic",
  totalPatientsCount = 0,
  activePatientsCount = 0,
  deletedPatientsCount = 0,
  onSelectPatientStatus,
}) => {
  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-sky-100 px-2 sm:px-4 md:px-4 lg:px-6 xl:px-8 flex items-center justify-between flex-shrink-0 sticky top-0 z-30 shadow-xs text-slate-800 w-full">
      {/* Clinic Name & Logo Header Region - Guaranteed Home Return & Adaptive Mobile Size */}
      <div className="flex items-center min-w-0 z-20 mr-1 sm:mr-3">
        {/* Clinic Name Branding Button */}
        <button
          type="button"
          id="header-home-logo-btn"
          className="flex items-center gap-1.5 sm:gap-2.5 md:gap-3 cursor-pointer select-none py-1 text-left group focus:outline-none focus:ring-2 focus:ring-sky-400 rounded-xl transition-all min-w-0"
          onClick={() => {
            onSelectView('patients');
            onSelectPatientStatus?.('all');
          }}
          title={`${clinicName} - Click to Return to Home / Patient Directory`}
          aria-label="Return to Home Screen"
        >
          {/* Fluid Logo scaling perfectly on mobile, tablet, desktop */}
          <div className="w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 shrink-0 drop-shadow-xs flex items-center justify-center group-hover:scale-105 transition-transform">
            <ClinicLogo className="w-full h-full" />
          </div>

          {/* Adaptive Clinic Name & Tagline */}
          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm md:text-base font-extrabold tracking-tight text-sky-950 leading-tight truncate group-hover:text-sky-700 transition-colors">
              <span className="hidden sm:inline">{clinicName}</span>
              <span className="sm:hidden">Namana Physio</span>
            </h1>
            <p className="hidden sm:block text-[8.5px] sm:text-[9.5px] md:text-[10px] font-bold tracking-wide uppercase whitespace-nowrap leading-tight mt-0.5 text-slate-500">
              <span className="text-rose-600">Remove pain, </span>
              <span className="text-emerald-600">Move Again</span>
            </p>
          </div>
        </button>
      </div>

      {/* Desktop & Tablet Navigation Tabs - Responsive Spacing & Labels */}
      <nav className="hidden md:flex items-center gap-1 lg:gap-1.5 shrink-0">
        <button
          id="nav-tab-patients"
          onClick={() => {
            onSelectView('patients');
            onSelectPatientStatus?.('all');
          }}
          className={`flex items-center gap-1.5 px-2 md:px-2.5 lg:px-3 py-1 lg:py-1.5 rounded-xl text-[11px] lg:text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            currentView === 'patients'
              ? 'bg-sky-50 text-sky-800 border border-sky-200 shadow-xs'
              : 'text-slate-600 hover:bg-sky-50/70 hover:text-sky-900 border border-transparent'
          }`}
          title="Patient Directory"
        >
          <Users className="w-3.5 h-3.5 text-sky-600 shrink-0" />
          <span>Patients</span>
        </button>

        <button
          id="nav-tab-monthly"
          onClick={() => onSelectView('monthly')}
          className={`flex items-center gap-1.5 px-2 md:px-2.5 lg:px-3 py-1 lg:py-1.5 rounded-xl text-[11px] lg:text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            currentView === 'monthly'
              ? 'bg-sky-50 text-sky-800 border border-sky-200 shadow-xs'
              : 'text-slate-600 hover:bg-sky-50/70 hover:text-sky-900 border border-transparent'
          }`}
          title="Monthly Analytics & Reports"
        >
          <Calendar className="w-3.5 h-3.5 text-sky-600 shrink-0" />
          <span className="inline lg:hidden">Monthly</span>
          <span className="hidden lg:inline">Monthly Data</span>
        </button>

        <button
          id="nav-tab-fees"
          onClick={() => onSelectView('fees')}
          className={`flex items-center gap-1.5 px-2 md:px-2.5 lg:px-3 py-1 lg:py-1.5 rounded-xl text-[11px] lg:text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            currentView === 'fees'
              ? 'bg-sky-50 text-sky-800 border border-sky-200 shadow-xs'
              : 'text-slate-600 hover:bg-sky-50/70 hover:text-sky-900 border border-transparent'
          }`}
          title="Fee Collected Overview"
        >
          <IndianRupee className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="inline lg:hidden">Fees</span>
          <span className="hidden lg:inline">Fee Collected</span>
        </button>

        <button
          id="nav-tab-itreturn"
          onClick={() => onSelectView('itreturn')}
          className={`flex items-center gap-1.5 px-2 md:px-2.5 lg:px-3 py-1 lg:py-1.5 rounded-xl text-[11px] lg:text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            currentView === 'itreturn'
              ? 'bg-sky-50 text-sky-800 border border-sky-200 shadow-xs'
              : 'text-slate-600 hover:bg-sky-50/70 hover:text-sky-900 border border-transparent'
          }`}
          title="Income Tax / Section 44ADA Return Audit"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>IT Return</span>
        </button>

        <WaterBackupNavButton
          isActive={currentView === 'backup'}
          onClick={() => onSelectView('backup')}
        />

        <button
          id="nav-tab-locum"
          onClick={() => onSelectView('locum')}
          className={`flex items-center gap-1.5 px-2 md:px-2.5 lg:px-3 py-1 lg:py-1.5 rounded-xl text-[11px] lg:text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            currentView === 'locum'
              ? 'bg-sky-50 text-sky-800 border border-sky-200 shadow-xs'
              : 'text-slate-600 hover:bg-sky-50/70 hover:text-sky-900 border border-transparent'
          }`}
          title="Locum Tenens Physiotherapists"
        >
          <UserCheck className="w-3.5 h-3.5 text-sky-600 shrink-0" />
          <span className="inline lg:hidden">Locum</span>
          <span className="hidden lg:inline">Locum Tenens</span>
        </button>
      </nav>

      {/* Mobile Quick Navigation Bar - Guaranteed Access to All Tabs including Locum Tenens */}
      <div className="flex md:hidden items-center gap-0.5 sm:gap-1 shrink-0 border-l border-sky-100 pl-1 sm:pl-2">
        <button
          id="nav-tab-patients-mobile"
          type="button"
          onClick={() => {
            onSelectView('patients');
            onSelectPatientStatus?.('all');
          }}
          className={`p-1.5 rounded-xl text-xs cursor-pointer transition-colors shrink-0 ${
            currentView === 'patients' ? 'bg-sky-100 text-sky-800 font-bold shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
          title="Patients Directory"
          aria-label="Patients Directory"
        >
          <Users className="w-4 h-4 text-sky-600" />
        </button>

        <button
          id="nav-tab-monthly-mobile"
          type="button"
          onClick={() => onSelectView('monthly')}
          className={`p-1.5 rounded-xl text-xs cursor-pointer transition-colors shrink-0 ${
            currentView === 'monthly' ? 'bg-sky-100 text-sky-800 font-bold shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
          title="Monthly Analytics"
          aria-label="Monthly Analytics"
        >
          <Calendar className="w-4 h-4 text-sky-600" />
        </button>

        <button
          id="nav-tab-fees-mobile"
          type="button"
          onClick={() => onSelectView('fees')}
          className={`p-1.5 rounded-xl text-xs cursor-pointer transition-colors shrink-0 ${
            currentView === 'fees' ? 'bg-sky-100 text-sky-800 font-bold shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
          title="Fee Collected"
          aria-label="Fee Collected"
        >
          <IndianRupee className="w-4 h-4 text-emerald-600" />
        </button>

        <button
          id="nav-tab-itreturn-mobile"
          type="button"
          onClick={() => onSelectView('itreturn')}
          className={`p-1.5 rounded-xl text-xs cursor-pointer transition-colors shrink-0 ${
            currentView === 'itreturn' ? 'bg-sky-100 text-sky-800 font-bold shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
          title="IT Return"
          aria-label="IT Return"
        >
          <FileSpreadsheet className="w-4 h-4 text-amber-600" />
        </button>

        <WaterBackupNavButton
          isMobile
          isActive={currentView === 'backup'}
          onClick={() => onSelectView('backup')}
        />

        <button
          id="nav-tab-locum-mobile"
          type="button"
          onClick={() => onSelectView('locum')}
          className={`p-1.5 rounded-xl text-xs cursor-pointer transition-colors shrink-0 ${
            currentView === 'locum'
              ? 'bg-sky-100 text-sky-800 font-bold ring-1 ring-sky-300 shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
          title="Locum Tenens Physiotherapists"
          aria-label="Locum Tenens Physiotherapists"
        >
          <UserCheck className="w-4 h-4 text-sky-700" />
        </button>
      </div>
    </header>
  );
};

