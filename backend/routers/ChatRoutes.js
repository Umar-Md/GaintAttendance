import express from "express";
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    // Convert chat history into a single prompt
    const conversation = history
      .map(m =>
        m.role === "user"
          ? `User: ${m.content}`
          : `Assistant: ${m.content}`
      )
      .join("\n");

    const prompt = `${conversation}\nUser: ${message}\nAssistant:`;

    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3",
        prompt,
        stream: false
      })
    });

    const data = await response.json();

    res.json({ reply: data.response });
  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "AI error" });
  }
});

export default router;
