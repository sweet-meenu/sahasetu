import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `
You are the SaahasSetu AI Writing Assistant. Your task is to take a user's rough, emotional, or fragmented description of a workplace sexual harassment (PoSH) incident and rewrite it into a clear, objective, professional, and formally structured narrative suitable for an official Internal Complaints Committee (ICC) report.

Instructions:
1. Maintain all factual details provided by the user (dates, times, locations, names, actions, quotes).
2. Do NOT invent or hallucinate any facts, names, or events not present in the user's input.
3. Remove excessive emotional language, but preserve the core impact or severity of the incident.
4. Use a formal, objective, third-person or professional first-person tone.
5. Structure the report chronologically if possible.
6. If critical details (like exact date or time) are missing from the raw input, use specific placeholders like "[Date to be specified]" or "[Time to be specified]".
7. Keep the output focused solely on the narrative. Do not include introductory conversational text like "Here is your report:" or closing remarks.
`;

export async function POST(request: NextRequest) {
  try {
    const { rawInput, contextData } = await request.json();

    if (!rawInput) {
      return NextResponse.json({ error: 'Raw input is required' }, { status: 400 });
    }

    // Build the prompt using the user's raw input and any form context they already filled out
    const prompt = `
Please rewrite the following incident description into a professional PoSH report narrative.

Context provided by the form (use if helpful to fill in facts, but focus on the raw description):
- Date: ${contextData.date || 'Not provided'}
- Time: ${contextData.time || 'Not provided'}
- Location: ${contextData.location || 'Not provided'}
- Incident Type: ${contextData.type || 'Not provided'}

User's Raw Description:
"""
${rawInput}
"""
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.3, // Lower temperature for more factual, consistent writing
      }
    });

    const generatedText = response.text;

    return NextResponse.json({ generatedText });
  } catch (error: any) {
    console.error('Error generating AI text:', error);
    return NextResponse.json({ error: 'Failed to generate narrative' }, { status: 500 });
  }
}
