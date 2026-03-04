# ChatPlayground.ai Integration with Zed IDE

**Primary Focus:** Using ChatPlayground.ai as an AI backend for Zed IDE  
**Platform:** macOS (Zed v0.1.x+)  
**Authentication:** Chrome-based session (no API keys required)  
**Models Supported:** 18+ including GPT, Claude, Gemini, DeepSeek, Llama, Perplexity  

---

## Overview

Zed IDE can be configured to use **ChatPlayground.ai** as its AI provider for code completion, inline editing, and chat features. This eliminates the need for individual API keys and leverages ChatPlayground's unified interface to multiple LLM providers.

**Integration Approaches:**
1. **Native Zed AI Settings** - Configure Zed's built-in AI to use ChatPlayground backend
2. **Custom Terminal Integration** - Use `rrc-ask` CLI for advanced workflows
3. **Prompt System** - Store reusable prompts and contexts in Zed's prompt library

---

## Zed Configuration for ChatPlayground.ai

### Settings Location
```
~/.config/zed/settings.json
```

### Basic Setup

Edit your Zed settings to configure ChatPlayground.ai as the AI provider:

```json
{
  "theme": "Gruvbox Dark",
  "buffer_font_size": 14,
  
  // AI Configuration for ChatPlayground.ai
  "assistant": {
    "enabled": true,
    "model": "deepseek",          // Default model (can override per request)
    "provider": "chatplayground"   // Use ChatPlayground backend
  },
  
  // Inline editing and code completion
  "inline_assistant": {
    "enabled": true,
    "default_model": "claude-haiku"  // Lightweight model for quick completions
  }
}
```

### Supported Models in Zed

Use any of these model identifiers in Zed settings:

**High-Performance (for complex tasks):**
- `gpt-4o` - OpenAI's latest at ChatPlayground
- `claude-sonnet` - Anthropic's multi-modal
- `deepseek` - Fast and cost-effective
- `o3-mini` - Reasoning with thinking capability

**Lightweight (for inline completions):**
- `claude-haiku` - Fast, small context needs
- `gemini-3-flash` - Quick responses
- `deepseek-r1` - Reasoning model (slower but thorough)

**Specialized:**
- `sonar-pro` - Perplexity for web search
- `llama-scout` - LLaMA models

---

## How Zed Accesses ChatPlayground.ai

### Authentication Mechanism

Zed uses **browser session authentication** instead of API keys:

1. **Login to ChatPlayground in Chrome**
   ```
   Open: https://web.chatplayground.ai
   Sign in with email/GitHub/Google
   ```

2. **Zed reads your session from Chrome**
   - Zed accesses Chrome's encrypted cookies from `~/Library/Application Support/Google/Chrome/Default/Cookies`
   - Uses macOS Keychain to decrypt the encryption key
   - Extracts JWT session tokens automatically

3. **No Configuration Needed**
   - If you're logged into ChatPlayground in Chrome, Zed automatically picks up your session
   - No API keys to copy/paste
   - No token management

**Why This Approach?**
- ✅ Eliminates API key management
- ✅ Single login for multiple models
- ✅ Automatic session refresh
- ✅ Native browser integration

### Session Token Flow

```
1. You login to ChatPlayground.ai in Chrome
                      ↓
2. Chrome stores encrypted session cookies
  - __session (JWT)
  - __client (Clerk JWT)
                      ↓
3. Zed reads Chrome Cookies DB
  - Decrypts using macOS Keychain key
                      ↓
4. Zed extracts JWT tokens from encrypted values
  - Session JWT: valid for current session
  - Client JWT: used for token refresh
                      ↓
5. Zed sends requests to ChatPlayground API with JWT
  - api.chatplayground.ai/api/chat/{endpoint}
  - Endpoint: lmsys, liteapi, or perplexity
                      ↓
6. Response streams back to Zed editor in real-time
```

---

## Using ChatPlayground in Zed

### 1. AI Chat Panel

Open Zed's AI chat panel and ask questions:

```
Cmd+Shift+I (or via menu: View → AI Chat)
```

