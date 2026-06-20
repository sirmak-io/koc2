let reply;

if (message.length < 10) {
  reply = "Bu düşüncenizi biraz açabilir misiniz?";
} else {
  reply = "İlginç bir nokta. Bu görüşünüzü en çok ne şekillendirdi?";
}

return res.status(200).json({ reply });
