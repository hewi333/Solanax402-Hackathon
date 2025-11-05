# FinanceAI Coach - Backend API

This is the backend server for FinanceAI Coach that handles OpenAI API requests securely.

## Why a Backend?

The OpenAI API cannot be called directly from the browser due to:
- CORS restrictions
- Security concerns (exposing API keys in the frontend)
- Rate limiting and request management

This Express.js server acts as a secure proxy between the frontend and OpenAI.

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Then edit `.env` and add your OpenAI API key:

```env
OPENAI_API_KEY=sk-your-openai-api-key-here
PORT=3001
NODE_ENV=development
```

**Get your OpenAI API key:**
1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Sign up or log in
3. Click "Create new secret key"
4. Copy the key and paste it into your `.env` file

### 3. Start the Server

```bash
npm start
```

The server will start on `http://localhost:3001`

## API Endpoints

### Health Check
```
GET /api/health
```

Returns server status and whether OpenAI is configured.

**Response:**
```json
{
  "status": "ok",
  "message": "FinanceAI Coach API is running",
  "openaiConfigured": true
}
```

### Chat
```
POST /api/chat
```

Sends messages to OpenAI and returns the AI response.

**Request Body:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "I want to save money for a vacation"
    }
  ]
}
```

**Response:**
```json
{
  "message": "That's a great goal! How much are you hoping to save, and when would you like to go on this vacation?",
  "usage": {
    "prompt_tokens": 50,
    "completion_tokens": 20,
    "total_tokens": 70
  }
}
```

**Error Response:**
```json
{
  "error": "Error message here"
}
```

## Error Handling

The server handles various OpenAI API errors:

- **401**: Invalid API key
- **429**: Rate limit exceeded
- **500**: OpenAI service error
- **400**: Invalid request format

## Development

### Running in Development Mode

```bash
npm run dev
```

### Testing the API

You can test the health endpoint:

```bash
curl http://localhost:3001/api/health
```

Or test the chat endpoint:

```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'
```

## Deployment

For production deployment, consider:

1. **Vercel/Netlify Serverless Functions**: Convert the Express app to serverless functions
2. **Railway/Render**: Deploy the Express server directly
3. **AWS Lambda/Google Cloud Functions**: Serverless deployment

### Environment Variables for Production

Make sure to set these in your deployment platform:
- `OPENAI_API_KEY`: Your OpenAI API key
- `PORT`: Port number (usually auto-assigned)
- `NODE_ENV`: Set to `production`

## Security Notes

- Never commit `.env` file to git
- Keep your OpenAI API key secret
- Consider adding rate limiting for production
- Add authentication for production use
- Monitor API usage and costs

## Troubleshooting

### "OPENAI_API_KEY not configured"

Make sure you have:
1. Created a `.env` file in the backend directory
2. Added your OpenAI API key
3. Restarted the server

### "Cannot connect to backend"

Make sure:
1. The backend server is running (`npm start`)
2. The server is on port 3001
3. No firewall is blocking the connection

### "Rate limit exceeded"

You've hit OpenAI's rate limit. Wait a moment and try again. Consider:
- Upgrading your OpenAI plan
- Implementing request queuing
- Adding caching for common responses

## Tech Stack

- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **OpenAI API**: AI chat completions
- **CORS**: Cross-origin resource sharing
- **dotenv**: Environment variable management

## License

MIT License
