import React from 'react';
import { HotelProvider, useHotel } from './context/HotelContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { RoomManagement } from './components/rooms/RoomManagement';
import { RoomTypeManagement } from './components/rooms/RoomTypeManagement';
import { CheckInDesk } from './components/frontdesk/CheckInDesk';
import { CheckOutDesk } from './components/frontdesk/CheckOutDesk';
import { ReservationManagement } from './components/reservations/ReservationManagement';
import { GuestManagement } from './components/guests/GuestManagement';
import { BillingManagement } from './components/billing/BillingManagement';
import { RestaurantPOS } from './components/restaurant/RestaurantPOS';
import { ExtraServices } from './components/services/ExtraServices';
import { StaffManagement } from './components/staff/StaffManagement';
import { HousekeepingManagement } from './components/housekeeping/HousekeepingManagement';
import { ExpenseManagement } from './components/expenses/ExpenseManagement';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsManagement } from './components/settings/SettingsManagement';
import { InvoiceModal } from './components/billing/InvoiceModal';
import { ReceiptModal } from './components/billing/ReceiptModal';
import { LoginView } from './components/auth/LoginView';

const MainContent: React.FC = () => {
  const { activeTab, isAuthenticated } = useHotel();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);

  if (!isAuthenticated) {
    return <LoginView />;
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans antialiased overflow-hidden selection:bg-indigo-500/20 selection:text-indigo-900">
      {/* Sidebar Navigation */}
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50">
        {/* Top Header */}
        <Header onToggleSidebarMobile={() => setIsMobileSidebarOpen(prev => !prev)} />

        {/* Dynamic Page Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-slate-50/70">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'rooms' && <RoomManagement />}
          {activeTab === 'room-types' && <RoomTypeManagement />}
          {activeTab === 'check-in' && <CheckInDesk />}
          {activeTab === 'checkin' && <CheckInDesk />}
          {activeTab === 'check-out' && <CheckOutDesk />}
          {activeTab === 'checkout' && <CheckOutDesk />}
          {activeTab === 'reservations' && <ReservationManagement />}
          {activeTab === 'guests' && <GuestManagement />}
          {activeTab === 'billing' && <BillingManagement />}
          {activeTab === 'restaurant' && <RestaurantPOS />}
          {activeTab === 'services' && <ExtraServices />}
          {activeTab === 'staff' && <StaffManagement />}
          {activeTab === 'housekeeping' && <HousekeepingManagement />}
          {activeTab === 'expenses' && <ExpenseManagement />}
          {activeTab === 'reports' && <ReportsView />}
          {activeTab === 'settings' && <SettingsManagement />}
          {activeTab === 'users' && <SettingsManagement />}
          {activeTab === 'backup' && <SettingsManagement />}
        </main>
      </div>

      {/* Global Invoices & Receipts Modals */}
      <InvoiceModal />
      <ReceiptModal />
    </div>
  );
};

export default function App() {
  return (
    <HotelProvider>
      <MainContent />
    </HotelProvider>
  );
}
