import React from 'react';
import { Lock, ArrowRight, CheckCircle2, Home } from 'lucide-react';

export default function AuthRequiredState({ title = "Authentication Required", pageName = "this page", openAuthModal, setActivePage }) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
      <div className="w-16 h-16 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto text-black shadow-inner">
        <Lock className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">{title}</h2>
        <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed">
          Please sign in or create an account to access {pageName} and manage your household appliances, service schedules, documents, and warranties.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          onClick={openAuthModal}
          className="w-full sm:w-auto bg-black hover:bg-gray-800 text-white font-semibold text-sm px-7 py-3.5 rounded-full transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
        >
          Sign In / Create Account
          <ArrowRight className="w-4 h-4" />
        </button>

        {setActivePage && (
          <button
            onClick={() => setActivePage('home')}
            className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-sm px-6 py-3.5 rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" /> Return to Home
          </button>
        )}
      </div>

      <div className="pt-6 border-t border-gray-100">
        <p className="text-xs text-gray-400">
          Tip: You can use <strong>1-Click Demo Sign In</strong> inside the login modal to explore immediately.
        </p>
      </div>
    </div>
  );
}
