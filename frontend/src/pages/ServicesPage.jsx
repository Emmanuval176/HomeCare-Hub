import React, { useState, useEffect } from 'react';
import { Calendar, History, Plus, CheckCircle2, Clock } from 'lucide-react';
import { scheduleService, serviceHistoryService } from '../services/api';

export default function ServicesPage({ openAddScheduleModal, onSelectAppliance }) {
  const [activeSection, setActiveSection] = useState('schedules'); // schedules or history
  const [schedules, setSchedules] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-white text-gray-900">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-black">Services & Maintenance</h1>
          <p className="text-gray-500 text-sm mt-1">Set maintenance schedules and track complete appliance service history.</p>
        </div>

        <button
          onClick={openAddScheduleModal}
          className="bg-black hover:bg-gray-800 text-white text-xs font-semibold px-6 py-3 rounded-full transition-all shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Calendar className="w-4 h-4" /> Schedule Maintenance
        </button>
      </div>

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
          {schedules.length === 0 ? (
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
          {history.length === 0 ? (
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
