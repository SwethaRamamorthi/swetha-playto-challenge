import React from 'react';
import { useKyc } from '../context/KycContext';
import { Settings as SettingsIcon, Bell, Shield, Smartphone } from 'lucide-react';

const Settings = () => {
  const { user } = useKyc();

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Account Settings</h1>
        <p className="text-slate-500">Manage your portal preferences and security.</p>
      </div>

      <div className="space-y-6">
        <div className="card p-6">
          <div className="flex items-center mb-6">
            <SettingsIcon className="w-5 h-5 text-brand-600 mr-2" />
            <h2 className="text-lg font-semibold text-slate-800">Profile Information</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700">Display Name</label>
              <input type="text" className="input-field" defaultValue="Swetha Ramamoorthi" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Email Address</label>
              <input type="email" className="input-field" defaultValue="swetha@example.com" />
            </div>
          </div>
          <button className="btn-primary mt-6">Save Changes</button>
        </div>

        <div className="card p-6">
          <div className="flex items-center mb-6">
            <Bell className="w-5 h-5 text-brand-600 mr-2" />
            <h2 className="text-lg font-semibold text-slate-800">Notification Preferences</h2>
          </div>
          <div className="space-y-4">
            <label className="flex items-center cursor-pointer">
              <input type="checkbox" className="w-4 h-4 text-brand-600 border-slate-300 rounded focus:ring-brand-500" defaultChecked />
              <span className="ml-3 text-sm text-slate-700">Email notifications on status change</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input type="checkbox" className="w-4 h-4 text-brand-600 border-slate-300 rounded focus:ring-brand-500" defaultChecked />
              <span className="ml-3 text-sm text-slate-700">Weekly submission summaries</span>
            </label>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center mb-6">
            <Shield className="w-5 h-5 text-brand-600 mr-2" />
            <h2 className="text-lg font-semibold text-slate-800">Security</h2>
          </div>
          <div className="flex items-center justify-between py-4 border-b border-slate-100">
            <div>
              <p className="text-sm font-medium text-slate-900">Two-factor Authentication</p>
              <p className="text-xs text-slate-500">Enable 2FA to secure your account</p>
            </div>
            <button className="text-brand-600 text-sm font-semibold hover:text-brand-700">Enable</button>
          </div>
          <div className="flex items-center justify-between py-4">
            <div>
              <p className="text-sm font-medium text-slate-900">Change Password</p>
              <p className="text-xs text-slate-500">Last changed 3 months ago</p>
            </div>
            <button className="text-brand-600 text-sm font-semibold hover:text-brand-700">Update</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
