# Story 6.5: AI-Powered Connections - Implementation Plan

## 📋 Overview
Enhance the auto-connection engine with AI-powered analysis to generate more intelligent and contextual connection suggestions.

## 🎯 Acceptance Criteria
1. ✅ Use LLM (OpenAI/Anthropic) to analyze card content semantically
2. ✅ Generate more nuanced connection reasons beyond keyword matching
3. ✅ Identify conceptual relationships (cause-effect, prerequisite, complement, etc.)
4. ✅ Provide confidence scores based on semantic similarity
5. ✅ Fall back to keyword matching if API fails or is unavailable
6. ✅ Respect API rate limits and handle errors gracefully
7. ✅ Optional: Cache AI responses to reduce API costs

## 🏗️ Architecture

### Backend Changes
1. **AI Service Layer** (`backend/src/services/ai-connection-service.ts`)
   - Interface with LLM API (OpenAI GPT-4 or Anthropic Claude)
   - Batch analyze card pairs for efficiency
   - Parse AI responses into structured format
   - Handle errors and timeouts

2. **Environment Configuration** (`.env`)
   - Add API key configuration
   - Toggle between AI and keyword-based suggestions
   - Configure model selection and parameters

3. **Enhanced Auto-Connection Service**
   - Integrate AI service as optional layer
   - Fall back to keyword matching if AI unavailable
   - Merge AI and keyword-based suggestions
   - Deduplicate and rank results

### API Integration Options

#### Option A: OpenAI GPT-4
- **Pros:** Very strong semantic understanding, widely used
- **Cons:** More expensive, requires OpenAI account
- **Model:** `gpt-4o-mini` (cost-effective) or `gpt-4o` (best quality)

#### Option B: Anthropic Claude
- **Pros:** Excellent reasoning, good for analysis tasks
- **Cons:** Requires Anthropic account
- **Model:** `claude-3-5-sonnet-20241022` (best balance)

#### Option C: OpenRouter (Multi-Model)
- **Pros:** Access multiple models, flexible pricing
- **Cons:** Additional abstraction layer
- **Models:** Various options available

**Recommended:** Start with OpenAI GPT-4o-mini for cost-effectiveness and quality balance.

## 🔧 Implementation Steps

### Step 1: Environment Setup
```bash
# Backend .env
OPENAI_API_KEY=sk-...
AI_ENABLED=true
AI_MODEL=gpt-4o-mini
AI_MAX_TOKENS=500
AI_TEMPERATURE=0.3
```

### Step 2: Create AI Connection Service
**File:** `backend/src/services/ai-connection-service.ts`

**Features:**
- Batch analysis (send multiple card pairs in one request)
- Structured JSON response parsing
- Relationship type classification
- Confidence scoring
- Error handling with fallback

**Prompt Engineering:**
```
Analyze these note/idea/plan pairs and identify meaningful connections.
For each pair, determine:
1. Is there a relationship? (yes/no)
2. Relationship type (prerequisite, complement, cause-effect, similar-theme, etc.)
3. Confidence (0.0-1.0)
4. Brief reason (1 sentence)

Return JSON array of connections.
```

### Step 3: Integrate with Auto-Connection Service
**File:** `backend/src/services/auto-connection-service.ts`

**Flow:**
1. Check if AI is enabled and API key exists
2. If yes → Use AI service (with keyword fallback)
3. If no → Use existing keyword matching
4. Merge and deduplicate results
5. Sort by confidence score

### Step 4: Add API Route Enhancement
**File:** `backend/src/routes/connections.ts`

**Query Parameters:**
- `?useAI=true` - Force AI suggestions
- `?useAI=false` - Force keyword matching
- Default: Use env config

### Step 5: Frontend Enhancement (Optional)
**UI Indicators:**
- Badge showing "AI-powered" vs "Keyword-based" suggestions
- Show relationship types in suggestion cards
- Tooltip explaining AI confidence vs keyword confidence

## 📊 Cost Optimization Strategies

### 1. Batch Processing
- Analyze multiple card pairs in single API call
- Reduce per-request overhead
- Stay within token limits

### 2. Caching
- Cache AI analysis results in database
- Add `AI_ANALYSIS_CACHE` table with TTL
- Only re-analyze when card content changes

### 3. Rate Limiting
- Limit AI suggestions to X per minute
- Queue requests if needed
- Show loading state to user

### 4. Smart Triggers
- Only use AI for new cards or when explicitly requested
- Use keyword matching for real-time updates
- Run AI analysis as background job

## 🧪 Testing Strategy

### Unit Tests
- Mock OpenAI API responses
- Test error handling (API timeout, invalid response)
- Verify fallback to keyword matching

### Integration Tests
- Test with real API (use small dataset)
- Verify confidence scoring consistency
- Check relationship type classification accuracy

### Cost Estimation
**Per API Call (GPT-4o-mini):**
- Input: ~100 tokens/card pair × 10 pairs = 1,000 tokens
- Output: ~50 tokens/connection × 5 connections = 250 tokens
- Cost: ~$0.0002 per suggestion request
- Monthly (100 users, 10 requests/user): ~$0.20

**Very affordable for MVP!**

## 🔒 Security Considerations

1. **API Key Protection**
   - Store in environment variables
   - Never expose in frontend
   - Use server-side only

2. **Rate Limiting**
   - Prevent abuse of AI endpoint
   - Track usage per user/session
   - Set daily/monthly quotas

3. **Content Sanitization**
   - Validate card content before sending to API
   - Remove PII if needed
   - Limit content length

## 📈 Success Metrics

- **Accuracy:** AI suggestions accepted > 40% (vs ~20% for keywords)
- **Quality:** Average confidence score > 0.6
- **Performance:** Response time < 3 seconds
- **Cost:** < $1/month for typical usage
- **Fallback:** Keyword matching works when AI unavailable

## 🎯 MVP Scope (This Story)

### Must Have:
- ✅ OpenAI integration with GPT-4o-mini
- ✅ Structured prompt for connection analysis
- ✅ Fallback to keyword matching on error
- ✅ Environment configuration
- ✅ Basic error handling

### Nice to Have:
- ⏳ Caching layer (defer to future)
- ⏳ Multiple model support (defer to future)
- ⏳ Frontend AI indicator badge (defer to future)
- ⏳ Relationship type visualization (defer to future)

## 🚀 Implementation Order

1. **Install OpenAI SDK** - `npm install openai`
2. **Create AI service** - Core logic
3. **Add environment config** - API key setup
4. **Integrate with auto-connection** - Use AI layer
5. **Test with real data** - Verify quality
6. **Add error handling** - Graceful degradation
7. **Update documentation** - Usage guide

## 📝 Deliverables

**Backend:**
- `backend/src/services/ai-connection-service.ts` (NEW)
- `backend/src/services/auto-connection-service.ts` (MODIFIED)
- `backend/.env.example` (MODIFIED)
- `backend/package.json` (MODIFIED - add openai dependency)

**Documentation:**
- `.env` configuration guide
- AI prompt examples
- Cost optimization tips

**Tests:**
- AI service unit tests with mocks
- Integration test with real API (manual)

---

## 💡 Next Steps

1. Get OpenAI API key from https://platform.openai.com/api-keys
2. Install OpenAI SDK
3. Implement AI connection service
4. Test with sample data
5. Integrate with existing flow
6. Deploy and monitor costs

**Ready to start implementation?** 🚀
