import React, { useState, useEffect } from 'react';
import { Calendar, History, Plus, CheckCircle2, Clock, Mail, AlertCircle } from 'lucide-react';
import { scheduleService, serviceHistoryService, reminderService } from '../services/api';
import AuthRequiredState from '../components/AuthRequiredState';

export default function ServicesPage({ openAddScheduleModal, onSelectAppliance, currentUser, openAuthModal, setActivePage }) {
  const [activeSection, setActiveSection] = useState('schedules'); // schedules or history
  const [schedules, setSchedules] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emailStatus, setEmailStatus] = useState(null);
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    if (currentUser) {
      loadAll();
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <AuthRequiredState
        title="Sign in to View Services & Maintenance"
        pageName="Services & Maintenance Schedules"
        openAuthModal={openAuthModal}
        setActivePage={setActivePage}
      />
    );
  }

  const loadAll = async () => {
    setLoading(true);
    try {
      const [sRes, hRes] = await Promise.all([
        scheduleService.getAll().catch(() => []),
        serviceHistoryService.getAll().catch(() => [])
      ]);
      setSchedules(sRes);
      setHistory(hRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async (scheduleId) => {
    try {
      await scheduleService.markCompleted(scheduleId);
      loadAll();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendEmailAlerts = async () => {
    setSendingEmail(true);
    setEmailStatus(null);
    try {
      const res = await reminderService.triggerEmailReminders();
      setEmailStatus({
        type: 'success',
        message: `Service alert emails processed! Notifications sent to ${currentUser.email || 'your email'}.`
      });
    } catch (e) {
      setEmailStatus({
        type: 'error',
        message: 'Could not send service emails. Please check your account email.'
      });
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-white text-gray-900">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-black">Services & Maintenance</h1>
          <p className="text-gray-500 text-sm mt-1">Set maintenance schedules and track complete appliance service history.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleSendEmailAlerts}
            disabled={sendingEmail}
            className="bg-gray-100 hover:bg-gray-200 text-gray-900 text-xs font-semibold px-5 py-3 rounded-full transition-all flex items-center gap-2 cursor-pointer border border-gray-200"
            title={`Send scheduled service alerts to ${currentUser.email}`}
          >
            <Mail className="w-4 h-4 text-blue-600" />
            {sendingEmail ? 'Sending Email...' : 'Send Service Alerts to Email'}
          </button>

          <button
            onClick={openAddScheduleModal}
            className="bg-black hover:bg-gray-800 text-white text-xs font-semibold px-6 py-3 rounded-full transition-all shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <Calendar className="w-4 h-4" /> Schedule Maintenance
          </button>
        </div>
      </div>

      {emailStatus && (
        <div className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
          emailStatus.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {emailStatus.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />}
          <span>{emailStatus.message}</span>
        </div>
      )}

      {/* Subnav */}
      <div className="flex space-x-2 border-b border-gray-100 pb-2">
        <button
          onClick={() => setActiveSection('schedules')}
          className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeSection === 'schedules' ? 'bg-black text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" /> Maintenance Schedules ({schedules.length})
        </button>

        <button
          onClick={() => setActiveSection('history')}
          className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeSection === 'history' ? 'bg-black text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
        >
          <History className="w-3.5 h-3.5" /> Service History ({history.length})
        </button>
      </div>

      {/* SECTION 1: SCHEDULES */}
      {activeSection === 'schedules' && (
        <div className="space-y-4">
          {loading ? (
            <div className="py-20 text-center text-sm text-gray-400">Loading maintenance schedules...</div>
          ) : schedules.length === 0 ? (
            <div className="py-20 text-center bg-gray-50 rounded-3xl border border-gray-100">
              <Calendar className="w-10 h-10 mx-auto text-gray-300 mb-2" />
              <p className="font-bold text-gray-700">No maintenance schedules set</p>
              <p className="text-xs text-gray-400 mt-1">Add routine service schedules for your appliances.</p>
            </div>
          ) : (
            schedules.map(s => (
              <div key={s.id} className="bg-white rounded-3xl border border-gray-200/90 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover-lift transition-all">
                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{s.appliance_name}</span>
                  <h3 className="text-lg font-bold text-black mt-0.5">{s.service_type}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Frequency: {s.frequency} • Next Due: <span className="font-bold text-gray-900">{s.next_service_date}</span></p>
                  {s.notes && <p className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-xl mt-2">{s.notes}</p>}
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                    s.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {s.status}
                  </span>
                  {s.status !== 'Completed' && (
                    <button
                      onClick={() => handleMarkComplete(s.id)}
                      className="bg-black hover:bg-gray-800 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
                    >
                      Mark Completed
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* SECTION 2: HISTORY */}
      {activeSection === 'history' && (
        <div className="space-y-4">
          {loading ? (
            <div className="py-20 text-center text-sm text-gray-400">Loading service history...</div>
          ) : history.length === 0 ? (
            <div className="py-20 text-center bg-gray-50 rounded-3xl border border-gray-100">
              <History className="w-10 h-10 mx-auto text-gray-300 mb-2" />
              <p className="font-bold text-gray-700">No service history logs yet</p>
              <p className="text-xs text-gray-400 mt-1">Completed maintenance schedules will be logged here automatically.</p>
            </div>
          ) : (
            history.map(h => (
              <div key={h.id} className="bg-white rounded-3xl border border-gray-200/90 p-6 space-y-2 hover-lift transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-gray-400">{h.service_date}</span>
                  <span className="text-xs font-bold text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full border border-green-200">
                    {h.status}
                  </span>
                </div>

                <h3 className="font-bold text-base text-black">{h.service_type} ({h.appliance_name})</h3>
                <p className="text-xs text-gray-600">{h.description}</p>
                
                <div className="pt-2 text-xs text-gray-400 flex items-center justify-between">
                  <span>Provider: {h.provider}</span>
                  <span>Cost: ${h.cost || '0.00'}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
}
