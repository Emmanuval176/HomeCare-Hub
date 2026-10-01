import React, { useState, useEffect } from 'react';
import { ArrowLeft, Cpu, FileText, Shield, Calendar, History, CheckCircle2, Upload, AlertCircle } from 'lucide-react';
import { applianceService, scheduleService } from '../services/api';
import AuthRequiredState from '../components/AuthRequiredState';

export default function ApplianceDetailPage({ applianceId, onBack, openOCRModal, openAddScheduleModal, currentUser, openAuthModal, setActivePage }) {
  const [appliance, setAppliance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');

  useEffect(() => {
    if (applianceId && currentUser) {
      loadAppliance();
    }
  }, [applianceId, currentUser]);

  if (!currentUser) {
    return (
      <AuthRequiredState
        title="Sign in to View Appliance Details"
        pageName="appliance details"
        openAuthModal={openAuthModal}
        setActivePage={setActivePage}
      />
    );
  }

  const loadAppliance = async () => {
    setLoading(true);
    try {
      const data = await applianceService.getById(applianceId);
      setAppliance(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async (scheduleId) => {
    try {
      await scheduleService.markCompleted(scheduleId);
      loadAppliance();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-sm text-gray-400">Loading appliance details...</div>;
  }

  if (!appliance) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center space-y-4">
        <p className="text-gray-600 font-bold">Appliance not found.</p>
        <button onClick={onBack} className="text-xs font-semibold text-black underline cursor-pointer">Back to Appliances</button>
      </div>
    );
  }

  const tabs = [
    { name: 'Overview', icon: Cpu },
    { name: 'Documents', icon: FileText, count: appliance.documents?.length || 0 },
    { name: 'Warranty', icon: Shield, count: appliance.warranties?.length || 0 },
    { name: 'Service Schedule', icon: Calendar, count: appliance.service_schedules?.length || 0 },
    { name: 'Service History', icon: History, count: appliance.service_histories?.length || 0 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-white text-gray-900">
      
      {/* Back Button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-black transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Appliances
      </button>

      {/* Appliance Header Card */}
      <div className="bg-white rounded-3xl border border-gray-200/90 p-8 shadow-2xs grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Image */}
        <div className="lg:col-span-4 aspect-[4/3] rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
          <img
            src={appliance.image_url || 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=800&q=80'}
            alt={appliance.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right Info */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{appliance.category} • {appliance.brand}</span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-black tracking-tight">{appliance.name}</h1>
            </div>

            <span className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border shadow-2xs ${
              appliance.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              {appliance.status}
            </span>
          </div>

          {/* Key Quick Metadata */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-gray-100 text-xs">
            <div>
              <span className="text-gray-400 font-medium block">Model Number</span>
              <span className="font-bold text-gray-900">{appliance.model_number || 'N/A'}</span>
            </div>
            <div>
              <span className="text-gray-400 font-medium block">Serial Number</span>
              <span className="font-bold text-gray-900">{appliance.serial_number || 'N/A'}</span>
            </div>
            <div>
              <span className="text-gray-400 font-medium block">Purchase Date</span>
              <span className="font-bold text-gray-900">{appliance.purchase_date || 'N/A'}</span>
            </div>
            <div>
              <span className="text-gray-400 font-medium block">Location</span>
              <span className="font-bold text-gray-900">{appliance.location}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={openAddScheduleModal}
              className="bg-black hover:bg-gray-800 text-white text-xs font-semibold px-5 py-2.5 rounded-full transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Calendar className="w-4 h-4" /> Schedule Maintenance
            </button>
            <button
              onClick={openOCRModal}
              className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 text-xs font-semibold px-5 py-2.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-4 h-4" /> Upload Document
            </button>
          </div>
        </div>
      </div>

      {/* CONNECTED TABS NAVIGATION */}
      <div className="border-b border-gray-200 flex space-x-2 overflow-x-auto no-scrollbar">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.name;
          return (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`px-5 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-black hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4 text-gray-400" />
              {tab.name}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-gray-100 font-bold text-gray-700">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENTS */}
      <div className="pt-4">
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'Overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-3xl border border-gray-200/90 p-6 space-y-4">
              <h3 className="font-extrabold text-base tracking-wider text-black uppercase">Technical Specifications</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Brand</span>
                  <span className="font-bold text-gray-900">{appliance.brand}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Category</span>
                  <span className="font-bold text-gray-900">{appliance.category}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Model Number</span>
                  <span className="font-bold text-gray-900">{appliance.model_number}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Serial Number</span>
                  <span className="font-bold text-gray-900">{appliance.serial_number}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Purchase Price</span>
                  <span className="font-bold text-gray-900">${appliance.purchase_price || '1,299.00'}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-200/90 p-6 space-y-4">
              <h3 className="font-extrabold text-base tracking-wider text-black uppercase">Appliance Health & Summary</h3>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2 text-xs">
                <p className="font-bold text-gray-900">Warranty Coverage:</p>
                <p className="text-gray-600">
                  {appliance.warranties?.length > 0 ? appliance.warranties[0].warranty_type : '2-Year Standard Manufacturer Warranty'}
                </p>
                <span className="inline-block text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 mt-1">
                  Status: Expiring Soon
                </span>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2 text-xs">
                <p className="font-bold text-gray-900">Next Scheduled Maintenance:</p>
                <p className="text-gray-600">Routine Maintenance (Every 6 months)</p>
                <p className="text-[10px] font-semibold text-gray-500">Due: Oct 06, 2026</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DOCUMENTS */}
        {activeTab === 'Documents' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base tracking-wider text-black uppercase">Associated Documents</h3>
              <button onClick={openOCRModal} className="text-xs font-semibold text-black bg-gray-100 px-4 py-2 rounded-full hover:bg-gray-200 cursor-pointer">
                + Add Document / OCR
              </button>
            </div>

            {appliance.documents?.length === 0 ? (
              <div className="py-12 text-center text-sm text-gray-400">No documents attached yet.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {appliance.documents?.map(doc => (
                  <div key={doc.id} className="p-5 bg-white rounded-3xl border border-gray-200/90 space-y-3">
                    <FileText className="w-8 h-8 text-black" />
                    <div>
                      <h4 className="font-bold text-sm text-gray-900">{doc.title}</h4>
                      <p className="text-xs text-gray-500">{doc.doc_type} • Uploaded {doc.upload_date}</p>
                    </div>
                    {doc.ocr_extracted_text && (
                      <p className="text-[11px] text-gray-600 bg-gray-50 p-2 rounded-xl font-mono truncate">
                        {doc.ocr_extracted_text}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: WARRANTY */}
        {activeTab === 'Warranty' && (
          <div className="bg-white rounded-3xl border border-gray-200/90 p-8 space-y-6 max-w-3xl">
            <h3 className="font-extrabold text-base tracking-wider text-black uppercase">Warranty Details</h3>
            <div className="p-6 bg-amber-50/50 rounded-2xl border border-amber-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-lg text-amber-900">LG Care Warranty</h4>
                  <p className="text-xs text-amber-800">Standard 2-Year Coverage</p>
                </div>
                <span className="text-xs font-bold text-amber-700 bg-white px-3 py-1 rounded-full border border-amber-200">
                  Expiring Soon (20 Days)
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs pt-2 border-t border-amber-200/60">
                <div>
                  <span className="text-gray-500">Warranty Start Date</span>
                  <p className="font-bold text-gray-900">15 September 2026</p>
                </div>
                <div>
                  <span className="text-gray-500">Warranty End Date</span>
                  <p className="font-bold text-gray-900">20 October 2026</p>
                </div>
              </div>

              <p className="text-xs text-amber-900 bg-white p-3 rounded-xl border border-amber-200/80">
                Terms: Comprehensive coverage including compressor, sealed system, and electronic circuit sensors.
              </p>
            </div>
          </div>
        )}

        {/* TAB 4: SERVICE SCHEDULE */}
        {activeTab === 'Service Schedule' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base tracking-wider text-black uppercase">Maintenance Schedule</h3>
              <button onClick={openAddScheduleModal} className="text-xs font-semibold text-black bg-gray-100 px-4 py-2 rounded-full hover:bg-gray-200 cursor-pointer">
                + Create Schedule
              </button>
            </div>

            {appliance.service_schedules?.map(sched => (
              <div key={sched.id} className="p-5 bg-white rounded-3xl border border-gray-200/90 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-gray-900">{sched.service_type}</h4>
                  <p className="text-xs text-gray-500">Frequency: {sched.frequency} • Next Due: {sched.next_service_date}</p>
                  {sched.notes && <p className="text-xs text-gray-600 mt-1">{sched.notes}</p>}
                </div>
                <button
                  onClick={() => handleMarkComplete(sched.id)}
                  className="bg-black hover:bg-gray-800 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer"
                >
                  Mark Completed
                </button>
              </div>
            ))}
          </div>
        )}

        {/* TAB 5: SERVICE HISTORY */}
        {activeTab === 'Service History' && (
          <div className="space-y-4">
            <h3 className="font-extrabold text-base tracking-wider text-black uppercase">Complete Service History</h3>

            <div className="relative border-l-2 border-gray-200 ml-4 space-y-6 py-2">
              <div className="relative pl-6">
                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white" />
                <span className="text-xs font-mono text-gray-400">01 April 2026</span>
                <h4 className="font-bold text-sm text-gray-900">General Maintenance</h4>
                <p className="text-xs text-gray-600 mt-0.5">Routine multi-point check, condenser coils vacuumed, temperature sensor calibrated.</p>
                <span className="inline-block text-[10px] font-semibold text-gray-500 mt-1">Cost: $85.00 • Authorized Service Center</span>
              </div>

              <div className="relative pl-6">
                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white" />
                <span className="text-xs font-mono text-gray-400">15 July 2026</span>
                <h4 className="font-bold text-sm text-gray-900">Periodic Maintenance</h4>
                <p className="text-xs text-gray-600 mt-0.5">Thermostat sensor checked and fresh food section fan motor lubricated.</p>
                <span className="inline-block text-[10px] font-semibold text-gray-500 mt-1">Cost: $140.00 • Certified Technician</span>
              </div>

              <div className="relative pl-6">
                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white" />
                <span className="text-xs font-mono text-gray-400">01 October 2026</span>
                <h4 className="font-bold text-sm text-gray-900">Filter Replacement & Coil Cleaning</h4>
                <p className="text-xs text-gray-600 mt-0.5">Multi-point seasonal check and internal deep cleaning completed.</p>
                <span className="inline-block text-[10px] font-semibold text-green-700 mt-1">Status: Completed</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
