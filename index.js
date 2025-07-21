import express from "express";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use("/webhook", express.raw({ type: "*/*" }));

app.get("/", (req, res) => {
  res.send("Hello, world!");
});

// app.post("/webhook", async (req, res) => {
//   console.log("Received webhook request...");
//   const secret = process.env.ELEVENLABS_CONVAI_WEBHOOK_SECRET;
//   const { event, error } = await constructWebhookEvent(req, secret);

//   if (error) {
//     return res.json({ error: error }, { status: 401 });
//   }
//   if (event.type === "post_call_transcription") {
//     console.log("event data", JSON.stringify(event.data, null, 2));
//   }

//   return res.json({
//     success: true,
//     message: "Webhook received successfully",
//   });
// });

// const constructWebhookEvent = async (req, secret) => {
//   console.log("🚀 ~ constructWebhookEvent ~ req:", req);
//   const body = await req;
//   const signature_header = req.headers.get("ElevenLabs-Signature");
//   console.log(signature_header);

//   if (!signature_header) {
//     return { event: null, error: "Missing signature header" };
//   }

//   const headers = signature_header.split(",");
//   const timestamp = headers.find((e) => e.startsWith("t="))?.substring(2);
//   const signature = headers.find((e) => e.startsWith("v0="));

//   if (!timestamp || !signature) {
//     return { event: null, error: "Invalid signature format" };
//   }

//   // Validate timestamp
//   const reqTimestamp = Number(timestamp) * 1000;
//   const tolerance = Date.now() - 30 * 60 * 1000;
//   if (reqTimestamp < tolerance) {
//     return { event: null, error: "Request expired" };
//   }

//   // Validate hash
//   const message = `${timestamp}.${body}`;

//   if (!secret) {
//     return { event: null, error: "Webhook secret not configured" };
//   }

//   const digest =
//     "v0=" + crypto.createHmac("sha256", secret).update(message).digest("hex");
//   console.log({ digest, signature });

//   if (signature !== digest) {
//     return { event: null, error: "Invalid signature" };
//   }

//   const event = JSON.parse(body);
//   return { event, error: null };
// };

app.post("/webhook", async (req, res) => {
  const rawString = req.body.toString(); // convert buffer to string
  const jsonData = JSON.parse(rawString);
  console.log("-----> request.bady <-----", jsonData);
  const secret = process.env.ELEVENLABS_CONVAI_WEBHOOK_SECRET;
  console.log("magan", req.headers["elevenlabs-signature"]);
  const headers = req.headers["elevenlabs-signature"].split(",");
  const timestamp = headers.find((e) => e.startsWith("t=")).substring(2);
  const signature = headers.find((e) => e.startsWith("v0="));
  // Validate timestamp
  const reqTimestamp = timestamp * 1000;
  const tolerance = Date.now() - 30 * 60 * 1000;
  if (reqTimestamp < tolerance) {
    res.status(403).send("Request expired");
    return;
  } else {
    // Validate hash
    const message = `${timestamp}.${req.body}`;
    const digest =
      "v0=" + crypto.createHmac("sha256", secret).update(message).digest("hex");
    if (signature !== digest) {
      res.status(401).send("Request unauthorized");
      return;
    }
  }

  let body = "";
  // Handle chunked/streaming requests
  req.on("data", (chunk) => {
    body += chunk;
  });

  req.on("end", () => {
    const requestBody = JSON.parse(body);
    console.log("Received webhook request:", requestBody);
  });
});

app.listen(3000, () => {
  console.log("server is running on port 3000");
});
