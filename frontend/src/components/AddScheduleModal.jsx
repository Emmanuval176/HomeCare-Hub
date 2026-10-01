import React, { useState, useEffect } from 'react';
import { X, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';
import { scheduleService, applianceService } from '../services/api';

export default function AddScheduleModal({ isOpen, onClose, appliances = [], defaultApplianceId = null, onSuccess }) {
  const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [localAppliances, setLocalAppliances] = useState(appliances || []);
  const [applianceId, setApplianceId] = useState('');
  const [serviceType, setServiceType] = useState('Routine Maintenance');
  const [nextServiceDate, setNextServiceDate] = useState(getTodayString());
  const [frequency, setFrequency] = useState('Every 6 months');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingAppliances, setFetchingAppliances] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch or refresh appliances whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setError('');
      setSuccessMsg('');
      setNextServiceDate(getTodayString());
      setFetchingAppliances(true);

      const fetchList = async () => {
        try {
          const data = await applianceService.getAll();
          const list = Array.isArray(data) ? data : [];
          setLocalAppliances(list);

          if (defaultApplianceId) {
            setApplianceId(String(defaultApplianceId));
          } else if (list.length > 0) {
            setApplianceId(String(list[0].id));
          } else {
            setApplianceId('');
          }
        } catch (err) {
          console.error('Failed to fetch appliances:', err);
          if (appliances && appliances.length > 0) {
            setLocalAppliances(appliances);
            setApplianceId(String(defaultApplianceId || appliances[0].id));
          } else {
            setLocalAppliances([]);
            setApplianceId('');
          }
        } finally {
          setFetchingAppliances(false);
        }
      };

      fetchList();
    }
  }, [isOpen, defaultApplianceId]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!applianceId) {
      setError('Please select an appliance first.');
      return;
    }
    if (!nextServiceDate) {
      setError('Please choose a valid service date.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      await scheduleService.create({
        appliance: parseInt(applianceId, 10),
        service_type: serviceType.trim() || 'Routine Maintenance',
        next_service_date: nextServiceDate,
        frequency: frequency,
        notes: notes.trim(),
        status: 'Pending'
      });
      setSuccessMsg('Service schedule created successfully! Email notification processed.');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 700);
    } catch (err) {
      console.error('Create schedule error:', err);
      let errorDetail = 'Failed to create schedule. Please check the fields.';
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorDetail = err.response.data;
        } else if (typeof err.response.data === 'object') {
          const messages = Object.entries(err.response.data)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
            .join(' | ');
          if (messages) errorDetail = messages;
        }
      }
      setError(errorDetail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 leading-tight">Schedule Maintenance</h3>
              <p className="text-xs text-gray-500">Set recurring service reminders & email alerts</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-black rounded-full hover:bg-gray-100 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs font-medium rounded-xl border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-green-50 text-green-700 text-xs font-medium rounded-xl border border-green-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Select Appliance *</label>
            {fetchingAppliances ? (
              <div className="w-full px-3.5 py-2.5 text-xs text-gray-400 border border-gray-200 rounded-xl bg-gray-50 animate-pulse">
                Loading your appliances...
              </div>
            ) : localAppliances.length === 0 ? (
              <div className="p-3 bg-amber-50 text-amber-800 text-xs font-medium rounded-xl border border-amber-200">
                No appliances found. Please add an appliance to your account first.
              </div>
            ) : (
              <select
                value={applianceId}
                onChange={e => setApplianceId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-black bg-white font-medium text-gray-900 cursor-pointer"
              >
                <option value="" disabled>-- Select an Appliance --</option>
                {localAppliances.map(app => (
                  <option key={app.id} value={String(app.id)}>
                    {app.brand ? `${app.brand} ` : ''}{app.name} ({app.category || 'Appliance'}{app.location ? ` - ${app.location}` : ''})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Service Type *</label>
            <input
              type="text"
              required
              placeholder="e.g. Routine Maintenance, Filter Replacement, Deep Cleaning"
              value={serviceType}
              onChange={e => setServiceType(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-black font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Next Service Due Date *</label>
            <input
              type="date"
              required
              value={nextServiceDate}
              onChange={e => setNextServiceDate(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-black font-medium cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Frequency</label>
            <select
              value={frequency}
              onChange={e => setFrequency(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-black bg-white font-medium cursor-pointer"
            >
              <option value="Monthly">Monthly</option>
              <option value="Every 3 months">Every 3 months</option>
              <option value="Every 6 months">Every 6 months</option>
              <option value="Yearly">Yearly</option>
              <option value="Custom">Custom</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Notes & Checklist (Optional)</label>
            <textarea
              rows={2}
              placeholder="e.g. Check compressor coils, inspect drain tube."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full p-3.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-black font-medium"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-semibold text-gray-600 hover:text-black cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || localAppliances.length === 0}
              className="bg-black hover:bg-gray-800 text-white font-semibold py-2.5 px-6 rounded-2xl transition-all text-sm shadow-sm cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Schedule →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