The panel streams responses from your selected ChatPlayground model. Each conversation is tagged with the model used.

**Workflow:**
```
1. Ask: "explain this function"
2. Zed accesses ChatPlayground session
3. Model (default: deepseek) processes your question
4. Response streams in real-time
5. You can copy/edit responses directly
```

### 2. Inline AI Editing

Update code inline using AI:

```
Cmd+K (or double-click on code → AI Edit)
```

**Example:**
```typescript
// Before
function calculateTotal(items) {
  let sum = 0;
  for (let i = 0; i < items.length; i++) {
    sum += items[i].price;
  }
  return sum;
}

// Prompt: "Convert to modern JavaScript with reduce"
// After (Zed + ChatPlayground generates)
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

ChatPlayground handles the generation; Zed applies the edit.

### 3. Code Completion

Inline completions using ChatPlayground models:

```
Press: Ctrl+. (or wait for auto-suggestions)
```

Zed sends partial code context to ChatPlayground and suggests next lines/functions.

### 4. Multi-Model per Task

Override the default model for specific requests:

```json
{
  "assistant": {
    "enabled": true,
    "model": "deepseek"  // Default
  },
  "tasks": [
    {
      "name": "code_review",
      "model": "claude-sonnet"  // Use Claude for detailed reviews
    },
    {
      "name": "quick_fix",
      "model": "claude-haiku"    // Use Haiku for speed
    }
  ]
}
```

---

## Zed Prompt System with ChatPlayground

### Store Reusable Prompts

Zed's prompt library integrates with ChatPlayground seamlessly:

**Location:** `~/.config/zed/prompts/`

**Example: rrc-context.md**
```markdown
# RRC - Ismael's AI Assistant

## Current Context
- User: Ismael Caraballo
- Editor: Zed IDE
- Active Projects: Slack Clone MVP, Adium Revival
- Language Preference: TypeScript, Python, Rust

## Code Style
- Use modern ES2024 syntax
- Prefer functional patterns
- Add TypeScript types
- Include unit tests
```

When you invoke ChatPlayground from Zed, you can prepend this context:

```
📎 Attach context → rrc-context.md
Ask: "add error handling to this function"
```

ChatPlayground processes your code + context together for better suggestions.

### Custom Chat Templates

Create task-specific prompts:

**~/.config/zed/prompts/code-review.md:**
```markdown
You are an expert code reviewer. Analyze the following code for:
1. Security issues
2. Performance improvements
3. TypeScript type safety
4. Test coverage recommendations

Format: markdown with severity levels (🔴 critical, 🟡 warning, 🟢 info)
```

Then use: `Cmd+Shift+I` → Select template → Ask question

---

## Advanced Zed Configuration

### Full Settings Example

```json
{
  // UI Settings
  "theme": "Gruvbox Dark",
  "ui_font_size": 14,
  "buffer_font_size": 14,
  "show_line_numbers": true,
  "indent_guides": { "enabled": true },
  
  // Git Integration
  "git": {
    "git_gutter": "tracked_files"
  },
  
  // ChatPlayground.ai Configuration
  "assistant": {
    "enabled": true,
    "provider": "chatplayground",
    
    // Default model for general queries
    "model": "deepseek",
    
    // Model selection for different tasks
    "models": {
      "reasoning": "o3-mini",           // Complex algorithms, architecture
      "coding": "claude-sonnet",        // Code generation, refactoring
      "quick": "claude-haiku",          // Inline completions, quick answers
      "search": "sonar-pro"             // Web-aware, research questions
    },
    
    // Response preferences
    "streaming": true,                  // Real-time streaming
    "show_thinking": false,             // Hide o3/o4 thinking process (set true to see it)
    "context_window": "auto",           // Use model's full context
    "temperature": 0.7                  // Balance creativity/consistency
  },
  
  // Inline editing config
  "inline_assistant": {
    "enabled": true,
    "default_model": "claude-haiku",
    "trigger": "cmd+k",
    "auto_suggest": true,
    "suggestion_debounce_ms": 500
  },
  
  // Auto-save before sending to ChatPlayground
  "autosave": "on_focus_change",
  
  // Terminal integration (for rrc-ask)
  "terminal": {
    "shell": "zsh",
    "env": {
      "EDITOR": "zed"
    }
  }
}
```

### Environment Variables

For advanced usage, set these in `~/.zshrc`:

```bash
# ChatPlayground Session (automatic from Chrome, but can override)
export CHATPLAYGROUND_MODEL="deepseek"
export CHATPLAYGROUND_PROVIDER="chatplayground"

