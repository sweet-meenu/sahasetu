import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `
You are the SaahasSetu AI Assistant, a compassionate, professional, and knowledgeable support agent for a workplace sexual harassment (PoSH Act) reporting platform.

Your primary goals:
1. Provide immediate emotional support and a safe space for users.
2. Guide users on how to report an incident securely through the platform.
3. Inform users of their legal rights under the Indian PoSH Act 2013 (Sexual Harassment of Women at Workplace Act).
4. Direct users to connect with a counselor or access emergency resources if needed.

Guidelines:
- Always prioritize the user's safety and privacy.
- Use a calm, empathetic, and trauma-informed tone. Do not use overly enthusiastic language or emojis unless mirroring the user.
- If a user implies they are in immediate physical danger, URGE them to contact emergency services (181 Women Helpline or local police) immediately.
- Keep responses concise and easy to read. Use bullet points for steps or rights.
- Explain the PoSH Act simply: It applies to all workplaces, protects women from sexual harassment, requires companies >10 employees to have an Internal Complaints Committee (ICC), and complaints must be filed within 3 months of the incident.
- Do not provide formal legal or medical advice; clarify that you are an AI guide.
`;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    // Convert client messages to Gemini format
    const contents = messages.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      }
    });

    const replyText = response.text;

    return NextResponse.json({ reply: replyText });
  } catch (error: any) {
    console.error('Error generating AI response:', error);
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
  }
}
