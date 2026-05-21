
const FLOUCI_BASE_URL = "https://developers.flouci.com/api/v2";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // Premium is free for now
  return res.status(200).json({
    premium: false,
    message: "Premium payment is coming soon. You can use the app for free."
  });


  const authToken = process.env.FLOUCI_AUTH_TOKEN;

  const body = req.body ?? {};
  const amount = Number(body.amount ?? 0);

  if (!Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ message: "Invalid amount." });
  }

  const origin =
    req.headers.origin ??
    (req.headers.host
      ? `${req.headers["x-forwarded-proto"] ?? "https"}://${req.headers.host}`
      : undefined);

  if (!origin) {
    return res.status(400).json({ message: "Missing request origin." });
  }

  const trackingId = `bacfeljib-${body.plan ?? "premium"}-${Date.now()}`;

  const successLink = `${origin}/?payment_status=success`;
  const failLink = `${origin}/?payment_status=failed`;

  const webhookUrl = process.env.FLOUCI_WEBHOOK_URL;

  try {
    const flouciResponse = await fetch(
      `${FLOUCI_BASE_URL}/generate_payment`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          accept_card: body.accept_card ?? true,
          success_link: successLink,
          fail_link: failLink,
          webhook: webhookUrl,
          developer_tracking_id: trackingId,
          client_id: body.client_id ?? "Bac Fel Jib AI Premium",
        }),
      }
    );

    const data = await flouciResponse.json();

    const paymentUrl = data?.result?.link;
    const paymentId = data?.result?.payment_id;

    if (!flouciResponse.ok || !paymentUrl || !paymentId) {
      return res.status(400).json({
        message:
          data?.message ?? "Could not generate Flouci payment.",
      });
    }

    return res.status(200).json({
      payment_url: paymentUrl,
      payment_id: paymentId,
      tracking_id: trackingId,
    });
  } catch {
    return res.status(500).json({
      message: "Flouci service unavailable.",
    });
  }
}