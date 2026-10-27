import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [role, setRole] = useState(() => localStorage.getItem('shikshasetu_role') || 'student');
  const [user, setUser] = useState(null);
  const [student, setStudent] = useState(null);
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(2);

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchUserData = async (currentRole) => {
    setLoading(true);
    try {
      const res = await api.getMe(currentRole);
      if (res && res.status === 'success') {
        setUser(res.user);
        setStudent(res.student);
        setInstitution(res.institution);
      }
    } catch (err) {
      console.warn('Could not fetch user profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData(role);
    localStorage.setItem('shikshasetu_role', role);
  }, [role]);

  const switchRole = (newRole) => {
    setRole(newRole);
    localStorage.setItem('shikshasetu_role', newRole);
    const roleLabels = {
      student: 'Student (Aarav Sharma)',
      institution: 'Institution Admin (DTU)',
      verifier: 'Verifier (TCS Campus)',
      super_admin: 'Super Admin (AICTE Central)',
    };
    showToast(`Switched active persona to ${roleLabels[newRole] || newRole}`, 'success');
  };

  const resetAllDemoData = async () => {
    try {
      await api.resetDemo();
      await fetchUserData(role);
      showToast('Prototype data successfully reset to initial seed state!', 'success');
    } catch (err) {
      showToast('Failed to reset demo data', 'error');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        role,
        user,
        student,
        institution,
        loading,
        switchRole,
        showToast,
        toasts,
        removeToast,
        resetAllDemoData,
        unreadNotifsCount,
        setUnreadNotifsCount,
        refreshUserData: () => fetchUserData(role),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
