# Quick Start Guide - FinanceAI Coach

This guide will help you get the FinanceAI Coach app running in under 5 minutes.

## 🚀 Step-by-Step Setup

### Step 1: Get Your OpenAI API Key

1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Sign up or log in to your OpenAI account
3. Click "Create new secret key"
4. Copy the key (it looks like: `sk-...`)

**Important:** Keep this key secure and don't share it!

### Step 2: Configure the Backend

1. **Navigate to the backend directory:**
   ```bash
   cd /home/user/Solanax402-Hackathon/backend
   ```

2. **Create the .env file:**
   ```bash
   cp .env.example .env
   ```

3. **Edit the .env file and add your OpenAI API key:**

   Open `backend/.env` in your editor and replace the empty value:
   ```env
   OPENAI_API_KEY=sk-your-actual-api-key-here
   PORT=3001
   NODE_ENV=development
   ```

4. **Start the backend server:**
   ```bash
   npm start
   ```

   You should see:
   ```
   🚀 FinanceAI Coach Backend running on http://localhost:3001
   📊 Health check: http://localhost:3001/api/health
   🤖 OpenAI configured: true
   ```

   **Keep this terminal window open!** The backend needs to stay running.

### Step 3: Start the Frontend

1. **Open a NEW terminal window/tab**

2. **Navigate to the frontend directory:**
   ```bash
   cd /home/user/Solanax402-Hackathon/financeai-coach
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

   You should see:
   ```
   VITE ready in XXX ms
   ➜  Local:   http://localhost:5173/
   ```

### Step 4: Open the App

1. **Open your browser** and go to: [http://localhost:5173](http://localhost:5173)

2. **Connect your Phantom wallet:**
   - Click the "Connect Wallet" button
   - Approve the connection in Phantom
   - Make sure Phantom is set to **Devnet** (Settings → Developer Settings → Testnet Mode)

3. **Get some Devnet SOL** (if you don't have any):
   - Go to [solfaucet.com](https://solfaucet.com)
   - Paste your wallet address
   - Click "Airdrop"

### Step 5: Test the Chat!

Try these example messages:

- "I want to save for a vacation"
- "Help me create a monthly budget"
- "I spent $50 on groceries today"
- "Teach me about investing"

When the AI detects a financial habit, you'll see a celebration modal with confetti! 🎉

## 🔍 Troubleshooting

### "Cannot connect to backend server"

**Problem:** The frontend can't reach the backend.

**Solutions:**
- Make sure the backend is running (Step 2.4)
- Check that it's running on port 3001
- Look for any error messages in the backend terminal

### "OpenAI API key not configured"

**Problem:** The backend doesn't have a valid API key.

**Solutions:**
- Check that you created `backend/.env`
- Make sure your API key starts with `sk-`
- Verify the key is correct at [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- Restart the backend server after updating the .env file

### "Wallet won't connect"

**Problem:** Phantom wallet isn't connecting.

**Solutions:**
- Make sure Phantom extension is installed
- Refresh the page
- Try disconnecting and reconnecting
- Check browser console for errors

### "Balance shows 0 SOL"

**Problem:** Your wallet doesn't have Devnet SOL.

**Solutions:**
- Go to [solfaucet.com](https://solfaucet.com) and request an airdrop
- Make sure Phantom is set to Devnet mode
- Wait a moment and click "🔄 Refresh Balance"

## 📊 Checking System Health

### Backend Health Check

Open this URL in your browser:
```
http://localhost:3001/api/health
```

You should see:
```json
{
  "status": "ok",
  "message": "FinanceAI Coach API is running",
  "openaiConfigured": true
}
```

If `openaiConfigured` is `false`, check your API key in `backend/.env`.

### Frontend Status

The frontend should show:
- ✅ Connect Wallet button (if not connected)
- ✅ Chat interface (if connected)
- ✅ "🟢 Ready to help" status (when backend is working)

## 🎯 What's Working Now

- ✅ Wallet connection with Phantom
- ✅ AI chat with OpenAI GPT-4
- ✅ Habit detection (5 types)
- ✅ Reward celebrations with confetti
- ✅ Stats tracking (habits completed, total earned, streaks)
- ✅ Beautiful Solana-themed UI

## 📝 Quick Test Checklist

- [ ] Backend running on http://localhost:3001
- [ ] Frontend running on http://localhost:5173
- [ ] Wallet connected successfully
- [ ] Can send chat messages
- [ ] AI responds to messages
- [ ] Habit detection triggers rewards
- [ ] Confetti animation appears
- [ ] Stats update correctly

## 🆘 Still Having Issues?

1. **Check both terminal windows** for error messages
2. **Clear browser cache** and reload
3. **Restart both servers**:
   - Stop backend (Ctrl+C)
   - Stop frontend (Ctrl+C)
   - Start backend first
   - Then start frontend

4. **Verify file structure**:
   ```
   Solanax402-Hackathon/
   ├── backend/
   │   ├── .env              ← Must exist with your API key
   │   ├── server.js
   │   └── node_modules/     ← Must exist (run npm install)
   └── financeai-coach/
       ├── .env              ← Should have VITE_API_URL=http://localhost:3001
       ├── src/
       └── node_modules/     ← Must exist (run npm install)
   ```

## 🎉 Success!

If everything is working, you should be able to:
- Chat with the AI coach about finances
- See rewards when you mention financial habits
- Watch your stats increase
- Enjoy the confetti celebrations!

---

**Next Steps:**
- Try different conversation topics
- Test all 5 habit types
- Check the rewards modal animations
- Share your progress on social media!

**Need More Help?**
- Check the detailed READMEs:
  - `backend/README.md` - Backend documentation
  - `financeai-coach/README.md` - Frontend documentation
- Review the code comments
- Check browser console for errors
