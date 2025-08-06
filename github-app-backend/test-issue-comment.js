import crypto from "crypto";
import axios from "axios";

const WEBHOOK_SECRET = "torchtorch";
const SERVER_URL = "http://localhost:3001/webhook";

const payload = {
  action: "created",
  repository: {
    full_name: "Vbraniumlads/vibetorch",
    name: "vibetorch",
    owner: { login: "Vbraniumlads" },
  },
  installation: { id: 1734153 },
  issue: {
    number: 1,
    title: "Test Issue for Claude Bot",
    body: "Hey @claude, can you help me understand this codebase?",
    html_url: "https://github.com/Vbraniumlads/vibetorch/issues/1",
    user: { login: "alphanonce" },
  },
};

const payloadString = JSON.stringify(payload);
const signature =
  "sha256=" +
  crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(payloadString)
    .digest("hex");

try {
  const response = await axios.post(SERVER_URL, payload, {
    headers: {
      "X-Hub-Signature-256": signature,
      "X-GitHub-Event": "issues",
      "X-GitHub-Delivery": "12345678-1234-1234-1234-123456789abc",
      "Content-Type": "application/json",
    },
  });

  console.log("✅ Issue webhook test successful:", response.status);
} catch (error) {
  console.error(
    "❌ Issue webhook test failed:",
    error.response?.data || error.message
  );
}
