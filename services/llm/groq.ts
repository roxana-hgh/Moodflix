import Groq from "groq-sdk";

if (!process.env.GROQ_API_KEY) {
  throw new Error("Missing GROQ_API_KEY env var");
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MOOD_MODEL = "openai/gpt-oss-120b";

export async function getMoodCompletion(systemPrompt: string, userMessage: string): Promise<string> {
  const completion = await groq.chat.completions.create({
    model: MOOD_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    // Not using response_format: json_object — Groq's server-side JSON
    // validation gate has been unreliable (400s with empty failed_generation
    // and no way to see what it rejected). We validate with Zod ourselves instead.
    temperature: 0.3,
    max_tokens: 400,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Empty response from Groq");
  }
  return content;
}