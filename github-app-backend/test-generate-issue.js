import axios from "axios";

const SERVER_URL = "http://localhost:3001/generate-issue";

const prompt = `
I want to clone the website https://ridex.live.
Please extract and recreate the full front-end (HTML, CSS, JS), matching its layout, design, and interactive elements as closely as possible.

Requirements:
	•	Replicate all visible UI elements, components, and animations
	•	Use responsive design (mobile & desktop)
	•	No backend functionality required
	•	Replace images with placeholders or link to the originals if publicly accessible
	•	Use clean, well-commented code and modern best practices (e.g. TailwindCSS or vanilla CSS, minimal JS frameworks)
	•	Organize code into separate files: index.html, styles.css, script.js

Output the complete source code.
If any sections require explanation or manual tweaking, describe what needs to be adjusted.
`;
const payload = {
  repository: {
    owner: "Vbraniumlads",
    name: "vibetorch",
  },
  issue: {
    title: "Implement RideX Idea",
    body: `# RideX

@claude
${prompt}
---
*Generated automatically by VibeTorch - ${new Date().toISOString()}*`,
    labels: ["bot-generated", "test"],
    assignees: [],
  },
};

try {
  console.log("🚀 Triggering issue generation...");
  console.log(
    "📋 Target repository:",
    payload.repository.owner + "/" + payload.repository.name
  );
  console.log("📋 Issue title:", payload.issue.title);

  const response = await axios.post(SERVER_URL, payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  console.log("✅ Issue generation successful!");
  console.log("📊 Response:", response.status);
  console.log("📋 Issue details:", response.data.issue);
  console.log("🔗 Issue URL:", response.data.issue.url);
} catch (error) {
  console.error(
    "❌ Issue generation failed:",
    error.response?.data || error.message
  );
  if (error.response) {
    console.error("📊 Status:", error.response.status);
    console.error("📋 Response:", error.response.data);
  }
}
