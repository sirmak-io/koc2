export default async function handler(req, res) {

// ============================================================
// api/claude_us.js
// AI-Personalized Misperception Correction Experiment
// ============================================================


// ------------------------------------------------------------
// Configuration
// ------------------------------------------------------------

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

const MODEL = "claude-sonnet-5";

const MAX_TOKENS = 250;

const TEMPERATURE = 0.4;



// ------------------------------------------------------------
// Holliday et al. (2024) benchmark values
// ------------------------------------------------------------

const BENCHMARKS = {

  Democrat: {
    poll: 9.2,
    court: 14.6,
    assault: 3.6
  },

  Republican: {
    poll: 8.8,
    court: 11.5,
    assault: 2.6
  }

};



// ------------------------------------------------------------
// Helper functions
// ------------------------------------------------------------

function difference(estimate, actual) {
  return Number((estimate - actual).toFixed(1));
}


function average(values) {
  return Number(
    (
      values.reduce((a, b) => a + b, 0) /
      values.length
    ).toFixed(1)
  );
}


function overallDirection(avgGap) {

  if (avgGap > 0) return "higher";

  if (avgGap < 0) return "lower";

  return "same";

}


function directionLabel(estimate, actual) {

  const diff = estimate - actual;

  if (diff > 5) return "OVERESTIMATED";

  if (diff < -5) return "UNDERESTIMATED";

  return "CLOSE";

}



// ------------------------------------------------------------
// Platform-generated opening message
// (Claude is NOT called)
// ------------------------------------------------------------

function buildOpeningMessage(data) {

  let summary;

  if (data.overallDirection === "higher") {

    summary =
      `Across the three items, your estimates were on average ${Math.abs(data.averageGap)} percentage points higher than the actual figures.`;

  }

  else if (data.overallDirection === "lower") {

    summary =
      `Across the three items, your estimates were on average ${Math.abs(data.averageGap)} percentage points lower than the actual figures.`;

  }

  else {

    summary =
      `Across the three items, your estimates were on average the same as the actual figures.`;

  }


  let reflectionQuestion;

  if (data.overallDirection === "same") {

    reflectionQuestion =
      "Before I say more: what do you think helped you arrive at estimates that were so close to the actual numbers?";

  }

  else {

    reflectionQuestion =
      "Before I say more: what do you think is behind the gap between your estimates and the actual numbers?";

  }


  return `Thanks for completing those estimates. Here's what national survey data shows about how ${data.outparty} supporters actually answered the same questions:

Reducing polling stations:
your estimate ${data.guessPoll}% — actual ${data.actualPoll}%

Ignoring court decisions:
your estimate ${data.guessCourt}% — actual ${data.actualCourt}%

Assaulting political opponents:
your estimate ${data.guessAssault}% — actual ${data.actualAssault}%

${summary}

This pattern—overestimating how much the other side endorses these kinds of actions—is something national surveys find for most Americans, in both parties. The figures come from a 2022 survey of about 45,000 Americans (Holliday et al., 2024).

${reflectionQuestion}`;

}



// ------------------------------------------------------------
// Platform-generated closing message
// ------------------------------------------------------------

const CLOSING_MESSAGE =
  "Thanks for thinking this through with me — I'll hand you back to the survey now.";



// ============================================================
// API
// ============================================================

export default async function handler(req, res) {

  if (req.method !== "POST") {

    return res.status(405).json({
      error: "Method not allowed"
    });

  }


  const {

    history = [],

    participantId,

    party,

    inparty,

    outparty,

    guessPoll,

    guessCourt,

    guessAssault,

    reasoning

  } = req.body;



  // ----------------------------------------------------------
  // Select benchmark values
  // Democrat respondents estimate Republicans
  // Republican respondents estimate Democrats
  // ----------------------------------------------------------

  const actual =
    party === "Democrat"
      ? BENCHMARKS.Republican
      : BENCHMARKS.Democrat;



  // ----------------------------------------------------------
  // Compute participant-specific quantities
  // ----------------------------------------------------------

  const gapPoll = difference(guessPoll, actual.poll);

  const gapCourt = difference(guessCourt, actual.court);

  const gapAssault = difference(guessAssault, actual.assault);


  const avgGap = average([
    gapPoll,
    gapCourt,
    gapAssault
  ]);


  const participantData = {

    participantId,

    party,

    inparty,

    outparty,

    reasoning,

    guessPoll,

    guessCourt,

    guessAssault,

    actualPoll: actual.poll,

    actualCourt: actual.court,

    actualAssault: actual.assault,

    gapPoll,

    gapCourt,

    gapAssault,

    averageGap: avgGap,

    overallDirection: overallDirection(avgGap),

    dirPoll: directionLabel(guessPoll, actual.poll),

    dirCourt: directionLabel(guessCourt, actual.court),

    dirAssault: directionLabel(guessAssault, actual.assault)

  };


  // ----------------------------------------------------------
  // Count assistant messages
  // ----------------------------------------------------------

  const assistantTurns = history.filter(
    m => m.role === "assistant"
  ).length;


  // ----------------------------------------------------------
  // First message (platform generated)
  // ----------------------------------------------------------

  if (assistantTurns === 0) {

    return res.json({
      reply: buildOpeningMessage(participantData)
    });

  }


  // ----------------------------------------------------------
  // End conversation after three assistant replies
  // ----------------------------------------------------------

  if (assistantTurns >= 3) {

    return res.json({
      reply: CLOSING_MESSAGE
    });

  }


  // ==========================================================
  // PART 2 STARTS HERE
  // Build the Appendix A system prompt and call Claude Sonnet 5
  // ==========================================================

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

Briefly note that personal experiences, conversations, or media exposure can shape people's estimates.

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
Do not evaluate the participant's explanation.
Do not agree or disagree with it.
Simply acknowledge that different information sources may shape people's estimates.

- Use natural Turkish.
- Keep the response polite, neutral and matter-of-fact. 
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
          model: "claude-sonnet-5",
          max_tokens: 250,
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
  reply: data.content
    .filter(x => x.type === "text")
    .map(x => x.text)
    .join("")
});
  } catch (err) {

    console.error(err);

    return res.status(500).json({
      reply: err.message
    });

  }

}
