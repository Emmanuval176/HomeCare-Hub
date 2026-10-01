import React, { useState, useEffect } from 'react';
import { Search, X, Cpu, FileText, Wrench, Shield, ArrowRight } from 'lucide-react';
import { dashboardService } from '../services/api';

export default function SearchModal({ isOpen, onClose, onSelectAppliance, setActivePage }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      return;
    }
    const timer = setTimeout(() => {
      setLoading(true);
      dashboardService.globalSearch(query)
        .then(res => {
          setResults(res);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center pt-16 px-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Search Header */}
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            autoFocus
            placeholder="Search appliances, documents, service requests..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-base font-medium text-gray-900 placeholder-gray-400 border-none focus:outline-none bg-transparent"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
          <button onClick={onClose} className="px-2.5 py-1 text-xs font-semibold text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200">
            ESC
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-6">
          {loading && (
            <div className="py-8 text-center text-sm text-gray-400">Searching home records...</div>
          )}

          {!loading && !query && (
            <div className="py-8 text-center text-xs text-gray-400">
              Try searching for <span className="text-black font-semibold">"LG"</span>, <span className="text-black font-semibold">"Bill"</span>, or <span className="text-black font-semibold">"SR-001"</span>
            </div>
          )}

          {!loading && results && (
            <>
              {/* Appliances */}
              {results.appliances && results.appliances.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5" /> Appliances ({results.appliances.length})
                  </h4>
                  <div className="space-y-1.5">
                    {results.appliances.map(app => (
                      <div
                        key={app.id}
                        onClick={() => {
                          onSelectAppliance(app.id);
                          onClose();
                        }}
                        className="p-3 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-200 cursor-pointer flex items-center justify-between transition-all"
                      >
                        <div>
                          <p className="text-sm font-bold text-gray-900">{app.name}</p>
                          <p className="text-xs text-gray-500">{app.category} • {app.location} • Model: {app.model_number}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Documents */}
              {results.documents && results.documents.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Documents ({results.documents.length})
                  </h4>
                  <div className="space-y-1.5">
                    {results.documents.map(doc => (
                      <div
                        key={doc.id}
                        onClick={() => {
                          setActivePage('documents');
                          onClose();
                        }}
                        className="p-3 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-200 cursor-pointer flex items-center justify-between transition-all"
                      >
                        <div>
                          <p className="text-sm font-bold text-gray-900">{doc.title}</p>
                          <p className="text-xs text-gray-500">{doc.doc_type} • Uploaded {doc.upload_date}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Service Requests */}
              {results.service_requests && results.service_requests.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5" /> Service Requests ({results.service_requests.length})
                  </h4>
                  <div className="space-y-1.5">
                    {results.service_requests.map(sr => (
                      <div
                        key={sr.id}
                        onClick={() => {
                          setActivePage('services');
                          onClose();
                        }}
                        className="p-3 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-200 cursor-pointer flex items-center justify-between transition-all"
                      >
                        <div>
                          <p className="text-sm font-bold text-gray-900">{sr.request_id} - {sr.appliance_name}</p>
                          <p className="text-xs text-gray-500">{sr.issue_description}</p>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                          {sr.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.appliances?.length === 0 && results.documents?.length === 0 && results.service_requests?.length === 0 && (
                <div className="py-8 text-center text-sm text-gray-500">
                  No records matched "<span className="font-semibold text-black">{query}</span>"
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
