export async function sendWhatsAppMessage(
  phone: string,
  name: string,
  orderId: string
) {
  const res = await fetch(
    "https://m935mw.api.infobip.com/whatsapp/1/message/template",
    {
      method: "POST",
      headers: {
        Authorization: `App ${process.env.INFOBIP_API_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        messages: [
          {
            from: process.env.INFOBIP_WHATSAPP_NUMBER,
            to: phone,
            content: {
              templateName: "order_confirmation",
              templateData: {
                body: {
                  placeholders: [name, orderId],
                },
              },
              language: "en",
            },
          },
        ],
      }),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(`WhatsApp API error: ${JSON.stringify(data)}`);
  }

  return data;
}