import React, { useState } from 'react';
import {
  GraduationCap,
  Shield,
  Bell,
  User,
  Building2,
  CheckCircle2,
  SlidersHorizontal,
  ChevronDown,
  Menu,
  X,
  FileText,
  KeyRound,
  Sparkles,
  Search,
  Upload,
  Activity,
  History,
  Lock,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ currentRoute, setCurrentRoute }) {
  const { role, switchRole, user, unreadNotifsCount } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const roleConfigs = {
    student: {
      label: 'Student',
      badge: 'Aarav Sharma (DTU)',
      color: 'bg-blue-600 text-white',
      border: 'border-blue-500',
      icon: GraduationCap,
      nav: [
        { id: 'student-dashboard', label: 'Dashboard', icon: User },
        { id: 'student-records', label: 'Academic Records', icon: FileText },
        { id: 'student-wallet', label: 'Credential Wallet', icon: KeyRound },
        { id: 'student-consent', label: 'Consent Manager', icon: Lock },
        { id: 'student-insights', label: 'Prototype AI Insights', icon: Sparkles, highlight: true },
      ]
    },
    institution: {
      label: 'Institution Admin',
      badge: 'DTU (AICTE Demo)',
      color: 'bg-indigo-700 text-white',
      border: 'border-indigo-500',
      icon: Building2,
      nav: [
        { id: 'institution-dashboard', label: 'Dashboard', icon: Building2 },
        { id: 'institution-issue', label: 'Issue Credential', icon: KeyRound },
        { id: 'institution-students', label: 'Student Directory', icon: Search },
        { id: 'institution-bulk', label: 'Bulk CSV Upload', icon: Upload },
        { id: 'institution-quality', label: 'Data Quality & AI Sentinel', icon: Activity, highlight: true },
      ]
    },
    verifier: {
      label: 'Verifier Portal',
      badge: 'TCS Campus Talent',
      color: 'bg-emerald-700 text-white',
      border: 'border-emerald-500',
      icon: CheckCircle2,
      nav: [
        { id: 'verifier-portal', label: 'Public Verification', icon: CheckCircle2 },
        { id: 'verifier-logs', label: 'Verification Logs', icon: History },
      ]
    },
    super_admin: {
      label: 'Super Admin',
      badge: 'AICTE Central Node',
      color: 'bg-purple-800 text-white',
      border: 'border-purple-600',
      icon: SlidersHorizontal,
      nav: [
        { id: 'admin-dashboard', label: 'Central Analytics', icon: SlidersHorizontal },
        { id: 'admin-institutions', label: 'Institutions', icon: Building2 },
        { id: 'admin-audit', label: 'Audit Trail', icon: History },
        { id: 'admin-health', label: 'System Health', icon: Activity, highlight: true },
      ]
    }
  };

  const activeRoleConfig = roleConfigs[role] || roleConfigs.student;

  const handleRoleSelect = (newRole) => {
    switchRole(newRole);
    setRoleDropdownOpen(false);
    
    // Automatically navigate to default dashboard for new role
    if (newRole === 'student') setCurrentRoute('student-dashboard');
    else if (newRole === 'institution') setCurrentRoute('institution-dashboard');
    else if (newRole === 'verifier') setCurrentRoute('verifier-portal');
    else if (newRole === 'super_admin') setCurrentRoute('admin-dashboard');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      {/* Tricolor stripe */}
      <div className="tricolor-stripe" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentRoute('landing')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-900 to-indigo-800 text-white flex items-center justify-center shadow-md border border-blue-700/30">
              <GraduationCap className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-blue-950 font-heading">
                  ShikshaSetu<span className="text-amber-500">.AI</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-900">
                  SIH AICTE
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium hidden sm:block">
                APAAR ID Student Data Management & Verification
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => setCurrentRoute('landing')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                currentRoute === 'landing'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Overview
            </button>

            {activeRoleConfig.nav.map((item) => {
              const Icon = item.icon;
              const isActive = currentRoute === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentRoute(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    isActive
                      ? 'bg-blue-700 text-white shadow-sm font-semibold'
                      : item.highlight
                      ? 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100 font-semibold border border-indigo-200/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : item.highlight ? 'text-indigo-600' : 'text-slate-500'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Actions: Role Selector, Notifications, User */}
          <div className="flex items-center gap-2">
            {/* Role Switcher Pill */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-full transition-all text-xs font-semibold text-slate-800"
              >
                <span className={`w-2 h-2 rounded-full ${role === 'student' ? 'bg-blue-600' : role === 'institution' ? 'bg-indigo-600' : role === 'verifier' ? 'bg-emerald-600' : 'bg-purple-600'}`} />
                <span className="hidden sm:inline text-slate-500 text-[11px]">Role:</span>
                <span className="font-bold text-slate-900">{activeRoleConfig.label}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-fadeIn">
                  <div className="px-3 py-2 border-b border-slate-100 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Switch Demo Persona (Judges Mode)
                  </div>

                  {Object.entries(roleConfigs).map(([rKey, rVal]) => {
                    const RoleIcon = rVal.icon;
                    const isCurrent = role === rKey;
                    return (
                      <button
                        key={rKey}
                        onClick={() => handleRoleSelect(rKey)}
                        className={`w-full flex items-start gap-2.5 px-3 py-2 text-left text-xs transition-colors ${
                          isCurrent ? 'bg-blue-50/80 text-blue-900 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg mt-0.5 ${isCurrent ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                          <RoleIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{rVal.label}</div>
                          <div className="text-[10px] text-slate-500">{rVal.badge}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg relative transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                )}
              </button>

              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-fadeIn">
                  <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-900">Notifications</span>
                    <button
                      onClick={() => {
                        setNotifDropdownOpen(false);
                        setCurrentRoute('notifications');
                      }}
                      className="text-[11px] text-blue-700 hover:underline"
                    >
                      View All
                    </button>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                    <div className="p-3 text-xs hover:bg-slate-50 transition-colors">
                      <div className="font-semibold text-slate-800">New Consent Request: Google India</div>
                      <p className="text-[11px] text-slate-500 mt-0.5">Requested access to verify Degree and Skills.</p>
                      <span className="text-[10px] text-blue-600 font-medium mt-1 inline-block">10 mins ago</span>
                    </div>
                    <div className="p-3 text-xs hover:bg-slate-50 transition-colors">
                      <div className="font-semibold text-slate-800">Credential Verified: TCS Campus</div>
                      <p className="text-[11px] text-slate-500 mt-0.5">B.Tech Degree (CRED-DTU-2024-DEG-01) verified.</p>
                      <span className="text-[10px] text-emerald-600 font-medium mt-1 inline-block">Yesterday</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 py-3 space-y-1 animate-fadeIn">
            <button
              onClick={() => {
                setCurrentRoute('landing');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Overview / Problem Statement
            </button>
            {activeRoleConfig.nav.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentRoute(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg ${
                  currentRoute === item.id
                    ? 'bg-blue-700 text-white font-semibold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
