import React, { useState, useEffect } from 'react';
import { Shield, ShieldCheck, ShieldAlert, Clock, Plus } from 'lucide-react';
import { warrantyService } from '../services/api';

export default function WarrantiesPage({ onSelectAppliance }) {
  const [warranties, setWarranties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    warrantyService.getAll()
      .then(data => setWarranties(data))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const filtered = warranties.filter(w => {
    if (activeTab === 'All') return true;
    return w.status === activeTab;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-white text-gray-900">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-black">Warranty Management</h1>
          <p className="text-gray-500 text-sm mt-1">Track active, expiring, and expired appliance warranties.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-gray-100 pb-2">
        {['All', 'Active', 'Expiring Soon', 'Expired'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === tab ? 'bg-black text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Cards */}
      {loading ? (
        <div className="py-20 text-center text-sm text-gray-400">Loading warranty records...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(w => (
            <div
              key={w.id}
              onClick={() => onSelectAppliance(w.appliance)}
              className="bg-white rounded-3xl border border-gray-200/90 p-6 hover-lift cursor-pointer space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-gray-400">{w.provider}</span>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    w.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' :
                    w.status === 'Expiring Soon' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    {w.status}
                  </span>
                </div>

                <h3 className="font-bold text-lg text-black">{w.appliance_brand} {w.appliance_name}</h3>
                <p className="text-xs text-gray-500 mt-1">{w.warranty_type}</p>

                <div className="grid grid-cols-2 gap-2 text-xs pt-3 mt-3 border-t border-gray-100">
                  <div>
                    <span className="text-gray-400 font-medium block">Start Date</span>
                    <span className="font-bold text-gray-900">{w.start_date}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-medium block">End Date</span>
                    <span className="font-bold text-gray-900">{w.end_date}</span>
                  </div>
                </div>

                {w.terms && (
                  <p className="text-[11px] text-gray-600 bg-gray-50 p-2.5 rounded-xl mt-3 line-clamp-2">
                    {w.terms}
                  </p>
                )}
              </div>

              <div className="pt-2 text-xs text-black font-semibold hover:underline">
                View Appliance connected profile →
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
