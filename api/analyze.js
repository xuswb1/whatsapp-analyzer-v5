export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  try {
    const { chatText } = await req.json();

    if (!chatText) {
      return new Response("No chat text provided", { status: 400 });
    }

    const prompt = `
Du bist ein WhatsApp-Chat-Analyst. Analysiere den folgenden Chatverlauf – egal ob er deutsch oder englisch ist, von iOS oder Android. Lies den Text wie ein Mensch.

Gib deine Analyse in diesen Punkten zurück:

1. 📈 Aktivität
2. ⏳ Antwortverhalten
3. 🔠 Sprachstil
4. 😂 Emojis
5. 🚩 Red Flags
6. 💬 Auffälligkeiten

Hier ist der Chat:

"""
${chatText.slice(0, 12000)}
"""

Formuliere wie ein Mensch, kein JSON, kein Code.
`;

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    const data = await openaiRes.json();
    const reply = data.choices?.[0]?.message?.content;

    return new Response(reply || "Keine Antwort von der KI.", { status: 200 });
  } catch (err) {
    return new Response("Server error: " + err.message, { status: 500 });
  }
}