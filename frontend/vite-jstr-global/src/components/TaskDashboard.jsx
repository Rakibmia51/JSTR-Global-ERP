import { useState } from 'react';

const ERPDashboard = () => {
  // Enterprise Project Modules Tracking State

  //  status: 'Completed',In Development, Planned
  const [modules] = useState([
    {
      id: 1,
      name: 'Products Management',
      description: 'Dual pricing schema configurations (TP/MRP), isolated stock catalogs registries, and live inventory table matrix grids.',
      status: 'In Development',
      percentage: 80,
      scope: ['Schema Optimization', 'TP / MRP System', 'Stock Registry Grid']
    },
    {
      id: 2,
      name: 'Invoice & Accounting',
      description: 'Automated billing numbers, Mongoose ACID session transactions rollback mechanics, dynamic item selection tools, and real-time ledger accounting.',
      status: 'In Development',
      percentage: 20,
      scope: ['ACID Transaction Sessions', 'Auto-Invoice Numbers', 'Financial Ledgers']
    },
    {
      id: 3,
      name: 'Dealer Management',
      description: 'Wholesale client ledger tracking tracking vectors, credit ceiling policies configuration, and separate corporate balance sheets alignment.',
      status: 'Completed',
      percentage: 100,
      scope: ['Credit Policies', 'Dealer Ledger Profiles', 'Balance Tracking']
    },
    {
      id: 4,
      name: 'Staff Management',
      description: 'Access authentication controls pipelines, employee activity records trackers, and operational credential authorization nodes (createdBy).',
      status: 'Completed',
      percentage: 100,
      scope: ['JWT Core Middleware', 'Role RBAC Matrices', 'Activity Audits']
    },
    {
      id: 5,
      name: 'Marketing & Sales',
      description: 'Targeted distribution logs calculations, real-time conversion metrics tracking, and sales analytics summary tracking arrays.',
      status: 'Planned',
      percentage: 0,
      scope: ['Conversion Trackers', 'Campaign Logs', 'Sales Vectors']
    },
    {
      id: 6,
      name: 'Reports',
      description: 'Dynamic profit/loss evaluation, comprehensive corporate stock logs, and automated auditing statements creation tools.',
      status: 'Planned',
      percentage: 0,
      scope: ['Profit & Loss Sheets', 'Audit Engine', 'PDF Exporter']
    },
    {
      id: 7,
      name: 'Settings',
      description: 'System configurations control hubs, security parameters adjustment protocols, and brand identity matrix customizations.',
      status: 'Planned',
      percentage: 0,
      scope: ['Security Policies', 'System Variables', 'Branding Toggles']
    }
  ]);

  // Aggregate Metrics Calculations
  const completedCount = modules.filter(m => m.status === 'Completed').length;
  const inDevCount = modules.filter(m => m.status === 'In Development').length;
  const totalProgress = Math.round(modules.reduce((acc, curr) => acc + curr.percentage, 0) / modules.length);

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* Visual Ambient Brand Glow Vectors */}
      <div 
        className="absolute w-[800px] h-[800px] rounded-full blur-[160px] opacity-[0.05] top-0 right-0 pointer-events-none"
        style={{ backgroundColor: '#4bcbfa' }}
      />

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        
        {/* Main Branding Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200/60 pb-6 gap-4">
          <div className="border-l-4 pl-4" style={{ borderColor: '#4bcbfa' }}>
            <span className="text-xs font-bold uppercase tracking-widest text-[#4bcbfa]">JSTR Global Limited</span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">Business ERP Management Software</h1>
            <p className="text-xs text-slate-500 font-medium">Core Deployment Roadmap and System Architecture Progress Ledger.</p>
          </div>
          
          {/* Main Completion Gauge */}
          <div className="bg-white border border-slate-200/80 px-5 py-3 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total System Build</span>
              <span className="text-2xl font-black text-slate-800">{totalProgress}%</span>
            </div>
            <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden relative">
              <div className="absolute inset-y-0 left-0 rounded-full" style={{ backgroundColor: '#4bcbfa', width: `${totalProgress}%` }} />
            </div>
          </div>
        </div>

        {/* Modular Metrics Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.01)] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Production Ready</span>
              <div className="text-xl font-black text-slate-800 mt-0.5">{completedCount} Modules</div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg">Live</span>
          </div>

          <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.01)] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Sprint Build</span>
              <div className="text-xl font-black text-slate-800 mt-0.5">{inDevCount} Modules</div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 bg-amber-50 text-amber-600 rounded-lg animate-pulse">Building</span>
          </div>

          <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.01)] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Upcoming Backlog</span>
              <div className="text-xl font-black text-slate-800 mt-0.5">{modules.length - (completedCount + inDevCount)} Modules</div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg">Pipeline</span>
          </div>
        </div>

        {/* Modules Map Layout Section */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 tracking-widest px-1">Functional Architecture Matrix</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {modules.map((mod) => (
              <div 
                key={mod.id} 
                className="bg-white border border-slate-100 shadow-[0_12px_40px_rgba(0,0,0,0.01)] rounded-2xl p-6 relative overflow-hidden transition-all duration-300 hover:shadow-[0_12px_40px_rgba(75,203,250,0.05)] hover:-translate-y-0.5 group"
              >
                {/* Decorative Branded Structural Top Bar */}
                <div 
                  className="absolute top-0 inset-x-0 h-[3px] transition-opacity duration-300 opacity-0 group-hover:opacity-100" 
                  style={{ backgroundColor: mod.status === 'Completed' ? '#4bcbfa' : mod.status === 'In Development' ? '#f59e0b' : '#cbd5e1' }}
                />

                {/* Card Title Layer */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-800 tracking-tight group-hover:text-slate-900 transition-colors">
                      {mod.name}
                    </h3>
                    <span className={`inline-flex items-center text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded border mt-1.5 ${
                      mod.status === 'Completed' 
                        ? 'bg-blue-50/50 text-blue-600 border-blue-100' 
                        : mod.status === 'In Development' 
                        ? 'bg-amber-50/50 text-amber-600 border-amber-100' 
                        : 'bg-slate-50 text-slate-400 border-slate-200/60'
                    }`}>
                      {mod.status}
                    </span>
                  </div>
                  
                  {/* Local Percentage Metrics */}
                  <span className="text-sm font-mono font-bold text-slate-400 group-hover:text-slate-700 transition-colors">
                    {mod.percentage}%
                  </span>
                </div>

                {/* Description Context Block */}
                <p className="text-slate-500 text-xs font-medium leading-relaxed mb-5 min-h-[40px]">
                  {mod.description}
                </p>

                {/* Subscope Bullet Items Layout Map */}
                <div className="border-t border-slate-50 pt-4 space-y-2">
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Target Components Map</span>
                  <div className="flex flex-wrap gap-1.5">
                    {mod.scope.map((scopeItem, sIdx) => (
                      <span key={sIdx} className="text-[10px] font-semibold bg-slate-50 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-100">
                        • {scopeItem}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="w-full h-[3px] bg-slate-100 mt-5 rounded-full overflow-hidden">
                    <div 
                        className="h-full rounded-full transition-all duration-500" 
                        style={{ 
                        backgroundColor: mod.status === 'Completed' ? '#4bcbfa' : mod.status === 'In Development' ? '#f59e0b' : '#e2e8f0',
                        width: `${mod.percentage}%` 
                        }} 
                    />
                </div>


            </div>

            ))}
          </div>
        </div>  
        </div>
    </div>
  );
}

export default ERPDashboard;