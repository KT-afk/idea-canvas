/**
 * Service: AI Connection Service
 * Story 6.5: AI-Powered Connections
 * 
 * Uses OpenAI GPT to analyze card relationships semantically
 * Provides more intelligent connection suggestions than keyword matching
 */

import OpenAI from 'openai';

// AI configuration from environment
const AI_ENABLED = process.env.AI_ENABLED === 'true';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const AI_MODEL = process.env.AI_MODEL || 'gpt-4o-mini';
const AI_MAX_TOKENS = parseInt(process.env.AI_MAX_TOKENS || '800', 10);
const AI_TEMPERATURE = parseFloat(process.env.AI_TEMPERATURE || '0.3');

// Initialize OpenAI client (only if enabled and key exists)
let openai: OpenAI | null = null;
if (AI_ENABLED && OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
  });
}

export interface Card {
  id: string;
  content: string;
  type: 'note' | 'idea' | 'plan';
}

export interface AIConnectionSuggestion {
  sourceCardId: string;
  targetCardId: string;
  confidence: number;
  reason: string;
  relationshipType?: 'prerequisite' | 'complement' | 'cause-effect' | 'similar-theme' | 'contrast' | 'example' | 'general';
}

interface AIAnalysisResponse {
  connections: Array<{
    sourceIndex: number;
    targetIndex: number;
    hasRelationship: boolean;
    relationshipType: string;
    confidence: number;
    reason: string;
  }>;
}

/**
 * Check if AI service is available
 */
export function isAIAvailable(): boolean {
  return AI_ENABLED && openai !== null;
}

/**
 * Analyze card pairs using AI to find meaningful connections
 * Processes in batches for efficiency
 */
export async function analyzeConnectionsWithAI(
  cards: Card[]
): Promise<AIConnectionSuggestion[]> {
  if (!isAIAvailable()) {
    throw new Error('AI service is not available. Check OPENAI_API_KEY in environment.');
  }

  if (cards.length < 2) {
    return [];
  }

  // Limit to reasonable batch size to avoid token limits
  const MAX_CARDS_PER_BATCH = 10;
  if (cards.length > MAX_CARDS_PER_BATCH) {
    cards = cards.slice(0, MAX_CARDS_PER_BATCH);
  }

  try {
    // Build prompt with card information
    const cardsInfo = cards.map((card, idx) => ({
      index: idx,
      id: card.id,
      type: card.type,
      content: card.content.slice(0, 200), // Limit content length to save tokens
    }));

    const prompt = buildAnalysisPrompt(cardsInfo);

    // Call OpenAI API
    const completion = await openai!.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are an expert at analyzing relationships between notes, ideas, and plans. Identify meaningful connections and explain them clearly.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: AI_TEMPERATURE,
      max_tokens: AI_MAX_TOKENS,
      response_format: { type: 'json_object' },
    });

    // Parse response
    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      throw new Error('Empty response from AI');
    }

    const analysis: AIAnalysisResponse = JSON.parse(responseText);

    // Convert AI response to suggestions
    const suggestions: AIConnectionSuggestion[] = [];
    for (const connection of analysis.connections) {
      if (connection.hasRelationship && connection.confidence > 0) {
        const sourceCard = cardsInfo[connection.sourceIndex];
        const targetCard = cardsInfo[connection.targetIndex];

        if (sourceCard && targetCard) {
          suggestions.push({
            sourceCardId: sourceCard.id,
            targetCardId: targetCard.id,
            confidence: connection.confidence,
            reason: connection.reason,
            relationshipType: connection.relationshipType as any,
          });
        }
      }
    }

    return suggestions;
  } catch (error) {
    console.error('AI connection analysis failed:', error);
    throw error;
  }
}

/**
 * Build analysis prompt for OpenAI
 */
function buildAnalysisPrompt(cards: Array<{ index: number; id: string; type: string; content: string }>): string {
  return `Analyze the following ${cards.length} cards and identify meaningful connections between them.

Cards:
${cards.map(c => `[${c.index}] (${c.type}): ${c.content}`).join('\n\n')}

For each pair of cards, determine:
1. Is there a meaningful relationship? (yes/no)
2. Relationship type: prerequisite, complement, cause-effect, similar-theme, contrast, example, or general
3. Confidence score (0.0 to 1.0, where 1.0 is very strong relationship)
4. Brief reason (one clear sentence explaining the connection)

Guidelines:
- Only suggest connections that would genuinely help the user
- Confidence > 0.7: Very strong, obvious relationship
- Confidence 0.4-0.7: Moderate relationship, worth considering
- Confidence < 0.4: Weak relationship, only suggest if still meaningful
- Don't force connections where there are none

Return a JSON object with this structure:
{
  "connections": [
    {
      "sourceIndex": 0,
      "targetIndex": 1,
      "hasRelationship": true,
      "relationshipType": "prerequisite",
      "confidence": 0.85,
      "reason": "Card 0 is a prerequisite for implementing Card 1"
    }
  ]
}

Only include connections where hasRelationship is true.`;
}

/**
 * Estimate cost of an AI analysis request (for monitoring)
 */
export function estimateAICost(cardCount: number): number {
  // Rough estimate for gpt-4o-mini pricing
  const INPUT_PRICE_PER_1M = 0.15; // $0.15 per 1M input tokens
  const OUTPUT_PRICE_PER_1M = 0.6; // $0.60 per 1M output tokens
  
  const estimatedInputTokens = cardCount * 100; // ~100 tokens per card
  const estimatedOutputTokens = (cardCount * (cardCount - 1) / 2) * 30; // ~30 tokens per connection
  
  const inputCost = (estimatedInputTokens / 1_000_000) * INPUT_PRICE_PER_1M;
  const outputCost = (estimatedOutputTokens / 1_000_000) * OUTPUT_PRICE_PER_1M;
  
  return inputCost + outputCost;
}
