require('dotenv').config();

module.exports = {
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  wordpressUrl: process.env.WORDPRESS_URL,
  port: process.env.PORT || 3000
};