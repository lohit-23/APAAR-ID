import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import DemoBanner from './components/DemoBanner';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Toast from './components/Toast';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import StudentDashboard from './pages/StudentDashboard';
import AcademicRecordsPage from './pages/AcademicRecordsPage';
import CredentialWalletPage from './pages/CredentialWalletPage';
import ConsentManagerPage from './pages/ConsentManagerPage';
import AiInsightsPage from './pages/AiInsightsPage';
import InstitutionDashboard from './pages/InstitutionDashboard';
import IssueCredentialPage from './pages/IssueCredentialPage';
import StudentDirectoryPage from './pages/StudentDirectoryPage';
import BulkUploadPage from './pages/BulkUploadPage';
import DataQualityPage from './pages/DataQualityPage';
import VerifierPortalPage from './pages/VerifierPortalPage';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import AuditLogsPage from './pages/AuditLogsPage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';

function MainApp() {
  const { role } = useAuth();
  const [currentRoute, setCurrentRoute] = useState('landing');
  const [routeParams, setRouteParams] = useState({});

  // Check URL search parameters on mount (e.g. for QR codes or share links)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get('id');
    const tokenParam = params.get('token');
    
    if (idParam || tokenParam) {
      setCurrentRoute('verifier-portal');
      setRouteParams({ searchId: idParam || tokenParam });
    }
  }, []);

  const handleNavigate = (route, params = {}) => {
    setCurrentRoute(route);
    setRouteParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderCurrentPage = () => {
    switch (currentRoute) {
      case 'landing':
        return <LandingPage onNavigate={handleNavigate} />;
      case 'login':
        return <LoginPage onNavigate={handleNavigate} />;
      // Student Routes
      case 'student-dashboard':
        return <StudentDashboard onNavigate={handleNavigate} />;
      case 'student-records':
        return <AcademicRecordsPage onNavigate={handleNavigate} />;
      case 'student-wallet':
        return <CredentialWalletPage onNavigate={handleNavigate} />;
      case 'student-consent':
        return <ConsentManagerPage onNavigate={handleNavigate} />;
      case 'student-insights':
        return <AiInsightsPage onNavigate={handleNavigate} />;
      // Institution Routes
      case 'institution-dashboard':
        return <InstitutionDashboard onNavigate={handleNavigate} />;
      case 'institution-issue':
        return <IssueCredentialPage onNavigate={handleNavigate} />;
      case 'institution-students':
        return <StudentDirectoryPage onNavigate={handleNavigate} />;
      case 'institution-bulk':
        return <BulkUploadPage onNavigate={handleNavigate} />;
      case 'institution-quality':
        return <DataQualityPage onNavigate={handleNavigate} />;
      // Verifier Routes
      case 'verifier-portal':
      case 'verifier-logs':
        return <VerifierPortalPage initialSearchId={routeParams.searchId} onNavigate={handleNavigate} />;
      // Super Admin Routes
      case 'admin-dashboard':
      case 'admin-institutions':
      case 'admin-health':
        return <SuperAdminDashboard onNavigate={handleNavigate} />;
      case 'admin-audit':
        return <AuditLogsPage onNavigate={handleNavigate} />;
      // Common Routes
      case 'notifications':
        return <NotificationsPage onNavigate={handleNavigate} />;
      case 'settings':
        return <SettingsPage onNavigate={handleNavigate} />;
      default:
        return <LandingPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Prototype Disclaimer Banner */}
      <DemoBanner />

      {/* Main Navbar */}
      <Navbar currentRoute={currentRoute} setCurrentRoute={handleNavigate} />

      {/* Dynamic Main Page Content */}
      <main className="flex-1">
        {renderCurrentPage()}
      </main>

      {/* Toast Notification Container */}
      <Toast />

      {/* Indian Ed-Tech Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
