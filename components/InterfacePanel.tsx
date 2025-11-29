import React, { useState, useRef, useEffect } from 'react';
import { AetherState, ChatMessage, WeatherData, Mood } from '../types';
import { Send, MapPin, Thermometer, BrainCircuit, Activity, Radio } from 'lucide-react';

interface Props {
  weather: WeatherData | null;
  aetherState: AetherState;
  messages: ChatMessage[];
  onSendMessage: (msg: string) => void;
  onSimulateEvent: (event: string) => void;
  isProcessing: boolean;
}

const InterfacePanel: React.FC<Props> = ({ 
  weather, 
  aetherState, 
  messages, 
  onSendMessage, 
  onSimulateEvent,
  isProcessing 
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="absolute inset-0 z-10 flex flex-col pointer-events-none p-4 md:p-8 justify-between">
      
      {/* Top Header / Status Bar */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pointer-events-auto">
        <div>
          <h1 className="text-3xl font-bold font-mono tracking-wider text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
            AETHER
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}></span>
            SYSTEM ONLINE
          </p>
        </div>

        {/* Environmental Readout */}
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-lg p-3 text-xs md:text-sm text-slate-300 font-mono w-full md:w-auto min-w-[200px]">
          <div className="flex items-center gap-2 mb-1">
            <MapPin size={14} className="text-sky-400" />
            <span>{weather ? weather.locationName : 'Scanning...'}</span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <Thermometer size={14} className="text-orange-400" />
            <span>{weather ? `${weather.temperature}°C • ${weather.condition}` : '--'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-emerald-400" />
            <span className="uppercase text-white font-bold">{aetherState.mood}</span>
          </div>
        </div>
      </header>

      {/* Middle Layer: Internal Monologue & Event Simulation */}
      <div className="flex flex-col gap-4 pointer-events-auto items-start max-w-md">
         {/* Thought Bubble */}
        <div className="bg-black/40 backdrop-blur-sm border-l-2 border-purple-500 p-4 rounded-r-lg max-w-sm transition-all duration-500">
          <div className="flex items-center gap-2 text-purple-300 text-xs uppercase font-bold mb-1">
            <BrainCircuit size={14} />
            Internal Process
          </div>
          <p className="text-sm italic text-purple-100/90 leading-relaxed animate-in fade-in slide-in-from-left-4 duration-700 key={aetherState.thought}">
            "{aetherState.thought}"
          </p>
        </div>

        {/* Simulation Controls (Hidden on small screens if cluttered, kept for demo) */}
        <div className="flex gap-2 text-xs">
           <button 
             onClick={() => onSimulateEvent("Breaking News: World Peace Treaty Signed")}
             className="bg-slate-800/60 hover:bg-emerald-900/60 text-emerald-200 px-3 py-1.5 rounded border border-emerald-500/30 transition-colors"
           >
             + Good News
           </button>
           <button 
             onClick={() => onSimulateEvent("Breaking News: Massive Solar Flare Incoming")}
             className="bg-slate-800/60 hover:bg-red-900/60 text-red-200 px-3 py-1.5 rounded border border-red-500/30 transition-colors"
           >
             - Bad News
           </button>
        </div>
      </div>

      {/* Bottom Chat Interface */}
      <div className="w-full max-w-lg mx-auto pointer-events-auto mt-4">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700 rounded-xl overflow-hidden shadow-2xl">
          {/* Chat History */}
          <div className="h-48 md:h-64 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-slate-700">
             {messages.length === 0 && (
               <div className="text-center text-slate-500 text-sm mt-10">
                 Aether is listening. Say hello.
               </div>
             )}
             {messages.map((msg) => (
               <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                 <div className={`
                   max-w-[85%] px-3 py-2 rounded-lg text-sm
                   ${msg.sender === 'user' 
                     ? 'bg-sky-600/80 text-white rounded-br-none' 
                     : 'bg-slate-700/80 text-slate-200 rounded-bl-none border border-slate-600'}
                 `}>
                   {msg.text}
                 </div>
               </div>
             ))}
             <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="border-t border-slate-700 p-2 flex gap-2 bg-slate-950/50">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Interact with Aether..."
              className="flex-1 bg-transparent text-white px-3 py-2 outline-none text-sm placeholder-slate-500"
              disabled={isProcessing}
            />
            <button 
              type="submit" 
              disabled={!input.trim() || isProcessing}
              className="p-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>

    </div>
  );
};

export default InterfacePanel;