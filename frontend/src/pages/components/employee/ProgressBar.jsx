import React from "react";

const ProgressBar = ({ value }) => {
  return (
    <div className="w-full mt-2">
      {/* Container with a subtle inset shadow for depth */}
      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200 shadow-inner">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out relative"
          style={{ 
            width: `${value}%`,
            background: `linear-gradient(90deg, #4f46e5 0%, #6366f1 100%)` 
          }}
        >
          {/* Animated Shimmer Effect */}
          <div className="absolute inset-0 w-full h-full">
            <div className="absolute inset-0 bg-white/20 skew-x-[-20deg] animate-[shimmer_2s_infinite] w-1/2" 
                 style={{ 
                   background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)' 
                 }} 
            />
          </div>
          
          {/* Top Highlight line for a 3D glass effect */}
          <div className="absolute top-0 left-0 right-0 h-1px bg-white/20 rounded-full" />
        </div>
      </div>
      
      {/* Optional: Add this CSS to your global styles or a style tag if you want the shimmer animation */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer {
          0% { transform: translateX(-150%); }
          100% { transform: translateX(250%); }
        }
      `}} />
    </div>
  );
};

export default ProgressBar;