# Story 6.5: AI-Powered Connections - Setup Guide

## 🎯 Overview
This feature enhances connection suggestions using OpenAI GPT-4o-mini to analyze card content semantically, providing more intelligent and contextual relationship detection than keyword matching alone.

## 🚀 Quick Start

### 1. Get OpenAI API Key
1. Visit https://platform.openai.com/api-keys
2. Sign up or log in
3. Create a new API key
4. Copy the key (starts with `sk-`)

### 2. Configure Environment
Add to `backend/.env`:

```bash
# AI-Powered Connections
AI_ENABLED=true
OPENAI_API_KEY=sk-your-actual-key-here
AI_MODEL=gpt-4o-mini
AI_MAX_TOKENS=800
AI_TEMPERATURE=0.3
```

### 3. Restart Backend
```bash
cd backend
npm run dev
```

## 📊 Features

### AI Mode (When Enabled)
- **Semantic Analysis:** Understands context beyond keywords
- **Relationship Types:** Identifies prerequisite, complement, cause-effect, etc.
- **Better Reasons:** Clear, natural language explanations
- **Higher Confidence:** More accurate confidence scores

### Fallback Mode (Keyword Matching)
- **Always Available:** Works without API key
- **No Cost:** Free keyword-based matching
- **Automatic Fallback:** If AI fails or is unavailable

## 🔧 API Usage

### Suggest Connections

**Endpoint:** `GET /api/boards/:boardId/connections/suggest`

**Query Parameters:**
- `minConfidence` (optional): Minimum confidence threshold (default: 0.2)
- `useAI` (optional): Force AI on/off
  - `true`: Use AI (fails if unavailable)
  - `false`: Force keyword matching
  - undefined: Auto-detect (use AI if available)

**Examples:**
```bash
# Auto-detect (use AI if configured)
curl "http://localhost:3000/api/boards/:boardId/connections/suggest?minConfidence=0.2"

# Force AI mode
curl "http://localhost:3000/api/boards/:boardId/connections/suggest?useAI=true"

# Force keyword mode
curl "http://localhost:3000/api/boards/:boardId/connections/suggest?useAI=false"
```

## 💰 Cost Estimation

### GPT-4o-mini Pricing (as of 2024)
- **Input:** $0.15 per 1M tokens
- **Output:** $0.60 per 1M tokens

### Typical Usage
- **10 cards analysis:** ~$0.0002 per request
- **100 requests/day:** ~$0.02/day (~$0.60/month)
- **Very affordable for MVP and small teams!**

### Cost Optimization Tips
1. **Limit card count:** AI analyzes max 10 cards per batch
2. **Cache results:** Store AI analysis results in database (future enhancement)
3. **Smart triggers:** Only run AI on new content or explicit request
4. **Rate limiting:** Prevent abuse with request limits

## 🧪 Testing

### Test with Sample Data
```bash
# Create some test cards with your board
curl -X POST http://localhost:3000/api/boards/:boardId/notes \
  -H "Content-Type: application/json" \
  -d '{"content": "Build mobile app for productivity tracking", "type": "idea"}'

curl -X POST http://localhost:3000/api/boards/:boardId/notes \
  -H "Content-Type: application/json" \
  -d '{"content": "Learn React Native for mobile development", "type": "note"}'

# Request AI suggestions
curl "http://localhost:3000/api/boards/:boardId/connections/suggest?useAI=true"
```

### Check Logs
The backend logs show whether AI or keyword matching is used:
```
[AI] Analyzing 5 cards (estimated cost: $0.0001)
[AI] Found 3 AI-powered suggestions
```

or

```
[Keyword] Using keyword matching for suggestions
```

## 🛡️ Error Handling

### Graceful Degradation
- If AI is enabled but API call fails → Falls back to keyword matching
- If API key is invalid → Uses keyword matching
- If rate limit exceeded → Returns cached results or uses keywords

### Error Scenarios
1. **Invalid API Key:** Falls back to keywords, logs warning
2. **Rate Limit:** Returns HTTP 429, suggests retry
3. **Network Timeout:** Falls back to keywords
4. **Invalid Response:** Falls back to keywords

## 🔒 Security

### API Key Protection
- ✅ Stored in `.env` (never committed)
- ✅ Server-side only (never exposed to frontend)
- ✅ Not logged or sent in responses

### Rate Limiting (Recommended)
Add middleware to limit AI requests per user:
```typescript
// Future enhancement
const rateLimit = require('express-rate-limit');

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per 15 minutes
  message: 'Too many AI requests, please try again later'
});

connectionRouter.get('/boards/:boardId/connections/suggest', aiLimiter, ...);
```

## 📈 Monitoring

### Usage Tracking
Check OpenAI dashboard for:
- Total requests
- Token usage
- Cost breakdown

### Performance Metrics
Monitor in application:
- AI response time (should be < 3s)
- Success rate (should be > 95%)
- Fallback frequency (should be < 5%)

## 🎨 Frontend Integration (Optional)

### Show AI vs Keyword Badge
```tsx
// In SuggestionCard.tsx
{suggestion.source === 'ai' && (
  <Badge variant="secondary">
    ✨ AI-Powered
  </Badge>
)}
```

### Display Relationship Types
```tsx
// Show relationship type from AI
{suggestion.relationshipType && (
  <span className="text-xs text-muted-foreground">
    {suggestion.relationshipType}
  </span>
)}
```

## 🐛 Troubleshooting

### AI Not Working
1. Check `.env` has `AI_ENABLED=true`
2. Verify `OPENAI_API_KEY` is set correctly
3. Restart backend server
4. Check logs for error messages

### High Costs
1. Check OpenAI dashboard for usage
2. Reduce `AI_MAX_TOKENS` in .env
3. Implement caching (future enhancement)
4. Add rate limiting

### Poor Quality Suggestions
1. Increase `AI_TEMPERATURE` for more creative connections
2. Decrease for more conservative suggestions
3. Adjust `minConfidence` threshold
4. Try different models (gpt-4o for best quality)

## 🚀 Future Enhancements

### Planned Features
- [ ] Cache AI analysis results in database
- [ ] Batch process multiple boards
- [ ] Support for other LLM providers (Anthropic Claude, local models)
- [ ] Relationship type visualization in UI
- [ ] User feedback loop to improve suggestions
- [ ] A/B testing between AI and keyword suggestions

### Cost Optimization
- [ ] Implement Redis cache for AI responses
- [ ] Only analyze changed/new cards
- [ ] Background job processing for suggestions
- [ ] Hybrid approach (AI for complex, keywords for simple)

## 📚 Additional Resources

- **OpenAI Documentation:** https://platform.openai.com/docs
- **GPT-4o-mini Pricing:** https://openai.com/api/pricing/
- **Rate Limits:** https://platform.openai.com/docs/guides/rate-limits

---

## ✅ Success Checklist

- [ ] OpenAI API key obtained
- [ ] `.env` configured with AI settings
- [ ] Backend restarted
- [ ] Test request successful
- [ ] Logs show AI mode active
- [ ] Suggestions quality improved over keywords
- [ ] Costs monitored and acceptable

**Ready to use AI-powered connections!** 🎉
