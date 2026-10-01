import React, { useState } from 'react';
import { HelpCircle, PhoneCall, Mail, MessageSquare, ChevronDown, ChevronUp, ShieldCheck, Zap } from 'lucide-react';

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState(0);

  const faqs = [
    {
      q: "How does the OCR document feature work?",
      a: "When you upload a purchase bill or warranty card image, HomeCare Hub uses OpenCV for image preprocessing (denoising and thresholding) and PyTesseract OCR to automatically extract brand, model number, serial number, purchase date, price, and warranty duration. You can review and edit all extracted data before saving."
    },
    {
      q: "Can I enter appliances manually without a bill?",
      a: "Yes! OCR is completely optional. You can add appliances manually at any time by entering the brand, category, model number, and purchase details."
    },
    {
      q: "Does HomeCare Hub automatically schedule technicians with manufacturers?",
      a: "HomeCare Hub manages your service schedules and tracks internal service request statuses (Reported -> Assigned -> In Progress -> Completed). For direct manufacturer warranty calls, we provide official customer care helplines and service portal links."
    },
    {
      q: "How do warranty expiry alerts work?",
      a: "HomeCare Hub automatically calculates warranty expiration dates and notifies you via the Notifications drawer and Dashboard when a warranty is expiring in 30 days or less."
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 bg-white text-gray-900">
      
      {/* Header */}
      <div className="border-b border-gray-100 pb-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-black">Support & Help Center</h1>
        <p className="text-gray-500 text-sm mt-1">Get assistance, view brand customer service lines, and read FAQs.</p>
      </div>

      {/* Brand Customer Support Directory */}
      <div className="space-y-4">
        <h2 className="text-2xl font-extrabold tracking-tight text-black">Official Manufacturer Customer Care Directory</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-white rounded-3xl border border-gray-200/90 space-y-2">
            <h3 className="font-extrabold text-lg text-black">LG Care</h3>
            <p className="text-xs text-gray-500">Consumer Electronics & Appliances</p>
            <p className="text-xs font-semibold text-black pt-1">Phone: 1-800-243-0000</p>
            <a href="https://www.lg.com/us/support" target="_blank" rel="noreferrer" className="text-xs text-blue-600 font-medium hover:underline block">lg.com/support →</a>
          </div>

          <div className="p-5 bg-white rounded-3xl border border-gray-200/90 space-y-2">
            <h3 className="font-extrabold text-lg text-black">Samsung Support</h3>
            <p className="text-xs text-gray-500">Home Appliances & Displays</p>
            <p className="text-xs font-semibold text-black pt-1">Phone: 1-800-726-7864</p>
            <a href="https://www.samsung.com/us/support" target="_blank" rel="noreferrer" className="text-xs text-blue-600 font-medium hover:underline block">samsung.com/support →</a>
          </div>

          <div className="p-5 bg-white rounded-3xl border border-gray-200/90 space-y-2">
            <h3 className="font-extrabold text-lg text-black">Sony Support</h3>
            <p className="text-xs text-gray-500">Televisions & Home Audio</p>
            <p className="text-xs font-semibold text-black pt-1">Phone: 1-800-222-7669</p>
            <a href="https://www.sony.com/electronics/support" target="_blank" rel="noreferrer" className="text-xs text-blue-600 font-medium hover:underline block">sony.com/support →</a>
          </div>

          <div className="p-5 bg-white rounded-3xl border border-gray-200/90 space-y-2">
            <h3 className="font-extrabold text-lg text-black">Whirlpool Care</h3>
            <p className="text-xs text-gray-500">Kitchen & Laundry Appliances</p>
            <p className="text-xs font-semibold text-black pt-1">Phone: 1-866-698-2538</p>
            <a href="https://www.whirlpool.com/services/contact-us" target="_blank" rel="noreferrer" className="text-xs text-blue-600 font-medium hover:underline block">whirlpool.com/support →</a>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="space-y-4 max-w-3xl">
        <h2 className="text-2xl font-extrabold tracking-tight text-black">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-gray-200/90 overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                className="w-full text-left p-5 font-bold text-sm text-gray-900 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-xs text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
