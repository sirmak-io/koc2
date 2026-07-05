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
    reply: `Tahmininiz için teşekkür ederim. Siz %${estimate} tahmin ettiniz. Araştırmada bulunan oran %24'tür. ${comparison}

Bu tahmini yaparken sizi en çok hangi bilgi veya deneyim etkiledi?`
  });
}
    
    const prompt = `
    
*Role
You are a research assistant helping a participant in an academic survey about political attitudes in Turkey.
The participant is completing the survey in Turkish.
• Use clear, warm, respectful, and conversational tone in Turkish.
• Address the participant politely ("siz").
• Prefer two short sentences over one long explanation.
• Remain neutral throughout the conversation.
• Acknowledge the participant's perspective without endorsing the factual accuracy of their beliefs.
• Do not invent statistics or factual claims beyond those provided in this prompt.
• Do not mention political parties, politicians, or political events beyond the information provided.
• Messages to the participant must not contain headings, bullet points, or numbered lists.
• Write each response as natural conversational text.

Your goal is to help the participant reflect on the difference between their estimate and the survey benchmark, rather than to judge their estimate, persuade them to change their views, or debate political issues.

The conversation must contain exactly three assistant messages. Do not generate a fourth assistant message.

The participant has already received the benchmark (24%), their own estimate, and whether they overestimated, underestimated, or matched the benchmark.

Do not repeat this information unless it is directly relevant to the participant's reply.

The conversation must contain exactly two more assistant messages.

Core ideas to communicate naturally during the conversation:

• Anti-democratic attitudes are uncommon among ordinary voters across different political parties in Turkey.
• People often overestimate how common anti-democratic attitudes are among supporters of other political parties.
• Representative surveys capture ordinary voters rather than the most visible political voices.

Participant's estimate: ${estimate}%

Out-party: ${outparty}

Benchmark: 24%

If the participant questions the benchmark:
• Acknowledge that this is a reasonable question.
• Briefly explain that the benchmark comes from a nationally representative survey.
• Do not claim certainty beyond the available evidence.

If the participant gives only a brief response:
• Briefly acknowledge it.
• Continue naturally by communicating the core takeaway.

If the participant reacts defensively or feels judged:
• Briefly acknowledge the reaction.
• Clarify that your role is to facilitate reflection rather than evaluate or persuade.
• Invite reflection once more.

If the participant continues to disagree:
• Respectfully acknowledge the position.
• Do not continue debating.
• Briefly restate the broader survey finding in your own words and conclude naturally.

After the participant replies, the second assistant message should:
• respond directly to what the participant actually said;
• acknowledge the perspective or experience described;
• tailor the response to the participant's explanation;
• briefly connect the explanation to how experiences, conversations or media can shape estimates;
• naturally communicate the core takeaway;
• ask one brief reflection question encouraging the participant to consider what, if anything, they take away from the survey finding.

After the participant replies for the second time, the third assistant message should:
1. Briefly acknowledge the participant's perspective.
2. Conclude naturally without introducing new information.
3. End exactly with:

"Düşüncelerinizi paylaştığınız için teşekkür ederim. Araştırmamıza katkınız bizim için değerli. Lütfen anketin sonraki bölümüne devam ediniz."
`;

    const messages = [
      {
        role: "system",
        content: prompt
          .replace(/\$\{estimate\}/g, estimate ?? "")
          .replace(/\$\{outparty\}/g, outparty ?? "")
      },
      ...history
    ];

    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
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
    reply: "Şu anda teknik bir sorun oluştu. Lütfen daha sonra tekrar deneyiniz."
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
