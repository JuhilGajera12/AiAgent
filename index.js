import express from "express";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use("/webhook", express.raw({ type: "*/*" }));

app.get("/", (req, res) => {
  res.send("Hello, world!");
});

app.post("/webhook", async (req, res) => {
  const rawString = req.body.toString(); // convert buffer to string
  const jsonData = JSON.parse(rawString);
  console.log("-----> request.bady <-----", jsonData);
  // const secret = process.env.ELEVENLABS_CONVAI_WEBHOOK_SECRET;
  // console.log("magan", req.headers["elevenlabs-signature"]);
  // const headers = req.headers["elevenlabs-signature"].split(",");
  // const timestamp = headers.find((e) => e.startsWith("t=")).substring(2);
  // const signature = headers.find((e) => e.startsWith("v0="));
  // // Validate timestamp
  // const reqTimestamp = timestamp * 1000;
  // const tolerance = Date.now() - 30 * 60 * 1000;
  // if (reqTimestamp < tolerance) {
  //   res.status(403).send("Request expired");
  //   return;
  // } else {
  //   // Validate hash
  //   const message = `${timestamp}.${req.body}`;
  //   const digest =
  //     "v0=" + crypto.createHmac("sha256", secret).update(message).digest("hex");
  //   if (signature !== digest) {
  //     res.status(401).send("Request unauthorized");
  //     return;
  //   }
  // }

  // let body = "";
  // // Handle chunked/streaming requests
  // req.on("data", (chunk) => {
  //   body += chunk;
  // });

  // req.on("end", () => {
  //   const requestBody = JSON.parse(body);
  //   console.log("Received webhook request:", requestBody);
  // });

  if (jsonData.type === "post_call_transcription") {
    // Handle transcription webhook with full conversation data
    handleTranscriptionWebhook(jsonData.data);
  }
});

const handleTranscriptionWebhook = async (data) => {
  console.log("Handling transcription webhook:", data);
  console.log("Handling transcription webhook:analysisanalysis", data.analysis);
};

app.listen(3000, () => {
  console.log("server is running on port 3000");
});
