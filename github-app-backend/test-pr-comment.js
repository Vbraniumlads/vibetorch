import axios from "axios";

const SERVER_URL = "http://localhost:3001/pr-comment";

const payload = {
  repository: {
    owner: "Vbraniumlads",
    name: "vibetorch",
  },
  pull_request: {
    number: 24, // Change this to an actual PR number in your repo
  },
  comment: {
    body: `This is a test comment on a pull request created via API.

@claude Great work on this PR! The implementation looks solid.

Some observations:
- ✅ Code follows the project conventions
- ✅ Good error handling
- 💡 Consider adding more unit tests

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
