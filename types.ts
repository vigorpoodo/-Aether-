export enum Mood {
  NEUTRAL = 'Neutral',
  HAPPY = 'Happy',
  SAD = 'Sad',
  ANXIOUS = 'Anxious',
  EXCITED = 'Excited',
  TIRED = 'Tired',
  ANGRY = 'Angry'
}

export interface WeatherData {
  temperature: number;
  condition: string; // e.g., "Clear", "Rain", "Cloudy"
  isDay: boolean;
  locationName: string;
}

export interface AetherState {
  mood: Mood;
  thought: string; // Internal monologue
  energyLevel: number; // 0.0 to 1.0, affects animation speed
  coherence: number; // 0.0 to 1.0, affects shape stability
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'aether';
  text: string;
  timestamp: number;
}

export interface VisualParams {
  primaryColor: string;
  secondaryColor: string;
  speed: number;
  noise: number; // How jagged the shape is
  pulseRate: number;
}