import React, { useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Footer({ setActivePage }) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-gray-100">
          
          {/* Brand & Slogan */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActivePage && setActivePage('home')}>
              <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center font-bold tracking-tighter text-lg shadow-sm">
                H
              </div>
              <span className="font-bold text-xl tracking-tight text-gray-900">HomeCare Hub</span>
            </div>
            <p className="text-gray-500 text-sm max-w-sm leading-relaxed">
              "A smarter home for a better tomorrow."
            </p>
            <p className="text-xs text-gray-400 leading-relaxed">
              Simplifying appliance management, warranty tracking, maintenance scheduling, and document vaulting for modern homes.
            </p>
          </div>

          {/* Nav Links */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">Product</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><button onClick={() => setActivePage && setActivePage('appliances')} className="hover:text-black transition-colors">Appliances</button></li>
              <li><button onClick={() => setActivePage && setActivePage('documents')} className="hover:text-black transition-colors">Documents & OCR</button></li>
              <li><button onClick={() => setActivePage && setActivePage('services')} className="hover:text-black transition-colors">Service Schedules</button></li>
              <li><button onClick={() => setActivePage && setActivePage('warranty')} className="hover:text-black transition-colors">Warranty Vault</button></li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">Company</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="#" className="hover:text-black transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-black transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-black transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          {/* Newsletter Subscription */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">Stay Updated</h4>
            <p className="text-xs text-gray-500">Subscribe for home care tips and feature updates.</p>
            {subscribed ? (
              <div className="flex items-center gap-1.5 text-xs text-green-600 font-semibold bg-green-50 p-2.5 rounded-xl border border-green-200">
                <CheckCircle2 className="w-4 h-4" /> Subscribed successfully!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-all bg-gray-50/50"
                  />
                  <button
                    type="submit"
                    className="absolute right-1 top-1 bottom-1 bg-black hover:bg-gray-800 text-white px-2.5 rounded-lg transition-all flex items-center justify-center text-xs"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>© {new Date().getFullYear()} HomeCare Hub Inc. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <a href="#" className="hover:text-gray-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-gray-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-gray-600 transition-colors">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
