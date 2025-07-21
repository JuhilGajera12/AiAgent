import express from "express";
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.get("/", (req, res) => {
  res.send("Hello, world!");
});

app.post("/webhook", async (req, res) => {
  console.log("Received webhook request...");
  const secret = process.env.ELEVENLABS_CONVAI_WEBHOOK_SECRET;
  const { event, error } = await constructWebhookEvent(req, secret);

  if (error) {
    return res.json({ error: error }, { status: 401 });
  }
  if (event.type === "post_call_transcription") {
    console.log("event data", JSON.stringify(event.data, null, 2));
  }

  return res.json({
    success: true,
    message: "Webhook received successfully",
  });
});

const constructWebhookEvent = async (req, secret) => {
  console.log("🚀 ~ constructWebhookEvent ~ req:", req);
  const body = await req.text();
  const signature_header = req.headers.get("ElevenLabs-Signature");
  console.log(signature_header);

  if (!signature_header) {
    return { event: null, error: "Missing signature header" };
  }

  const headers = signature_header.split(",");
  const timestamp = headers.find((e) => e.startsWith("t="))?.substring(2);
  const signature = headers.find((e) => e.startsWith("v0="));

  if (!timestamp || !signature) {
    return { event: null, error: "Invalid signature format" };
  }

  // Validate timestamp
  const reqTimestamp = Number(timestamp) * 1000;
  const tolerance = Date.now() - 30 * 60 * 1000;
  if (reqTimestamp < tolerance) {
    return { event: null, error: "Request expired" };
  }

  // Validate hash
  const message = `${timestamp}.${body}`;

  if (!secret) {
    return { event: null, error: "Webhook secret not configured" };
  }

  const digest =
    "v0=" + crypto.createHmac("sha256", secret).update(message).digest("hex");
  console.log({ digest, signature });

  if (signature !== digest) {
    return { event: null, error: "Invalid signature" };
  }

  const event = JSON.parse(body);
  return { event, error: null };
};

app.listen(3000, () => {
  console.log("server is running on port 3000");
});
