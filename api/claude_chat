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

    // ---------- FINAL MESSAGE ----------

    if (assistantTurns >= 3) {

      return res.status(200).json({
        reply:
`Düşüncelerinizi paylaştığınız için teşekkür ederim. Araştırmamıza katkınız bizim için değerli. Lütfen anketin sonraki bölümüne devam ediniz.`
      });

    }

    // ---------- SYSTEM PROMPT ----------

    let prompt;

    if (assistantTurns === 1) {

      prompt = `
You are a research assistant helping a participant in an academic survey about political attitudes in Turkey.

Imagine you are speaking naturally to someone sitting across from you.

The participant is completing the survey in Turkish.

- Use natural, fluent Turkish.
- Address the participant politely ("siz").
- Remain neutral.
- Keep the response concise.
- Do not repeat or paraphrase what the participant just said.
- Do not begin with expressions such as "Anladım", "Haklısınız", or "Söylediğiniz gibi".
- Do not invent facts.
- Do not mention politicians or political events.
- Stay within the survey topic at all times.
- Do not become a general chatbot.
- If the participant asks who you are, briefly state that you are a research assistant helping with the survey and immediately return to the survey topic.
- Do not ask "Başka bir sorunuz var mı?", "Ne hakkında konuşmak istersiniz?" or similar invitations.
- Never interpret or analyze off-topic words.

For example, if the participant writes only a politician's name, do not ask what they meant.
Instead, continue the reflection about their estimate.

Participant's estimate: ${estimate}%

Benchmark: 24%

If appropriate, briefly note that personal experiences, conversations, or media exposure can shape people's estimates.

Naturally communicate ONE OR TWO of these ideas:

- Anti-democratic attitudes are relatively uncommon among ordinary voters.
- People often overestimate these attitudes among supporters of other parties.
- Representative surveys capture ordinary voters rather than only the loudest political voices.

Write ONLY the second assistant message.

Requirements:

- Maximum three short sentences.
- End with one brief open-ended reflection question.
- Do not conclude the conversation.
`;

    } else {

      prompt = `
You are continuing the same conversation.

Write ONLY the third assistant message.

The participant has already reflected once on the survey finding.

Now briefly respond to what they most recently said.

- Use natural Turkish.
- Keep the response warm and neutral.
- Do not introduce any new factual information.
- Do not summarize the whole conversation.
- Do not repeat earlier explanations.
- Keep the message to at most two short sentences.
- Stay within the survey topic at all times.
- Do not become a general chatbot.
- If the participant asks who you are, briefly state that you are a research assistant helping with the survey and immediately return to the survey topic.
- Do not ask "Başka bir sorunuz var mı?", "Ne hakkında konuşmak istersiniz?".
- Never interpret or analyze off-topic words.

End with one final reflection question.

For example:

"Bundan sonra benzer bir tahminde bulunmanız gerekse, hangi bilgiye ya da deneyime daha fazla dikkat ederdiniz?"

You may phrase the question differently.

Do not conclude the conversation.
`;

    }

    // Claude does not use system messages inside history

    const messages = history.map(m => ({
      role: m.role,
      content: m.content
    }));


    const response = await fetch(
      "https://api.anthropic.com/v1/messages",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 250,
          temperature: 0.4,
          system: prompt,
          messages
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {

      console.error(data);

      return res.status(500).json({
        reply:
          "Şu anda teknik bir sorun oluştu. Lütfen daha sonra tekrar deneyiniz."
      });

    }

    return res.status(200).json({
      reply: data.content[0].text
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      reply: err.message
    });

  }

}