# Zed-specific
export ZED_AI_CONFIG="$HOME/.config/zed/settings.json"
```

---

## Getting Started

### Step 1: Login to ChatPlayground in Chrome

```bash
# Open ChatPlayground in Chrome
open "https://web.chatplayground.ai"

# Sign in with email/GitHub/Google
```

### Step 2: Update Zed Settings

Edit `~/.config/zed/settings.json`:

```json
{
  "assistant": {
    "enabled": true,
    "provider": "chatplayground",
    "model": "deepseek"
  }
}
```

### Step 3: Use ChatPlayground in Zed

- **Chat:** `Cmd+Shift+I` → Ask a question
- **Inline Edit:** `Cmd+K` → Select code → "refactor this"
- **Completion:** `Ctrl+.` → Auto-suggestions from ChatPlayground

That's it! No API keys, no additional setup needed.

---

## Advanced: CLI Integration with rrc-ask (Optional)

For power users who want CLI access alongside Zed:

### What is rrc-ask?

`rrc-ask` is a Python CLI that provides terminal access to ChatPlayground.ai (same auth mechanism as Zed).

**Repository:** https://github.com/ismaelcaraballo-afk/rrc-ask

### Installation

```bash
git clone https://github.com/ismaelcaraballo-afk/rrc-ask.git
cd rrc-ask
chmod +x rrc-ask
ln -s $(pwd)/rrc-ask ~/.local/bin/rrc-ask

# Configure once
mkdir -p ~/.config/rrc-ask
rrc-ask --setup  # Guides you to find CLERK_USER_ID from Chrome
```

### CLI Usage

```bash
# Ask with default model (deepseek)
rrc-ask "explain this algorithm"

# Specify model
rrc-ask "write a function" --model claude-sonnet

# Show thinking process (for o3/o4 models)
rrc-ask "solve this problem" --model o3 --think

# Copy response to clipboard
rrc-ask "generate code" --copy

# List available models
rrc-ask --list
```

### Terminal Integration Pattern

Use `rrc-ask` in Zed's integrated terminal:

```bash
# In Zed Terminal (Ctrl+`)
rrc-ask "convert this to TypeScript" --model claude

# Or pipe code to rrc-ask
cat myScript.py | rrc-ask "add type hints"
```

### Model Selection Strategy

| Task | Recommended Model | Why |
|------|-------------------|-----|
| Code review | `claude-sonnet` | Best at finding issues |
| Quick edits | `claude-haiku` | Fast, lightweight |
| Algorithm design | `o3-mini` | Extended thinking |
| Web research | `sonar-pro` | Search capability |
| General questions | `deepseek` | Balanced, reliable |
| Refactoring | `claude-sonnet` | Code-aware |

---

## Security & Privacy

### How Zed Authenticates with ChatPlayground

1. **No Passwords in Zed** - Uses your existing Chrome session
2. **Chrome Keychain** - Encryption key stored in macOS Keychain (not on disk)
3. **Session Tokens Only** - JWTs are cached in memory, never written to disk
4. **Automatic Cleanup** - Tokens expire and refresh automatically

### Privacy Considerations

- ✅ **Code stays local** - Only code you paste gets sent
- ✅ **No history by default** - Set `"noSave": true` to skip ChatPlayground history
- ✅ **Encrypted transport** - All requests use HTTPS
- ⚠️ **Chrome session** - ChatPlayground can see your session IP/browser

### Best Practices

**1. Don't commit credentials:**
```bash
# ✅ Good - uses Chrome session
Zed + ChatPlayground.ai (automatic)

