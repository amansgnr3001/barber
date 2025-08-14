import React from "react";
import { Scissors } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-r from-black via-gray-900 to-black text-white shadow-lg border-t border-amber-500/20">
      <div className="container flex flex-col items-center justify-between gap-6 py-10 md:py-8 md:flex-row">
        <div className="flex flex-col items-center md:items-start">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-10 w-10 rounded-full bg-amber-500 flex items-center justify-center shadow-amber-500/30 shadow-inner">
              <Scissors className="h-5 w-5 text-black transform -rotate-45" />
            </div>
            <p className="text-xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
              Barber Suite
            </p>
          </div>
          <p className="text-sm text-gray-400">© {new Date().getFullYear()} Premium Grooming Services</p>
          <p className="text-xs text-gray-500 mt-1">Exceptional cuts. Exceptional service.</p>
        </div>
        
        <div className="flex flex-col items-center my-4 md:my-0">
          <p className="text-lg md:text-xl font-semibold text-amber-500 mb-2">RRU haircutting</p>
          <div className="flex gap-4 mt-2">
            <a href="#" className="h-8 w-8 rounded-full bg-gray-800 hover:bg-amber-500/20 flex items-center justify-center transition-colors border border-amber-500/30 hover:border-amber-500">
              <span className="text-amber-400 text-xs font-bold">FB</span>
            </a>
            <a href="#" className="h-8 w-8 rounded-full bg-gray-800 hover:bg-amber-500/20 flex items-center justify-center transition-colors border border-amber-500/30 hover:border-amber-500">
              <span className="text-amber-400 text-xs font-bold">IG</span>
            </a>
            <a href="#" className="h-8 w-8 rounded-full bg-gray-800 hover:bg-amber-500/20 flex items-center justify-center transition-colors border border-amber-500/30 hover:border-amber-500">
              <span className="text-amber-400 text-xs font-bold">TW</span>
            </a>
          </div>
        </div>
        
        <nav className="flex flex-wrap justify-center items-center gap-4" aria-label="Footer Navigation">
          <a href="#services" className="px-3 py-1.5 text-sm text-gray-300 hover:text-amber-400 transition-colors border border-transparent hover:border-amber-500/30 rounded-md hover:bg-amber-500/10">Services</a>
          <a href="#availability" className="px-3 py-1.5 text-sm text-gray-300 hover:text-amber-400 transition-colors border border-transparent hover:border-amber-500/30 rounded-md hover:bg-amber-500/10">Availability</a>
          <a href="#book" className="px-3 py-1.5 text-sm text-gray-300 hover:text-amber-400 transition-colors border border-transparent hover:border-amber-500/30 rounded-md hover:bg-amber-500/10">Book</a>
          <a href="#about" className="px-3 py-1.5 text-sm text-gray-300 hover:text-amber-400 transition-colors border border-transparent hover:border-amber-500/30 rounded-md hover:bg-amber-500/10">About</a>
          <a href="#team" className="px-3 py-1.5 text-sm text-gray-300 hover:text-amber-400 transition-colors border border-transparent hover:border-amber-500/30 rounded-md hover:bg-amber-500/10">Team</a>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
