const FLOUCI_BASE_URL = "https://developers.flouci.com/api/v2";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const authToken = process.env.FLOUCI_AUTH_TOKEN;
  if (!authToken) {
    return res.status(500).json({ message: "Missing FLOUCI_AUTH_TOKEN server secret." });
  }

  const paymentId = String(req.query.payment_id ?? "").trim();
  if (!paymentId) {
    return res.status(400).json({ message: "payment_id is required." });
  }

  try {
    const flouciResponse = await fetch(`${FLOUCI_BASE_URL}/verify_payment/${encodeURIComponent(paymentId)}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    });

    const data = await flouciResponse.json();
    if (!flouciResponse.ok || !data?.success) {
      return res.status(400).json({ status: "FAILURE", message: data?.message ?? "Verification failed." });
    }

    return res.status(200).json({ status: data?.result?.status ?? "PENDING" });
  } catch {
    return res.status(500).json({ status: "FAILURE", message: "Flouci verification unavailable." });
  }
}