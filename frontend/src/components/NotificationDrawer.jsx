import React, { useState, useEffect } from 'react';
import { Bell, X, Check, Calendar, AlertTriangle, ShieldAlert, FileText, CheckCheck, Mail, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { reminderService } from '../services/api';

export default function NotificationDrawer({ isOpen, onClose, setActivePage, currentUser }) {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emailStatus, setEmailStatus] = useState(null);
  const [sendingEmail, setSendingEmail] = useState(false);

  const fetchReminders = async () => {
    try {
      const data = await reminderService.getAll();
      setReminders(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchReminders();
      setEmailStatus(null);
    }
  }, [isOpen]);

  const handleMarkRead = async (id) => {
    try {
      await reminderService.markRead(id);
      setReminders(prev => prev.map(r => r.id === id ? { ...r, is_read: true } : r));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendEmailReminders = async () => {
    setSendingEmail(true);
    setEmailStatus(null);
    try {
      const res = await reminderService.triggerEmailReminders();
      setEmailStatus({
        type: 'success',
        message: `Processed reminders! Alerts sent to ${currentUser?.email || 'your email'}.`
      });
      fetchReminders();
    } catch (e) {
      setEmailStatus({
        type: 'error',
        message: 'Could not send reminder emails. Please check account details.'
      });
    } finally {
      setSendingEmail(false);
    }
  };

  const handleSendTestEmail = async () => {
    setSendingEmail(true);
    setEmailStatus(null);
    try {
      const res = await reminderService.sendTestEmailAlert();
      setEmailStatus({
        type: 'success',
        message: `Sample Service & Warranty emails dispatched to ${currentUser?.email || 'your email'}!`
      });
    } catch (e) {
      setEmailStatus({
        type: 'error',
        message: 'Failed to send test email.'
      });
    } finally {
      setSendingEmail(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-md h-full shadow-2xl border-l border-gray-100 flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 leading-tight">Reminders & Alerts</h3>
              <p className="text-xs text-gray-500">Service & warranty notification center</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-black rounded-full hover:bg-gray-100 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Email Notification Sync Banner */}
        <div className="p-4 bg-gray-50 border-b border-gray-100 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500 font-medium">Notification Recipient:</span>
            <span className="font-bold text-gray-900 truncate max-w-[200px]">{currentUser?.email || 'Registered email'}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleSendEmailReminders}
              disabled={sendingEmail}
              className="bg-black hover:bg-gray-800 text-white text-[11px] font-semibold py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {sendingEmail ? 'Sending...' : 'Send Due Reminders'}
            </button>

            <button
              onClick={handleSendTestEmail}
              disabled={sendingEmail}
              className="bg-white hover:bg-gray-100 text-gray-900 text-[11px] font-semibold py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-gray-200 shadow-2xs disabled:opacity-50"
            >
              <Mail className="w-3.5 h-3.5 text-blue-600" />
              Test Email Alert
            </button>
          </div>

          {emailStatus && (
            <div className={`p-2.5 rounded-xl text-[11px] font-medium flex items-center gap-2 ${
              emailStatus.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {emailStatus.type === 'success' ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
              <span>{emailStatus.message}</span>
            </div>
          )}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {loading && <div className="py-8 text-center text-sm text-gray-400">Loading reminders...</div>}

          {!loading && reminders.length === 0 && (
            <div className="py-12 text-center text-gray-400 text-sm">
              <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              No active notifications
            </div>
          )}

          {!loading && reminders.map(rem => (
            <div
              key={rem.id}
              className={`p-4 rounded-2xl border transition-all ${
                rem.is_read ? 'bg-gray-50 border-gray-100 text-gray-600' : 'bg-white border-blue-100 shadow-xs text-gray-900'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-xl mt-0.5 ${
                    rem.reminder_type === 'Upcoming Service' ? 'bg-blue-50 text-blue-600' :
                    rem.reminder_type === 'Warranty Expiry' ? 'bg-amber-50 text-amber-600' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {rem.reminder_type === 'Upcoming Service' ? <Calendar className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">{rem.title}</h4>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{rem.message}</p>
                    <span className="inline-block mt-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                      Due: {rem.due_date}
                    </span>
                  </div>
                </div>

                {!rem.is_read && (
                  <button
                    onClick={() => handleMarkRead(rem.id)}
                    className="p-1.5 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg cursor-pointer"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 text-center">
          <button
            onClick={() => { setActivePage('services'); onClose(); }}
            className="text-xs font-semibold text-black hover:underline cursor-pointer"
          >
            Manage All Service Schedules →
          </button>
        </div>
      </div>
    </div>
  );
}
