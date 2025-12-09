import React, { useState } from 'react';
import { CelestialBody, NasaImage } from '../types';
import { Search, Info, ImageIcon, X, ChevronRight, Activity } from 'lucide-react';

interface UIOverlayProps {
  selectedBody: CelestialBody | null;
  aiDescription: string;
  isAiLoading: boolean;
  nasaData: NasaImage | null;
  isNasaLoading: boolean;
  onAsk: (q: string) => void;
  qaResult: string | null;
  isQaLoading: boolean;
  onClose: () => void;
}

export const UIOverlay: React.FC<UIOverlayProps> = ({
  selectedBody,
  aiDescription,
  isAiLoading,
  nasaData,
  isNasaLoading,
  onAsk,
  qaResult,
  isQaLoading,
  onClose
}) => {
  const [question, setQuestion] = useState("");

  const handleAsk = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim()) onAsk(question);
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden flex flex-col justify-between p-6">
      
      {/* 1. TOP BAR - TITLE */}
      <div className="flex justify-between items-center pointer-events-auto">
        <div>
           <h1 className="text-4xl font-extralight text-cyan-100 tracking-[0.3em] drop-shadow-[0_0_8px_rgba(0,255,255,0.4)]">
             STAR WALKER
           </h1>
           <div className="h-[1px] w-32 bg-cyan-500/50 mt-2"></div>
           <p className="text-[10px] text-cyan-400/60 uppercase tracking-widest mt-1">
             Evrensel Keşif Arayüzü
           </p>
        </div>
      </div>

      {/* 2. BOTTOM TIP */}
      {!selectedBody && (
        <div className="text-center mb-10 animate-pulse">
           <p className="text-cyan-500/50 text-xs tracking-[0.4em] uppercase">
             Keşfetmek için bir cisme tıklayın
           </p>
        </div>
      )}

      {/* 3. SIDE PANEL - INFO CARD */}
      {selectedBody && (
        <div className="absolute top-0 right-0 w-full md:w-[450px] h-full bg-[#050a14]/80 backdrop-blur-xl border-l border-white/10 pointer-events-auto flex flex-col transition-transform duration-500 ease-out shadow-2xl">
           
           {/* Header Image (NASA or Color Placeholder) */}
           <div className="relative h-48 w-full overflow-hidden shrink-0 bg-black">
              {isNasaLoading ? (
                 <div className="absolute inset-0 flex items-center justify-center bg-cyan-900/20 animate-pulse">
                    <span className="text-[10px] text-cyan-400 tracking-widest">GÖRÜNTÜ YÜKLENİYOR...</span>
                 </div>
              ) : nasaData ? (
                 <img src={nasaData.url} className="w-full h-full object-cover opacity-80" alt="NASA" />
              ) : (
                 <div className="w-full h-full" style={{ backgroundColor: selectedBody.color, opacity: 0.2 }}></div>
              )}
              
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
              >
                <X size={24} strokeWidth={1} />
              </button>

              <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-[#050a14] to-transparent">
                  <h2 className="text-5xl font-thin text-white drop-shadow-md">{selectedBody.displayName}</h2>
                  <p className="text-cyan-400 text-xs tracking-widest uppercase mt-1">{selectedBody.name}</p>
              </div>
           </div>

           {/* Scrollable Content */}
           <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
              
              {/* Stats */}
              <div className="grid grid-cols-2 gap-px bg-white/10 border border-white/10">
                 <div className="p-4 bg-white/5 backdrop-blur-sm">
                    <span className="block text-[10px] text-cyan-400/60 uppercase tracking-widest mb-1">Tür</span>
                    <span className="text-lg font-light text-white capitalize">{selectedBody.type}</span>
                 </div>
                 <div className="p-4 bg-white/5 backdrop-blur-sm">
                    <span className="block text-[10px] text-cyan-400/60 uppercase tracking-widest mb-1">Mesafe</span>
                    <span className="text-lg font-light text-white">{selectedBody.distance} AU</span>
                 </div>
              </div>

              {/* Description */}
              <div className="relative pl-4 border-l-2 border-cyan-500/30">
                 <h3 className="text-sm font-normal text-cyan-200 mb-2 flex items-center gap-2">
                    <Info size={14} /> ÖZET BİLGİ
                 </h3>
                 <p className="text-sm font-light text-gray-300 leading-relaxed">
                    {isAiLoading ? (
                        <span className="animate-pulse text-cyan-500">Analiz ediliyor...</span>
                    ) : (
                        aiDescription
                    )}
                 </p>
              </div>

              {/* NASA Credit */}
              {nasaData && (
                  <div className="bg-black/30 p-4 rounded border border-white/5">
                      <div className="flex items-center gap-2 text-cyan-500/70 mb-2">
                          <ImageIcon size={14} />
                          <span className="text-[10px] uppercase tracking-widest">NASA Arşivi</span>
                      </div>
                      <p className="text-xs text-gray-400 italic">"{nasaData.title}"</p>
                      <p className="text-[10px] text-gray-600 mt-1">{nasaData.date}</p>
                  </div>
              )}

              {/* QA Section */}
              <div className="pt-4 border-t border-white/10">
                 <h3 className="text-sm font-normal text-cyan-200 mb-4 flex items-center gap-2">
                    <Search size={14} /> SORGULAMA ARAYÜZÜ
                 </h3>
                 
                 <form onSubmit={handleAsk} className="relative mb-4">
                    <input 
                      type="text" 
                      value={question}
                      onChange={e => setQuestion(e.target.value)}
                      placeholder="Bu cisim hakkında soru sorun..."
                      className="w-full bg-white/5 border border-white/10 rounded p-3 pl-4 pr-10 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors font-light"
                    />
                    <button 
                       type="submit" 
                       disabled={isQaLoading}
                       className="absolute right-2 top-1/2 -translate-y-1/2 text-cyan-400 hover:text-white disabled:opacity-50"
                    >
                       <ChevronRight size={18} />
                    </button>
                 </form>

                 {isQaLoading && (
                    <div className="flex items-center gap-2 text-xs text-cyan-500 animate-pulse">
                        <Activity size={12} className="animate-bounce" />
                        <span>Veritabanı taranıyor...</span>
                    </div>
                 )}

                 {qaResult && !isQaLoading && (
                    <div className="bg-cyan-900/20 border-l-2 border-cyan-500/50 p-4 text-sm font-light text-gray-200 leading-relaxed">
                       {qaResult}
                    </div>
                 )}
              </div>

           </div>
        </div>
      )}

    </div>
  );
};