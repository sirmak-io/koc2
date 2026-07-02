export default async function handler(req, res) {

  const {
  history = [],
  estimate
} = req.body;

  // Assistant'ın şimdiye kadar kaç mesaj gönderdiğini say
  const assistantTurns = history.filter(
    m => m.role === "assistant"
  ).length;

  let reply;

  const value = Number(estimate);

  let comparison;

  if (value > 24) {
    comparison = "Bu, gerçek değeri olduğundan daha yüksek tahmin ettiğiniz anlamına geliyor.";
  } else if (value < 24) {
    comparison = "Bu, gerçek değeri olduğundan daha düşük tahmin ettiğiniz anlamına geliyor.";
  } else {
    comparison = "Tahmininiz araştırmada bulunan değerle aynıdır.";
  }
  
  if (assistantTurns === 0) {

    const value = Number(estimate);

let comparison;

if (value > 24) {
  comparison = "Bu, gerçek değeri olduğundan daha yüksek tahmin ettiğiniz anlamına geliyor.";
} else if (value < 24) {
  comparison = "Bu, gerçek değeri olduğundan daha düşük tahmin ettiğiniz anlamına geliyor.";
} else {
  comparison = "Tahmininiz araştırmada bulunan değerle aynıdır.";
}
    
    reply =
`Tahmininiz için teşekkür ederim. Siz %${estimate} tahmin ettiniz. Araştırmada bulunan oran %24'tür. Bu, gerçek değeri olduğundan daha yüksek tahmin ettiğiniz anlamına geliyor.

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
