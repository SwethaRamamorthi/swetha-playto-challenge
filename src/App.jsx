import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { KycProvider, useKyc } from './context/KycContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import MerchantDashboard from './pages/MerchantDashboard';
import ReviewerDashboard from './pages/ReviewerDashboard';
import SubmissionDetail from './pages/SubmissionDetail';
import Settings from './pages/Settings';
import Support from './pages/Support';
import Metrics from './pages/Metrics';
import Toast from './components/Toast';

const ProtectedLayout = ({ allowedRole }) => {
  const { user } = useKyc();

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={`/${user.role}-dashboard`} replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 w-full relative z-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const AppRoutes = () => {
  const { user, toasts, removeToast } = useKyc();
  return (
    <>
      <div className="fixed bottom-0 right-0 p-4 space-y-4 z-[100] pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast 
              message={toast.message} 
              type={toast.type} 
              onClose={() => removeToast(toast.id)} 
            />
          </div>
        ))}
      </div>
      <Routes>
         <Route path="/login" element={user ? <Navigate to={`/${user.role}-dashboard`} /> : <Login />} />
         
         <Route element={<ProtectedLayout allowedRole="merchant" />}>
            <Route path="/merchant-dashboard" element={<MerchantDashboard />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/support" element={<Support />} />
         </Route>

         <Route element={<ProtectedLayout allowedRole="reviewer" />}>
            <Route path="/reviewer-dashboard" element={<ReviewerDashboard />} />
            <Route path="/submission/:id" element={<SubmissionDetail />} />
            <Route path="/metrics" element={<Metrics />} />
            <Route path="/settings" element={<Settings />} />
         </Route>

         <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <KycProvider>
      <Router>
        <AppRoutes />
      </Router>
    </KycProvider>
  );
}

export default App;
