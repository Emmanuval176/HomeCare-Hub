import React, { useState, useEffect } from 'react';
import { X, Cpu, Upload, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { applianceService } from '../services/api';

const DEFAULT_CATEGORY_IMAGES = {
  'Refrigerator': 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=800&q=80',
  'Air Conditioner': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
  'Washing Machine': 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=800&q=80',
  'Television': 'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=800&q=80',
  'Microwave': 'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?auto=format&fit=crop&w=800&q=80',
  'Water Heater': 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
  'Laptop': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80',
  'Other': 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
};

export default function AddApplianceModal({ isOpen, onClose, applianceToEdit = null, onSuccess }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Refrigerator');
  const [brand, setBrand] = useState('LG');
  const [modelNumber, setModelNumber] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [location, setLocation] = useState('Kitchen');
  const [status, setStatus] = useState('Active');
  const [imageUrl, setImageUrl] = useState('');
  const [filePreview, setFilePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (applianceToEdit) {
      setName(applianceToEdit.name || '');
      setCategory(applianceToEdit.category || 'Refrigerator');
      setBrand(applianceToEdit.brand || '');
      setModelNumber(applianceToEdit.model_number || '');
      setSerialNumber(applianceToEdit.serial_number || '');
      setPurchaseDate(applianceToEdit.purchase_date || '');
      setPurchasePrice(applianceToEdit.purchase_price || '');
      setLocation(applianceToEdit.location || 'Kitchen');
      setStatus(applianceToEdit.status || 'Active');
      setImageUrl(applianceToEdit.image_url || '');
      setFilePreview(applianceToEdit.image_url || null);
    } else {
      setName('');
      setCategory('Washing Machine');
      setBrand('LG');
      setModelNumber('');
      setSerialNumber('');
      setPurchaseDate('');
      setPurchasePrice('');
      setLocation('Kitchen');
      setStatus('Active');
      setImageUrl('');
      setFilePreview(null);
    }
  }, [applianceToEdit, isOpen]);

  if (!isOpen) return null;

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result);
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const sanitizeDate = (rawDate) => {
    if (!rawDate || !rawDate.trim()) return null;
    const clean = rawDate.trim();
    // If format is DD-MM-YYYY or DD/MM/YYYY
    const parts = clean.split(/[\-\/]/);
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        // YYYY-MM-DD
        return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
      } else if (parts[2].length === 4) {
        // DD-MM-YYYY -> YYYY-MM-DD
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }
    return clean;
  };

  const sanitizePrice = (rawPrice) => {
    if (rawPrice === null || rawPrice === undefined || rawPrice === '') return null;
    const cleanStr = String(rawPrice).replace(/[^0-9.]/g, '');
    const num = parseFloat(cleanStr);
    return isNaN(num) ? null : num;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Fallback default high-res image based on selected category if empty
    const finalImageUrl = imageUrl.trim() || DEFAULT_CATEGORY_IMAGES[category] || DEFAULT_CATEGORY_IMAGES['Other'];

    const payload = {
      name: name.trim() || `${brand} ${category}`,
      category: category || 'Washing Machine',
      brand: brand.trim() || 'LG',
      model_number: modelNumber.trim(),
      serial_number: serialNumber.trim(),
      purchase_date: sanitizeDate(purchaseDate),
      purchase_price: sanitizePrice(purchasePrice),
      location: location.trim() || 'Home',
      status: status || 'Active',
      image_url: finalImageUrl
    };

    try {
      if (applianceToEdit) {
        await applianceService.update(applianceToEdit.id, payload);
      } else {
        await applianceService.create(payload);
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Appliance Save Error:', err.response?.data);
      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === 'string') {
          setError(data);
        } else if (typeof data === 'object') {
          const messages = Object.entries(data).map(([key, val]) => {
            const valStr = Array.isArray(val) ? val.join(', ') : String(val);
            return `${key.replace('_', ' ')}: ${valStr}`;
          });
          setError(messages.join(' | '));
        } else {
          setError('Failed to save appliance. Please check inputs.');
        }
      } else {
        setError('Failed to save appliance. Please check server network connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 leading-tight">
                {applianceToEdit ? 'Edit Appliance' : 'Add New Appliance'}
              </h3>
              <p className="text-xs text-gray-500">Manage household appliance details</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-black rounded-full hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs font-medium rounded-xl border border-red-200">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Appliance Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Whirlpool Washing Machine"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-black bg-white"
              >
                <option value="Washing Machine">Washing Machine</option>
                <option value="Refrigerator">Refrigerator</option>
                <option value="Air Conditioner">Air Conditioner</option>
                <option value="Television">Television</option>
                <option value="Microwave">Microwave</option>
                <option value="Water Heater">Water Heater</option>
                <option value="Laptop">Laptop</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Brand</label>
              <input
                type="text"
                placeholder="e.g. LG, Samsung, Whirlpool"
                value={brand}
                onChange={e => setBrand(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Location</label>
              <input
                type="text"
                placeholder="e.g. Kitchen, Work Area, Bedroom"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Model Number</label>
              <input
                type="text"
                placeholder="e.g. df-7667"
                value={modelNumber}
                onChange={e => setModelNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Serial Number</label>
              <input
                type="text"
                placeholder="e.g. 35555667655"
                value={serialNumber}
                onChange={e => setSerialNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Purchase Date (Optional)</label>
              <input
                type="date"
                value={purchaseDate}
                onChange={e => setPurchaseDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Purchase Price ($) (Optional)</label>
              <input
                type="text"
                placeholder="e.g. 1200.50"
                value={purchasePrice}
                onChange={e => setPurchasePrice(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-black"
              />
            </div>
          </div>

          {/* Improved Appliance Photo Field (Optional with automatic category default) */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-gray-700">Appliance Photo (Optional)</label>
              <span className="text-[10px] text-gray-400 font-medium">Auto-defaults to {category} photo if empty</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Paste image URL (Optional)"
                  value={imageUrl}
                  onChange={e => {
                    setImageUrl(e.target.value);
                    setFilePreview(e.target.value);
                  }}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-black"
                />
              </div>

              {/* Upload image button */}
              <label className="cursor-pointer bg-gray-100 hover:bg-black hover:text-white px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0">
                <Upload className="w-4 h-4" />
                Upload Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Photo Preview */}
            <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-2xl border border-gray-100 mt-2">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-200 border border-gray-200 shrink-0">
                <img
                  src={filePreview || imageUrl || DEFAULT_CATEGORY_IMAGES[category] || DEFAULT_CATEGORY_IMAGES['Other']}
                  alt="Appliance Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-[11px] text-gray-500">
                <p className="font-semibold text-gray-900">Current Photo Preview</p>
                <p className="text-[10px] text-gray-400">
                  {imageUrl ? 'Custom photo selected' : `Using default high-resolution ${category} photo`}
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-black bg-white"
            >
              <option value="Active">Active</option>
              <option value="Service Due">Service Due</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Out of Order">Out of Order</option>
            </select>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-black"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-black hover:bg-gray-800 text-white font-semibold py-2.5 px-6 rounded-2xl transition-all text-sm shadow-sm"
            >
              {loading ? 'Saving...' : (applianceToEdit ? 'Update Appliance' : 'Save Appliance')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
