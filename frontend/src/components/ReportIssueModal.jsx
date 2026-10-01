import React, { useState } from 'react';
import { X, Wrench, AlertTriangle, PhoneCall, Globe } from 'lucide-react';
import { serviceRequestService } from '../services/api';

export default function ReportIssueModal({ isOpen, onClose, appliances = [], defaultApplianceId = null, onSuccess }) {
  const [applianceId, setApplianceId] = useState(defaultApplianceId || (appliances[0]?.id || ''));
  const [issueDescription, setIssueDescription] = useState('');
  const [priority, setPriority] = useState('High');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showProviderInfo, setShowProviderInfo] = useState(false);

  if (!isOpen) return null;

  const selectedAppliance = appliances.find(a => a.id === parseInt(applianceId));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!applianceId) {
      setError('Please select an appliance.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      await serviceRequestService.create({
        appliance: applianceId,
        issue_description: issueDescription,
        priority: priority,
        status: 'Reported'
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError('Failed to report issue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 leading-tight">Report Service Issue</h3>
              <p className="text-xs text-gray-500">Create an internal service request</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-black rounded-full hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs font-medium rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Select Appliance</label>
            <select
              value={applianceId}
              onChange={e => setApplianceId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-black bg-white"
            >
              {appliances.map(app => (
                <option key={app.id} value={app.id}>{app.brand} {app.name} ({app.location})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Problem Description</label>
            <textarea
              required
              rows={4}
              placeholder="e.g. Refrigerator is not cooling properly. Freezer temperature is fluctuating."
              value={issueDescription}
              onChange={e => setIssueDescription(e.target.value)}
              className="w-full p-3.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Priority Level</label>
            <select
              value={priority}
              onChange={e => setPriority(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-black bg-white"
            >
              <option value="Low">Low (General inquiry)</option>
              <option value="Medium">Medium (Minor issue)</option>
              <option value="High">High (Core component fault)</option>
              <option value="Emergency">Emergency (Immediate hazard)</option>
            </select>
          </div>

          {/* Service Provider Contact Section */}
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-gray-500" /> Need official manufacturer support?
              </span>
              <button
                type="button"
                onClick={() => setShowProviderInfo(!showProviderInfo)}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                {showProviderInfo ? 'Hide Contact Info' : 'Show Customer Care'}
              </button>
            </div>

            {showProviderInfo && selectedAppliance && (
              <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600 space-y-1 animate-in fade-in">
                <p className="font-bold text-gray-900">{selectedAppliance.brand} Authorized Customer Support:</p>
                <p>Helpline: <span className="font-semibold text-black">+1 (800) 555-0199</span></p>
                <p>Official Website: <a href="https://www.lg.com" target="_blank" rel="noreferrer" className="text-blue-600 underline">support.{selectedAppliance.brand?.toLowerCase()}.com</a></p>
              </div>
            )}
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
              {loading ? 'Submitting...' : 'Submit Service Request →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
