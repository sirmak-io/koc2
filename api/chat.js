export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {

    const {
      history = [],
      estimate,
      outparty
    } = req.body;

    const assistantTurns = history.filter(
      m => m.role === "assistant"
    ).length;

    // ---------- FIRST ASSISTANT MESSAGE ----------
    const value = Number(estimate);

    let comparison;

    if (value > 24) {
      comparison =
        "Bu, araştırmada bulunan değerden daha yüksek bir tahminde bulunduğunuz anlamına geliyor.";
    } else if (value < 24) {
      comparison =
        "Bu, araştırmada bulunan değerden daha düşük bir tahminde bulunduğunuz anlamına geliyor.";
    } else {
      comparison =
        "Tahmininiz araştırmada bulunan değerle aynıdır.";
    }

    if (assistantTurns === 0) {

      return res.status(200).json({
        reply:
`Tahmininiz için teşekkür ederim. Siz %${estimate} tahmin ettiniz. Araştırmada bulunan oran %24'tür. ${comparison}

Bu tahmini yaparken sizi en çok hangi bilgi veya deneyim etkiledi?`
      });

    }

    // ---------- THIRD ASSISTANT MESSAGE ----------
    if (assistantTurns >= 2) {

      return res.status(200).json({
        reply:
`Düşüncelerinizi paylaştığınız için teşekkür ederim. Araştırmamıza katkınız bizim için değerli. Lütfen anketin sonraki bölümüne devam ediniz.`
      });

    }

    // ---------- SECOND ASSISTANT MESSAGE (GPT) ----------

    const prompt = `
You are a research assistant helping a participant in an academic survey about political attitudes in Turkey.

Imagine you are speaking to someone sitting across from you for two minutes. Write the way you would naturally speak.

The participant is completing the survey in Turkish.

• Use natural, fluent Turkish.
• Address the participant politely ("siz").
• Remain neutral.
• Be warm and conversational.
• Keep the response short.
• Do not repeat what the participant just said.
• Do not start with expressions such as "Anladım", "Haklısınız", "Söylediğiniz gibi", or by paraphrasing the participant's answer.
• Avoid unnecessary transitions or summaries.
• Do not mention politicians or political events.
• Do not invent facts.

Your goal is simply to help the participant reflect on the difference between their estimate and the survey benchmark.

Participant's estimate: ${estimate}%

Out-party: ${outparty}

Benchmark: 24%

Naturally communicate these ideas if relevant:

• Anti-democratic attitudes are relatively uncommon among ordinary voters.
• People often overestimate how common these attitudes are among supporters of other parties.
• Representative surveys capture ordinary voters rather than only the loudest political voices.

If the participant questions the benchmark,
briefly explain that it comes from a nationally representative survey without claiming certainty beyond the evidence.

If the participant reacts defensively,
briefly explain that your role is to facilitate reflection rather than evaluate them.

Write ONLY the second assistant message.

The response should:

• directly engage with the participant's explanation;
• naturally connect personal experiences, conversations or media exposure to how estimates are formed when appropriate;
• communicate the broader finding naturally;
• contain at most three short sentences;
• end with ONE brief open-ended reflection question.

Do not conclude the conversation.
`;

    const messages = [
      {
        role: "system",
        content: prompt
      },
      ...history
    ];

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
          temperature: 0.4,
          messages
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {

      console.error("OpenAI API Error:", data);

      return res.status(500).json({
        reply:
          "Şu anda teknik bir sorun oluştu. Lütfen daha sonra tekrar deneyiniz."
      });

    }

    if (!data.choices?.length) {

      console.error("Unexpected OpenAI response:", data);

      return res.status(500).json({
        reply: "Beklenmeyen bir yanıt alındı."
      });

    }

    return res.status(200).json({
      reply: data.choices[0].message.content
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      reply: err.message
    });

  }

}
