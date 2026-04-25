import React, { useEffect } from 'react';
import { useKyc } from '../context/KycContext';
import { BarChart3, PieChart, TrendingUp, Users, CheckCircle2, Clock } from 'lucide-react';

const Metrics = () => {
  const { submissions, loadSubmissions } = useKyc();

  useEffect(() => {
    loadSubmissions();
  }, []);

  const total = submissions.length;
  const approved = submissions.filter(s => s.status === 'approved').length;
  const rejected = submissions.filter(s => s.status === 'rejected').length;
  const pending = submissions.filter(s => s.status === 'under_review' || s.status === 'submitted').length;

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Operational Metrics</h1>
        <p className="text-slate-500">Analytics and performance tracking for Swetha Ramamoorthi Review Panel.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Volume', value: total, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
          { label: 'Approval Rate', value: `${total ? Math.round((approved/total)*100) : 0}%`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100' },
          { label: 'Active Queue', value: pending, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100' },
          { label: 'Rejected', value: rejected, icon: CheckCircle2, color: 'text-red-600', bg: 'bg-red-100' }
        ].map((stat, i) => (
          <div key={i} className="card p-6 shadow-sm border border-slate-100">
            <div className={`w-10 h-10 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800">Submission Trend</h3>
            <BarChart3 className="w-5 h-5 text-slate-400" />
          </div>
          <div className="h-48 flex items-end gap-2 px-2">
            {[40, 70, 45, 90, 65, 80, 100].map((h, i) => (
              <div key={i} className="flex-1 bg-brand-500/20 hover:bg-brand-500 rounded-t-sm transition-all cursor-pointer relative group" style={{ height: `${h}%` }}>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Day {i+1}: {Math.floor(h*1.5)} units
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-[10px] text-slate-400 font-medium px-2">
            <span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span>
          </div>
        </div>

        <div className="card p-6">
           <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800">Status Distribution</h3>
            <PieChart className="w-5 h-5 text-slate-400" />
          </div>
          <div className="space-y-4">
            {[
              { status: 'Approved', count: approved, color: 'bg-green-500', total: total },
              { status: 'Rejected', count: rejected, color: 'bg-red-500', total: total },
              { status: 'In Review', count: pending, color: 'bg-orange-500', total: total },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1 px-1">
                  <span className="font-medium text-slate-700">{item.status}</span>
                  <span className="text-slate-500">{item.count} ({item.total ? Math.round((item.count/item.total)*100) : 0}%)</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color}`} style={{ width: `${item.total ? (item.count/item.total)*100 : 0}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Metrics;
