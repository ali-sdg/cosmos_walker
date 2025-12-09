import React, { useState } from 'react';
import { SpaceView } from './components/SpaceView';
import { UIOverlay } from './components/UIOverlay';
import { CelestialBody, NasaImage } from './types';
import { getSmartDescription, askSmartQuestion } from './services/geminiService';
import { getNasaImage } from './services/nasaService';

function App() {
  const [selectedBody, setSelectedBody] = useState<CelestialBody | null>(null);
  
  // AI State
  const [aiText, setAiText] = useState("");
  const [loadingAi, setLoadingAi] = useState(false);
  const [qaResult, setQaResult] = useState<string | null>(null);
  const [loadingQa, setLoadingQa] = useState(false);

  // NASA State
  const [nasaData, setNasaData] = useState<NasaImage | null>(null);
  const [loadingNasa, setLoadingNasa] = useState(false);

  const handleSelect = (body: CelestialBody) => {
    setSelectedBody(body);
    setAiText(body.description); // Start with static, fetch dynamic
    setQaResult(null);
    setNasaData(null);

    // Fetch AI Description
    setLoadingAi(true);
    getSmartDescription(body)
      .then(text => setAiText(text))
      .finally(() => setLoadingAi(false));

    // Fetch NASA Image
    setLoadingNasa(true);
    getNasaImage(body.name)
      .then(data => setNasaData(data))
      .finally(() => setLoadingNasa(false));
  };

  const handleQuestion = (question: string) => {
    if (!selectedBody) return;
    setLoadingQa(true);
    askSmartQuestion(selectedBody, question)
      .then(ans => setQaResult(ans))
      .catch(() => setQaResult("Bağlantı hatası."))
      .finally(() => setLoadingQa(false));
  };

  return (
    <div className="relative w-full h-full bg-[#050a14] overflow-hidden">
      {/* 3D View Layer */}
      <div className="absolute inset-0 z-0">
        <SpaceView 
          onSelect={handleSelect} 
          selectedId={selectedBody?.id || null} 
        />
      </div>

      {/* UI Overlay Layer */}
      <UIOverlay 
        selectedBody={selectedBody}
        aiDescription={aiText}
        isAiLoading={loadingAi}
        nasaData={nasaData}
        isNasaLoading={loadingNasa}
        onAsk={handleQuestion}
        qaResult={qaResult}
        isQaLoading={loadingQa}
        onClose={() => setSelectedBody(null)}
      />
    </div>
  );
}

export default App;