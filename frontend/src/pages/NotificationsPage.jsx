import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  Lock,
  Award,
  AlertTriangle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export default function NotificationsPage({ onNavigate }) {
  const { user, showToast, setUnreadNotifsCount } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [filterUnread, setFilterUnread] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.getNotifications({ unread_only: filterUnread });
      if (res?.status === 'success') {
        setNotifications(res.data);
        setUnreadNotifsCount(res.unread_count);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [filterUnread]);

  const handleMarkRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      loadNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      showToast('All notifications marked as read', 'success');
      loadNotifications();
    } catch (err) {
      showToast('Failed to mark all as read', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications & Alerts</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time feed of consent requests, newly issued credentials, and verification inquiries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterUnread(!filterUnread)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors ${
              filterUnread
                ? 'bg-blue-50 text-blue-700 border-blue-300'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {filterUnread ? 'Showing Unread' : 'Filter Unread'}
          </button>
          <button
            onClick={handleMarkAllRead}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
          >
            Mark All Read
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.map((notif) => {
          const isConsent = notif.type === 'consent';
          const isCred = notif.type === 'credential';
          const isVerify = notif.type === 'verification';

          return (
            <div
              key={notif.id}
              onClick={() => handleMarkRead(notif.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                !notif.is_read
                  ? 'bg-blue-50/40 border-blue-200 shadow-sm'
                  : 'bg-white border-slate-200 opacity-80'
              }`}
            >
              <div className={`p-2.5 rounded-xl shrink-0 ${
                isConsent ? 'bg-amber-100 text-amber-700' :
                isCred ? 'bg-blue-100 text-blue-700' :
                isVerify ? 'bg-emerald-100 text-emerald-700' : 'bg-purple-100 text-purple-700'
              }`}>
                {isConsent && <Lock className="w-5 h-5" />}
                {isCred && <Award className="w-5 h-5" />}
                {isVerify && <CheckCircle2 className="w-5 h-5" />}
                {!isConsent && !isCred && !isVerify && <AlertTriangle className="w-5 h-5" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-slate-900 text-sm">{notif.title}</h3>
                  <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                    {notif.timestamp.split('T')[0]}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>

                {notif.action_url && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onNavigate) {
                        const routeMap = {
                          '/student/consent': 'student-consent',
                          '/student/wallet': 'student-wallet',
                          '/student/records': 'student-records',
                          '/institution/quality': 'institution-quality'
                        };
                        onNavigate(routeMap[notif.action_url] || 'student-dashboard');
                      }
                    }}
                    className="mt-2 text-xs font-semibold text-blue-700 hover:underline flex items-center gap-1"
                  >
                    View Details <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
