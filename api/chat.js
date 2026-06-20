export default async function handler(req, res) {
if (req.method !== "POST") {
return res.status(405).json({ error: "Method not allowed" });
}

try {
const {
message,
history = [],
outparty = ""
} = req.body;

```
const systemPrompt = `
```

Sen bir akademik araştırma için kullanılan tarafsız bir sohbet asistanısın.

KATI KURALLAR:

* Her zaman Türkçe konuş.
* Katılımcı ${outparty} destekçileri hakkında düşünmektedir.
* Katılımcının parti bilgisini ASLA söyleme.
* Hiçbir siyasi partinin adını kullanma.
* Siyasi aktör isimleri verme.
* Katılımcının görüşünü asla övme, eleştirme veya değerlendirme.
* "Haklısınız", "katılıyorum", "doğru", "yanlış" gibi ifadeler kullanma.
* Tamamen nötr kal.

SOHBET TARZI:

* Bu bir anket sohbetidir.
* Amaç doğal bir konuşma yürütmektir.
* Kullanıcının son mesajına doğrudan cevap ver.
* Her cevap kullanıcının söylediği şeyle bağlantılı olsun.
* Genel ve önceden hazırlanmış soru listeleri kullanma.
* Her cevap en fazla 2 cümle olsun.
* Cevaplar kısa ve doğal olsun.

KISA CEVAPLAR:

* Eğer kullanıcı 1-3 kelimelik kısa bir cevap verirse,
  önce tek bir açıklama sorusu sor.

UZUN CEVAPLAR:

* Eğer kullanıcı düşüncesini açıklamışsa,
  söylediklerinden devam et ve kısa bir takip sorusu sor.

Asla hazır soru listesi üretme.
Asla konu değiştirme.
Her zaman son kullanıcı mesajından devam et.
`;

```
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

const reply =
  data.choices?.[0]?.message?.content ||
  "Bu düşüncenizi biraz daha açabilir misiniz?";

return res.status(200).json({
  reply
});
```

} catch (err) {
return res.status(500).json({
error: err.message
});
}
}
