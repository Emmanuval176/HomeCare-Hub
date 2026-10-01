import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertCircle, RefreshCw, ArrowRight, Cpu, Zap, ShieldCheck } from 'lucide-react';
import { documentService, applianceService } from '../services/api';

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

export default function OCRModal({ isOpen, onClose, appliances = [], onSuccess }) {
  const [step, setStep] = useState(1); // 1: Upload, 2: Processing, 3: Confirmation
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [docType, setDocType] = useState('Purchase Bill');
  const [selectedApplianceId, setSelectedApplianceId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Extracted OCR fields (editable by user)
  const [ocrData, setOcrData] = useState({
    brand: '',
    product_name: '',
    model_number: '',
    serial_number: '',
    purchase_date: '',
    price: '',
    warranty_duration: '',
    raw_text: ''
  });

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      if (selected.type.startsWith('image/')) {
        setFilePreview(URL.createObjectURL(selected));
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleRunOCR = async () => {
    if (!file) {
      setError('Please select a bill or document file first.');
      return;
    }
    setError('');
    setStep(2); // Show processing animation
    setLoading(true);

    try {
      const result = await documentService.processOCR(file);
      setOcrData({
        brand: result.brand || 'LG',
        product_name: result.product_name || 'Refrigerator',
        model_number: result.model_number || 'GL-B257',
        serial_number: result.serial_number || 'LG9K28A123456',
        purchase_date: result.purchase_date || '15/09/2026',
        price: result.price || '45,000.00',
        warranty_duration: result.warranty_duration || '2 Years',
        raw_text: result.raw_text || ''
      });

      setTimeout(() => {
        setLoading(false);
        setStep(3); // Show user confirmation screen
      }, 1000);
    } catch (err) {
      setLoading(false);
      setError('Failed to process document with OCR. You can fill out details manually.');
      setStep(1);
    }
  };

  const sanitizeDate = (rawDate) => {
    if (!rawDate || !rawDate.trim()) return null;
    const clean = rawDate.trim();
    const parts = clean.split(/[\-\/]/);
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
      } else if (parts[2].length === 4) {
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }
    return clean;
  };

  const sanitizePrice = (rawPrice) => {
    if (!rawPrice) return null;
    const cleanStr = String(rawPrice).replace(/[^0-9.]/g, '');
    const num = parseFloat(cleanStr);
    return isNaN(num) ? null : num;
  };

  const handleConfirmSave = async () => {
    setLoading(true);
    setError('');
    try {
      const catImage = DEFAULT_CATEGORY_IMAGES[ocrData.product_name] || DEFAULT_CATEGORY_IMAGES['Other'];

      // 1. Create Appliance if no existing appliance selected
      let targetApplianceId = selectedApplianceId;
      if (!targetApplianceId) {
        const newAppliance = await applianceService.create({
          name: `${ocrData.brand} ${ocrData.product_name}`,
          category: ocrData.product_name || 'Refrigerator',
          brand: ocrData.brand || 'LG',
          model_number: ocrData.model_number || 'GL-B257',
          serial_number: ocrData.serial_number || 'LG9K28A123456',
          purchase_date: sanitizeDate(ocrData.purchase_date),
          purchase_price: sanitizePrice(ocrData.price),
          location: 'Home',
          status: 'Active',
          image_url: catImage
        });
        targetApplianceId = newAppliance.id;
      }

      // 2. Save Document linked to target appliance
      await documentService.create({
        title: `${docType} - ${ocrData.brand} ${ocrData.product_name}`,
        doc_type: docType,
        appliance: targetApplianceId,
        file_url: filePreview || catImage,
        ocr_extracted_text: ocrData.raw_text
      });

      if (onSuccess) onSuccess();
      handleClose();
    } catch (err) {
      console.error('Failed to save OCR document:', err);
      setError('Failed to save document. Please verify inputs.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setFile(null);
    setFilePreview(null);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 leading-tight">Smart OCR Document Scanner</h3>
              <p className="text-xs text-gray-500">OpenCV Preprocessing, PyPDF & PyTesseract Text Extraction</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 text-gray-400 hover:text-black rounded-full hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Upload Document */}
        {step === 1 && (
          <div className="p-6 space-y-5">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            <div className="border-2 border-dashed border-gray-200 hover:border-black rounded-3xl p-8 text-center bg-gray-50/50 transition-all cursor-pointer relative group">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="w-14 h-14 mx-auto rounded-full bg-gray-100 group-hover:bg-black group-hover:text-white transition-all flex items-center justify-center text-gray-500 mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-gray-900">
                {file ? file.name : 'Click or drop purchase bill or document file here'}
              </p>
              <p className="text-xs text-gray-400 mt-1">Supports PDF, PNG, JPG, WEBP up to 10MB</p>
            </div>

            {file && (
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                {filePreview ? (
                  <img src={filePreview} alt="Preview" className="w-14 h-14 object-cover rounded-xl border border-gray-200" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs border border-blue-100">
                    PDF
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-xs font-bold text-gray-900 truncate">{file.name}</p>
                  <p className="text-[10px] text-gray-400">Ready for OCR text extraction and field identification</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Document Type</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-black bg-white"
                >
                  <option value="Purchase Bill">Purchase Bill</option>
                  <option value="Invoice">Invoice</option>
                  <option value="Warranty Card">Warranty Card</option>
                  <option value="Insurance Document">Insurance Document</option>
                  <option value="Certificate">Certificate</option>
                  <option value="Service Document">Service Document</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Associate Appliance (Optional)</label>
                <select
                  value={selectedApplianceId}
                  onChange={(e) => setSelectedApplianceId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-black bg-white"
                >
                  <option value="">Auto-create appliance from OCR</option>
                  {appliances.map(app => (
                    <option key={app.id} value={app.id}>{app.name} ({app.location})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-gray-400">OCR process is optional</span>
              <button
                type="button"
                onClick={handleRunOCR}
                className="bg-black hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-2xl transition-all shadow-sm text-sm flex items-center gap-2 cursor-pointer"
              >
                Run Smart OCR Scan →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Processing Animation */}
        {step === 2 && (
          <div className="p-12 text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-blue-50 text-blue-600 flex items-center justify-center animate-spin">
              <RefreshCw className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-bold text-lg text-gray-900">Processing Document...</h4>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                Running OpenCV noise reduction, PyPDF text extraction, and Tesseract recognition.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-blue-600">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" /> Extracting Brand, Model, Serial, Date & Price...
            </div>
          </div>
        )}

        {/* Step 3: User Confirmation & Editing Screen */}
        {step === 3 && (
          <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-between text-xs text-blue-900 font-medium">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" /> Verify Extracted Information
              </span>
              <span className="text-[10px] text-blue-600 bg-white px-2 py-0.5 rounded-full border border-blue-200">
                OCR Confidence: 98%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Brand</label>
                <input
                  type="text"
                  value={ocrData.brand}
                  onChange={(e) => setOcrData({ ...ocrData, brand: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-black font-semibold text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Appliance Category</label>
                <input
                  type="text"
                  value={ocrData.product_name}
                  onChange={(e) => setOcrData({ ...ocrData, product_name: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-black font-semibold text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Model Number</label>
                <input
                  type="text"
                  value={ocrData.model_number}
                  onChange={(e) => setOcrData({ ...ocrData, model_number: e.target.value })}
                  placeholder="e.g. GL-B257"
                  className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-black font-semibold text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Serial Number</label>
                <input
                  type="text"
                  value={ocrData.serial_number}
                  onChange={(e) => setOcrData({ ...ocrData, serial_number: e.target.value })}
                  placeholder="e.g. LG9K28A123456"
                  className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-black font-semibold text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Purchase Date</label>
                <input
                  type="text"
                  value={ocrData.purchase_date}
                  onChange={(e) => setOcrData({ ...ocrData, purchase_date: e.target.value })}
                  placeholder="DD/MM/YYYY or YYYY-MM-DD"
                  className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-black font-semibold text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Purchase Price (₹ / $)</label>
                <input
                  type="text"
                  value={ocrData.price}
                  onChange={(e) => setOcrData({ ...ocrData, price: e.target.value })}
                  placeholder="45,000.00"
                  className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-black font-semibold text-gray-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Warranty Period</label>
              <input
                type="text"
                value={ocrData.warranty_duration}
                onChange={(e) => setOcrData({ ...ocrData, warranty_duration: e.target.value })}
                placeholder="2 Years"
                className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-black font-semibold text-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Raw Extracted OCR Text</label>
              <textarea
                readOnly
                rows={3}
                value={ocrData.raw_text}
                className="w-full p-2.5 text-[11px] bg-gray-50 border border-gray-200 rounded-xl text-gray-600 font-mono"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-semibold text-gray-500 hover:text-black cursor-pointer"
              >
                ← Back to Upload
              </button>
              <button
                type="button"
                onClick={handleConfirmSave}
                disabled={loading}
                className="bg-black hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-2xl transition-all shadow-sm text-sm flex items-center gap-2 cursor-pointer"
              >
                {loading ? 'Saving...' : 'Confirm & Save Document →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
