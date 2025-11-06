# CDP API Key Setup - Quick Reference

## ❌ What You Have (Wrong)

```bash
CDP_API_KEY_NAME=87d98ae9-f31f-42ee-9b69-723d3ff9dd77
```
This is just the **key ID** - it won't work!

---

## ✅ What You Need (Correct)

```bash
CDP_API_KEY_NAME=organizations/8f1ac569-ed29-48ae-b989-6798a975afab/apiKeys/87d98ae9-f31f-42ee-9b69-723d3ff9dd77
```

The full path includes:
- `organizations/` prefix
- Your **organization ID**
- `/apiKeys/` segment
- Your **API key ID**

---

## 📥 Where to Get the Correct Values

### Method 1: Download the JSON File (Recommended)

When you create an API key at https://portal.cdp.coinbase.com/, you get a **JSON file**:

**File: `cdp_api_key.json`**
```json
{
  "name": "organizations/8f1ac569-ed29-48ae-b989-6798a975afab/apiKeys/87d98ae9-f31f-42ee-9b69-723d3ff9dd77",
  "privateKey": "-----BEGIN EC PRIVATE KEY-----\nMHcCAQEEIBw...\n-----END EC PRIVATE KEY-----"
}
```

**In Railway, set:**
```bash
CDP_API_KEY_NAME=organizations/8f1ac569-ed29-48ae-b989-6798a975afab/apiKeys/87d98ae9-f31f-42ee-9b69-723d3ff9dd77

CDP_API_KEY_PRIVATE_KEY=-----BEGIN EC PRIVATE KEY-----
MHcCAQEEIBw...
-----END EC PRIVATE KEY-----
```

### Method 2: Reconstruct the Path

If you lost the JSON file:

1. Go to https://portal.cdp.coinbase.com/
2. Look for your **organization ID** (in settings or URL)
3. Look for your **API key ID** (in API Keys section)
4. Combine them:

```
organizations/[YOUR_ORG_ID]/apiKeys/[YOUR_KEY_ID]
```

### Method 3: Create a New Key (Safest)

1. Go to https://portal.cdp.coinbase.com/
2. **API Keys** → **Create New API Key**
3. **Download the JSON file immediately** ⚠️ (only shown once!)
4. Open the file and copy both values to Railway

---

## 🚀 Setting Up in Railway

### Step 1: Open Railway Dashboard
Go to your backend service → **Variables** tab

### Step 2: Add Both Variables

**Variable 1:**
```
Name: CDP_API_KEY_NAME
Value: organizations/8f1ac569-ed29-48ae-b989-6798a975afab/apiKeys/87d98ae9-f31f-42ee-9b69-723d3ff9dd77
```
(Use your actual org ID and key ID!)

**Variable 2:**
```
Name: CDP_API_KEY_PRIVATE_KEY
Value: -----BEGIN EC PRIVATE KEY-----
MHcCAQEEIBwrZWNkc2Etc...
-----END EC PRIVATE KEY-----
```
(Multi-line is fine in Railway!)

### Step 3: Save & Redeploy

Railway will automatically redeploy. Wait ~2 minutes.

---

## ✅ How to Verify It's Working

### Check Railway Logs

**If Format is Wrong:**
```
❌ Invalid CDP_API_KEY_NAME format!
Current value: 87d98ae9-f31f-42ee-9b69-723d3ff9dd77
Expected format: organizations/{org_id}/apiKeys/{key_id}
```

**If Format is Correct:**
```
🏦 Coinbase CDP SDK initialized successfully
Organization ID: 8f1ac569-ed29-48ae-b989-6798a975afab
API Key ID: 87d98ae9-f31f-42ee-9b69-723d3ff9dd77
```

---

## 🔍 Common Mistakes

| ❌ Wrong | ✅ Correct |
|---------|-----------|
| Just the key ID | Full path with organizations/ |
| Missing organizations/ prefix | Has organizations/ prefix |
| Missing /apiKeys/ segment | Has /apiKeys/ segment |
| Copied only part of the path | Copied entire "name" from JSON |

---

## 📞 Still Having Issues?

1. **Check Railway logs** for the validation error message
2. **Verify your JSON file** contains both "name" and "privateKey"
3. **Create a new API key** if you lost the original values
4. **Copy-paste carefully** - no extra spaces or characters

The backend now validates the format and will tell you exactly what's wrong!

---

## Quick Checklist

- [ ] Downloaded `cdp_api_key.json` from CDP Portal
- [ ] Copied the FULL `name` value (starts with "organizations/")
- [ ] Copied the FULL `privateKey` value (includes BEGIN/END markers)
- [ ] Added both to Railway environment variables
- [ ] Waited for Railway to redeploy
- [ ] Checked Railway logs for success message

Once you see "🏦 Coinbase CDP SDK initialized successfully" in your logs, the embedded wallet button will work! 🎉
