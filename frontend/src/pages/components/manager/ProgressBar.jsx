import React from "react";

const ProgressBar = ({ value }) => {
  // 🔹 Dynamic styling logic based on percentage
  const getProgressConfig = (val) => {
    if (val >= 100) return { 
      color: "bg-emerald-500", 
      text: "text-emerald-600", 
      label: "Finalized",
      shadow: "0 0 12px rgba(16, 185, 129, 0.4)"
    };
    if (val >= 50) return { 
      color: "bg-indigo-600", 
      text: "text-indigo-600", 
      label: "Current Progress",
      shadow: "0 0 12px rgba(99, 102, 241, 0.3)"
    };
    if (val >= 25) return { 
      color: "bg-orange-500", 
      text: "text-orange-600", 
      label: "Steady Pace",
      shadow: "0 0 12px rgba(249, 115, 22, 0.3)"
    };
    return { 
      color: "bg-rose-500", 
      text: "text-rose-600", 
      label: "Just Starting",
      shadow: "0 0 12px rgba(244, 63, 94, 0.3)"
    };
  };

  const config = getProgressConfig(value);

  return (
    <div className="w-full mt-3 font-sans">
      {/* Outer Track */}
      <div className="w-full bg-slate-100 rounded-full h-2 sm:h-2.5 overflow-hidden border border-slate-200 shadow-inner">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out relative shadow-sm ${config.color}`}
          style={{ 
            width: `${value}%`,
            boxShadow: config.shadow
          }}
        >
          {/* Animated Highlight Streak */}
          {value > 0 && value < 100 && (
            <div className="absolute inset-0 w-full h-full overflow-hidden">
              <div className="absolute inset-0 skew-x-[-25deg] animate-[shimmer_2s_infinite] w-1/3" 
                   style={{ 
                     background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)' 
                   }} 
              />
            </div>
          )}
        </div>
      </div>

      {/* Percentage Label */}
      <div className="flex flex-row justify-between items-center mt-1.5 px-0.5 gap-2">
        <p className="text-[10px] sm:text-[11px] font-bold text-slate-500 truncate">
          {config.label}
        </p>
        <p className={`text-[11px] sm:text-xs font-black transition-colors duration-500 shrink-0 ${config.text}`}>
          {value}% completed
        </p>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer {
          0% { transform: translateX(-150%); }
          100% { transform: translateX(450%); }
        }
      `}} />
    </div>
  );
};

export default ProgressBar;