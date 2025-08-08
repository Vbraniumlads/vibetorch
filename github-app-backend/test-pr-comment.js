import axios from "axios";

const SERVER_URL = "http://localhost:3001/api/pr-comment";

const payload = {
  repository: {
    owner: "guzus",
    name: "test",
  },
  pull_request: {
    number: 3, // Change this to an actual PR number in your repo
  },
  comment: {
    body: `
@claude Great work on this PR! Some improvements you should make:

- After a user clicks "Find Rides", the app should the path from the user's current location to the destination. 
(e.g. uber, walk, bike etc.)

---
*Generated automatically by VibeTorch - ${new Date().toISOString()}*`,
  },
};

try {
  console.log("💬 Testing pull request comment creation...");
  console.log(
    "📋 Target PR:",
    `${payload.repository.owner}/${payload.repository.name}#${payload.pull_request.number}`
  );
  console.log(
    "💬 Comment body:",
    payload.comment.body.substring(0, 100) + "..."
  );

  const response = await axios.post(SERVER_URL, payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  console.log("✅ PR comment creation successful!");
  console.log("📊 Response:", response.status);
  console.log("💬 Comment details:", response.data.comment);
  console.log("🔗 Comment URL:", response.data.comment.url);
} catch (error) {
  console.error(
    "❌ PR comment creation failed:",
    error.response?.data || error.message
  );
  if (error.response) {
    console.error("📊 Status:", error.response.status);
    console.error("📋 Response:", error.response.data);
  }
}
