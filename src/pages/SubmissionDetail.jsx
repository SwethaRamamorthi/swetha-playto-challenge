import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useKyc } from '../context/KycContext';
import { fetchSubmissionById } from '../services/mockApi';
import { StatusBadge } from '../components/StatusBadge';
import { ArrowLeft, Check, X, FileQuestion, FileText } from 'lucide-react';

const SubmissionDetail = () => {
   const { id } = useParams();
   const navigate = useNavigate();
   const { actionOnSubmission, loading: contextLoading } = useKyc();
   const [submission, setSubmission] = useState(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const load = async () => {
         try {
            const data = await fetchSubmissionById(id);
            setSubmission(data);
         } catch (err) {
            console.error(err);
         } finally {
            setLoading(false);
         }
      };
      load();
   }, [id]);

   const handleAction = async (status) => {
      let reason = "";
      if(status === 'rejected' || status === 'more_info_requested') {
         reason = prompt(`Enter reason for ${status}:`);
         if(reason === null) return; // cancelled
      }
      await actionOnSubmission(id, status, reason);
      navigate('/reviewer-dashboard');
   };

   if(loading) return <div className="p-10 text-center">Loading details...</div>;
   if(!submission) return <div className="p-10 text-center text-red-500">Submission not found.</div>;

   return (
      <div className="p-6 lg:p-10 max-w-4xl mx-auto mb-16">
         <button onClick={() => navigate(-1)} className="flex items-center text-sm font-medium text-slate-500 hover:text-brand-600 mb-6">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Queue
         </button>

         <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
               <h1 className="text-2xl font-bold text-slate-900 mb-2">Application {submission.id}</h1>
               <div className="text-slate-500 text-sm">Submitted on {new Date(submission.submittedAt).toLocaleString()}</div>
            </div>
            <StatusBadge status={submission.status} className="px-3 py-1 text-sm" />
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="card p-6">
               <h3 className="text-lg font-semibold text-slate-800 border-b pb-2 mb-4">Business Profile</h3>
               <dl className="space-y-3 text-sm">
                  <div className="grid grid-cols-3"><dt className="text-slate-500">Name</dt><dd className="col-span-2 font-medium text-slate-900">{submission.merchantName}</dd></div>
                  <div className="grid grid-cols-3"><dt className="text-slate-500">Type</dt><dd className="col-span-2 font-medium text-slate-900">{submission.businessType}</dd></div>
                  <div className="grid grid-cols-3"><dt className="text-slate-500">Exp. Vol</dt><dd className="col-span-2 font-medium text-slate-900">{submission.expectedVolume}</dd></div>
               </dl>
            </div>
            <div className="card p-6">
               <h3 className="text-lg font-semibold text-slate-800 border-b pb-2 mb-4">Personal Details</h3>
               <dl className="space-y-3 text-sm">
                  <div className="grid grid-cols-3"><dt className="text-slate-500">Name</dt><dd className="col-span-2 font-medium text-slate-900">{submission.personalDetails?.name}</dd></div>
                  <div className="grid grid-cols-3"><dt className="text-slate-500">Email</dt><dd className="col-span-2 font-medium text-slate-900">{submission.personalDetails?.email}</dd></div>
                  <div className="grid grid-cols-3"><dt className="text-slate-500">Phone</dt><dd className="col-span-2 font-medium text-slate-900">{submission.personalDetails?.phone}</dd></div>
               </dl>
            </div>
         </div>

         <div className="card p-6 mb-8">
            <h3 className="text-lg font-semibold text-slate-800 border-b pb-2 mb-4">Uploaded Documents</h3>
            <ul className="space-y-3">
               {submission.documents && submission.documents.length > 0 ? (
                  submission.documents.map((doc, idx) => (
                     <li key={idx} className="flex items-center p-3 border border-slate-200 rounded text-sm group hover:border-brand-300">
                        <FileText className="w-5 h-5 text-brand-500 mr-3" />
                        <span className="font-medium text-slate-700 flex-1">{typeof doc === 'string' ? doc : doc.name}</span>
                        <button className="text-brand-600 opacity-0 group-hover:opacity-100 font-medium text-xs">View</button>
                     </li>
                  ))
               ) : (
                  <p className="text-sm text-slate-500">No documents provided.</p>
               )}
            </ul>
         </div>

         <div className="flex items-center gap-4 fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 justify-end md:static md:bg-transparent md:border-0 md:p-0">
            <button 
               onClick={() => handleAction('rejected')} 
               disabled={contextLoading}
               className="btn-secondary text-red-600 hover:text-red-700 hover:bg-red-50"
            >
               <X className="w-4 h-4 mr-2" /> Reject
            </button>
            <button 
               onClick={() => handleAction('more_info_requested')} 
               disabled={contextLoading}
               className="btn-secondary text-orange-600 hover:text-orange-700 hover:bg-orange-50"
            >
               <FileQuestion className="w-4 h-4 mr-2" /> Req. Info
            </button>
            <button 
               onClick={() => handleAction('approved')} 
               disabled={contextLoading}
               className="btn-primary bg-green-600 hover:bg-green-700 focus:ring-green-500"
            >
               <Check className="w-4 h-4 mr-2" /> Approve Application
            </button>
         </div>
      </div>
   );
};

export default SubmissionDetail;
