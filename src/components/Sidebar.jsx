import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Settings, HelpCircle } from 'lucide-react';
import { useKyc } from '../context/KycContext';

const Sidebar = () => {
   const { user } = useKyc();

   if (!user) return null;

   const links = user.role === 'merchant' ? [
     { name: 'My Dashboard', path: '/merchant-dashboard', icon: LayoutDashboard },
     { name: 'Settings', path: '/settings', icon: Settings },
     { name: 'Help Support', path: '/support', icon: HelpCircle },
   ] : [
     { name: 'Review Queue', path: '/reviewer-dashboard', icon: FileText },
     { name: 'Metrics', path: '/metrics', icon: LayoutDashboard },
     { name: 'Settings', path: '/settings', icon: Settings },
   ];

   return (
      <aside className="w-64 bg-slate-900 text-slate-300 min-h-[calc(100vh-64px)] flex flex-col p-4 z-0 relative pt-8 font-sans">
         <div className="flex flex-col space-y-2">
            {links.map(link => (
               <NavLink 
                 key={link.name} 
                 to={link.path}
                 className={({ isActive }) => `flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${isActive && link.path !== '#' ? 'bg-brand-600 text-white shadow' : 'hover:bg-slate-800 hover:text-white'}`}
               >
                 <link.icon className="w-5 h-5" />
                 <span className="font-medium text-sm">{link.name}</span>
               </NavLink>
            ))}
         </div>
         <div className="mt-auto p-4 bg-slate-800 rounded-lg text-xs leading-relaxed text-slate-400">
           <p className="font-semibold mb-1 text-slate-200">Swetha Ramamoorthi</p>
           <p>Fintech Solutions &copy; 2026.</p>
           <p>All rights reserved.</p>
         </div>
      </aside>
   )
}

export default Sidebar;
