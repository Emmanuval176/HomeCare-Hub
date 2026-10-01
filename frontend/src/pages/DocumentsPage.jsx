import React, { useState, useEffect } from 'react';
import { FileText, Upload, Search, Zap, Trash2, Eye, Download, Filter } from 'lucide-react';
import { documentService } from '../services/api';
import AuthRequiredState from '../components/AuthRequiredState';

export default function DocumentsPage({ openOCRModal, currentUser, openAuthModal, setActivePage }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [docTypeFilter, setDocTypeFilter] = useState('All');
  const [previewDoc, setPreviewDoc] = useState(null);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const data = await documentService.getAll();
      setDocuments(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchDocuments();
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <AuthRequiredState
        title="Sign in to View Documents"
        pageName="your Document Vault"
        openAuthModal={openAuthModal}
        setActivePage={setActivePage}
      />
    );
  }

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Delete this document from your vault?')) {
      try {
        await documentService.delete(id);
        fetchDocuments();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(search.toLowerCase()) ||
                          (doc.ocr_extracted_text && doc.ocr_extracted_text.toLowerCase().includes(search.toLowerCase()));
    const matchesType = docTypeFilter === 'All' || doc.doc_type === docTypeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-white text-gray-900">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-black">Document Vault</h1>
          <p className="text-gray-500 text-sm mt-1">Store purchase bills, warranties, certificates with OpenCV & Tesseract OCR.</p>
        </div>

        <button
          onClick={openOCRModal}
          className="bg-black hover:bg-gray-800 text-white text-xs font-semibold px-6 py-3 rounded-full transition-all shadow-xs flex items-center gap-2 self-start sm:self-auto"
        >
          <Zap className="w-4 h-4 text-blue-400" /> Upload Document & Run OCR
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50 p-4 rounded-3xl border border-gray-100">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search documents or OCR text..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-black bg-white"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={docTypeFilter}
            onChange={e => setDocTypeFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-black bg-white text-gray-700 font-medium w-full sm:w-auto"
          >
            <option value="All">All Types</option>
            <option value="Purchase Bill">Purchase Bill</option>
            <option value="Invoice">Invoice</option>
            <option value="Warranty Card">Warranty Card</option>
            <option value="Insurance Document">Insurance Document</option>
            <option value="Certificate">Certificate</option>
            <option value="Service Document">Service Document</option>
          </select>
        </div>
      </div>

      {/* Documents Grid */}
      {loading ? (
        <div className="py-20 text-center text-sm text-gray-400">Loading documents...</div>
      ) : filteredDocs.length === 0 ? (
        <div className="py-20 text-center bg-gray-50 rounded-3xl border border-gray-100">
          <FileText className="w-10 h-10 mx-auto text-gray-300 mb-2" />
          <p className="font-bold text-gray-700">No documents found</p>
          <p className="text-xs text-gray-400 mt-1">Upload purchase bills or warranties to keep them safe.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocs.map(doc => (
            <div
              key={doc.id}
              className="bg-white rounded-3xl border border-gray-200/90 p-6 flex flex-col justify-between hover-lift transition-all space-y-4"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="p-3 bg-gray-100 text-black rounded-2xl">
                    <FileText className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full uppercase">
                    {doc.doc_type}
                  </span>
                </div>

                <h3 className="font-bold text-base text-gray-900">{doc.title}</h3>
                <p className="text-xs text-gray-500 mt-1">Appliance: {doc.appliance_name || 'General Document'}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Uploaded: {doc.upload_date}</p>

                {doc.ocr_extracted_text && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-2xl border border-gray-100 text-[11px] font-mono text-gray-600 space-y-1">
                    <span className="text-[9px] font-bold text-blue-600 uppercase tracking-wider block">Extracted OCR Data</span>
                    <p className="line-clamp-2">{doc.ocr_extracted_text}</p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => setPreviewDoc(doc)}
                  className="text-black font-semibold hover:underline flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" /> Preview Document
                </button>
                <button
                  onClick={(e) => handleDelete(doc.id, e)}
                  className="text-red-500 hover:text-red-700 p-1 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-lg text-gray-900">{previewDoc.title}</h3>
              <button onClick={() => setPreviewDoc(null)} className="p-1 text-gray-400 hover:text-black">✕</button>
            </div>
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 border">
              <img src={previewDoc.file_url || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80'} alt="Document" className="w-full h-full object-contain" />
            </div>
            <div className="flex justify-end">
              <a
                href={previewDoc.file_url}
                target="_blank"
                rel="noreferrer"
                className="bg-black text-white px-5 py-2.5 rounded-full text-xs font-semibold flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" /> Open Full Resolution
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
