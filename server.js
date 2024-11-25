const express = require('express');
const cors = require('cors');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS for your WordPress site
app.use(cors({
  origin: process.env.WORDPRESS_URL || '*',
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.post('/v1/messages', upload.array('files'), async (req, res) => {
  try {
    const { message, customPrompt } = req.body;
    const files = req.files || [];

    const fileContents = files.map(file => ({
      type: 'text',
      text: file.buffer.toString('utf-8'),
      cache_control: { type: 'ephemeral' }
    }));

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'prompt-caching-2024-07-31'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1024,
        system: [
          {
            type: 'text',
            text: customPrompt || 'You are a helpful AI assistant.',
            cache_control: { type: 'ephemeral' }
          },
          ...fileContents
        ],
        messages: [{
          role: 'user',
          content: message
        }]
      })
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});