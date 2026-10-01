import React, { useState, useEffect } from 'react';
import { Cpu, Calendar, FileText, ShieldAlert, Bell, ArrowRight, CheckCircle2, Plus } from 'lucide-react';
import { dashboardService, applianceService, scheduleService, warrantyService, documentService } from '../services/api';
import AuthRequiredState from '../components/AuthRequiredState';

export default function DashboardPage({ setActivePage, onSelectAppliance, openAddApplianceModal, currentUser, openAuthModal }) {
  const [stats, setStats] = useState({
    total_appliances: 0,
    upcoming_services: 0,
    total_documents: 0,
    expiring_warranties: 0,
    total_reminders: 0
  });
  const [appliances, setAppliances] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [warranties, setWarranties] = useState([]);

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <AuthRequiredState
        title="Sign in to View Dashboard"
        pageName="your Dashboard"
        openAuthModal={openAuthModal}
        setActivePage={setActivePage}
      />
    );
  }

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, appsRes, schedRes, warRes, docRes] = await Promise.all([
        dashboardService.getStats().catch(() => null),
        applianceService.getAll().catch(() => []),
        scheduleService.getAll().catch(() => []),
        warrantyService.getAll().catch(() => []),
        documentService.getAll().catch(() => [])
      ]);
      if (statsRes) setStats(statsRes);
      if (appsRes) setAppliances(appsRes);
      if (schedRes) setSchedules(schedRes);
      if (warRes) setWarranties(warRes);
      if (docRes) setDocuments(docRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async (scheduleId) => {
    try {
      await scheduleService.markCompleted(scheduleId);
      await loadData();
    } catch (e) {
      console.error('Failed to mark schedule completed:', e);
    }
  };

  const pendingSchedules = schedules.filter(s => s.status !== 'Completed');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 bg-white text-gray-900">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-black">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Your home, all in one place.</p>
        </div>

        <button
          onClick={openAddApplianceModal}
          className="bg-black hover:bg-gray-800 text-white text-xs font-semibold px-6 py-3 rounded-full transition-all shadow-xs flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Appliance
        </button>
      </div>

      {/* SUMMARY STATS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs hover:border-gray-300 transition-all">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total</span>
            <Cpu className="w-4 h-4 text-black" />
          </div>
          <p className="text-3xl font-extrabold text-black">{stats.total_appliances}</p>
          <p className="text-[11px] font-medium text-gray-500 mt-1">Appliances</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs hover:border-gray-300 transition-all">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Services</span>
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-3xl font-extrabold text-black">{stats.upcoming_services}</p>
          <p className="text-[11px] font-medium text-gray-500 mt-1">Upcoming</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs hover:border-gray-300 transition-all">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Vault</span>
            <FileText className="w-4 h-4 text-black" />
          </div>
          <p className="text-3xl font-extrabold text-black">{stats.total_documents}</p>
          <p className="text-[11px] font-medium text-gray-500 mt-1">Documents</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs hover:border-gray-300 transition-all">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Warranty</span>
            <ShieldAlert className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-3xl font-extrabold text-black">{stats.expiring_warranties}</p>
          <p className="text-[11px] font-medium text-gray-500 mt-1">Expiring Soon</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs hover:border-gray-300 transition-all">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Alerts</span>
            <Bell className="w-4 h-4 text-black" />
          </div>
          <p className="text-3xl font-extrabold text-black">{stats.total_reminders}</p>
          <p className="text-[11px] font-medium text-gray-500 mt-1">Active Reminders</p>
        </div>
      </div>

      {/* TWO COLUMN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-6 space-y-8">
          
          {/* UPCOMING SERVICES */}
          <div className="bg-white rounded-3xl border border-gray-200/90 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-extrabold text-base tracking-wider text-black uppercase">Upcoming Services</h3>
              <button onClick={() => setActivePage('services')} className="text-xs font-bold text-black hover:underline cursor-pointer">
                View Schedule →
              </button>
            </div>

            <div className="space-y-3">
              {pendingSchedules.length === 0 ? (
                <p className="text-xs text-gray-400 py-4 text-center">No pending service schedules.</p>
              ) : (
                pendingSchedules.map(sched => (
                  <div key={sched.id} className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-black">{sched.appliance_name}</span>
                      <p className="text-xs text-gray-500">{sched.service_type}</p>
                      <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 mt-1 inline-block">
                        Due: {sched.next_service_date}
                      </span>
                    </div>
                    <button
                      onClick={() => handleMarkComplete(sched.id)}
                      className="bg-black hover:bg-gray-800 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
                    >
                      Mark Completed
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>


        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-6 space-y-8">
          
          {/* WARRANTY STATUS */}
          <div className="bg-white rounded-3xl border border-gray-200/90 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-extrabold text-base tracking-wider text-black uppercase">Warranty Status</h3>
              <button onClick={() => setActivePage('warranty')} className="text-xs font-bold text-black hover:underline cursor-pointer">
                Warranty Vault →
              </button>
            </div>

            <div className="space-y-3">
              {warranties.length === 0 ? (
                <p className="text-xs text-gray-400 py-4 text-center">No warranties registered.</p>
              ) : (
                warranties.slice(0, 3).map(war => (
                  <div key={war.id} className="p-4 rounded-2xl border border-gray-100 bg-white flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-gray-900">{war.appliance_name}</span>
                      <p className="text-xs text-gray-500">Coverage ends {war.end_date}</p>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                      war.status === 'Active' ? 'text-green-700 bg-green-50 border-green-200' : 'text-amber-700 bg-amber-50 border-amber-200'
                    }`}>
                      {war.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* RECENT DOCUMENTS */}
          <div className="bg-white rounded-3xl border border-gray-200/90 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-extrabold text-base tracking-wider text-black uppercase">Recent Documents</h3>
              <button onClick={() => setActivePage('documents')} className="text-xs font-bold text-black hover:underline cursor-pointer">
                Document Vault →
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {documents.slice(0, 3).map(doc => (
                <div
                  key={doc.id}
                  onClick={() => setActivePage('documents')}
                  className="p-3 rounded-2xl border border-gray-200 hover:border-black cursor-pointer text-center bg-gray-50/50 hover:bg-white transition-all group"
                >
                  <FileText className="w-6 h-6 mx-auto mb-1 text-gray-400 group-hover:text-black" />
                  <p className="text-xs font-bold text-gray-900 truncate">{doc.doc_type}</p>
                  <p className="text-[10px] text-gray-400 truncate">{doc.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* YOUR APPLIANCES HORIZONTAL GRID */}
      <div className="space-y-4 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-extrabold tracking-tight text-black">Your Appliances</h2>
          <button onClick={() => setActivePage('appliances')} className="text-xs font-bold text-black hover:underline cursor-pointer">
            Manage All Appliances →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {appliances.map(app => (
            <div
              key={app.id}
              onClick={() => onSelectAppliance(app.id)}
              className="bg-white rounded-3xl border border-gray-200/90 p-4 hover-lift cursor-pointer transition-all flex flex-col justify-between"
            >
              <div>
                <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gray-50 mb-3 border border-gray-100">
                  <img src={app.image_url} alt={app.name} className="w-full h-full object-cover" />
                </div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{app.category}</p>
                <h4 className="font-bold text-base text-black mt-0.5">{app.name}</h4>
                <p className="text-xs text-gray-500">{app.location}</p>
              </div>

              <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  app.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                }`}>
                  {app.status}
                </span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
