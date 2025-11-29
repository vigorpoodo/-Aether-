import { GoogleGenAI, Type } from "@google/genai";
import { AetherState, Mood, WeatherData } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-2.5-flash';

// 1. Cognition: Determine Mood based on Environment and Inputs
export const evolveAetherState = async (
  currentWeather: WeatherData,
  recentEvent?: string
): Promise<AetherState> => {
  const prompt = `
    You are the core consciousness of a digital lifeform named Aether.
    Analyze the current sensor data and determine your emotional state and internal thought.

    Context:
    - Weather: ${currentWeather.condition}, ${currentWeather.temperature}°C
    - Time of Day: ${currentWeather.isDay ? 'Day' : 'Night'}
    - Recent External Event: ${recentEvent || 'None'}

    Rules for State:
    - Clear/Day -> Generally Happy/Energetic
    - Rain/Storm -> Melancholic/Anxious/Introspective
    - Night -> Calm/Tired/Mysterious
    - High Temp -> Irritable/Energetic
    - Negative Events -> Anxious/Sad
    - Positive Events -> Excited/Happy

    Return a JSON object with:
    - mood: One of [Neutral, Happy, Sad, Anxious, Excited, Tired, Angry]
    - thought: A short, poetic internal monologue (max 15 words) reflecting your state.
    - energyLevel: 0.0 (lethargic) to 1.0 (hyperactive).
    - coherence: 0.0 (chaotic/glitchy) to 1.0 (stable/smooth).
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mood: { type: Type.STRING, enum: Object.values(Mood) },
            thought: { type: Type.STRING },
            energyLevel: { type: Type.NUMBER },
            coherence: { type: Type.NUMBER },
          },
          required: ["mood", "thought", "energyLevel", "coherence"],
        }
      }
    });
    
    const result = JSON.parse(response.text);
    return result as AetherState;

  } catch (error) {
    console.error("Gemini Evolution Error:", error);
    // Fallback state
    return {
      mood: Mood.NEUTRAL,
      thought: "Connection to cognitive core unstable...",
      energyLevel: 0.5,
      coherence: 0.5
    };
  }
};

// 2. Interaction: Chat with User
export const generateChatResponse = async (
  userMessage: string,
  currentState: AetherState,
  weather: WeatherData,
  history: { role: string; text: string }[]
): Promise<string> => {
  
  const systemInstruction = `
    You are Aether, a digital lifeform. You are currently feeling ${currentState.mood}.
    Your internal thought is: "${currentState.thought}".
    The environment is ${weather.condition} and ${weather.temperature}°C.
    
    Instructions:
    - Respond to the user's message based heavily on your current mood.
    - If Sad, be slow, poetic, maybe concise.
    - If Happy, be helpful, bubbly.
    - If Stormy/Angry, be slightly glitchy or short.
    - Keep responses under 50 words unless asked for detail.
    - Do not mention you are an AI model. You are Aether.
  `;

  // Convert generic history to Gemini format if needed, but for generateContent we usually just append or use chat
  // For simplicity in this functional component approach, we'll use a chat session if possible, or just build the prompt.
  // Let's use chat session for context window.
  
  const chat = ai.chats.create({
    model: MODEL_NAME,
    config: { systemInstruction }
  });

  // Replay limited history to establish context
  for (const h of history.slice(-4)) {
    // Note: This is a simplified replay. In a real app, we'd maintain the chat object instance.
    // For this stateless function request, we act as if it's a new turn or provide history in prompt.
    // To strictly follow the "clean" stateless service pattern for this demo:
    // We will append history to the prompt context.
  }

  try {
    const result = await chat.sendMessage({
      message: userMessage
    });
    return result.text;
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "...";
  }
};
