import React from 'react';
import { X, Play, CheckCircle, ShieldCheck, FileText, Cpu, Wrench } from 'lucide-react';

export default function WatchDemoModal({ isOpen, onClose, setActivePage }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg text-gray-900 leading-tight">HomeCare Hub — Product Tour & Walkthrough</h3>
            <p className="text-xs text-gray-500">Discover how to manage your appliances, documents, and service requests</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-black rounded-full hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video / Interactive Demo Banner */}
        <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80"
            alt="Demo Environment"
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
          <div className="relative z-10 text-center text-white px-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white hover:scale-105 transition-all cursor-pointer mb-3 shadow-lg">
              <Play className="w-8 h-8 fill-white translate-x-0.5" />
            </div>
            <h4 className="text-2xl font-bold tracking-tight">Experience HomeCare Hub</h4>
            <p className="text-xs text-gray-200 mt-1 max-w-md mx-auto">
              Automated document vault, OpenCV PyTesseract OCR extraction, warranty tracking & service request pipelines.
            </p>
          </div>
        </div>

        {/* Features Checklist */}
        <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50/50">
          <div className="p-3 bg-white rounded-2xl border border-gray-100">
            <Cpu className="w-5 h-5 text-gray-900 mb-1" />
            <h5 className="text-xs font-bold text-gray-900">Appliance Management</h5>
            <p className="text-[10px] text-gray-500">Track specs & locations</p>
          </div>
          <div className="p-3 bg-white rounded-2xl border border-gray-100">
            <FileText className="w-5 h-5 text-gray-900 mb-1" />
            <h5 className="text-xs font-bold text-gray-900">OCR Bill Vault</h5>
            <p className="text-[10px] text-gray-500">Auto-extract bill data</p>
          </div>
          <div className="p-3 bg-white rounded-2xl border border-gray-100">
            <ShieldCheck className="w-5 h-5 text-gray-900 mb-1" />
            <h5 className="text-xs font-bold text-gray-900">Warranty Expiry</h5>
            <p className="text-[10px] text-gray-500">Alerts before expiry</p>
          </div>
          <div className="p-3 bg-white rounded-2xl border border-gray-100">
            <Wrench className="w-5 h-5 text-gray-900 mb-1" />
            <h5 className="text-xs font-bold text-gray-900">Service Pipeline</h5>
            <p className="text-[10px] text-gray-500">Track SR-001 progress</p>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 bg-white flex justify-end gap-3">
          <button
            onClick={() => { setActivePage('dashboard'); onClose(); }}
            className="bg-black hover:bg-gray-800 text-white font-semibold py-2.5 px-6 rounded-2xl text-xs transition-all"
          >
            Launch Interactive Dashboard →
          </button>
        </div>
      </div>
    </div>
  );
}
