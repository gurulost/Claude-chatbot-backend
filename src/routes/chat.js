const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');

router.post('/messages', upload.array('files'), async (req, res, next) => {
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
    next(error);
  }
});

module.exports = router;