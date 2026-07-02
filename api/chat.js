export default async function handler(req, res) {

  const { history = [] } = req.body;

  // Assistant'ın şimdiye kadar kaç mesaj gönderdiğini say
  const assistantTurns = history.filter(
    m => m.role === "assistant"
  ).length;

  let reply;

  if (assistantTurns === 0) {

    reply =
`Tahmininiz için teşekkür ederim. Siz %37 tahmin ettiniz. Araştırmada bulunan oran %24'tür. Bu, gerçek değeri olduğundan daha yüksek tahmin ettiğiniz anlamına geliyor.

Bu tahmini yaparken sizi en çok hangi bilgi veya deneyim etkiledi?`;

  } else if (assistantTurns === 1) {

    reply =
`Paylaştığınız açıklama için teşekkür ederim. İnsanların kişisel deneyimleri ve karşılaştıkları bilgiler tahminlerini doğal olarak etkileyebilir. Bununla birlikte, ulusal temsili araştırmalar çoğu zaman farklı siyasi görüşlerden sıradan seçmenler arasında demokrasi karşıtı tutumların sanıldığından daha az yaygın olduğunu göstermektedir.

Bu bulgudan kendiniz için çıkardığınız bir düşünce var mı?`;

  } else {

    reply =
`Paylaştığınız görüş için teşekkür ederim.

Düşüncelerinizi paylaştığınız için teşekkür ederim. Araştırmamıza katkınız bizim için değerli. Lütfen anketin sonraki bölümüne devam ediniz.`;

  }

  return res.status(200).json({ reply });

}
