import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useKyc } from '../context/KycContext';
import { ShieldCheck, User, Building } from 'lucide-react';

const Login = () => {
   const { login } = useKyc();
   const navigate = useNavigate();

   const handleLogin = (role) => {
      login(role);
      navigate(role === 'merchant' ? '/merchant-dashboard' : '/reviewer-dashboard');
   };

   return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
         <div className="max-w-md w-full">
            <div className="text-center mb-10">
               <div className="mx-auto h-16 w-16 bg-brand-600 rounded-full flex items-center justify-center shadow-lg mb-6">
                  <ShieldCheck className="h-8 w-8 text-white" />
               </div>
               <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Swetha Ramamoorthi</h2>
               <p className="mt-2 text-sm text-slate-500 font-medium tracking-wide uppercase">KYC Portal Login</p>
            </div>

            <div className="bg-white py-8 px-6 shadow rounded-xl sm:px-10 border border-slate-100">
               <p className="text-center text-sm font-medium text-slate-700 mb-6">Select your portal access level</p>

               <div className="space-y-4">
                  <button 
                     onClick={() => handleLogin('merchant')}
                     className="w-full flex items-center justify-between px-6 py-4 border-2 border-slate-200 rounded-lg hover:border-brand-500 hover:bg-brand-50 transition-colors group"
                  >
                     <div className="flex items-center">
                        <Building className="h-6 w-6 text-brand-600 mr-4" />
                        <div className="text-left">
                           <p className="text-sm font-bold text-slate-900">Merchant Portal</p>
                           <p className="text-xs text-slate-500 mt-1">Submit & manage KYC applications</p>
                        </div>
                     </div>
                  </button>

                  <button 
                     onClick={() => handleLogin('reviewer')}
                     className="w-full flex items-center justify-between px-6 py-4 border-2 border-slate-200 rounded-lg hover:border-brand-500 hover:bg-brand-50 transition-colors group"
                  >
                     <div className="flex items-center">
                        <User className="h-6 w-6 text-brand-600 mr-4" />
                        <div className="text-left">
                           <p className="text-sm font-bold text-slate-900">Reviewer Panel</p>
                           <p className="text-xs text-slate-500 mt-1">Review & approve submissions</p>
                        </div>
                     </div>
                  </button>
               </div>
            </div>
            
            <div className="mt-8 text-center text-xs text-slate-400">
               &copy; 2026 Swetha Ramamoorthi. All rights reserved.
            </div>
         </div>
      </div>
   );
};

export default Login;
