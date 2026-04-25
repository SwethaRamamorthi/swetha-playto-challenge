import React, { useState } from 'react';
import { useKyc } from '../context/KycContext';
import FileUpload from '../components/FileUpload';
import { StatusBadge } from '../components/StatusBadge';
import { CheckCircle, Save, Send } from 'lucide-react';

const MerchantDashboard = () => {
   const { submitApplication, loading, addNotification } = useKyc();
   const [step, setStep] = useState(1);
   const [currentStatus, setCurrentStatus] = useState('draft');
   const [isSubmittedSuccessfully, setIsSubmittedSuccessfully] = useState(false);

   const [formData, setFormData] = useState({
      personalDetails: { name: '', email: '', phone: '' },
      businessDetails: { businessName: '', businessType: 'Software', expectedVolume: '0-50k' },
      documents: []
   });

   const handlePersonal = (e) => setFormData({ ...formData, personalDetails: { ...formData.personalDetails, [e.target.name]: e.target.value } });
   const handleBusiness = (e) => setFormData({ ...formData, businessDetails: { ...formData.businessDetails, [e.target.name]: e.target.value } });
   const handleFiles = (files) => setFormData({ ...formData, documents: files });

   const handleAction = async (isDraft) => {
      try {
         await submitApplication({ ...formData, isDraft });
         if(!isDraft) {
            setCurrentStatus('submitted');
            setIsSubmittedSuccessfully(true);
         }
      } catch (err) {
         console.error(err);
      }
   };

   if(isSubmittedSuccessfully) {
      return (
         <div className="p-8 max-w-2xl mx-auto mt-10">
            <div className="card p-10 text-center">
               <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle className="w-8 h-8 text-green-600" />
               </div>
               <h2 className="text-2xl font-bold text-slate-800 mb-2">KYC Submitted successfully</h2>
               <p className="text-slate-600">Your application has been received and is under review.</p>
               <div className="mt-8">
                 <StatusBadge status="under_review" />
               </div>
            </div>
         </div>
      );
   }

   return (
      <div className="p-6 lg:p-10 max-w-4xl mx-auto">
         <div className="mb-8 flex items-center justify-between">
            <div>
               <h1 className="text-2xl font-bold text-slate-900 mb-1">Welcome, Swetha Ramamoorthi</h1>
               <p className="text-slate-500">Complete your KYC to unlock full merchant capabilities.</p>
            </div>
            <StatusBadge status={currentStatus} />
         </div>

         <div className="card p-6 md:p-10">
            {/* Stepper */}
            <div className="flex items-center mb-8">
               {[1, 2, 3].map((num) => (
                  <React.Fragment key={num}>
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= num ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                        {num}
                     </div>
                     {num < 3 && <div className={`flex-1 h-1 mx-2 rounded ${step > num ? 'bg-brand-600' : 'bg-slate-100'}`}></div>}
                  </React.Fragment>
               ))}
            </div>

            {/* Form Steps */}
            <div className="mb-8">
               {step === 1 && (
                  <div className="space-y-5 animate-in fade-in">
                     <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Personal Details</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                           <label className="block text-sm font-medium text-slate-700">Full Name</label>
                           <input type="text" name="name" className="input-field" value={formData.personalDetails.name} onChange={handlePersonal} />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-slate-700">Email</label>
                           <input type="email" name="email" className="input-field" value={formData.personalDetails.email} onChange={handlePersonal} />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-slate-700">Phone</label>
                           <input type="tel" name="phone" className="input-field" value={formData.personalDetails.phone} onChange={handlePersonal} />
                        </div>
                     </div>
                  </div>
               )}

               {step === 2 && (
                  <div className="space-y-5 animate-in fade-in">
                     <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Business Details</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                           <label className="block text-sm font-medium text-slate-700">Business Name</label>
                           <input type="text" name="businessName" className="input-field" value={formData.businessDetails.businessName} onChange={handleBusiness} />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-slate-700">Business Type</label>
                           <select name="businessType" className="input-field" value={formData.businessDetails.businessType} onChange={handleBusiness}>
                              <option>Software</option>
                              <option>Retail</option>
                              <option>Food & Beverage</option>
                              <option>Other</option>
                           </select>
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-slate-700">Expected USD Volume (Monthly)</label>
                           <select name="expectedVolume" className="input-field" value={formData.businessDetails.expectedVolume} onChange={handleBusiness}>
                              <option>0-50k</option>
                              <option>50k-100k</option>
                              <option>100k-500k</option>
                              <option>500k+</option>
                           </select>
                        </div>
                     </div>
                  </div>
               )}

               {step === 3 && (
                  <div className="space-y-5 animate-in fade-in">
                     <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Document Upload</h3>
                     <p className="text-sm text-slate-500">Please provide your PAN, Aadhaar, and recent bank statement.</p>
                     <FileUpload label="KYC Documents" onFilesUpdate={handleFiles} />
                  </div>
               )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-slate-100">
               <button 
                  className="btn-secondary" 
                  onClick={() => handleAction(true)}
                  disabled={loading}
               >
                  <Save className="w-4 h-4 mr-2" /> Save Draft
               </button>
               
               <div className="space-x-3">
                  {step > 1 && (
                     <button className="btn-secondary" onClick={() => setStep(step - 1)}>Back</button>
                  )}
                  {step < 3 ? (
                     <button className="btn-primary" onClick={() => setStep(step + 1)}>Next Step</button>
                  ) : (
                     <button className="btn-primary bg-brand-600 hover:bg-brand-700" onClick={() => handleAction(false)} disabled={loading}>
                        {loading ? 'Submitting...' : <><Send className="w-4 h-4 mr-2" /> Submit Application</>}
                     </button>
                  )}
               </div>
            </div>
         </div>
      </div>
   );
};

export default MerchantDashboard;
