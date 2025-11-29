import React, { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AetherState, Mood, WeatherData, ChatMessage } from './types';
import { fetchWeather, getGeolocation } from './services/environmentService';
import { evolveAetherState, generateChatResponse } from './services/geminiService';
import AetherVisualizer from './components/AetherVisualizer';
import InterfacePanel from './components/InterfacePanel';

const App: React.FC = () => {
  // --- State ---
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [aetherState, setAetherState] = useState<AetherState>({
    mood: Mood.NEUTRAL,
    thought: "Initializing systems...",
    energyLevel: 0.5,
    coherence: 0.8
  });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastEvent, setLastEvent] = useState<string | undefined>(undefined);

  // --- Initialization & Environment Loop ---
  useEffect(() => {
    const initEnvironment = async () => {
      try {
        const { lat, lon } = await getGeolocation();
        const wData = await fetchWeather(lat, lon);
        setWeather(wData);
        
        // Initial evolution
        const newState = await evolveAetherState(wData);
        setAetherState(newState);
      } catch (err) {
        console.error("Initialization failed", err);
      }
    };

    initEnvironment();

    // Poll weather every 10 minutes
    const weatherInterval = setInterval(async () => {
      try {
        const { lat, lon } = await getGeolocation();
        const wData = await fetchWeather(lat, lon);
        setWeather(wData);
      } catch (e) { console.error(e); }
    }, 600000);

    return () => clearInterval(weatherInterval);
  }, []);

  // --- Evolution Loop ---
  // Aether re-evaluates its state every time weather changes or a significant event occurs
  useEffect(() => {
    if (!weather) return;

    const evolve = async () => {
      // Don't evolve if currently processing a chat to avoid state jumpiness
      if (isProcessing) return; 

      try {
        const newState = await evolveAetherState(weather, lastEvent);
        setAetherState(newState);
        // Clear event after processing so it doesn't dominate forever
        if (lastEvent) {
          setTimeout(() => setLastEvent(undefined), 30000);
        }
      } catch (e) { console.error("Evolution error", e); }
    };

    evolve();
    
    // "Lifebeat": Randomly evolve thoughts every 2 minutes even if nothing happens
    const lifeBeat = setInterval(evolve, 120000); 
    return () => clearInterval(lifeBeat);

  }, [weather, lastEvent]);

  // --- Interaction Handlers ---
  const handleSendMessage = useCallback(async (text: string) => {
    if (!weather) return;

    // Add User Message
    const userMsg: ChatMessage = {
      id: uuidv4(),
      sender: 'user',
      text,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsProcessing(true);

    try {
      // 1. Get Response
      const responseText = await generateChatResponse(
        text,
        aetherState,
        weather,
        messages.map(m => ({ role: m.sender, text: m.text }))
      );

      // 2. Add Bot Message
      const botMsg: ChatMessage = {
        id: uuidv4(),
        sender: 'aether',
        text: responseText,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, botMsg]);

      // 3. Conversation affects state immediately
      // Small chance to change mood based on interaction context would go here
      // For now, we let the periodic evolution handle major shifts, 
      // but we could call evolveAetherState with the user's text as an "event"
      
    } catch (err) {
      console.error("Chat Error", err);
    } finally {
      setIsProcessing(false);
    }
  }, [aetherState, weather, messages]);

  const handleSimulateEvent = (event: string) => {
    setLastEvent(event);
    // This will trigger the useEffect dependent on `lastEvent` to re-run evolution
  };

  return (
    <div className="relative w-screen h-screen bg-slate-900 overflow-hidden">
      {/* Background Visualizer */}
      <AetherVisualizer state={aetherState} />
      
      {/* UI Overlay */}
      <InterfacePanel 
        weather={weather}
        aetherState={aetherState}
        messages={messages}
        onSendMessage={handleSendMessage}
        onSimulateEvent={handleSimulateEvent}
        isProcessing={isProcessing}
      />
    </div>
  );
};

export default App;