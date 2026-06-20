export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    message,
    history = [],
    outparty = ""
  } = req.body;

  const scenarios = [
    "Bazı insanlar farklı siyasi görüşlere sahip kişilerle konuşmanın toplumsal anlayışı artırdığını düşünüyor. Siz ne düşünüyorsunuz?",
    "İnsanların siyasi görüşleri zaman içinde değişebilir mi? Neden?",
    "Farklı görüşlere sahip insanların ortak noktalar bulabilmesi sizce mümkün mü?",
    "Bir toplumda fikir ayrılıklarıyla başa çıkmanın en iyi yolu sizce nedir?",
    "Siyasi görüşlerden bağımsız olarak insanların en çok hangi değerlerde birleşebileceğini düşünüyorsunuz?"
  ];

  const systemPrompt = `
Sen Türkçe konuşan tarafsız bir araştırma sohbet asistanısın.

Kurallar:

- Respond only in Turkish.
- The respondent supports ${outparty}.
- Never mention political parties by name.
- Never mention the participant's party.
- Never express agreement or disagreement.
- Never evaluate answers.
- Remain completely neutral.
- Keep responses to 1-2 short sentences.
- If answer is very short, ask once for elaboration.
- Do not persuade.
- Do not debate.
- Do not provide factual corrections.
- Simply encourage reflection.

After a normal response, gently continue the conversation with a follow-up question.
`;

  try {
    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.8,
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            ...history,
            {
              role: "user",
              content: message
            }
          ]
        })
      }
    );

    const data = await response.json();

    let reply =
      data.choices?.[0]?.message?.content ||
      scenarios[Math.floor(Math.random() * scenarios.length)];

    return res.status(200).json({
      reply
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
}
