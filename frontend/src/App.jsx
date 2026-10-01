import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SearchModal from './components/SearchModal';
import NotificationDrawer from './components/NotificationDrawer';
import AuthModal from './components/AuthModal';
import OCRModal from './components/OCRModal';
import AddApplianceModal from './components/AddApplianceModal';
import AddScheduleModal from './components/AddScheduleModal';
import WatchDemoModal from './components/WatchDemoModal';

import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import AppliancesPage from './pages/AppliancesPage';
import ApplianceDetailPage from './pages/ApplianceDetailPage';
import DocumentsPage from './pages/DocumentsPage';
import WarrantiesPage from './pages/WarrantiesPage';
import ServicesPage from './pages/ServicesPage';

import { applianceService, authService } from './services/api';

export default function App() {
  const [activePage, setActivePage] = useState('home');
  const [selectedApplianceId, setSelectedApplianceId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [appliancesList, setAppliancesList] = useState([]);
  const [pendingPage, setPendingPage] = useState(null);

  // Modals state
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [ocrModalOpen, setOcrModalOpen] = useState(false);
  const [addApplianceModalOpen, setAddApplianceModalOpen] = useState(false);
  const [applianceToEdit, setApplianceToEdit] = useState(null);
  const [addScheduleModalOpen, setAddScheduleModalOpen] = useState(false);
  const [scheduleDefaultApplianceId, setScheduleDefaultApplianceId] = useState(null);
  const [watchDemoModalOpen, setWatchDemoModalOpen] = useState(false);

  useEffect(() => {
    // Restore user session if stored
    const storedUser = localStorage.getItem('homecare_user');
    const storedToken = localStorage.getItem('homecare_token');
    if (storedUser && storedToken) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('homecare_user');
        localStorage.removeItem('homecare_token');
      }
    }
    // Note: Do NOT auto-login as demo user, so visitors start unauthenticated
  }, []);

  const handleSetCurrentUser = (user) => {
    setCurrentUser(user);
    if (user) {
      if (pendingPage) {
        setActivePage(pendingPage);
        setPendingPage(null);
      } else if (activePage === 'home') {
        setActivePage('dashboard');
      }
    }
  };

  const handleNavigate = (page) => {
    if (page === 'home') {
      setActivePage('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Protected pages check
    if (!currentUser) {
      setPendingPage(page);
      setAuthOpen(true);
      return;
    }

    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const requireAuth = (callback, targetPage = null) => {
    if (!currentUser) {
      if (targetPage) setPendingPage(targetPage);
      setAuthOpen(true);
      return false;
    }
    if (callback) callback();
    return true;
  };

  useEffect(() => {
    if (currentUser) {
      applianceService.getAll().then(data => setAppliancesList(data)).catch(() => {});
    }
  }, [currentUser, activePage, addApplianceModalOpen, ocrModalOpen]);

  const handleSelectAppliance = (id) => {
    if (!currentUser) {
      setPendingPage('appliances');
      setAuthOpen(true);
      return;
    }
    setSelectedApplianceId(id);
    setActivePage('appliance-detail');
  };

  const handleEditAppliance = (appliance) => {
    if (!currentUser) {
      setPendingPage('appliances');
      setAuthOpen(true);
      return;
    }
    setApplianceToEdit(appliance);
    setAddApplianceModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans flex flex-col justify-between">
      
      {/* Top Global Navigation Bar */}
      <Navbar
        activePage={activePage}
        setActivePage={handleNavigate}
        openSearch={() => requireAuth(() => setSearchOpen(true))}
        openNotifications={() => requireAuth(() => setNotificationsOpen(true))}
        openAuth={() => setAuthOpen(true)}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
      />

      {/* Main Dynamic View Router */}
      <main className="flex-1">
        {activePage === 'home' && (
          <HomePage
            setActivePage={handleNavigate}
            currentUser={currentUser}
            openOCRModal={() => requireAuth(() => setOcrModalOpen(true), 'documents')}
            openAddApplianceModal={() => requireAuth(() => { setApplianceToEdit(null); setAddApplianceModalOpen(true); }, 'appliances')}
            openWatchDemoModal={() => setWatchDemoModalOpen(true)}
            onSelectAppliance={handleSelectAppliance}
          />
        )}

        {activePage === 'dashboard' && (
          <DashboardPage
            setActivePage={handleNavigate}
            currentUser={currentUser}
            onSelectAppliance={handleSelectAppliance}
            openAddApplianceModal={() => requireAuth(() => { setApplianceToEdit(null); setAddApplianceModalOpen(true); }, 'appliances')}
            openAuthModal={() => setAuthOpen(true)}
          />
        )}

        {activePage === 'appliances' && (
          <AppliancesPage
            currentUser={currentUser}
            onSelectAppliance={handleSelectAppliance}
            openAddApplianceModal={() => requireAuth(() => { setApplianceToEdit(null); setAddApplianceModalOpen(true); }, 'appliances')}
            onEditAppliance={handleEditAppliance}
            openAuthModal={() => setAuthOpen(true)}
          />
        )}

        {activePage === 'appliance-detail' && (
          <ApplianceDetailPage
            applianceId={selectedApplianceId}
            onBack={() => setActivePage('appliances')}
            currentUser={currentUser}
            openOCRModal={() => requireAuth(() => setOcrModalOpen(true), 'documents')}
            openAddScheduleModal={(appId) => {
              requireAuth(() => {
                setScheduleDefaultApplianceId(appId || selectedApplianceId);
                setAddScheduleModalOpen(true);
              }, 'services');
            }}
          />
        )}

        {activePage === 'documents' && (
          <DocumentsPage
            currentUser={currentUser}
            openOCRModal={() => requireAuth(() => setOcrModalOpen(true), 'documents')}
            openAuthModal={() => setAuthOpen(true)}
          />
        )}

        {activePage === 'warranty' && (
          <WarrantiesPage
            currentUser={currentUser}
            onSelectAppliance={handleSelectAppliance}
            openAuthModal={() => setAuthOpen(true)}
          />
        )}

        {activePage === 'services' && (
          <ServicesPage
            currentUser={currentUser}
            openAddScheduleModal={() => {
              requireAuth(() => {
                setScheduleDefaultApplianceId(null);
                setAddScheduleModalOpen(true);
              }, 'services');
            }}
            onSelectAppliance={handleSelectAppliance}
            openAuthModal={() => setAuthOpen(true)}
          />
        )}
      </main>

      {/* Global Footer */}
      <Footer setActivePage={handleNavigate} />

      {/* MODALS & DRAWERS */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectAppliance={handleSelectAppliance}
        setActivePage={handleNavigate}
      />

      <NotificationDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        setActivePage={handleNavigate}
        currentUser={currentUser}
      />

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        setCurrentUser={handleSetCurrentUser}
      />

      <OCRModal
        isOpen={ocrModalOpen}
        onClose={() => setOcrModalOpen(false)}
        appliances={appliancesList}
        onSuccess={() => {
          applianceService.getAll().then(data => setAppliancesList(data)).catch(() => {});
        }}
      />

      <AddApplianceModal
        isOpen={addApplianceModalOpen}
        onClose={() => setAddApplianceModalOpen(false)}
        applianceToEdit={applianceToEdit}
        onSuccess={() => {
          applianceService.getAll().then(data => setAppliancesList(data)).catch(() => {});
        }}
      />

      <AddScheduleModal
        isOpen={addScheduleModalOpen}
        onClose={() => {
          setAddScheduleModalOpen(false);
          setScheduleDefaultApplianceId(null);
        }}
        appliances={appliancesList}
        defaultApplianceId={scheduleDefaultApplianceId}
        onSuccess={() => {
          setActivePage('services');
        }}
      />

      <WatchDemoModal
        isOpen={watchDemoModalOpen}
        onClose={() => setWatchDemoModalOpen(false)}
        setActivePage={handleNavigate}
        openAuth={() => setAuthOpen(true)}
      />

    </div>
  );
}
