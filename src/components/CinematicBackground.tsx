import React from 'react';
import { motion } from 'motion/react';
import { ExamIcons } from './Icons';

export const CinematicBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden bg-transparent -z-10 select-none pointer-events-none">
      {/* Cinematic ambient lighting particles from Design Spec */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-700/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-500/10 blur-[100px] rounded-full" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%]" />

      {/* Floating cross/stars vector designs as sublte Christian/Educational motif */}
      <div className="absolute top-12 left-12 opacity-25 animate-pulse duration-[4s]">
        <img 
          src="https://lh3.googleusercontent.com/d/1--F3GW0ESYSLaHEUvMoMFIQSOFLwAX52" 
          alt="SDN Kejuron Logo" 
          className="w-10 h-10 object-contain opacity-75 grayscale" 
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="absolute bottom-16 left-24 opacity-15">
        <ExamIcons.Book size={48} className="text-emerald-400" />
      </div>
      <div className="absolute top-24 right-20 opacity-10 duration-[6s]">
        <ExamIcons.Graduate size={64} className="text-amber-500" />
      </div>
      <div className="absolute bottom-24 right-16 opacity-10">
        <ExamIcons.Security size={40} className="text-emerald-500" />
      </div>

      {/* Subtle layout gridlines */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:24px_24px]" />
      
      {/* Light rays at the top */}
      <div className="absolute top-0 inset-x-0 h-[400px] bg-gradient-to-b from-emerald-500/5 via-amber-500/3 to-transparent opacity-70" />
    </div>
  );
};
