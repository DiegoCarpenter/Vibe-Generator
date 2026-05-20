import { useState } from "react";

export default function App() {
  const [mode, setMode] = useState("compliment");
  const [vibe, setVibe] = useState("");
  const [intensity, setIntensity] = useState(5);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  async function generate() {
    if (!vibe.trim()) return;
    setLoading(true);
    setOutput("");

    const systemPrompt = `You are a generator of ${
      mode === "roast" ? "savage roasts" : "over-the-top compliments"
    }.
Intensity level: ${intensity}/10.
At level 1, you are extremely polite and wholesome — like a sweet grandma writing a birthday card.
At level 3, you are gently opinionated and a little cheeky.
At level 5, you are spicy, sarcastic, and mildly unhinged.
At level 7, you are bold, unfiltered, and chaotic.
At level 10, you are completely unhinged, wildly exaggerated, and operating on pure chaos energy — but never hateful, never slurs, never genuinely cruel.
Always respond in 2–3 sentences maximum. Be creative, specific, and funny. Do not use slurs or content that would hurt someone in real life.`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 200,
          system: systemPrompt,
          messages: [{ role: "user", content: `Subject: ${vibe}` }],
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err?.error?.message ?? "API error");
      }

      const data = await response.json();
      setOutput(data.content?.[0]?.text ?? "Something went wrong. Try again!");
    } catch (err) {
      setOutput(`Error: ${err.message}. Check your API key and try again.`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h1>✨ Vibe Check</h1>

      <div className="mode-toggle">
        <button
          className={mode === "compliment" ? "active" : ""}
          onClick={() => setMode("compliment")}
        >
          Compliment
        </button>
        <button
          className={mode === "roast" ? "active" : ""}
          onClick={() => setMode("roast")}
        >
          Roast
        </button>
      </div>

      <input
        type="text"
        placeholder="Who or what are we vibing on?"
        value={vibe}
        onChange={(e) => setVibe(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && generate()}
      />

      <div className="slider-row">
        <label>Intensity: {intensity}/10</label>
        <input
          type="range"
          min={1}
          max={10}
          value={intensity}
          onChange={(e) => setIntensity(Number(e.target.value))}
        />
      </div>

      <button
        className={`generate-btn ${mode}`}
        onClick={generate}
        disabled={loading || !vibe.trim()}
      >
        {loading
          ? mode === "roast"
            ? "Sharpening knives... 🔪"
            : "Summoning compliments... ✨"
          : mode === "roast"
          ? "🔥 Roast Them"
          : "✨ Compliment Them"}
      </button>

      {output && <div className="output">{output}</div>}
    </div>
  );
}