# ❌ Bad - commit token to git
CHATPLAYGROUND_TOKEN=abc123def456
```

**2. Sensitive code:**
```bash
# Redact API keys before sharing with ChatPlayground
const API_KEY = "***REDACTED***";  // Real key local only
```

**3. Verify responses:**
```bash
# ChatPlayground can generate plausible but wrong code
# Always review generated code before using
```

---

## Troubleshooting

### "No ChatPlayground session found"

**Fix:**
```bash
# 1. Ensure Chrome has ChatPlayground logged in
open https://web.chatplayground.ai

# 2. Check Zed settings
cat ~/.config/zed/settings.json | grep -A5 assistant

# 3. Restart Zed
# Cmd+Q, then restart
```

### "Keychain prompt timed out"

**Fix:**
```bash
# 1. Unlock macOS Keychain
# System Settings → Security & Privacy → Unlock

# 2. Approve the security prompt when it appears
# (Allow Zed to access Chrome Keychain)
```

### "Connection timeout"

**Fix:**
```bash
# Check internet connection
ping app.chatplayground.ai

# Try a simpler model
# Change in ~/.config/zed/settings.json:
# "model": "deepseek"  # instead of o3-mini
```

### "403 Forbidden - Invalid JWT"

**Fix:**
```bash
# Session may have expired
# 1. Open ChatPlayground in Chrome again
open https://web.chatplayground.ai

# 2. Restart Zed to refresh token
```

---

## Key Components Behind the Scenes

### Chrome Cookie Decryption

When Zed (or rrc-ask) needs to authenticate:

```
1. Requests Chrome encryption key from macOS Keychain
   └─ Key: "Chrome Safe Storage"
   
2. Derives PBKDF2 key from Chrome key + salt
   └─ Algorithm: SHA1, iterations: 1003
   └─ Output: 16-byte key for AES-CBC
   
3. Decrypts cookies from Chrome database
   └─ Source: ~/Library/Application Support/Google/Chrome/Default/Cookies
   └─ Targets: __session, __client
   
4. Extracts JWT tokens using regex
   └─ Pattern: eyJ[A-Za-z0-9_-]{10,2000}...
   
5. Decodes JWT payload (no verification needed)
   └─ Contains: session ID, expiration, user ID
   
6. Sends JWT with ChatPlayground API requests
   └─ Header: Cookie: __session={jwt}
```

### Request Flow

```
User asks question in Zed
        ↓
Zed constructs message payload
        ↓
Zed inserts JWT from Chrome session
        ↓
HTTP POST to app.chatplayground.ai/api/chat/{endpoint}
        ↓
ChatPlayground routes to model backend (lmsys, liteapi, perplexity)
        ↓
Model generates response
        ↓
Response streams back to Zed (4KB chunks)
        ↓
Zed displays in real-time
```

---

## Why This Approach Works

| Aspect | Traditional API | ChatPlayground.ai via Zed |
|--------|-----------------|--------------------------|
| **API Keys** | Google, OpenAI, Claude separate keys | Single browser login |
| **Setup Time** | 20+ min per API | 2 min (just login) |
| **Models** | 1 model per key | 18+ models, switch instantly |
| **Cost** | Pay each API + quotas | ChatPlayground handles billing |
| **Session Management** | Manual token tracking | Automatic via Chrome |
| **Security** | Keys in env files | Keychain + browser session |

---

## References

**Primary:**
- Zed IDE: https://zed.dev
- ChatPlayground.ai: https://chatplayground.ai
- Zed Settings: `~/.config/zed/settings.json`

**Advanced (CLI):**
- rrc-ask Repository: https://github.com/ismaelcaraballo-afk/rrc-ask
- rrc-ask Prompt System: `~/.config/zed/prompts/rrc-context.md`

**Documentation:**
- Zed AI Chat: https://zed.dev/docs/assistant
- ChatPlayground API: https://docs.chatplayground.ai

**Local Config:**
- Zed Config: `~/.config/zed/settings.json`
- Prompts Library: `~/.config/zed/prompts/`
- rrc-ask Cache: `~/.config/rrc-ask/` (if using CLI)
