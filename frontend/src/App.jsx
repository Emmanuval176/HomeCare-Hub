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
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {}
    } else {
      // Auto login as demo user by default
      authService.login('demo', 'demo123')
        .then(res => setCurrentUser(res.user))
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      applianceService.getAll().then(data => setAppliancesList(data)).catch(() => {});
    }
  }, [currentUser, activePage, addApplianceModalOpen, ocrModalOpen]);

  const handleSelectAppliance = (id) => {
    setSelectedApplianceId(id);
    setActivePage('appliance-detail');
  };

  const handleEditAppliance = (appliance) => {
    setApplianceToEdit(appliance);
    setAddApplianceModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans flex flex-col justify-between">
      
      {/* Top Global Navigation Bar */}
      <Navbar
        activePage={activePage}
        setActivePage={(page) => {
          setActivePage(page);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        openSearch={() => setSearchOpen(true)}
        openNotifications={() => setNotificationsOpen(true)}
        openAuth={() => setAuthOpen(true)}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
      />

      {/* Main Dynamic View Router */}
      <main className="flex-1">
        {activePage === 'home' && (
          <HomePage
            setActivePage={setActivePage}
            openOCRModal={() => setOcrModalOpen(true)}
            openAddApplianceModal={() => { setApplianceToEdit(null); setAddApplianceModalOpen(true); }}
            openWatchDemoModal={() => setWatchDemoModalOpen(true)}
            onSelectAppliance={handleSelectAppliance}
          />
        )}

        {activePage === 'dashboard' && (
          <DashboardPage
            setActivePage={setActivePage}
            onSelectAppliance={handleSelectAppliance}
            openAddApplianceModal={() => { setApplianceToEdit(null); setAddApplianceModalOpen(true); }}
          />
        )}

        {activePage === 'appliances' && (
          <AppliancesPage
            onSelectAppliance={handleSelectAppliance}
            openAddApplianceModal={() => { setApplianceToEdit(null); setAddApplianceModalOpen(true); }}
            onEditAppliance={handleEditAppliance}
          />
        )}

        {activePage === 'appliance-detail' && (
          <ApplianceDetailPage
            applianceId={selectedApplianceId}
            onBack={() => setActivePage('appliances')}
            openOCRModal={() => setOcrModalOpen(true)}
            openAddScheduleModal={(appId) => {
              setScheduleDefaultApplianceId(appId || selectedApplianceId);
              setAddScheduleModalOpen(true);
            }}
          />
        )}

        {activePage === 'documents' && (
          <DocumentsPage
            openOCRModal={() => setOcrModalOpen(true)}
          />
        )}

        {activePage === 'warranty' && (
          <WarrantiesPage
            onSelectAppliance={handleSelectAppliance}
          />
        )}

        {activePage === 'services' && (
          <ServicesPage
            openAddScheduleModal={() => {
              setScheduleDefaultApplianceId(null);
              setAddScheduleModalOpen(true);
            }}
            onSelectAppliance={handleSelectAppliance}
          />
        )}
      </main>

      {/* Global Footer */}
      <Footer setActivePage={setActivePage} />

      {/* MODALS & DRAWERS */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectAppliance={handleSelectAppliance}
        setActivePage={setActivePage}
      />

      <NotificationDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        setActivePage={setActivePage}
      />

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        setCurrentUser={setCurrentUser}
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
        setActivePage={setActivePage}
      />

    </div>
  );
}
