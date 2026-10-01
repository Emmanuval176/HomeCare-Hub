import React, { useState, useEffect } from 'react';
import { Search, Bell, User, Menu, X, Home, LayoutDashboard, Cpu, FileText, Wrench, Shield, LogOut } from 'lucide-react';
import { authService, reminderService } from '../services/api';

export default function Navbar({ activePage, setActivePage, openSearch, openAuth, openNotifications, currentUser, setCurrentUser }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);

  useEffect(() => {
    if (currentUser) {
      reminderService.getAll().then(reminders => {
        setUnreadCount(reminders.filter(r => !r.is_read).length);
      }).catch(() => {});
    }
  }, [currentUser]);

  const navLinks = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'appliances', label: 'Appliances', icon: Cpu },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'services', label: 'Services', icon: Wrench },
    { id: 'warranty', label: 'Warranty', icon: Shield },
  ];

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setUserDropdownOpen(false);
    setActivePage('home');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Left: Brand Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActivePage('home')}>
            <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center font-bold tracking-tighter text-lg shadow-sm">
              H
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight text-gray-900 block leading-none">HomeCare Hub</span>
              <span className="text-[10px] tracking-widest text-gray-400 font-semibold uppercase block mt-0.5">SMART HOME</span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activePage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setActivePage(link.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-gray-100 text-black font-semibold shadow-xs'
                      : 'text-gray-600 hover:text-black hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons */}
          <div className="hidden sm:flex items-center gap-2">
            
            {/* Global Search Button */}
            <button
              onClick={openSearch}
              className="p-2.5 text-gray-600 hover:text-black hover:bg-gray-100 rounded-full transition-all relative group"
              title="Search Appliances, Documents, Services (Cmd+K)"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Notification Bell */}
            <button
              onClick={openNotifications}
              className="p-2.5 text-gray-600 hover:text-black hover:bg-gray-100 rounded-full transition-all relative"
              title="Notifications & Reminders"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-blue-600 rounded-full ring-2 ring-white animate-pulse" />
              )}
            </button>

            {/* User Profile / Login */}
            <div className="relative ml-1">
              {currentUser ? (
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 transition-all text-sm font-medium"
                >
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    {currentUser.first_name ? currentUser.first_name[0] : (currentUser.username ? currentUser.username[0].toUpperCase() : 'U')}
                  </div>
                  <span className="text-gray-900 font-medium">{currentUser.first_name || currentUser.username}</span>
                </button>
              ) : (
                <button
                  onClick={openAuth}
                  className="bg-black hover:bg-gray-800 text-white text-sm font-medium px-5 py-2.5 rounded-full transition-all shadow-sm"
                >
                  Sign In
                </button>
              )}

              {/* Profile Dropdown */}
              {userDropdownOpen && currentUser && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-bold text-gray-900">{currentUser.first_name} {currentUser.last_name}</p>
                    <p className="text-xs text-gray-500 truncate">{currentUser.email || currentUser.username}</p>
                  </div>
                  <button
                    onClick={() => { setActivePage('dashboard'); setUserDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4 text-gray-400" />
                    Dashboard
                  </button>
                  <button
                    onClick={() => { setActivePage('appliances'); setUserDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Cpu className="w-4 h-4 text-gray-400" />
                    My Appliances
                  </button>
                  <div className="border-t border-gray-100 my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Hamburger Menu Toggle */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={openSearch}
              className="p-2 text-gray-600 hover:text-black rounded-lg"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-black rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white px-4 pt-3 pb-6 space-y-2 shadow-lg">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = activePage === link.id;
            return (
              <button
                key={link.id}
                onClick={() => {
                  setActivePage(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all ${
                  isActive ? 'bg-gray-100 text-black font-semibold' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5 text-gray-400" />
                {link.label}
              </button>
            );
          })}
          <div className="pt-4 border-t border-gray-100">
            {currentUser ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{currentUser.first_name || currentUser.username}</p>
                  <p className="text-xs text-gray-500">{currentUser.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-red-600 text-sm font-medium border border-red-200 px-3 py-1.5 rounded-lg"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => { openAuth(); setMobileMenuOpen(false); }}
                className="w-full bg-black text-white py-3 rounded-xl font-medium"
              >
                Sign In / Get Started
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
