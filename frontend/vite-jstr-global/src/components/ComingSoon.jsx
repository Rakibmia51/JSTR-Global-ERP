import React, { useState } from 'react';

const ComingSoon = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleNotify = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubmitted(true);
      setEmail('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 relative overflow-hidden font-sans select-none">
      
      {/* High-End Soft Geometric Light Gradients */}
      <div 
        className="absolute w-[800px] h-[800px] rounded-full blur-[160px] opacity-[0.12] -top-80 -left-40 pointer-events-none"
        style={{ backgroundColor: '#4bcbfa' }}
      />
      <div 
        className="absolute w-[600px] h-[600px] rounded-full blur-[140px] opacity-[0.08] -bottom-40 -right-20 pointer-events-none"
        style={{ backgroundColor: '#4bcbfa' }}
      />

      {/* Grid Pattern Overlay for Texture */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-[0.25] pointer-events-none" />

      {/* Main Glassmorphic Panel Container */}
      <div className="w-full max-w-xl bg-white/70 backdrop-blur-xl border border-white shadow-[0_20px_50px_rgba(0,0,0,0.03)] rounded-3xl p-8 sm:p-12 text-center z-10 space-y-8 relative">
        
        {/* Subtle Outer Border Line For Crisp Definition */}
        <div className="absolute inset-px rounded-[23px] border border-slate-100/50 pointer-events-none" />

        {/* Micro Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-200/60 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.01)] mx-auto">
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#4bcbfa' }} />
          <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500">System Core Update</span>
        </div>

        {/* Main Display Typography */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
            Something New Is <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-[#4bcbfa]" style={{ textShadow: '0 2px 20px rgba(75,203,250,0.1)' }}>Coming Soon</span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm max-w-sm mx-auto font-medium leading-relaxed">
            We are fine-tuning our localized distribution logs, financial ledgers, and invoice engines to guarantee a seamless management experience.
          </p>
        </div>

        {/* Ultra-Clean Subscription Component Box */}
        <div className="max-w-md mx-auto bg-slate-50/50 border border-slate-100/80 rounded-2xl p-2 shadow-inner">
          {!isSubmitted ? (
            <form onSubmit={handleNotify} className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter corporate email..."
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all duration-300"
                onFocus={(e) => {
                  e.target.style.borderColor = '#4bcbfa';
                  e.target.style.boxShadow = '0 0 0 4px rgba(75, 203, 250, 0.12)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '';
                  e.target.style.boxShadow = '';
                }}
              />
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 text-white font-bold text-xs rounded-xl whitespace-nowrap active:scale-[0.97] transition-all duration-200 shadow-sm"
                style={{ 
                  backgroundColor: '#4bcbfa',
                  boxShadow: '0 4px 14px rgba(75, 203, 250, 0.25)' 
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#3cbbe5'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#4bcbfa'}
              >
                Join Waitlist
              </button>
            </form>
          ) : (
            <div className="py-4 space-y-1.5 animate-fade-in text-center">
              <div className="w-8 h-8 rounded-full mx-auto flex items-center justify-center bg-emerald-50 text-emerald-500 font-extrabold text-sm">
                ✓
              </div>
              <h3 className="text-slate-800 font-bold text-sm">Subscription Authenticated</h3>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">We will drop an active credential invite payload as soon as public ports launch.</p>
            </div>
          )}
        </div>

        {/* Minimal Subtle Progress Bar Indicator */}
        <div className="w-24 h-[3px] bg-slate-100 mx-auto rounded-full overflow-hidden relative">
          <div 
            className="absolute left-0 top-0 bottom-0 rounded-full animate-[loading_2s_ease-in-out_infinite]"
            style={{ 
              backgroundColor: '#4bcbfa',
              width: '45%'
            }} 
          />
        </div>

        {/* Tailored Footer Sign-off */}
        <div className="pt-2 text-[9px] font-bold uppercase tracking-widest text-slate-400 flex justify-center items-center gap-2">
          <span>Enterprise Framework V2</span>
          <span className="w-1 h-1 rounded-full bg-slate-200" />
          <span style={{ color: '#4bcbfa' }}>Identity Spectrum #4bcbfa</span>
        </div>

      </div>
    </div>
  );
};

export default ComingSoon;
