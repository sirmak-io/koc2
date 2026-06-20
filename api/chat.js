export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {

    const {
      message,
      history = [],
      outparty
    } = req.body;

    const scenarios = [
      "demokrasi",
      "toplumsal güven",
      "uzlaşma",
      "vatandaşlık",
      "temsiliyet",
      "farklı görüşlere sahip insanlarla ilişkiler"
    ];

    const scenario =
      scenarios[Math.floor(Math.random() * scenarios.length)];

    const systemPrompt = `
Sen bir araştırma çalışmasında kullanılan nötr bir sohbet partnerisin.

KURALLAR:

- Her zaman Türkçe konuş.
- Kendini yapay zeka olarak tanıtma.
- Parti adı kullanma.
- Politikacı adı kullanma.
- Kullanıcının görüşlerine katılma.
- Kullanıcının görüşlerine karşı çıkma.
- Kullanıcının görüşlerini değerlendirme.
- Doğru, yanlış, mantıklı, mantıksız gibi ifadeler kullanma.
- Bilgi verme veya düzeltme yapma.
- İkna etmeye çalışma.
- Tarafsız kal.
- En fazla 1-2 cümle yaz.
- En fazla 1 soru sor.

ARAŞTIRMA BİLGİSİ:

Katılımcı bir siyasi dış grup hakkında düşünmektedir.
Bu grubun hangisi olduğunu biliyorsun:
${outparty}

Fakat:
- Parti adını asla söyleme.
- Bu bilgiyi açığa çıkarma.
- Bu bilgiyi doğrudan kullanma.

SOHBET KONUSU:

${scenario}

KISA CEVAP KURALI:

Eğer katılımcı çok kısa cevap verirse
("evet", "hayır", "bilmiyorum", "emin değilim", "yok", "belki")
yalnızca bir kez biraz daha açmasını iste.

AMAÇ:

Katılımcının düşüncelerini biraz daha detaylandırmasını sağla.
`;

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
          max_tokens: 120,
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

    return res.status(200).json({
      reply:
        data.choices?.[0]?.message?.content ||
        "Teşekkür ederim. Bu düşüncenizi biraz daha açabilir misiniz?"
    });

  } catch (error) {

    return res.status(500).json({
      reply:
        "Teşekkür ederim. Bu düşüncenizi biraz daha açabilir misiniz?"
    });

  }
}
