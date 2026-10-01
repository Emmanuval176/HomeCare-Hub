import React, { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import { scheduleService } from '../services/api';

export default function AddScheduleModal({ isOpen, onClose, appliances = [], onSuccess }) {
  const [applianceId, setApplianceId] = useState(appliances[0]?.id || '');
  const [serviceType, setServiceType] = useState('Routine Maintenance');
  const [nextServiceDate, setNextServiceDate] = useState('');
  const [frequency, setFrequency] = useState('Every 6 months');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!applianceId) return;
    setLoading(true);
    try {
      await scheduleService.create({
        appliance: applianceId,
        service_type: serviceType,
        next_service_date: nextServiceDate,
        frequency: frequency,
        notes: notes,
        status: 'Pending'
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 leading-tight">Schedule Maintenance</h3>
              <p className="text-xs text-gray-500">Set recurring service reminders</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-black rounded-full hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Select Appliance</label>
            <select
              value={applianceId}
              onChange={e => setApplianceId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-black bg-white"
            >
              {appliances.map(app => (
                <option key={app.id} value={app.id}>{app.brand} {app.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Service Type</label>
            <input
              type="text"
              required
              placeholder="e.g. Routine Maintenance, Filter Replacement, Deep Cleaning"
              value={serviceType}
              onChange={e => setServiceType(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Next Service Due Date</label>
            <input
              type="date"
              required
              value={nextServiceDate}
              onChange={e => setNextServiceDate(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Frequency</label>
            <select
              value={frequency}
              onChange={e => setFrequency(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-black bg-white"
            >
              <option value="Monthly">Monthly</option>
              <option value="Every 3 months">Every 3 months</option>
              <option value="Every 6 months">Every 6 months</option>
              <option value="Yearly">Yearly</option>
              <option value="Custom">Custom</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Notes & Checklist</label>
            <textarea
              rows={2}
              placeholder="e.g. Check compressor coils, inspect drain tube."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full p-3.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-black"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-semibold text-gray-600 hover:text-black"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-black hover:bg-gray-800 text-white font-semibold py-2.5 px-6 rounded-2xl transition-all text-sm shadow-sm"
            >
              {loading ? 'Creating...' : 'Create Schedule →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
