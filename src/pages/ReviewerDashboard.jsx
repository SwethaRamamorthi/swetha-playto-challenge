import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKyc } from '../context/KycContext';
import { StatusBadge } from '../components/StatusBadge';
import { Clock, CheckSquare, List, AlertTriangle } from 'lucide-react';

const ReviewerDashboard = () => {
   const { submissions, loadSubmissions, loading } = useKyc();
   const navigate = useNavigate();

   useEffect(() => {
      loadSubmissions();
   }, []);

   const getHoursDiff = (dateStr) => {
      const msDiff = new Date() - new Date(dateStr);
      return Math.floor(msDiff / (1000 * 60 * 60));
   };

   const total = submissions.length;
   const approved = submissions.filter(s => s.status === 'approved').length;
   const approvalRate = total === 0 ? 0 : Math.round((approved / total) * 100);
   // avg queue time for pending
   const pending = submissions.filter(s => s.status === 'under_review' || s.status === 'submitted');
   const avgQueueTime = pending.length === 0 ? 0 : Math.round(pending.reduce((acc, s) => acc + getHoursDiff(s.submittedAt), 0) / pending.length);

   return (
      <div className="p-6 lg:p-10 max-w-6xl mx-auto">
         <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Swetha Ramamoorthi - Reviewer Panel</h1>
            <p className="text-slate-500">Manage and review incoming KYC submissions.</p>
         </div>

         {/* Metrics */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card p-6 flex items-center shadow-sm">
               <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                  <List className="w-6 h-6" />
               </div>
               <div>
                  <p className="text-sm font-medium text-slate-500">Total Queue</p>
                  <p className="text-2xl font-bold text-slate-800">{pending.length}</p>
               </div>
            </div>
            <div className="card p-6 flex items-center shadow-sm">
               <div className="p-3 rounded-full bg-orange-100 text-orange-600 mr-4">
                  <Clock className="w-6 h-6" />
               </div>
               <div>
                  <p className="text-sm font-medium text-slate-500">Avg Time in Queue</p>
                  <p className="text-2xl font-bold text-slate-800">{avgQueueTime}h</p>
               </div>
            </div>
            <div className="card p-6 flex items-center shadow-sm">
               <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                  <CheckSquare className="w-6 h-6" />
               </div>
               <div>
                  <p className="text-sm font-medium text-slate-500">Approval Rate</p>
                  <p className="text-2xl font-bold text-slate-800">{approvalRate}%</p>
               </div>
            </div>
         </div>

         {/* Queue Table */}
         <div className="card shadow-sm">
            <div className="px-6 py-5 border-b border-slate-100 bg-white">
               <h3 className="text-lg font-semibold text-slate-800">Review Queue</h3>
            </div>
            <div className="overflow-x-auto">
               <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                     <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Merchant Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Time in Queue</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                     </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                     {loading ? (
                        <tr><td colSpan="5" className="px-6 py-10 text-center text-slate-500">Loading submissions...</td></tr>
                     ) : submissions.length === 0 ? (
                        <tr><td colSpan="5" className="px-6 py-10 text-center text-slate-500">No submissions in queue.</td></tr>
                     ) : (
                        submissions.map((sub) => {
                           const hours = getHoursDiff(sub.submittedAt);
                           const isAtRisk = (sub.status === 'under_review' || sub.status === 'submitted') && hours > 24;
                           
                           return (
                              <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{sub.id}</td>
                                 <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-slate-900">{sub.merchantName}</div>
                                    <div className="text-xs text-slate-500">{sub.businessType}</div>
                                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap">
                                    <StatusBadge status={sub.status} />
                                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                    {isAtRisk ? (
                                       <span className="flex items-center text-red-600 font-semibold"><AlertTriangle className="w-4 h-4 mr-1"/> {hours}h (At Risk)</span>
                                    ) : (
                                       <span>{hours}h</span>
                                    )}
                                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button 
                                      onClick={() => navigate(`/submission/${sub.id}`)}
                                      className="text-brand-600 hover:text-brand-900 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-md transition-colors"
                                    >
                                       Review
                                    </button>
                                 </td>
                              </tr>
                           )
                        })
                     )}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
   );
};

export default ReviewerDashboard;
