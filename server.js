require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname)));
app.use(express.json());

const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.post('/api/study', async (req, res) => {
  const { subject, topic, mode } = req.body;
  console.log('Study request:', subject, topic, mode);
  
  const modePrompts = {
    teach: `You are an energetic professor. Teach "${topic}" from ${subject} using simple language, real examples and analogies. Make it fun and memorable.`,
    quiz: `Generate 5 MCQ questions on "${topic}" from ${subject}.\nFormat:\nQ: [question]\nA) B) C) D)\nAnswer: [letter]\nExplanation: [one line]`,
    boss: `BOSS FIGHT on "${topic}" from ${subject}. Ask 3 increasingly hard questions one at a time. Be strict.`,
    story: `Teach "${topic}" from ${subject} as an exciting story. End with 3 key exam takeaways.`
  };

  const prompt = modePrompts[mode] || modePrompts.teach;

  try {
    const stream = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      stream: true
    });

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('X-Accel-Buffering', 'no');

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || '';
      if (text) res.write(text);
    }
    res.end();
  } catch (err) {
    console.error('Groq error:', err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    } else {
      res.end();
    }
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Study OS running at:');
  console.log(`http://localhost:${PORT}`);
  console.log('Open this in your browser!');
});
