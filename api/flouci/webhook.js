export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // Save webhook events in your DB before enabling premium access.
  return res.status(200).json({ received: true });
}