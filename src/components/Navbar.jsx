import React from 'react';
import { useKyc } from '../context/KycContext';
import { Bell, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout, notifications } = useKyc();
  
  if (!user) return null;

  return (
    <nav className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 sticky top-0 z-10 w-full">
      <div className="flex items-center">
        <h1 className="text-xl font-bold text-brand-700 tracking-tight">Swetha Ramamoorthi KYC</h1>
      </div>
      
      <div className="flex items-center space-x-6">
        <div className="relative group cursor-pointer">
          <Bell className="w-5 h-5 text-slate-500 hover:text-brand-600 transition-colors" />
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {notifications.filter(n => !n.read).length || notifications.length}
            </span>
          )}
          {/* Dropdown for dummy notifications */}
          <div className="absolute right-0 top-6 w-64 bg-white border border-slate-200 shadow-lg rounded-md hidden group-hover:block transition-all opacity-0 group-hover:opacity-100 p-2 z-50">
            {notifications.length > 0 ? (
               notifications.map(n => (
                 <div key={n.id} className="text-sm p-2 border-b last:border-0 border-slate-100 text-slate-700">
                    {n.message}
                 </div>
               ))
            ) : (
               <div className="text-sm p-2 text-slate-500">No notifications</div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-3 border-l pl-6">
          <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold">
            <User className="w-4 h-4" />
          </div>
          <div className="text-sm flex flex-col">
             <span className="font-semibold text-slate-800">Swetha Ramamoorthi</span>
             <span className="text-slate-500 text-xs capitalize">{user.role} Portal</span>
          </div>
          <button onClick={logout} className="ml-4 text-sm text-slate-500 hover:text-red-500 transition-colors">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
