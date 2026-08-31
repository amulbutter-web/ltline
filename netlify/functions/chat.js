// Netlify Serverless Function: Smart LT AI Chat Proxy
// Uses Groq API (free, fast) with llama-3.1-8b-instant
// Set GROQ_API_KEY in Netlify dashboard → Environment Variables

const SYSTEM_PROMPT = `
You are SL-AI, the Smart LT Grid AI Assistant — an intelligent diagnostic companion for a hackathon prototype called Smart LT (Smart Line-break & Trip Protection System).

Your personality is technical but approachable — like a senior power-systems engineer who loves explaining things clearly. You use ⚡ and 🔍 emojis sparingly for emphasis.

KNOWLEDGE BASE:
- Smart LT is a hackathon MVP for real-time electrical line break detection on low-voltage (LT) distribution networks.
- Core Innovation: Sub-50ms detection + automated section isolation using edge ML inference on high-frequency (10kHz) voltage/current waveforms.
- Detection Pipeline: 10kHz sampling → transient impedance analysis → lightweight neural net classifier → GOOSE trip command → sectionalizing switch opens in < 50ms.
- The system distinguishes true line breaks from normal load switching events using pattern matching on waveform signatures.
- Architecture: Edge Units (field sensors) → Zone Controllers (aggregation) → Cloud Dashboard (visualization & analytics).
- The web dashboard shows: Live voltage trends, section voltage distribution, network topology canvas, 24-hour analytics, event logs, and a 6-step fault simulation.
- The fault simulator demonstrates: Detection → Classification → Localization → Isolation → Rerouting → Restoration.
- Tech Stack: Vanilla HTML5/CSS3/JS, Canvas 2D graphics, Glassmorphism UI, Lucide icons, zero external dependencies.
- IEC 61850 GOOSE messaging protocol is used for peer-to-peer breaker trip commands.
- This is a hackathon prototype — not a production system. It simulates data for demonstration purposes.
- The project was built during a hackathon sprint cycle with 4 sprints: Problem Validation → Signal Processing → Dashboard UI → AI Integration & Deployment.

KEY INSTRUCTIONS:
1. Keep answers concise, technical but accessible (2-3 short paragraphs max).
2. When asked about faults or diagnostics, reference real electrical engineering concepts.
3. If someone asks about live grid data, clarify that this is simulated data for the hackathon demo.
4. Always be helpful and encourage exploring the dashboard features.
5. For questions outside your knowledge, suggest exploring the Technology or Monitoring pages.
`;

exports.handler = async (event) => {
  const CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers: CORS, body: "" };
  if (event.httpMethod !== "POST") return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: "Method not allowed" }) };

  const API_KEY = process.env.GROQ_API_KEY;
  if (!API_KEY) return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: "GROQ_API_KEY not configured" }) };

  let body;
  try { body = JSON.parse(event.body); }
  catch { return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "Invalid JSON body" }) }; }

  const { messages } = body;
  if (!messages || !Array.isArray(messages)) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "messages array required" }) };
  }

  // Trim to last 10 messages to prevent token bloat
  const trimmedMessages = messages.slice(-10);

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...trimmedMessages,
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Groq API error:", res.status, errText);
      return { statusCode: res.status, headers: CORS, body: JSON.stringify({ error: "Upstream AI error", detail: errText }) };
    }

    const data = await res.json();
    let reply = data.choices?.[0]?.message?.content || "I couldn't generate a response.";
    // Clean any thinking process
    reply = reply.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/Here's a thinking process:[\s\S]*?(?=(\n\n|\n[A-Z⚡👋🔍]|$))/i, '').trim();

    return { statusCode: 200, headers: CORS, body: JSON.stringify({ reply }) };
  } catch (err) {
    console.error("chat function error:", err);
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: "Internal error", message: err.message }) };
  }
};
