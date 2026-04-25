import React from 'react';
import { HelpCircle, MessageSquare, Book, Mail } from 'lucide-react';

const Support = () => {
  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Help & Support</h1>
        <p className="text-slate-500">Find answers or get in touch with our team.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="card p-6 hover:shadow-md transition-shadow cursor-pointer">
          <Book className="w-8 h-8 text-brand-600 mb-4" />
          <h3 className="text-lg font-semibold text-slate-800 mb-1">Documentation</h3>
          <p className="text-sm text-slate-500">Browse our detailed guides on KYC compliance and portal usage.</p>
        </div>
        <div className="card p-6 hover:shadow-md transition-shadow cursor-pointer">
          <MessageSquare className="w-8 h-8 text-brand-600 mb-4" />
          <h3 className="text-lg font-semibold text-slate-800 mb-1">Live Chat</h3>
          <p className="text-sm text-slate-500">Speak with a support representative in real-time.</p>
        </div>
      </div>

      <div className="card p-8 bg-brand-900 text-white shadow-xl">
        <h2 className="text-xl font-bold mb-4">Still need help?</h2>
        <p className="mb-6 text-slate-300">Our team is available 24/7 to assist with your KYC submissions or technical queries.</p>
        <div className="flex flex-col sm:flex-row gap-4">
          <a href="mailto:support@swethakyc.com" className="btn-primary bg-white text-brand-900 hover:bg-slate-100 flex items-center justify-center">
            <Mail className="w-4 h-4 mr-2" /> Email Support
          </a>
          <button className="btn-secondary bg-transparent border-white text-white hover:bg-white/10 flex items-center justify-center">
            <HelpCircle className="w-4 h-4 mr-2" /> Visit FAQ Center
          </button>
        </div>
      </div>

      <div className="mt-12">
        <h3 className="text-lg font-semibold text-slate-800 mb-6 font-sans">Frequently Asked Questions</h3>
        <div className="space-y-4">
          {[
            { q: "How long does the KYC review take?", a: "Typically, reviews are completed within 24-48 business hours." },
            { q: "What documents are required for business verification?", a: "We require valid PAN, Aadhaar, and a recent bank statement (last 3 months)." },
            { q: "Can I update my details after submission?", a: "Once submitted, details are locked. If you need changes, please contact support or wait for a 'More Info' request." }
          ].map((faq, i) => (
            <div key={i} className="card p-5">
              <p className="font-bold text-slate-900 text-sm mb-2">{faq.q}</p>
              <p className="text-sm text-slate-600">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Support;
